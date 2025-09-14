import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { getComprehensiveAnalytics } from '../utils/realDataService';
import './DataVisualization.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function DataVisualization() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getComprehensiveAnalytics();
      if (result.success) {
        setAnalyticsData(result.analytics);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const generateChartData = () => {
    if (!analyticsData) return {};

    const viridis = [
      '#440154', '#482878', '#3e4989', '#31688e', '#26828e',
      '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'
    ];

    const genderColors = { male: '#2196f3', female: '#e91e63' };

    return {
      genderDisease: {
        labels: Object.keys(analyticsData.genderDisease.male),
        datasets: [
          { label: 'Male', data: Object.values(analyticsData.genderDisease.male), backgroundColor: genderColors.male },
          { label: 'Female', data: Object.values(analyticsData.genderDisease.female), backgroundColor: genderColors.female },
        ],
      },
      ageGroup: {
        labels: Object.keys(analyticsData.ageGroups),
        datasets: [{ data: Object.values(analyticsData.ageGroups), backgroundColor: viridis, borderWidth: 0 }],
      },
      heartDisease: {
        labels: ['Male - Yes', 'Male - No', 'Female - Yes', 'Female - No'],
        datasets: [{
          data: [
            analyticsData.heartDisease.male.yes,
            analyticsData.heartDisease.male.no,
            analyticsData.heartDisease.female.yes,
            analyticsData.heartDisease.female.no,
          ],
          backgroundColor: [genderColors.male, 'rgba(33, 150, 243, 0.5)', genderColors.female, 'rgba(233, 30, 99, 0.5)'],
          borderWidth: 0,
        }],
      },
    };
  };

  const chartData = generateChartData();

  const renderChart = (data, title, ChartComponent, className = '') => {
    if (loading) return <div className={`chart-card loading ${className}`}><div className="spinner"></div><p>Loading...</p></div>;
    if (error) return <div className={`chart-card error ${className}`}><h3>Error</h3><p>{error}</p></div>;
    if (!analyticsData) return <div className={`chart-card no-data ${className}`}><h3>No Data</h3></div>;

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
        title: { display: true, text: title, font: { size: 18, family: "'Inter', sans-serif" }, color: '#111' },
      },
      scales: (ChartComponent === Bar) ? {
        x: { grid: { display: false } },
        y: { grid: { color: '#f0f0f0' } }
      } : undefined,
    };

    return (
      <div className={`chart-card ${className}`}>
        <ChartComponent data={data} options={options} />
      </div>
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Health Analytics Dashboard</h1>
      </div>

      <div className="charts-grid">
        {renderChart(chartData.genderDisease, 'Disease Analysis by Gender', Bar, 'wide-chart')}

        {renderChart(chartData.ageGroup, 'Age Distribution', Pie)}
        {renderChart(chartData.heartDisease, 'Heart Disease by Gender', Doughnut)}
      </div>
    </div>
  );
}
