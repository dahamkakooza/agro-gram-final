import React, { useState, useRef } from 'react';
import { Card, Button, FileUpload, ImagePreview, LoadingSpinner } from '@agro-gram/ui';
import './RemoteDiagnosis.css';

const RemoteDiagnosis = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const analyzeImages = async () => {
    if (uploadedImages.length === 0) return;

    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResult({
        disease: 'Powdery Mildew',
        confidence: 87,
        severity: 'Moderate',
        recommendations: [
          'Apply sulfur-based fungicide',
          'Improve air circulation',
          'Remove affected leaves',
          'Monitor humidity levels'
        ],
        treatment: {
          products: ['Sulfur Dust', 'Neem Oil'],
          schedule: 'Apply every 7-10 days',
          precautions: 'Avoid application in direct sunlight'
        }
      });
      setAnalyzing(false);
    }, 3000);
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  return (
    <div className="remote-diagnosis-page">
      <div className="page-header">
        <h1>🔍 Remote Diagnosis</h1>
        <p>Upload crop images for AI-powered disease and pest identification</p>
      </div>

      <div className="diagnosis-grid">
        <Card className="upload-section">
          <h3>Image Upload</h3>
          <FileUpload
            ref={fileInputRef}
            onFilesSelected={handleImageUpload}
            accept="image/*"
            multiple
          />
          
          {uploadedImages.length > 0 && (
            <div className="uploaded-images">
              <h4>Uploaded Images ({uploadedImages.length})</h4>
              <div className="image-grid">
                {uploadedImages.map(image => (
                  <div key={image.id} className="image-item">
                    <ImagePreview src={image.url} alt={image.name} />
                    <Button 
                      size="small" 
                      variant="danger"
                      onClick={() => removeImage(image.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="primary" 
                onClick={analyzeImages}
                disabled={analyzing}
                fullWidth
              >
                {analyzing ? <LoadingSpinner size="small" /> : 'Analyze Images'}
              </Button>
            </div>
          )}
        </Card>

        <Card className="analysis-results">
          <h3>Analysis Results</h3>
          {analyzing ? (
            <div className="analyzing">
              <LoadingSpinner size="large" />
              <p>Analyzing images with AI...</p>
            </div>
          ) : analysisResult ? (
            <div className="results-content">
              <div className="diagnosis-header">
                <h4>Diagnosis: {analysisResult.disease}</h4>
                <div className="confidence">
                  Confidence: {analysisResult.confidence}%
                </div>
                <div className={`severity ${analysisResult.severity.toLowerCase()}`}>
                  Severity: {analysisResult.severity}
                </div>
              </div>

              <div className="recommendations">
                <h5>Recommended Actions</h5>
                <ul>
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="treatment-plan">
                <h5>Treatment Plan</h5>
                <div className="treatment-details">
                  <p><strong>Products:</strong> {analysisResult.treatment.products.join(', ')}</p>
                  <p><strong>Schedule:</strong> {analysisResult.treatment.schedule}</p>
                  <p><strong>Precautions:</strong> {analysisResult.treatment.precautions}</p>
                </div>
              </div>

              <div className="action-buttons">
                <Button variant="primary">Save Diagnosis</Button>
                <Button variant="outline">Share with Farmer</Button>
                <Button variant="outline">Order Recommended Products</Button>
              </div>
            </div>
          ) : (
            <div className="no-results">
              <p>Upload images to get started with diagnosis</p>
            </div>
          )}
        </Card>

        <Card className="diagnosis-tools">
          <h3>Diagnosis Tools</h3>
          <div className="tools-grid">
            <Button 
              variant="outline" 
              fullWidth
              onClick={() => console.log('Open crop scanner')}
            >
              🌱 Crop Health Scanner
            </Button>
            <Button 
              variant="outline" 
              fullWidth
              onClick={() => console.log('Open pest identifier')}
            >
              🐛 Pest Identifier
            </Button>
            <Button 
              variant="outline" 
              fullWidth
              onClick={() => console.log('Open weather analysis')}
            >
              🌦️ Weather Impact Analysis
            </Button>
            <Button 
              variant="outline" 
              fullWidth
              onClick={() => console.log('Open soil analysis')}
            >
              🌱 Soil Health Analysis
            </Button>
          </div>
        </Card>

        <Card className="recent-diagnoses">
          <h3>Recent Diagnoses</h3>
          <div className="diagnoses-list">
            <div className="diagnosis-item">
              <div className="diagnosis-info">
                <strong>Tomato Blight</strong>
                <span>Farm: Johnson Organic</span>
                <span>Date: 2024-01-15</span>
              </div>
              <Badge color="green">Resolved</Badge>
            </div>
            <div className="diagnosis-item">
              <div className="diagnosis-info">
                <strong>Corn Borer</strong>
                <span>Farm: Smith Fields</span>
                <span>Date: 2024-01-14</span>
              </div>
              <Badge color="yellow">In Progress</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RemoteDiagnosis;