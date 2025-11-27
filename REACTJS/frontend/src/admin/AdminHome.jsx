import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import config from '../config';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Import the API utility with JWT token handling
import api from '../utils/api';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

export default function AdminHome() {
  const [sellerCount, setSellerCount] = useState(0);
  const [buyerCount, setBuyerCount] = useState(0);
  const [barChartData, setBarChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [adminUsername, setAdminUsername] = useState('');
  const [error, setError] = useState('');

  const fetchCountsAndUpdateCharts = async () => {
    try {
      // Get admin data from session storage
      const adminData = JSON.parse(sessionStorage.getItem('admin'));
      
      // Create headers with JWT token
      const headers = {
        'Authorization': `Bearer ${adminData?.token || ''}`
      };
      
      const sellersResponse = await axios.get(`${config.url}/admin/viewallsellers`, { headers });
      const buyersResponse = await axios.get(`${config.url}/admin/viewallbuyers`, { headers });

      const sellers = sellersResponse.data;
      const buyers = buyersResponse.data;
      setSellerCount(sellers.length);
      setBuyerCount(buyers.length);

      // Update bar chart data
      setBarChartData({
        labels: ['Donors', 'Recipients'],
        datasets: [
          {
            label: 'Count',
            data: [sellers.length, buyers.length],
            backgroundColor: ['#34D399', '#60A5FA'],
            borderColor: ['#059669', '#2563EB'],
            borderWidth: 1,
          },
        ],
      });

      // Update pie chart data
      setPieChartData({
        labels: ['Donors', 'Recipients'],
        datasets: [
          {
            data: [sellers.length, buyers.length],
            backgroundColor: ['#34D399', '#60A5FA'],
            hoverBackgroundColor: ['#059669', '#2563EB'],
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data || 'Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchCountsAndUpdateCharts();

    // Fetch admin username from session storage or context
    const adminData = JSON.parse(sessionStorage.getItem('admin'));
    const username = adminData?.admin?.username || 'Admin';
    setAdminUsername(username);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center px-4 py-8">
      {error && (
        <div className="w-full max-w-4xl bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-green-700 mb-4 drop-shadow-lg">
          Welcome, {adminUsername}!
        </h1>
        <p className="text-xl text-green-600">
          Manage Donors, Recipients, and administrative tasks with ease.
        </p>
      </div>

      {/* Counts Section in the Middle */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="bg-green-100 hover:bg-green-200 text-green-800 font-semibold p-8 rounded-lg shadow-lg text-center transition-all duration-300 mb-6 w-80">
          <h2 className="text-3xl font-bold mb-4">Total Donors</h2>
          <p className="text-5xl">{sellerCount}</p>
        </div>

        <div className="bg-green-100 hover:bg-green-200 text-green-800 font-semibold p-8 rounded-lg shadow-lg text-center transition-all duration-300 w-80">
          <h2 className="text-3xl font-bold mb-4">Total Recipients</h2>
          <p className="text-5xl">{buyerCount}</p>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="w-full max-w-4xl mb-10">
        {barChartData && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Pie Chart Section */}
      <div className="w-full max-w-2xl mb-10">
        {pieChartData && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
