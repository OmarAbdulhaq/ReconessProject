from collections import Counter
import torch
from facenet_pytorch import MTCNN
from transformers import AutoFeatureExtractor, AutoModelForImageClassification, AutoConfig
from PIL import Image
from moviepy.editor import VideoFileClip
from joblib import dump, load

class VFERPipeline:
    def __init__(self):
        self.device, self.mtcnn, self.extractor, self.model, self.id2label = self.setFERConfigs()

    def setFERConfigs(self):
        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        mtcnn = MTCNN(keep_all=True, device=device)
        extractor = AutoFeatureExtractor.from_pretrained("trpakov/vit-face-expression")
        model = AutoModelForImageClassification.from_pretrained("trpakov/vit-face-expression").to(device)
        config = AutoConfig.from_pretrained("trpakov/vit-face-expression")
        id2label = {i: label for i, label in enumerate(config.label2id.keys())}
        return device, mtcnn, extractor, model, id2label

    def detect_and_analyze_emotions(self, frame):
        frame_pil = Image.fromarray(frame).convert('RGB')
        boxes, _ = self.mtcnn.detect(frame_pil)
        emotion_labels = []
        if boxes is not None:
            for box in boxes:
                face = frame_pil.crop((box[0], box[1], box[2], box[3]))
                inputs = self.extractor(images=face, return_tensors="pt").to(self.device)
                outputs = self.model(**inputs)
                probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
                predicted_class = probabilities.argmax(dim=1).item()
                emotion = self.id2label[predicted_class]
                emotion_labels.append(emotion)
        else:
            print("No faces detected in the frame.")

        return emotion_labels

    def process(self, scene, frames_per_second=1):
        clip = VideoFileClip(scene).without_audio()
        vid_fps = clip.fps
        frame_interval = int(vid_fps / frames_per_second)

        emotions_list = []

        for frame_number, frame in enumerate(clip.iter_frames()):
            if frame_number % frame_interval == 0:
                frame_emotions = self.detect_and_analyze_emotions(frame)
                emotions_list.extend(frame_emotions)

        emotions_counter = Counter(emotions_list)
        
        for emotion in ['fear', 'surprise', 'disgust']:
            if emotion in emotions_counter:
                emotions_counter['others'] = emotions_counter.get('others', 0) + emotions_counter.pop(emotion)

        del clip, vid_fps, frame_interval, emotions_list
        return dict(emotions_counter)

    def serialize(self, path):
        return load(path)

    @classmethod
    def deserialize(cls, path):
        dump(self, path)