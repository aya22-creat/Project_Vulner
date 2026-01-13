import torch
import pickle
import numpy as np
from transformers import AutoTokenizer
from model import HybridModel
from stage2_features import extract_features

DEVICE = "cpu"

tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")

# Load scaler
with open("model/scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

# Load model
model = HybridModel(feat_dim=14)
model.load_state_dict(torch.load("model/stage3_best.pt", map_location=DEVICE))
model.eval()

def predict(code: str):
    # Stage 2
    features = extract_features(code)
    features = scaler.transform([features])
    feat_tensor = torch.tensor(features, dtype=torch.float32)

    # Tokenization
    enc = tokenizer(
        code,
        truncation=True,
        padding="max_length",
        max_length=256,
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

    return {
        "label": "VULN" if pred == 1 else "SAFE",
        "confidence": float(probs.max())
    }
