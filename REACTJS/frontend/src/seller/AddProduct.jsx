import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AddProduct = () => {
  const [product, setProduct] = useState({
    category: '',
    name: '',
    description: '',
    cost: ''
  });
  const [productImage, setProductImage] = useState(null);
  const [seller, setSeller] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [timer, setTimer] = useState(0); // timer in minutes
  const [countdown, setCountdown] = useState(null); // seconds left for countdown
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    // Simulate initial page loading
    const fetchSellerData = async () => {
      setPageLoading(true);
      
      try {
        const storedSeller = sessionStorage.getItem('seller');
        if (storedSeller) {
          setSeller(JSON.parse(storedSeller));
        }
        
        // Simulate network delay for a more noticeable loading effect
        setTimeout(() => {
          setPageLoading(false);
          
          // Show form with a delay for smooth transition
          setTimeout(() => {
            setFormVisible(true);
          }, 300);
        }, 2000);
        
      } catch (err) {
        console.error("Error fetching seller data:", err);
        setPageLoading(false);
      }
    };
    
    fetchSellerData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "timer") {
      setTimer(value);
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProductImage(file);
    
    // Create preview URL
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!seller) {
      setError("Seller not logged in.");
      setIsLoading(false);
      return;
    }

    if (!timer || isNaN(timer) || timer <= 0) {
      setError("Please set a valid timer (in minutes).");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('productimage', productImage);
    formData.append('category', product.category);
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('cost', product.cost);
    formData.append('sid', seller.id);
    formData.append('timer', timer); // send timer to backend if needed

    try {
      const response = await axios.post(`${config.url}/product/addproduct`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage(response.data);
      setError('');
      setCountdown(timer * 60); // start countdown in seconds
      setTimerActive(true);

      // Reset form
      setProduct({
        category: '',
        name: '',
        description: '',
        cost: ''
      });
      setProductImage(null);
      setPreviewUrl(null);
      setTimer(0);
    } catch (error) {
      console.error(error.message);
      setMessage('');
      setError(error.response?.data || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown effect
  useEffect(() => {
    let interval = null;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && countdown === 0) {
      setMessage('');
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <h3 className="text-3xl font-bold text-center mb-8 relative overflow-hidden">
        <span className="relative z-10 inline-block logo-text after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-green-500 after:to-green-700 after:transform after:transition-all after:duration-300 hover:after:h-2">
          Add Food Item
        </span>
      </h3>
      
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
            <div className="h-6 bg-green-200 bg-opacity-50 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-green-200 bg-opacity-50 rounded w-2/4"></div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              </div>
              <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              </div>
              <div className="mb-4 md:col-span-2">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
              </div>
              <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              </div>
              <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-center mt-8">
              <div className="h-12 bg-gradient-to-r from-green-500 to-green-700 rounded-lg w-40"></div>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className={`bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-500 ease-in-out hover:shadow-2xl ${
            formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-gradient-to-r from-green-500 to-green-700 px-6 py-4">
            <h4 className="text-xl font-semibold text-white">Food Item Details</h4>
            <p className="text-green-100 text-sm">Fill in the information below to add a new food item</p>
          </div>
          
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Food Category
                </label>
                <select 
                  className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-3 shadow-sm"
                  id="category"
                  name="category" 
                  value={product.category} 
                  onChange={handleChange} 
                  required
                >
                   <option value=""disabled>-- Select Food Category --</option>
                              <option value="Donate Food For The People">Donate Food For The People</option>
                              <option value="Wastage Food For cattle">Wastage Food For cattle</option>
                              
                    
                              <option value="Others">Others</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Food Name
                </label>
                <input 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-3" 
                  id="name"
                  type="text" 
                  name="name" 
                  value={product.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter food name"
                />
              </div>
              <div className="mb-4 md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-3" 
                  id="description"
                  name="description" 
                  rows="4" 
                  value={product.description} 
                  onChange={handleChange} 
                  required 
                  placeholder="Describe the food item"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cost">
                  Cost (₹)
                </label>
                <input 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-3" 
                  id="cost"
                  type="number" 
                  name="cost" 
                  value={product.cost} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter cost"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productImage">
                  Food Image
                </label>
                <input 
                  id="productImage" 
                  type="file" 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" 
                  onChange={handleImageChange} 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="timer">
                  Timer (minutes)
                </label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-3"
                  id="timer"
                  type="number"
                  name="timer"
                  value={timer}
                  onChange={handleChange}
                  required
                  min={1}
                  placeholder="Enter timer in minutes"
                />
              </div>
            </div>
            {previewUrl && (
              <div className="mt-4">
                <p className="block text-gray-700 text-sm font-bold mb-2">Image Preview:</p>
                <img src={previewUrl} alt="Food Preview" className="max-h-64 object-contain" />
              </div>
            )}
            <div className="flex items-center justify-center mt-8">
              <button 
                className={`px-8 py-3 bg-green-500 text-white font-medium rounded-lg transition-all duration-300 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`} 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Add Food Item'}
              </button>
            </div>
          </form>
          {timerActive && countdown > 0 && (
            <div className="text-center mt-4 text-lg font-semibold text-green-700">
              Product will disappear in: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddProduct;