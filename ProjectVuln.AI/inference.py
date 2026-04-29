import torch
import pickle
import numpy as np
from torch import nn
from transformers import AutoTokenizer, AutoModel, AutoConfig
from stage2_features import extract_features
from typing import Optional
import os
import logging

logger = logging.getLogger(__name__)

# =============================================================
# HybridModel — EXACT architecture from training notebook
# =============================================================
class HybridModel(nn.Module):
    def __init__(self, feat_dim: int, classifier_hidden: int, num_classes: int):
        super().__init__()
        # Build encoder from config only (no download) — weights come from .pt file
        config = AutoConfig.from_pretrained("microsoft/codebert-base")
        self.encoder = AutoModel.from_config(config)
        self.feat_proj = nn.Sequential(
            nn.Linear(feat_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        self.cls = nn.Sequential(
            nn.Linear(768 + 128, classifier_hidden),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(classifier_hidden, num_classes)
        )

    def forward(self, ids, mask, feat):
        x = self.encoder(
            input_ids=ids,
            attention_mask=mask
        ).last_hidden_state[:, 0]          # CLS token
        f = self.feat_proj(feat)
        z = torch.cat([x, f], dim=1)
        return self.cls(z)


DEVICE = "cpu"
MAX_LEN = 256
SAFE_CLASS_IDX = 0

# =============================================================
# Load tokenizer (CodeBERT)
# =============================================================
logger.info("Loading CodeBERT tokenizer...")
tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")

# =============================================================
# Load scaler (optional)
# =============================================================
scaler: Optional[object] = None
scaler_path = os.path.join("model", "scaler.pkl")
if os.path.exists(scaler_path):
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)
    logger.info("Scaler loaded from %s", scaler_path)

# =============================================================
# Load model with trained weights
# =============================================================
logger.info("Loading trained weights from model/stage3_best.pt...")
_state = torch.load("model/stage3_best.pt", map_location=DEVICE, weights_only=False)

classifier_hidden = 256
num_classes = 2
if isinstance(_state, dict):
    if "cls.0.bias" in _state:
        classifier_hidden = int(_state["cls.0.bias"].shape[0])
    if "cls.3.bias" in _state:
        num_classes = int(_state["cls.3.bias"].shape[0])

logger.info("Building HybridModel (feat_dim=19, hidden=%s, classes=%s)...", classifier_hidden, num_classes)
model = HybridModel(feat_dim=19, classifier_hidden=classifier_hidden, num_classes=num_classes)

result = model.load_state_dict(_state, strict=False)
logger.info("Loaded weights — missing: %d, unexpected: %d", len(result.missing_keys), len(result.unexpected_keys))
if result.missing_keys:
    logger.warning("Missing keys: %s", result.missing_keys)

model.eval()
logger.info("Model ready for inference.")


def predict(code: str):
    """Run inference on a C/C++ code snippet."""

    # --- Stage 2: extract static features ---
    features = extract_features(code)
    if scaler is not None:
        features = scaler.transform([features])
    else:
        features = [features]
    feat_tensor = torch.tensor(features, dtype=torch.float32)

    # --- Tokenize code with CodeBERT tokenizer ---
    enc = tokenizer(
        code,
        truncation=True,
        padding="max_length",
        max_length=MAX_LEN,
        return_tensors="pt"
    )

    with torch.no_grad():
        logits = model(
            enc["input_ids"],
            enc["attention_mask"],
            feat_tensor
        )
        probs = torch.softmax(logits, dim=1)
        pred = probs.argmax(1).item()
        confidence = float(probs[0, pred].item())

    is_vuln = pred != SAFE_CLASS_IDX
    vulnerability_type = None if not is_vuln else f"CWE-CLASS-{pred}"

    return {
        "label": "VULN" if is_vuln else "SAFE",
        "confidence": confidence,
        "vulnerability_type": vulnerability_type,
    }
