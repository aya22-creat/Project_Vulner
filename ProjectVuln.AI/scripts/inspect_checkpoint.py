import torch
import sys
from pathlib import Path

ckpt_path = Path(__file__).resolve().parents[1] / 'model' / 'stage3_best.pt'
print(f"Loading checkpoint from: {ckpt_path}")

sd = torch.load(str(ckpt_path), map_location='cpu')
print('Checkpoint type:', type(sd))

# Some checkpoints save a dict with a 'state_dict' key
if isinstance(sd, dict) and 'state_dict' in sd and isinstance(sd['state_dict'], dict):
    state_dict = sd['state_dict']
    print('Using nested state_dict with', len(state_dict), 'keys')
elif isinstance(sd, dict):
    state_dict = sd
    print('Using direct state_dict with', len(state_dict), 'keys')
else:
    print('Non-dict checkpoint, cannot inspect keys reliably')
    sys.exit(0)

# Print first 50 keys and shapes
count = 0
for k, v in state_dict.items():
    shape = getattr(v, 'shape', None)
    print(f"{k}: {tuple(shape) if shape is not None else type(v)}")
    count += 1
    if count >= 50:
        break

# Summarize by prefix groups
from collections import defaultdict
prefix_counts = defaultdict(int)
for k in state_dict.keys():
    prefix = k.split('.')[0]
    prefix_counts[prefix] += 1
print('Prefix counts:')
for p, c in prefix_counts.items():
    print(f"  {p}: {c}")
