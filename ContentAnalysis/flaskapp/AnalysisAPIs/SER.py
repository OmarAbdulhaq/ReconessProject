import os
import math
from moviepy.editor import VideoFileClip, AudioFileClip
import torchaudio
import torch
from transformers import Wav2Vec2FeatureExtractor, HubertForSequenceClassification
from joblib import dump, load
from collections import Counter

class SERPipeline:
    def __init__(self):
        self.EMOTIONMAP, self.feature_extractor, self.model = self.setSERConfigs()

    def setSERConfigs(self):
        EMOTIONMAP = {0: 'neutral', 1: 'angry', 2: 'happy', 3: 'sad', 4: 'others'}
        feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained("facebook/hubert-large-ls960-ft")
        model = HubertForSequenceClassification.from_pretrained("xbgoose/hubert-speech-emotion-recognition-russian-dusha-finetuned")
        return EMOTIONMAP, feature_extractor, model

    def extract_audio_from_video(self, video_file, output_audio_file):
        output_dir = os.path.dirname(output_audio_file)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)

        video = VideoFileClip(video_file)
        audio = video.audio
        audio.write_audiofile(output_audio_file)

    def convert_audio_to_wav(self, audio_file_path, output_path):
        audio_clip = AudioFileClip(audio_file_path)
        audio_clip.write_audiofile(output_path, codec='pcm_s16le')
        os.remove(audio_file_path)

    def process_audio_segment(self, segment_waveform):
        segment_waveform = segment_waveform.squeeze()

        if segment_waveform.dim() == 1:
            segment_waveform = segment_waveform.unsqueeze(0)

        inputs = self.feature_extractor(
            segment_waveform, 
            sampling_rate=self.feature_extractor.sampling_rate, 
            return_tensors="pt",
            padding=True, 
            max_length=16000, 
            truncation=True
        )

        input_values = inputs.input_values.squeeze()
        if input_values.dim() == 1:
            input_values = input_values.unsqueeze(0)

        with torch.no_grad():
            logits = self.model(input_values).logits

        predictions = torch.argmax(logits, dim=-1)
        emotions = [self.EMOTIONMAP[prediction.item()] for prediction in predictions]
        return emotions

    def split_and_process_audio(self, filename, segment_length):
        waveform, sample_rate = torchaudio.load(filename)
        waveform = waveform.mean(dim=0).unsqueeze(0)
        num_samples_per_segment = sample_rate * segment_length
        total_segments = math.ceil(waveform.size(1) / num_samples_per_segment)
        emotions_list = []

        for segment in range(total_segments):
            start_sample = int(segment * num_samples_per_segment)
            end_sample = int(start_sample + num_samples_per_segment)
            segment_waveform = waveform[:, start_sample:end_sample]
            if segment_waveform.size(1) < num_samples_per_segment:
                continue
            segment_emotions = self.process_audio_segment(segment_waveform)
            emotions_list.extend(segment_emotions)

        emotions_counter = Counter(emotions_list)
        return dict(emotions_counter)

    def process(self, video_file, segment_length=1):
        base_name = os.path.splitext(os.path.basename(video_file))[0]
        output_audio_file = f"UserData/{base_name}.mp3"
        output_wav_file = f"UserData/{base_name}.wav"
        
        self.extract_audio_from_video(video_file, output_audio_file)
        self.convert_audio_to_wav(output_audio_file, output_wav_file)
        emotions_counter = self.split_and_process_audio(output_wav_file, segment_length)

        return emotions_counter
        
    def serialize(self, path):
        return load(path)

    @classmethod
    def deserialize(cls, path):
        dump(self, path)