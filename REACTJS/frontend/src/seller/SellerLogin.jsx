import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
import { useAuth } from "../contextapi/AuthContext";
import { toast } from "react-toastify"; // No ToastContainer here
import "react-toastify/dist/ReactToastify.css";

export default function SellerLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

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
    try {
      const response = await axios.post(
        `${config.url}/seller/checksellerlogin`,
        formData
      );

      if (response.status === 200) {
        // Handle JWT authentication
        handleLogin(response.data);
        toast.success("Login Success 🎉");
        // Store seller data in session storage
        sessionStorage.setItem("seller", JSON.stringify(response.data));
        setTimeout(() => {
          navigate("/sellerhome");
        }, 1500);
      } else {
        setMessage(response.data);
      }
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data;
        setError(errorMsg);

        // Ensure errorMsg is a string before using .toLowerCase()
        const errorMessage = typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg);

        if (errorMessage.toLowerCase().includes("invalidpassword")) {
          toast.error("Invalid Password ❌");
        } else {
          toast.error(errorMessage);
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">SAVE N SERVE</h1>
         
        </div>

        <h2 className="text-xl sm:text-2xl text-center font-semibold text-gray-800 mb-4">
          Donor Login
        </h2>

        {message && (
          <p className="text-center text-green-600 font-bold">{message}</p>
        )}
        {error && <p className="text-center text-red-600 font-bold">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="text-green-500 hover:underline mb-4"
            >
              Clear Form
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-700">
            Don't have an account?
            <Link
              to="/sellerregistration"
              className="text-green-500 hover:underline ml-1"
            >
              Create Account
            </Link>
          </p>
          <Link
            to="/sforgotpassword"
            className="text-green-500 hover:underline block mt-2"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
