import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PlusCircleIcon,
  ClipboardListIcon,
  UserCircleIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/outline";
import axios from "axios";
import config from "../config";

export default function SellerHome() {
  const [seller, setSeller] = useState(null);
  const [donationCount, setDonationCount] = useState(0);
  const [timerDonations, setTimerDonations] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSeller = sessionStorage.getItem("seller");
    if (storedSeller) {
      const parsedSeller = JSON.parse(storedSeller);
      setSeller(parsedSeller);
      fetchStats(parsedSeller.id);
    } else {
      navigate("/sellerlogin");
    }
    // eslint-disable-next-line
  }, [navigate]);

  const fetchStats = async (sellerId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.url}/product/viewproductsbyseller/${sellerId}`);
      setDonationCount(res.data.length || 0);
      setTimerDonations(res.data.filter(p => p.timer && Number(p.timer) > 0).length);
    } catch {
      setDonationCount(0);
      setTimerDonations(0);
    } finally {
      setLoading(false);
    }
  };

  const profileCompletion = seller
    ? Math.round(
        [
          seller.name,
          seller.email,
          seller.username,
          seller.location,
          seller.nationalidno,
          seller.mobileno,
        ].filter(Boolean).length / 6 * 100
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl">
        {/* Animated Greeting */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-lg p-8 mb-8 animate-fadeIn">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-full w-24 h-24 flex items-center justify-center shadow-lg border-4 border-green-100 animate-popIn">
              <span className="text-white text-5xl font-bold select-none">
                {seller?.name ? seller.name.charAt(0).toUpperCase() : <UserCircleIcon className="w-14 h-14" />}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-green-800 mb-1 animate-slideIn">
                Welcome{seller?.name ? `, ${seller.name}` : ""}!
              </h1>
              <p className="text-gray-600 text-lg">
                Your personal donation dashboard.
              </p>
            </div>
          </div>
          <div className="mt-8 md:mt-0 flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">Profile Completion</span>
            <div className="w-36 bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-green-700 mt-1">{profileCompletion}%</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col items-center bg-green-100 rounded-lg shadow p-6 hover:shadow-lg transition group">
            <ClipboardListIcon className="w-10 h-10 mb-2 text-green-600 group-hover:scale-110 transition" />
            <span className="font-bold text-2xl text-green-800">{loading ? "..." : donationCount}</span>
            <span className="text-xs text-green-700 mt-1">Total Donations</span>
          </div>
          <div className="flex flex-col items-center bg-green-50 rounded-lg shadow p-6 hover:shadow-lg transition group">
            <ClockIcon className="w-10 h-10 mb-2 text-green-500 group-hover:scale-110 transition" />
            <span className="font-bold text-2xl text-green-700">{loading ? "..." : timerDonations}</span>
            <span className="text-xs text-green-600 mt-1">With Timer</span>
          </div>
          <div className="flex flex-col items-center bg-green-50 rounded-lg shadow p-6 hover:shadow-lg transition group">
            <CheckCircleIcon className="w-10 h-10 mb-2 text-green-500 group-hover:scale-110 transition" />
            <span className="font-bold text-2xl text-green-700">{profileCompletion}%</span>
            <span className="text-xs text-green-600 mt-1">Profile Complete</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Link
            to="/addproduct"
            className="flex flex-col items-center bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md p-6 transition-all duration-200 group"
          >
            <PlusCircleIcon className="w-10 h-10 mb-2 group-hover:scale-110 transition" />
            <span className="font-semibold text-lg">Add Donation</span>
            <span className="text-xs mt-1">Create a new food donation</span>
          </Link>
          <Link
            to="/sellerproducts"
            className="flex flex-col items-center bg-green-100 hover:bg-green-200 text-green-800 rounded-lg shadow-md p-6 transition-all duration-200 group"
          >
            <ClipboardListIcon className="w-10 h-10 mb-2 group-hover:scale-110 transition" />
            <span className="font-semibold text-lg">My Donations</span>
            <span className="text-xs mt-1">{loading ? "Loading..." : `${donationCount} total`}</span>
          </Link>
          <Link
            to="/sellerprofile"
            className="flex flex-col items-center bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg shadow-md p-6 transition-all duration-200 group"
          >
            <UserCircleIcon className="w-10 h-10 mb-2 group-hover:scale-110 transition" />
            <span className="font-semibold text-lg">My Profile</span>
            <span className="text-xs mt-1">View &amp; edit profile</span>
          </Link>
        </div>

        {/* Food Items Available for Donation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Food Items Available for Donation</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            {/* Import sample food items from SampleFoodData.js */}
            {React.createElement(() => {
              const sampleFoodItems = require('../components/SampleFoodData').default;
              const FoodItemCard = require('../components/FoodItemCard').default;
              
              return (
                <>
                  {sampleFoodItems.map(item => (
                    <FoodItemCard key={item.id} item={item} />
                  ))}
                </>
              );
            })}
          </div>
          
          <div className="flex justify-center mt-4">
            <Link
              to="/addproduct"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Add New Food Item
            </Link>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-6 h-6 text-green-500 mr-2" />
            <h2 className="text-lg font-semibold text-green-800">Recent Activity</h2>
          </div>
          <ul className="text-gray-600 text-sm space-y-3">
            <li className="flex items-center">
              <ClockIcon className="w-5 h-5 text-green-500 mr-2" />
              <span>
                <span className="font-medium text-green-700">Tip:</span> Use the timer to auto-remove expired donations.
              </span>
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              <span>
                <span className="font-medium text-green-700">Reminder:</span> Keep your profile updated for better trust.
              </span>
            </li>
            <li className="flex items-center">
              <InformationCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              <span>
                <span className="font-medium text-green-700">Need help?</span> Contact support from your profile page.
              </span>
            </li>
          </ul>
        </div>
      </div>
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.7s ease; }
        .animate-popIn { animation: popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
        .animate-slideIn { animation: slideIn 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideIn { 0% { opacity: 0; transform: translateY(20px);} 100% { opacity: 1; transform: translateY(0);} }
      `}</style>
    </div>
  );
}
