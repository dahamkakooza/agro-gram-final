import React, { useState, useEffect } from 'react';
import { Card, Button, Table, SearchInput, Badge, Modal } from '@agro-gram/ui';
import { dashboardAPI } from '../../services/services';
import './KnowledgeBase.css';

const KnowledgeBase = () => {
  const [solutions, setSolutions] = useState([]);
  const [filteredSolutions, setFilteredSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSolution, setSelectedSolution] = useState(null);

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  useEffect(() => {
    filterSolutions();
  }, [solutions, searchTerm, selectedCategory]);

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getTechnicalAdvisorDashboard();
      if (response.success) {
        setSolutions(response.data.knowledge_base || []);
      }
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSolutions = () => {
    let filtered = solutions;

    if (searchTerm) {
      filtered = filtered.filter(solution =>
        solution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solution.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solution.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(solution => solution.category === selectedCategory);
    }

    setFilteredSolutions(filtered);
  };

  const categories = ['all', ...new Set(solutions.map(s => s.category))];

  const getEffectivenessBadge = (effectiveness) => {
    if (effectiveness >= 90) return { color: 'green', label: 'Excellent' };
    if (effectiveness >= 80) return { color: 'yellow', label: 'Good' };
    if (effectiveness >= 70) return { color: 'orange', label: 'Fair' };
    return { color: 'red', label: 'Poor' };
  };

  return (
    <div className="knowledge-base-page">
      <div className="page-header">
        <h1>📚 Knowledge Base</h1>
        <Button variant="primary">Add Solution</Button>
      </div>

      <div className="search-filters">
        <div className="search-section">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search solutions..."
          />
        </div>
        <div className="filter-section">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="knowledge-grid">
        <Card className="solutions-list">
          <h3>Agricultural Solutions</h3>
          <div className="solutions-count">
            {filteredSolutions.length} solutions found
          </div>
          <Table
            columns={[
              { key: 'title', label: 'Solution' },
              { key: 'category', label: 'Category' },
              { key: 'effectiveness', label: 'Effectiveness' },
              { key: 'usage_count', label: 'Used' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={filteredSolutions.map(solution => {
              const effectiveness = getEffectivenessBadge(solution.effectiveness);
              return {
                ...solution,
                effectiveness: (
                  <div className="effectiveness-display">
                    <Badge color={effectiveness.color}>{effectiveness.label}</Badge>
                    <span className="effectiveness-value">{solution.effectiveness}%</span>
                  </div>
                ),
                usage_count: `${solution.usage_count} times`,
                actions: (
                  <div className="action-buttons">
                    <Button 
                      size="small" 
                      onClick={() => setSelectedSolution(solution)}
                    >
                      View
                    </Button>
                    <Button size="small" variant="outline">
                      Apply
                    </Button>
                  </div>
                )
              };
            })}
          />
        </Card>

        <Card className="recent-solutions">
          <h3>Recently Used Solutions</h3>
          <div className="recent-list">
            {solutions.slice(0, 5).map(solution => (
              <div key={solution.id} className="recent-item">
                <div className="solution-title">{solution.title}</div>
                <div className="solution-meta">
                  <span className="category">{solution.category}</span>
                  <span className="effectiveness">{solution.effectiveness}% effective</span>
                </div>
                <Button size="small">Use Again</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="best-practices">
          <h3>Best Practices</h3>
          <div className="practices-list">
            {solutions.filter(s => s.effectiveness >= 90).map(practice => (
              <div key={practice.id} className="practice-item">
                <div className="practice-header">
                  <strong>{practice.title}</strong>
                  <Badge color="green">Best</Badge>
                </div>
                <div className="practice-description">
                  {practice.description}
                </div>
                <div className="practice-stats">
                  <span>Adoption: {practice.adoption_rate}%</span>
                  <span>Success: {practice.effectiveness}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={!!selectedSolution}
        onClose={() => setSelectedSolution(null)}
        title={selectedSolution?.title}
        size="large"
      >
        {selectedSolution && (
          <div className="solution-details">
            <div className="solution-header">
              <div className="solution-meta">
                <Badge>{selectedSolution.category}</Badge>
                <div className="effectiveness">
                  Effectiveness: {selectedSolution.effectiveness}%
                </div>
                <div className="usage">
                  Used {selectedSolution.usage_count} times
                </div>
              </div>
            </div>

            <div className="solution-content">
              <div className="description-section">
                <h4>Description</h4>
                <p>{selectedSolution.description}</p>
              </div>

              <div className="implementation-section">
                <h4>Implementation Steps</h4>
                <ol className="steps-list">
                  {selectedSolution.steps?.map((step, index) => (
                    <li key={index} className="step-item">
                      <strong>Step {index + 1}:</strong> {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="materials-section">
                <h4>Required Materials</h4>
                <ul className="materials-list">
                  {selectedSolution.materials?.map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
              </div>

              <div className="action-section">
                <Button variant="primary">Apply This Solution</Button>
                <Button variant="outline">Save to Favorites</Button>
                <Button variant="outline">Share with Farmer</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KnowledgeBase;