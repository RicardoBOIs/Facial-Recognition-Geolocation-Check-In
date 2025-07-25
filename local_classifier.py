import sys
import base64
import torch
from torchvision import models
from PIL import Image
import io
import json
import numpy as np

# Load ResNet-50 architecture with specific weights
num_classes = 4  # Replace with the actual number of classes in your model
model = models.resnet50(weights="DEFAULT")
model.fc = torch.nn.Linear(model.fc.in_features, num_classes)

# Load model weights with weights_only set to True
try:
    model.load_state_dict(torch.load("best_model.pth", weights_only=True))
    model.eval()
except Exception as e:
    print(json.dumps({"error": f"Error loading model: {str(e)}"}))
    sys.exit(1)  # Exit the program if model loading fails

# Load class mapping
try:
    with open("class_mapping.json", "r") as f:
        class_mapping = json.load(f)
except Exception as e:
    print(json.dumps({"error": f"Error loading class mapping: {str(e)}"}))
    sys.exit(1)

def preprocess_image(image_data):
    """Preprocess image for model input."""
    try:
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        image = image.resize((224, 224))
        image_np = np.array(image) / 255.0
        image_tensor = torch.tensor(image_np).permute(2, 0, 1).unsqueeze(0).float()
        return image_tensor
    except Exception as e:
        print(json.dumps({"error": f"Error processing image: {str(e)}"}))
        sys.exit(1)

def classify_image(image_data):
    """Classify image from base64 data and return result as human-readable label."""
    image_tensor = preprocess_image(image_data)
    with torch.no_grad():
        output = model(image_tensor)
        _, predicted = torch.max(output, 1)
        class_index = str(predicted.item())
        return class_mapping.get(class_index, "Unknown class")

# Read base64-encoded image data from stdin
try:
    image_base64 = sys.stdin.read().strip()
    image_data = base64.b64decode(image_base64)
except Exception as e:
    print(json.dumps({"error": f"Error decoding image: {str(e)}"}))
    sys.exit(1)

# Classify the image
try:
    label = classify_image(image_data)
    print(json.dumps({"label": label}))  # Output JSON format
except Exception as e:
    print(json.dumps({"error": f"Error classifying image: {str(e)}"}))
    sys.exit(1)
