import torch
from facenet_pytorch import MTCNN
from transformers import AutoFeatureExtractor, AutoModelForImageClassification, AutoConfig
from PIL import Image
import numpy as np
from moviepy.editor import ImageSequenceClip, VideoFileClip
import matplotlib.pyplot as plt
import seaborn as sns
import os

def setFERConfigs():
    device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
    mtcnn = MTCNN(keep_all=True, device=device)
    extractor = AutoFeatureExtractor.from_pretrained("trpakov/vit-face-expression")
    model = AutoModelForImageClassification.from_pretrained("trpakov/vit-face-expression").to(device)
    config = AutoConfig.from_pretrained("trpakov/vit-face-expression")
    id2label = {i: 'others' if label in ['fear', 'surprise', 'disgust'] else label for i, label in config.id2label.items()}

    return device, mtcnn, extractor, model, id2label

def detect_and_analyze_emotions(frame, mtcnn, extractor, device, model, id2label):
    frame_pil = Image.fromarray(frame) if not isinstance(frame, Image.Image) else frame.convert('RGB')
    boxes, _ = mtcnn.detect(frame_pil)
    results = []
    if boxes is not None:
        for box in boxes:
            face = frame_pil.crop((box[0], box[1], box[2], box[3]))
            inputs = extractor(images=face, return_tensors="pt").to(device)
            outputs = model(**inputs)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
            probabilities = probabilities.detach().cpu().numpy().tolist()[0]
            class_probabilities = {id2label[i]: prob for i, prob in enumerate(probabilities)}
            results.append((face, class_probabilities))
    return results

def create_combined_image(face, class_probabilities):
    face_array = np.array(face)
    fig, axs = plt.subplots(1, 2, figsize=(8, 4))
    axs[0].imshow(face_array)
    axs[0].axis('off')
    sns.barplot(ax=axs[1], x=list(class_probabilities.values()), y=list(class_probabilities.keys()))
    axs[1].set_ylabel('Probability (%)')
    fig.canvas.draw()
    combined_image = np.frombuffer(fig.canvas.tostring_rgb(), dtype='uint8')
    combined_image = combined_image.reshape(fig.canvas.get_width_height()[::-1] + (3,))
    plt.close(fig)
    return combined_image

def VFERPipeline(scene, frames_per_second=1):
    device, mtcnn, extractor, model, id2label = setFERConfigs()

    input_dir, input_filename = os.path.split(scene)
    filename_without_ext, ext = os.path.splitext(input_filename)
    output_filename = f"{filename_without_ext}_emotion_processed{ext}"
    output_path = os.path.join(input_dir, output_filename)

    clip = VideoFileClip(scene).without_audio()
    vid_fps = clip.fps
    frame_interval = int(vid_fps / frames_per_second)

    combined_images = []
    emotions_list = [] 

    for frame_number, frame in enumerate(clip.iter_frames()):
        if frame_number % frame_interval == 0:
            frame_results = detect_and_analyze_emotions(frame, mtcnn, extractor, device, model, id2label)
            for face, class_probabilities in frame_results:
                combined_image = create_combined_image(face, class_probabilities)
                combined_images.append(combined_image)
                emotions_list.append(class_probabilities)

    pil_images = [Image.fromarray(img) for img in combined_images]
    output_clip = ImageSequenceClip(pil_images, fps=frames_per_second)
    output_clip.write_videofile(output_path, codec='libx264')

    return emotions_list, output_path