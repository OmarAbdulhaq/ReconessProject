import torch
from transformers import AutoModelForImageClassification, AutoFeatureExtractor, AutoConfig
from PIL import Image
import matplotlib.pyplot as plt
import seaborn as sns
import os

def setFERConfigs():
    extractor = AutoFeatureExtractor.from_pretrained("trpakov/vit-face-expression")
    model = AutoModelForImageClassification.from_pretrained("trpakov/vit-face-expression").to('cpu')
    config = AutoConfig.from_pretrained("trpakov/vit-face-expression")

    id2label = {i: 'others' if label in ['fear', 'surprise', 'disgust'] else label for i, label in config.id2label.items()}

    return extractor, model, id2label

def analyze_emotions_in_image(image_path, extractor, model, id2label):
    image = Image.open(image_path).convert('RGB')
    inputs = extractor(images=image, return_tensors="pt").to('cpu')
    
    outputs = model(**inputs)
    probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
    probabilities = probabilities.detach().cpu().numpy()[0]
    class_probabilities = {id2label[i]: prob for i, prob in enumerate(probabilities)}
    
    return image, class_probabilities

def save_emotion_analysis(image, class_probabilities, output_path):
    plt.figure(figsize=(12, 6))
    
    plt.subplot(1, 2, 1)
    plt.imshow(image)
    plt.axis('off')
    
    plt.subplot(1, 2, 2)
    sns.barplot(x=list(class_probabilities.values()), y=list(class_probabilities.keys()))
    plt.xlabel('Probability')
    plt.tight_layout()
    
    plt.savefig(output_path)
    plt.close()

def IFERPipeline(image_path):
    extractor, model, id2label = setFERConfigs()
    image, class_probabilities = analyze_emotions_in_image(image_path, extractor, model, id2label)

    dir_path, filename = os.path.split(image_path)
    name, ext = os.path.splitext(filename)
    output_filename = f"{name}_emotion_analysis{ext}"
    output_path = os.path.join(dir_path, output_filename)

    save_emotion_analysis(image, class_probabilities, output_path)

    return class_probabilities, output_path