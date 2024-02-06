import os
import math
import matplotlib.pyplot as plt
from collections import Counter
from moviepy.editor import VideoFileClip, AudioFileClip
import torchaudio
import torch
from transformers import Wav2Vec2FeatureExtractor, HubertForSequenceClassification

def setSERConfigs():
    EMOTIONMAP = {0: 'Neutral', 1: 'Angry', 2: 'Happy', 3: 'Sad', 4: 'Other'}
    feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained("facebook/hubert-large-ls960-ft")
    model = HubertForSequenceClassification.from_pretrained("xbgoose/hubert-speech-emotion-recognition-russian-dusha-finetuned")
    return EMOTIONMAP, feature_extractor, model

def extract_audio_from_video(video_file, output_audio_file):
    video = VideoFileClip(video_file)
    audio = video.audio
    audio.write_audiofile(output_audio_file)
    print(f"Audio extracted and saved to {output_audio_file}")

def convert_audio_to_wav(audio_file_path, output_path, feature_extractor):
    audio_clip = AudioFileClip(audio_file_path)
    audio_clip.write_audiofile(output_path, codec='pcm_s16le')
    os.remove(audio_file_path)

def process_audio_segment(segment_waveform, feature_extractor, model, EMOTIONMAP):
    inputs = feature_extractor(
        segment_waveform, 
        sampling_rate=feature_extractor.sampling_rate, 
        return_tensors="pt",
        padding=True,
        max_length=16000,
        truncation=True
    )
    logits = model(inputs.input_values).logits
    predictions = torch.argmax(logits, dim=-1)
    emotions = [EMOTIONMAP[prediction.item()] for prediction in predictions]
    return emotions

def split_and_process_audio(filename, segment_length, feature_extractor, model, EMOTIONMAP):
    waveform, sample_rate = torchaudio.load(filename)
    waveform = waveform.mean(dim=0).unsqueeze(0) 
    num_samples_per_segment = sample_rate * segment_length
    total_segments = math.ceil(waveform.size(1) / num_samples_per_segment)
    emotions = []

    for segment in range(total_segments):
        start_sample = int(segment * num_samples_per_segment)
        end_sample = int(start_sample + num_samples_per_segment)
        
        segment_waveform = waveform[:, start_sample:end_sample]
        if segment_waveform.size(1) < num_samples_per_segment:
            continue

        segment_emotions = process_audio_segment(segment_waveform, feature_extractor, model, EMOTIONMAP)
        emotions.extend(segment_emotions)

    return emotions

def plot_emotion_distribution(emotions):
    emotion_counts = Counter(emotions)
    plt.figure(figsize=(8, 8))
    plt.pie(emotion_counts.values(), labels=emotion_counts.keys(), autopct='%1.1f%%', startangle=140)
    plt.title('Emotion Distribution in Audio')
    plt.show()

def SERPipeline(video_file, segment_length=1):
    EMOTIONMAP, feature_extractor, model = setSERConfigs()
    base_name = os.path.splitext(os.path.basename(video_file))[0]
    output_audio_file = f"output/{base_name}.mp3"
    output_wav_file = f"output/{base_name}.wav"
    
    extract_audio_from_video(video_file, output_audio_file)
    convert_audio_to_wav(output_audio_file, output_wav_file, feature_extractor)
    emotions = split_and_process_audio(output_wav_file, segment_length, feature_extractor, model, EMOTIONMAP)
    plot_emotion_distribution(emotions)
    return emotions