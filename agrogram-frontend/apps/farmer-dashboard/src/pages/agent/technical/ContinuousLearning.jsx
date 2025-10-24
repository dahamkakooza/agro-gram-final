import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, ProgressBar, Modal } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './ContinuousLearning.css';

const ContinuousLearning = () => {
  const [learningData, setLearningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState(null);

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getTechnicalAdvisorDashboard();
      if (response.success) {
        setLearningData(response.data);
      }
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrainingStatus = (status) => {
    const statusConfig = {
      completed: { color: 'green', label: 'Completed' },
      in_progress: { color: 'yellow', label: 'In Progress' },
      not_started: { color: 'gray', label: 'Not Started' },
      upcoming: { color: 'blue', label: 'Upcoming' }
    };
    return statusConfig[status] || { color: 'gray', label: status };
  };

  return (
    <div className="continuous-learning-page">
      <div className="page-header">
        <h1>🎓 Continuous Learning</h1>
        <Button variant="primary">Find Courses</Button>
      </div>

      <div className="learning-grid">
        <Card className="research-integration">
          <h3>Latest Research</h3>
          <div className="research-list">
            {learningData?.latest_research?.map(research => (
              <div key={research.id} className="research-item">
                <div className="research-content">
                  <div className="research-title">{research.title}</div>
                  <div className="research-meta">
                    <span className="source">{research.source}</span>
                    <span className="date">{research.publication_date}</span>
                  </div>
                  <div className="research-summary">
                    {research.summary}
                  </div>
                </div>
                <div className="research-actions">
                  <Button size="small">Study</Button>
                  <Button size="small" variant="outline">Save</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="training-materials">
          <h3>Training Materials</h3>
          <div className="materials-list">
            {learningData?.training_materials?.map(material => (
              <div key={material.id} className="material-item">
                <div className="material-type">{material.type}</div>
                <div className="material-content">
                  <div className="material-title">{material.title}</div>
                  <div className="material-meta">
                    <span className="duration">{material.duration}</span>
                    <span className="level">{material.level}</span>
                  </div>
                  <div className="material-progress">
                    <ProgressBar 
                      value={material.progress || 0} 
                      max={100}
                      showLabel
                    />
                  </div>
                </div>
                <div className="material-actions">
                  <Button 
                    size="small"
                    onClick={() => setSelectedTraining(material)}
                  >
                    {material.progress === 100 ? 'Review' : 'Continue'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="certification-tracker">
          <h3>Certification Tracker</h3>
          <div className="certifications-list">
            <div className="certification-item">
              <div className="certification-info">
                <div className="cert-name">Certified Crop Advisor</div>
                <div className="cert-organization">American Society of Agronomy</div>
                <div className="cert-status">
                  <Badge color="green">Active</Badge>
                </div>
              </div>
              <div className="cert-expiry">Expires: 2025-12-31</div>
            </div>
            <div className="certification-item">
              <div className="certification-info">
                <div className="cert-name">Organic Farming Specialist</div>
                <div className="cert-organization">Organic Trade Association</div>
                <div className="cert-status">
                  <Badge color="yellow">Renewal Due</Badge>
                </div>
              </div>
              <div className="cert-expiry">Expires: 2024-06-30</div>
            </div>
            <div className="certification-item">
              <div className="certification-info">
                <div className="cert-name">Precision Agriculture Expert</div>
                <div className="cert-organization">International Society of Precision Agriculture</div>
                <div className="cert-status">
                  <Badge color="blue">In Progress</Badge>
                </div>
              </div>
              <div className="cert-progress">
                <ProgressBar value={65} max={100} showLabel />
              </div>
            </div>
          </div>
        </Card>

        <Card className="skill-development">
          <h3>Skill Development</h3>
          <div className="skills-grid">
            <div className="skill-category">
              <h4>Technical Skills</h4>
              <div className="skills-list">
                <div className="skill-item">
                  <span className="skill-name">Soil Analysis</span>
                  <ProgressBar value={90} max={100} size="small" />
                </div>
                <div className="skill-item">
                  <span className="skill-name">Pest Management</span>
                  <ProgressBar value={85} max={100} size="small" />
                </div>
                <div className="skill-item">
                  <span className="skill-name">Irrigation Systems</span>
                  <ProgressBar value={75} max={100} size="small" />
                </div>
              </div>
            </div>
            <div className="skill-category">
              <h4>Digital Skills</h4>
              <div className="skills-list">
                <div className="skill-item">
                  <span className="skill-name">Remote Sensing</span>
                  <ProgressBar value={70} max={100} size="small" />
                </div>
                <div className="skill-item">
                  <span className="skill-name">Data Analysis</span>
                  <ProgressBar value={80} max={100} size="small" />
                </div>
                <div className="skill-item">
                  <span className="skill-name">GIS Applications</span>
                  <ProgressBar value={65} max={100} size="small" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="learning-recommendations">
          <h3>Recommended Learning</h3>
          <div className="recommendations-list">
            <div className="recommendation-item">
              <div className="rec-type">Course</div>
              <div className="rec-title">Advanced Soil Health Management</div>
              <div className="rec-description">
                Learn advanced techniques for soil analysis and improvement
              </div>
              <div className="rec-meta">
                <span>Duration: 8 hours</span>
                <span>Level: Advanced</span>
              </div>
              <Button size="small">Enroll</Button>
            </div>
            <div className="recommendation-item">
              <div className="rec-type">Webinar</div>
              <div className="rec-title">Climate-Smart Agriculture</div>
              <div className="rec-description">
                Strategies for adapting to climate change in farming
              </div>
              <div className="rec-meta">
                <span>Date: 2024-02-15</span>
                <span>Duration: 2 hours</span>
              </div>
              <Button size="small">Register</Button>
            </div>
          </div>
        </Card>

        <Card className="learning-stats">
          <h3>Learning Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">24</div>
              <div className="stat-label">Courses Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">156</div>
              <div className="stat-label">Learning Hours</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">8</div>
              <div className="stat-label">Certifications</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">94%</div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
          <div className="learning-streak">
            <div className="streak-count">🔥 15 day streak</div>
            <div className="streak-description">Keep going! You're on a learning streak.</div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={!!selectedTraining}
        onClose={() => setSelectedTraining(null)}
        title={selectedTraining?.title}
        size="large"
      >
        {selectedTraining && (
          <div className="training-details">
            <div className="training-header">
              <div className="training-meta">
                <Badge>{selectedTraining.type}</Badge>
                <span className="duration">{selectedTraining.duration}</span>
                <span className="level">{selectedTraining.level}</span>
              </div>
            </div>

            <div className="training-content">
              <div className="description-section">
                <h4>Course Description</h4>
                <p>{selectedTraining.description}</p>
              </div>

              <div className="objectives-section">
                <h4>Learning Objectives</h4>
                <ul>
                  {selectedTraining.objectives?.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>

              <div className="modules-section">
                <h4>Course Modules</h4>
                <div className="modules-list">
                  {selectedTraining.modules?.map((module, index) => (
                    <div key={index} className="module-item">
                      <div className="module-number">Module {index + 1}</div>
                      <div className="module-title">{module.title}</div>
                      <div className="module-duration">{module.duration}</div>
                      <Button size="small">Start</Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="action-section">
                <Button variant="primary" fullWidth>
                  {selectedTraining.progress === 100 ? 'Review Course' : 'Start Learning'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContinuousLearning;