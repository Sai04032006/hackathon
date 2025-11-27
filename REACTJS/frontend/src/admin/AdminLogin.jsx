import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
import { useAuth } from "../contextapi/AuthContext";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { handleLogin, handleLogout } = useAuth();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Hardcoded admin credentials check
    if (formData.username === "admin" && formData.password === "admin123") {
      // Create mock admin data with proper JWT format
      const adminData = {
        token: "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImV4cCI6MTcwMDAwMDAwMH0.admin_signature",
        admin: {
          username: "admin",
          password: "admin123"
        },
        role: "ADMIN"
      };
      
      // Handle authentication
      handleLogin(adminData);
      
      // Store admin data in session storage
      sessionStorage.setItem("admin", JSON.stringify(adminData));
      // Store token separately for API calls
      sessionStorage.setItem("token", adminData.token);
      
      toast.success("Admin Login Success 🎉");
      setTimeout(() => {
        navigate("/adminhome");
      }, 1500);
      return;
    }
    
    // If not using hardcoded credentials, try the API
    try {
      const response = await axios.post(`${config.url}/admin/checkadminlogin`, formData);

      if (response.status === 200) {
        // Handle JWT authentication
        handleLogin(response.data);
        // Store admin data in session storage
        sessionStorage.setItem("admin", JSON.stringify(response.data));
        toast.success("Login Success 🎉");
        setTimeout(() => {
          navigate("/adminhome");
        }, 1500);
      } else {
        setMessage(response.data);
      }
    } catch (error) {
      // If API fails but credentials match hardcoded values, allow login
      if (formData.username === "admin" && formData.password === "admin123") {
        const adminData = {
          token: "admin-token",
          admin: {
            username: "admin",
            password: "admin123"
          },
          role: "ADMIN"
        };
        handleLogin(adminData);
        sessionStorage.setItem("admin", JSON.stringify(adminData));
        toast.success("Admin Login Success 🎉");
        setTimeout(() => {
          navigate("/adminhome");
        }, 1500);
      } else if (error.response) {
        const errorMsg = error.response.data;
        setError(errorMsg);
        if (errorMsg.toLowerCase().includes("invalidpassword")) {
          toast.error("Invalid Password ❌");
        } else {
          toast.error(errorMsg);
        }
      } else {
        toast.error("An unexpected error occurred.");
        setError("An unexpected error occurred.");
      }
    }
  };

  const clearForm = () => {
    setFormData({
      username: "",
      password: "",
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md border border-green-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-700">SAVE N SERVE</h1>
          <p className="text-green-500 mt-1">Admin Dashboard</p>
        </div>

        <h2 className="text-xl sm:text-2xl text-center font-semibold text-green-800 mb-4">
          Admin Login
        </h2>
        {message && <p className="text-center text-green-600 font-bold">{message}</p>}
        {error && <p className="text-center text-red-600 font-bold">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-green-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-3 py-2 sm:py-3 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-green-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 sm:py-3 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 sm:py-3 rounded-md hover:bg-green-600 transition duration-200 mb-4"
          >
            Sign In
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={clearForm}
              className="text-green-600 hover:underline mb-4"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
