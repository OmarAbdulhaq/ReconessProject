import speech_recognition as sr
from deepmultilingualpunctuation import PunctuationModel
from nltk.tokenize import sent_tokenize
from transformers import pipeline

def setContextConfigs():
    r = sr.Recognizer()
    punctuator = PunctuationModel()
    sentiment_model = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion")
    return r, punctuator, sentiment_model

def transcribe_audio(path, recognizer):
    with sr.AudioFile(path) as source:
        audio = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio)
            return text
        except sr.UnknownValueError:
            print("Google Speech Recognition could not understand the audio")
            return None
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition service; {e}")
            return None

def punctuate_text(text, punctuator):
    punctuated_text = punctuator.restore_punctuation(text)
    return punctuated_text

def divide_to_sentences(text):
    sentences = sent_tokenize(text)
    return sentences

def analyze_emotion(sentences, sentiment_model):
    results = sentiment_model(sentences)
    return results

def SAPipeline(audio_path):
    recognizer, punctuator, sentiment_model = setContextConfigs()
    transcribed_text = transcribe_audio(audio_path, recognizer)
    if transcribed_text:
        punctuated_text = punctuate_text(transcribed_text, punctuator)
        sentences = divide_to_sentences(punctuated_text)
        emotion_analysis = analyze_emotion(sentences, sentiment_model)
        return emotion_analysis
    else:
        return []