import React from 'react';
import './style.css'
import Sidebar from '../Sidebar';

function AboutUsPage() {

    return (
        <div className="d-flex" style={{ height: '100vh' }}>
            <Sidebar />
            <div className="mainContentStyle">
                <div className="containerStyle">
                    <h1 className="headingStyle"><b>About Medialysis</b></h1>
                </div>
                <div className="containerStyle">
                    <h4>
                        Medialysis is an emotion extraction API that leverages advanced algorithms to recognize emotions through faces, voice, and context. Our platform empowers users with comprehensive insights to understand emotional responses deeply.
                    </h4>
                </div>
                <div className="containerStyle">
                    <h4>
                        Founded on the principles of accessibility and precision, Medialysis offers cutting-edge technology to analyze media files effortlessly. With our user-friendly interface, we aim to make emotion analysis accessible to everyone.
                    </h4>
                </div>
                <div className="containerStyle">
                    <h4>
                        Explore the power of emotion analysis with Medialysis and unlock valuable insights from your media content.
                    </h4>
                </div>
            </div>
        </div>
    );
}


export default AboutUsPage;