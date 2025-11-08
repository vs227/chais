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
  Filler,
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
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
  LineElement,
  Filler
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

    const plasma = [
      '#0d0887', '#41049d', '#6a00a8', '#8f0da4', '#b12a90',
      '#cc4778', '#e16462', '#f2844b', '#fca636', '#f0f921'
    ];
    const genderColors = { male: '#1f77b4', female: '#e377c2' };

    const diseasePrevalence = Object.entries(analyticsData.diseasePrevalence)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const timeTrends = Object.entries(analyticsData.timeTrends)
      .sort(([a], [b]) => new Date(a) - new Date(b));

    return {
      ageGroup: {
        labels: Object.keys(analyticsData.ageGroups),
        datasets: [{ data: Object.values(analyticsData.ageGroups), backgroundColor: plasma, borderWidth: 0 }],
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
          backgroundColor: [genderColors.male, 'rgba(31, 119, 180, 0.4)', genderColors.female, 'rgba(227, 119, 194, 0.4)'],
          borderWidth: 0,
        }],
      },
      diseasePrevalence: {
        labels: diseasePrevalence.map(([disease]) => disease),
        datasets: [{
          label: 'Patient Count',
          data: diseasePrevalence.map(([, count]) => count),
          backgroundColor: plasma,
          borderColor: '#ffffff',
          borderWidth: 1,
        }],
      },
      bloodPressure: {
        labels: Object.keys(analyticsData.bloodPressure),
        datasets: [{
          data: Object.values(analyticsData.bloodPressure),
          backgroundColor: plasma,
          borderWidth: 0,  
        }],
      },
      timeTrends: {
        labels: timeTrends.map(([month]) => month),
        datasets: [{
          label: 'Records Added',
          data: timeTrends.map(([, count]) => count),
          fill: true,
          backgroundColor: 'rgba(31, 119, 180, 0.2)',
          borderColor: '#1f77b4',
          tension: 0.3,
        }],
      },
    };
  };

  const chartData = generateChartData();

  const renderChart = (data, title, ChartComponent, options = {}, className = '') => {
    if (loading) return <div className={`chart-card loading ${className}`}><div className="spinner"></div><p>Loading...</p></div>;
    if (error) return <div className={`chart-card error ${className}`}><h3>Error</h3><p>{error}</p></div>;
    if (!analyticsData) return <div className={`chart-card no-data ${className}`}><h3>No Data</h3></div>;

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
        title: { display: true, text: title, font: { size: 16, family: "'Inter', sans-serif" }, color: '#333' },
      },
    };

    return (
      <div className={`chart-card ${className}`}>
        <ChartComponent data={data} options={{...defaultOptions, ...options}} />
      </div>
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Health Analytics Dashboard</h1>
      </div>

      <div className="charts-grid">
        {renderChart(chartData.diseasePrevalence, 'Top 10 Disease Prevalence', Bar, {
          indexAxis: 'y',
          scales: { 
            x: { 
              grid: { color: '#e0e0e0' },
              min: 0,
              suggestedMax: 30
            }, 
            y: { grid: { display: false } } 
          },
          plugins: { legend: { display: false } }
        }, 'span-two')}

        {renderChart(chartData.ageGroup, 'Age Distribution', Pie, {
           plugins: { legend: { position: 'left' } }
        })}

        {renderChart(chartData.bloodPressure, 'Blood Pressure Analysis', Doughnut, {
           plugins: { legend: { position: 'left' } }
        })}

        {renderChart(chartData.heartDisease, 'Heart Disease by Gender', Pie, {}, 'span-two')}

        {renderChart(chartData.timeTrends, 'Monthly Health Record Trends', Line, {
          scales: { x: { grid: { display: false } }, y: { grid: { color: '#e0e0e0' } } }
        }, 'span-two')}
      </div>
    </div>
  );
}