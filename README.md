# Medialysis
![logo](https://github.com/OmarAbdulhaq/ReconessProject/assets/68372273/877e0f30-ed31-438f-8baa-caad02f128f2)
##
### Introduction
The website mainly focuses on presenting an effective solution towards understanding the sentiment analysis of humans via videos. Understanding the emotions is a pretty difficult task, however, since the revolution of Artificial Intelligence and its tools, it's become much easier to use models that behave in a predictive way in many things; sentiment is set as an example without mentioning. This website precisely analyzes the uploaded video's 3 main components, which are to be clear, the senses that allow us to understand the behaviour of human beings, precisely, the visual cues (facial expressions), the tone, and the speech context, which this website provides adequately.
##
### Problem
To address the issue properly, we have to talk about the way we precieve things as humans, we usually feel emotions, we interact and deal with these emotions, however, it's not that easy for everyone to understand what people are feeling at the moment without visual and vocal cues, not to mention, that these emotions could change within a second, therefore, there are issues we might face in life that would require for us to understand them to deal with people in a casual manner, where we can react towards the better part of humans, which is communication.
##
### Target
This problem could occur in many places in our regular lives other than in regular communication, especially if we're developing a business. A business model changes constantly, and for a stable business model, you need to understand what your consumers feel about the product, that's where the science of studying sentiments began. The problem of understanding visual and vocal analysis can be set in many areas, and these examples illustrate the usage of this website: 
- **Interviews**: Companies need to understand what the interviewee is feeling, since they're looking for confident members in their workplace.
- **Customers Segmentations**: This of course depends on the nature of the business, however if the business revolves around uploading videos of people speaking such as the ones uploaded on social media, sometimes the content has to be analyzed to be recommended properly to the segments based on the emotion given.
- **Interrogations**: Emotion is a cruital point in these sorts of inquisitions, since the interrogated party can lie within a second, and it can be detected via the emotion they feel, it mostly depends on body language, but facial cues are also a cruical part.
- **Neurodivergent People**: Some people which have certain disorders face the problem of identifying what people are feeling, for them it's pretty difficult to understand the emotion of the human being, therefore this website can help them get a better insight on what's going on in a scene of human interactions.
##
### Solution
The presented solution can provide comprehensive views on these issues, to be precise, they can monitor how the person is feeling within the mentioned senses. I'll go in detail here:
- **Visual Cues**: The face of the human can be one of the biggest indicators of how they're feeling, precisely, that the human can change their facial emotion within 0.25 seconds, which is why it's important to study the frames of the video, crop the faces in the frame, and analyze each emotion. Which is how this website had been developed.
- **Vocal Cues**: The tone of the human can tell geniuenity of emotion sometimes, which is why it's an important thing to study the vocal sentiment, the average human can change their tone within 0.33 seconds, which is why it can strengthen the analysis. The human voice can be broke down to multiple waves, which can be represented in a numeric value (MFCC matrix), which is how voice sentiment models are trained, therefore, the voice was broken down to segments of seconds to analyze the emotion within each second.
- **Context**: The understanding of what other people are saying is also cruical, which is why the audio was transcribed, punctuated (for sentence segmentation), and broken down into sentences. Now sentences give us a closer look into what people are saying, it's consisted of words, which are ordered in multiple ways, to gurantee the understanding of the spoken words, emotionally in our case.

The provided solution which is the main idea of the website, allows the user to interact with the main function, which gives them the generic analysis of the emotions in the video after they upload it. The user will be able to use the application once they have an account, and access to the main function. You might be wondering what's the purpose of having an account? Well, The application provides a place where the analysis of each analyzed video will be saved, the user will be able to revisit their previous analysis in their profile, which helps them track their results. Also there will be comments available for the moderators of the website to improve the website, so feel free to add your comments!
##
### Requirements
For windows users to be able to use the application, you need to make sure that the python version you're using is 3.10.11, and node version 20.10.0, and you need to install the required dependencies via these commands:
For backend:
```
cd ContentAnalysis\flaskapp\ (if you're at ReconessProject folder)
pip install -r requirements.txt
```

For frontend:
```
cd ContentAnalysis\reactapp\ (if you're at ReconessProject folder)
npm install
```
MongoDB database named ContentAnalysis, with 2 collections: UserInfo, and AnalysisInfo.
##
### Usage
You can easily use this application via terminal, in order to use it, you have to write these following commands:
For backend:
```
cd ContentAnalysis\flaskapp\ (if you're at ReconessProject folder)
.venv\Scripts\activate
flask run
```

For frontend:
```
cd ContentAnalysis\reactapp\ (if you're at ReconessProject folder)
npm start
```

The frontend is located at localhost:3000, the backend is located at localhost:5000
##
### Docker
The project is dockerized as well, and it's uploaded with the docker commands, you can use docker to run the application as well after creating the container and running the images codes.
##
### Notes
- The website is still under development level, improvements will happen in the near future.
- The website restricts users to upload videos under 50 mbs.
- The website requires an account to use the API.
- The website requires a token to use the API.
- The backend takes time to run, since there are AI models used in the process.
- The upload takes time to run, since there are AI models used to evaluate each face in each frame, each voice segment and each sentence mentioned in the video.
- There might be a couple misclassifications in the APIs, which would lead to faulty results, however, it generally gives decent results.
