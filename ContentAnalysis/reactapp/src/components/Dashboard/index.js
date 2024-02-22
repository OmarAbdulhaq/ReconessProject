import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, ButtonGroup, Button } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2';
import loadingGif from '../../images/loading.gif';
import 'bootstrap/dist/css/bootstrap.min.css';
import backgroundImage from '../../images/dashboard.webp';
import { AuthContext } from '../../AuthContext';
import './style.css'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PieController, BarController } from 'chart.js';
import Sidebar from '../Sidebar/index.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController,
  BarController
);

const chartColors = [
  'rgba(255, 99, 132, 0.2)',
  'rgba(54, 162, 235, 0.2)',
  'rgba(255, 206, 86, 0.2)',
  'rgba(75, 192, 192, 0.2)',
  'rgba(153, 102, 255, 0.2)',
  'rgba(255, 159, 64, 0.2)',
];

const borderColor = chartColors.map(color => color.replace('0.2', '1'));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true
};

const processDataForChart = (data, type) => {
  if (!data) return { labels: [], datasets: [] };
  
  const labels = Object.keys(data);
  const counts = Object.values(data);
  const total = counts.reduce((acc, count) => acc + count, 0);
  const percentages = counts.map(count => (count / total * 100).toFixed(2));

  return {
    labels,
    datasets: [{
      label: type === 'bar' ? 'Count per Category' : 'Percentage per Category',
      data: type === 'bar' ? counts : percentages,
      backgroundColor: chartColors.slice(0, labels.length),
      borderColor: borderColor.slice(0, labels.length),
      borderWidth: 1,
    }],
  };
};

const CommentSubmissionOverlay = ({ onClose, analysisId }) => { 
  const { user } = useContext(AuthContext);
  const [comment, setComment] = useState('');

  const handleSubmitComment = async () => {
    const commentData = {
      comment: comment,
      analysis_id: analysisId, 
    };
  
    try {
      const response = await fetch('http://localhost:5000/submit_comment', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data);
      alert('Comment submitted successfully.');
      onClose();
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment.');
    }
  };

  return (
    <div className="comment-modal-overlay">
      <div className="comment-modal">
        <div className="comment-modal-header">
          <h4 className="comment-modal-title">Add Comment</h4>
          <button onClick={onClose} className="comment-modal-close-button">&times;</button>
        </div>
        <textarea
          className="comment-modal-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={handleSubmitComment} className="comment-modal-submit">Submit Comment</button>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { username, videoname } = useParams();
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState({});
  const [selectedChartGroup, setSelectedChartGroup] = useState('overall');
  const [showCommentOverlay, setShowCommentOverlay] = useState(false);
  const [analysisId, setAnalysisId] = useState('');

  const toggleCommentOverlay = () => {
    setShowCommentOverlay(!showCommentOverlay);
  };

  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!user || !user.accessToken) {
        navigate('/');
        return;
      }

      setIsLoading(true);
      let url = 'http://localhost:5000/dashboard';
      if (username && videoname) {
        url = `${url}/${username}/${videoname}`;
      }

      try {
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${user.accessToken}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analysis data');
        }

        const data = await response.json();
        if (data && data.analysis_result) {
          setAnalysisData(data.analysis_result);
          setAnalysisId(data.filename || ''); 
        } else {
          console.log("No analysis data available.");
        }
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisData();
  }, [user, username, videoname, navigate]);

  const getOverallAnalysisSummary = (analysisData) => {
    const combinedData = { Negative: 0, Positive: 0, Neutral: 0 };
  
    Object.values(analysisData).forEach(typeData => {
      Object.entries(typeData).forEach(([emotion, count]) => {
        if (emotion === 'sad' || emotion === 'angry') {
          combinedData['Negative'] += count;
        } else if (emotion === 'happy') {
          combinedData['Positive'] += count;
        } else if (emotion === 'neutral') {
          combinedData['Neutral'] += count;
        }
      });
    });
  
    const total = Object.values(combinedData).reduce((acc, count) => acc + count, 0);
    const percentages = {
      Negative: total ? ((combinedData.Negative / total) * 100).toFixed(2) : 0,
      Positive: total ? ((combinedData.Positive / total) * 100).toFixed(2) : 0,
      Neutral: total ? ((combinedData.Neutral / total) * 100).toFixed(2) : 0,
    };
  
    const chartData = {
      labels: ['Negative', 'Positive', 'Neutral'],
      datasets: [
        {
          label: 'Count per Category',
          data: [combinedData.Negative, combinedData.Positive, combinedData.Neutral],
          backgroundColor: chartColors.slice(0, 3),
          borderColor: borderColor.slice(0, 3),
          borderWidth: 1,
        },
        {
          label: 'Percentage per Category',
          data: [percentages.Negative, percentages.Positive, percentages.Neutral],
          backgroundColor: chartColors.slice(0, 3),
        }
      ]
    };
  
    return { chartData };
  };

  const memoizedChartData = useMemo(() => {
    const overallAnalysis = getOverallAnalysisSummary(analysisData);
    return {
      overallPie: {
        labels: overallAnalysis.chartData.labels,
        datasets: [overallAnalysis.chartData.datasets[1]]
      },
      overallBar: {
        labels: overallAnalysis.chartData.labels,
        datasets: [overallAnalysis.chartData.datasets[0]] 
      },
      visualPie: processDataForChart(analysisData.visual, 'pie'),
      audioPie: processDataForChart(analysisData.audio, 'pie'),
      textPie: processDataForChart(analysisData.text, 'pie'),
      visualBar: processDataForChart(analysisData.visual, 'bar'),
      audioBar: processDataForChart(analysisData.audio, 'bar'),
      textBar: processDataForChart(analysisData.text, 'bar'),
    };
  }, [analysisData]);

  const renderChartsByGroup = (groupKey) => {
    const chartKeyPie = `${groupKey}Pie`;
    const chartKeyBar = `${groupKey}Bar`;
    const commonChartOptions = { ...chartOptions, maintainAspectRatio: true, aspectRatio: 1 };
  
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%' }}>
        <div className="chartContainerStyle">
          <Pie options={commonChartOptions} data={memoizedChartData[chartKeyPie]} />
        </div>
        <div className="chartContainerStyle">
          <Bar options={commonChartOptions} data={memoizedChartData[chartKeyBar]} />
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex" style={{ height: '100vh' }}>
        <Sidebar />
        <div style={{ flexGrow: 1, padding: '20px', backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', position: 'relative' }}>
            {isLoading ? (
                <div className='loadingContainerStyle'>
                    <img src={loadingGif} alt="Loading..." style={{ width: '100px', height: '100px' }} />
                    <h3><b>Loading...</b></h3>
                    <p className="mt-3">Analyzing media, please wait...</p>
                </div>
            ) : (
          <>
            <div className="chartHeader">
              <ButtonGroup aria-label="Chart selection">
                <Button className="chartButtons" onClick={() => setSelectedChartGroup('overall')}>Overall Sentiment</Button>
                <Button className="chartButtons" onClick={() => setSelectedChartGroup('visual')}>Recognized Faces</Button>
                <Button className="chartButtons" onClick={() => setSelectedChartGroup('audio')}>Audio Segments</Button>
                <Button className="chartButtons" onClick={() => setSelectedChartGroup('text')}>Parsed Sentences</Button>
              </ButtonGroup>
              <Button className="commentButton" onClick={toggleCommentOverlay}>Add Comment</Button>
            </div>
            <Card className="cardStyle">
              <Card.Body style={{ height: '650px' }}>
                {selectedChartGroup === 'overall'
                  ? <>
                      <Card.Title className="text-center mb-4">Overall Analysis</Card.Title>
                      {renderChartsByGroup('overall')}
                    </>
                  : <>
                      <Card.Title className="text-center mb-4">{selectedChartGroup.charAt(0).toUpperCase() + selectedChartGroup.slice(1)} Charts</Card.Title>
                      {renderChartsByGroup(selectedChartGroup)}
                    </>
                }
              </Card.Body>
            </Card>
            {showCommentOverlay && <CommentSubmissionOverlay
              onClose={() => setShowCommentOverlay(false)}
              analysisId={analysisId} 
            />}
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;