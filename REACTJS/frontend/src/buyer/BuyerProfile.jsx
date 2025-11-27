import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { UserCircleIcon, MailIcon, PhoneIcon, UserIcon, LocationMarkerIcon } from '@heroicons/react/outline';
import { useAuth } from '../contextapi/AuthContext';

export default function BuyerProfile() {
  const [buyer, setBuyer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBuyer, setEditedBuyer] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const { user, userRole, getAuthHeaders, setUser } = useAuth();

  useEffect(() => {
    const fetchBuyerData = async () => {
      setPageLoading(true);

      try {
        // 1) Prefer context user if role is BUYER
        if (user && (userRole === 'BUYER' || !userRole)) {
          setBuyer(user);
          setEditedBuyer(user);
        } else {
          // 2) Fallback: session keys 'buyer' or generic 'user'
          const storedBuyer = sessionStorage.getItem('buyer') || sessionStorage.getItem('user');
          if (storedBuyer) {
            const parsedBuyer = JSON.parse(storedBuyer);
            setBuyer(parsedBuyer);
            setEditedBuyer(parsedBuyer);
          }
        }

        setTimeout(() => {
          setPageLoading(false);
          setProfileVisible(true);
        }, 500);
      } catch (err) {
        console.error("Error fetching buyer data:", err);
        setPageLoading(false);
        setProfileVisible(true);
      }
    };

    fetchBuyerData();
  }, [user, userRole]);

  const handleEditChange = (e) => {
    setEditedBuyer({
      ...editedBuyer,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.put(
        `${config.url}/buyer/updatebuyer`,
        editedBuyer,
        { headers: getAuthHeaders() }
      );

      const savedBuyer = response.data?.buyer || editedBuyer;
      sessionStorage.setItem('buyer', JSON.stringify(savedBuyer));
      sessionStorage.setItem('user', JSON.stringify(savedBuyer));
      setBuyer(savedBuyer);
      setUser && setUser(savedBuyer);
      setIsEditing(false);
      setMessage(response.data?.message || "Profile updated successfully!");

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Error updating buyer:", err);
      const apiMessage = typeof err.response?.data === 'string' 
        ? err.response.data 
        : (err.response?.data?.message || err.message);
      setError(apiMessage || "Failed to update profile. Please try again.");

      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!buyer && !pageLoading) {
      const storedBuyer = sessionStorage.getItem('buyer') || sessionStorage.getItem('user');
      if (storedBuyer) {
        const parsedBuyer = JSON.parse(storedBuyer);
        setBuyer(parsedBuyer);
        setEditedBuyer(parsedBuyer);
      }
    }
  }, [buyer, pageLoading]);

  const getAnimationClass = (delayMs) => {
    return `animate-fade-in-${delayMs}`;
  };

  // Calculate profile completion percentage
  const profileCompletion = buyer
    ? Math.round(
        [
          buyer.name,
          buyer.email,
          buyer.username,
          buyer.address,
          buyer.mobileno,
        ].filter(Boolean).length / 5 * 100
      )
    : 0;

  // Add: Last updated and login info (simulate for demo)
  const lastUpdated = buyer?.updatedAt ? new Date(buyer.updatedAt).toLocaleString() : "N/A";
  const lastLogin = buyer?.lastLogin ? new Date(buyer.lastLogin).toLocaleString() : "N/A";

  // Add: Avatar color based on name
  const avatarColor = buyer?.name
    ? `hsl(${(buyer.name.charCodeAt(0) * 137) % 360}, 60%, 50%)`
    : "#22c55e";

  // Add: Social/Contact links (demo)
  const socialLinks = [
    { label: "Email", value: buyer?.email, icon: <MailIcon className="h-5 w-5 mr-1" />, href: `mailto:${buyer?.email}` },
    { label: "Phone", value: buyer?.mobileno, icon: <PhoneIcon className="h-5 w-5 mr-1" />, href: `tel:${buyer?.mobileno}` },
  ];

  if (!buyer && !pageLoading) {
    return (
      <div className="flex justify-center items-center h-64 animate-fadeIn">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md" role="alert">
          <p className="font-bold">Not Logged In</p>
          <p>Buyer information not found. Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h3 className="text-3xl font-bold text-center mb-8 relative overflow-hidden">
        <span className="relative z-10 inline-block logo-text after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-green-500 after:to-green-700 after:transform after:transition-all after:duration-300 hover:after:h-2">
          My Profile
        </span>
      </h3>

      {/* Profile Completion Bar */}
      {!pageLoading && (
        <div className="flex flex-col items-center mb-8">
          <span className="text-xs text-gray-500 mb-1">Profile Completion</span>
          <div className="w-48 bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          <span className="text-sm font-semibold text-green-700 mt-1">{profileCompletion}%</span>
        </div>
      )}

      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-md animate-slideDown">
          <p className="font-medium">{message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md animate-slideDown">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {pageLoading ? (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-pulse">
          <div className="bg-gradient-to-r from-green-500 to-green-700 px-6 py-4">
            <div className="h-6 bg-green-200 bg-opacity-50 rounded w-1/4 mb-2 skeleton-loading"></div>
            <div className="h-4 bg-green-200 bg-opacity-50 rounded w-2/4 skeleton-loading"></div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg mb-6 md:mb-0">
                <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 skeleton-loading"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 skeleton-loading"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 skeleton-loading"></div>
              </div>
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 skeleton-loading"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 skeleton-loading"></div>
                </div>
                <div className="border-b pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 skeleton-loading"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3 skeleton-loading"></div>
                </div>
                <div className="border-b pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 skeleton-loading"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 skeleton-loading"></div>
                </div>
                <div className="border-b pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 skeleton-loading"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/5 skeleton-loading"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex justify-center gap-4">
              <div className="h-10 bg-gradient-to-r from-green-500 to-green-700 rounded w-32 skeleton-loading"></div>
              <div className="h-10 bg-gray-200 rounded w-40 skeleton-loading"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-green-500 to-green-700 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-xl font-semibold text-white">Profile Details</h4>
              <p className="text-green-100 text-sm">Your account information</p>
            </div>
            <div className="mt-2 md:mt-0 flex flex-col md:items-end">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mb-1">
                Member since: {buyer?.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : "N/A"}
              </span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                Last updated: {lastUpdated}
              </span>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div
                  className={`flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg mb-6 md:mb-0 transform transition-all duration-300 hover:border-green-300 bg-gray-50 ${getAnimationClass(100)}`}
                >
                  <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center text-4xl text-white mb-4 shadow-lg transition-all duration-500 hover:scale-105">
                    {editedBuyer.name ? editedBuyer.name.charAt(0).toUpperCase() : <UserCircleIcon className="w-16 h-16" />}
                  </div>
                  <div className="w-full">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editedBuyer.name || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Full Name"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="w-full mt-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={editedBuyer.address || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Address"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editedBuyer.email || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Email"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="mobileno" className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                    <input
                      type="text"
                      name="mobileno"
                      value={editedBuyer.mobileno || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Phone Number"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editedBuyer.username || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400 transition-all duration-300"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedBuyer(buyer);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg mb-6 md:mb-0 bg-gray-50">
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-4xl text-white mb-4 shadow-lg"
                    style={{
                      background: avatarColor,
                      fontWeight: 700,
                      fontSize: "2.5rem",
                      letterSpacing: 1,
                    }}
                  >
                    {buyer.name ? buyer.name.charAt(0).toUpperCase() : <UserCircleIcon className="w-16 h-16" />}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{buyer.name}</h3>
                  <p className="text-sm text-gray-600">{buyer.address}</p>
                  <div className="mt-4 flex flex-col items-center">
                    <span className="text-xs text-gray-400">Username</span>
                    <span className="font-medium text-gray-700">{buyer.username}</span>
                  </div>
                  <div className="mt-4 flex flex-col items-center gap-1">
                    {socialLinks.map(
                      (link) =>
                        link.value && (
                          <a
                            key={link.label}
                            href={link.href}
                            className="flex items-center text-green-600 hover:underline text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.icon}
                            {link.value}
                          </a>
                        )
                    )}
                  </div>
                  <div className="mt-4 text-xs text-gray-400 text-center">
                    Last login: {lastLogin}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <div className="flex items-center">
                      <MailIcon className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                    </div>
                    <p className="font-medium text-gray-800">{buyer.email}</p>
                  </div>
                  <div className="border-b pb-2">
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-sm text-gray-500 font-medium">Phone</p>
                    </div>
                    <p className="font-medium text-gray-800">{buyer.mobileno || "Not provided"}</p>
                  </div>
                  <div className="border-b pb-2">
                    <div className="flex items-center">
                      <LocationMarkerIcon className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-sm text-gray-500 font-medium">Address</p>
                    </div>
                    <p className="font-medium text-gray-800">{buyer.address}</p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-sm text-gray-500 font-medium">Username</p>
                    </div>
                    <p className="font-medium text-gray-800">{buyer.username}</p>
                  </div>
                </div>
              </div>
              {/* Recent Activity Section */}
              <div className="mt-8 bg-gray-50 rounded-lg p-4 shadow-inner">
                <h5 className="text-green-700 font-semibold mb-2">Recent Activity</h5>
                <ul className="text-gray-600 text-sm list-disc pl-5 space-y-1">
                  <li>Checked available food donations</li>
                  <li>Updated profile information</li>
                  <li>Ordered food</li>
                </ul>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="px-6 py-4 text-center flex flex-col md:flex-row gap-4 justify-center">
              <button
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all duration-300"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-all duration-300"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .logo-text {
          display: inline-block;
          background: linear-gradient(90deg, #22c55e, #16a34a, #15803d, #16a34a, #22c55e);
          background-size: 200% auto;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          animation: shimmer 8s linear infinite;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
        .animate-fade-in-100 {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-delay: 100ms;
        }
        .animate-fade-in-200 {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-delay: 200ms;
        }
        .animate-fade-in-300 {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-delay: 300ms;
        }
        .animate-fade-in-400 {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-delay: 400ms;
        }
        .animate-fade-in-500 {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-delay: 500ms;
        }
        .animate-fade-in-600 {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-delay: 600ms;
        }
        .skeleton-loading {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}
