from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import sent_tokenize
from transformers import pipeline
from deepmultilingualpunctuation import PunctuationModel
from collections import Counter
from joblib import dump, load
import soundfile as sf
import torchaudio
import torch
import os

class SAPipeline:
    def __init__(self):
        self.asr_pipeline = pipeline("automatic-speech-recognition", model="openai/whisper-small")
        self.punctuator = PunctuationModel()
        self.sentiment_model = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion")
        self.sia = SentimentIntensityAnalyzer()

    def transcribe_audio(self, audio_file_path):
        speech, sample_rate = sf.read(audio_file_path, dtype="float32")
        
        if speech.ndim > 1:
            speech = speech.mean(axis=1)
        
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            speech = resampler(torch.tensor(speech)).numpy()
        
        transcription = self.asr_pipeline(speech)
        return transcription['text']

    def analyze_emotion(self, sentences):
        results = self.sentiment_model(sentences)
        return [{'label': self.normalize_emotion_label(result['label']), 'score': result['score']} for result in results]

    def normalize_emotion_label(self, label):
        mapping = {
            'joy': 'happy',
            'anger': 'angry',
            'sadness': 'sad',
            'fear': 'others',
            'love': 'happy',
            'surprise': 'others',
        }
        return mapping.get(label, 'others')

    def process(self, video_filename):
        base_filename = os.path.splitext(os.path.basename(video_filename))[0]
        audio_file = os.path.join('UserData', base_filename + '.wav')

        transcribed_text = self.transcribe_audio(audio_file)
        if transcribed_text:
            punctuated_text = self.punctuator.restore_punctuation(transcribed_text)
            sentences = sent_tokenize(punctuated_text)
            emotion_analysis = self.analyze_emotion(sentences)
            emotions = [result['label'] for result in emotion_analysis]
            emotion_counts = Counter(emotions)
            return emotion_counts
        else:
            return {}


    def serialize(self, path):
        dump(self, path)

    @classmethod
    def deserialize(cls, path):
        return load(path)