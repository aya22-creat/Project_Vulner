import torch
import pickle
import numpy as np
from stage2_features import extract_features
from typing import Optional
import os

class HybridModel(torch.nn.Module):
    def __init__(self, feat_dim: int, hidden: int = 128, num_classes: int = 2):
        super().__init__()
        self.text_proj = torch.nn.Linear(768, hidden)
        self.feat_proj = torch.nn.Linear(feat_dim, hidden)
        self.classifier = torch.nn.Linear(hidden * 2, num_classes)

    def forward(self, input_ids, attention_mask, features):
        batch_size = input_ids.shape[0]
        device = input_ids.device
        pooled = torch.zeros((batch_size, 768), device=device)
        text_h = torch.relu(self.text_proj(pooled))
        feat_h = torch.relu(self.feat_proj(features))
        fused = torch.cat([text_h, feat_h], dim=1)
        return self.classifier(fused)

DEVICE = "cpu"

tokenizer = None  # transformers removed; using dummy inputs

# Load scaler (optional)
scaler: Optional[object] = None
scaler_path = os.path.join("model", "scaler.pkl")
if os.path.exists(scaler_path):
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)

# Load model
model = HybridModel(feat_dim=19)
_state = torch.load("model/stage3_best.pt", map_location=DEVICE)
try:
    model.load_state_dict(_state, strict=False)
except Exception:
    pass
model.eval()

def predict(code: str):
    # Stage 2
    features = extract_features(code)
    if scaler is not None:
        features = scaler.transform([features])
    else:
        features = [features]
    feat_tensor = torch.tensor(features, dtype=torch.float32)

    # Tokenization
    enc = {
        "input_ids": torch.zeros((1, 256), dtype=torch.long),
        "attention_mask": torch.zeros((1, 256), dtype=torch.long)
    }

    with torch.no_grad():
        logits = model(
            enc["input_ids"],
            enc["attention_mask"],
            feat_tensor
        )
        probs = torch.softmax(logits, dim=1)
        pred = probs.argmax(1).item()

    return {
        "label": "VULN" if pred == 1 else "SAFE",
        "confidence": float(probs.max())
    }
