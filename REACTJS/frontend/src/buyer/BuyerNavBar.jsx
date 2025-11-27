import React, { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
// Import framer-motion for simple animations
import { motion } from "framer-motion";
import BuyerProfile from "./BuyerProfile";
import BuyerLogin from "./BuyerLogin";
import NotFound from "./NotFound";
import Footer from "../main/Footer";
import { useAuth } from "../contextapi/AuthContext";
import FAQ from "../main/FAQ";
import About from "../main/About";
import Contact from "../main/Contact";
import axios from 'axios';
import config from '../config';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UserIcon, 
  LogoutIcon,
  MenuIcon,
  XIcon,
  SearchIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  MailIcon,
  FilterIcon,
  AdjustmentsIcon,
  ChevronDownIcon
} from '@heroicons/react/outline';
import BuyerHome from "./BuyerHome";
import Cart from './Cart';
import { FaCartPlus, FaHome, FaUser } from "react-icons/fa";
import ProductDetail from './ProductDetail';


// Create context for search and filters
const SearchContext = createContext();
export const useSearch = () => useContext(SearchContext);

// Product Skeleton component
const ProductSkeleton = ({ delay = 0 }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 skeleton-loading"></div>
      </div>
      
      <div className="p-4">
        {/* Category skeleton */}
        <div className="h-4 w-16 bg-gray-200 rounded skeleton-loading mb-2"></div>
        
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded skeleton-loading mb-2"></div>
        
        {/* Description skeleton - two lines */}
        <div className="h-4 bg-gray-200 rounded skeleton-loading mb-2"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded skeleton-loading mb-4"></div>
        
        {/* Buttons skeleton */}
        <div className="mt-6 space-y-2">
          <div className="h-10 bg-gray-200 rounded skeleton-loading"></div>
          <div className="h-10 bg-gray-200 rounded skeleton-loading"></div>
        </div>
      </div>
    </div>
  );
};

export default function BuyerNavBar() {
  const { setIsBuyerLoggedIn } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("default"); // Options: default, priceLow, priceHigh, newest
  const location = useLocation();
  const [pageTransition, setPageTransition] = useState(false);
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Use static categories instead of fetching from backend
    setCategories([
      "Donating Food For People",
      "Wastage Food For Cattle", 
      "Others"
    ]);
  }, []);

  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => {
      setPageTransition(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container') && !e.target.closest('.search-results')) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Initialize cart count from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartCount(cartItems.length);
    
    // Listen for cart updates from other components
    const handleCartUpdate = (event) => {
      setCartCount(event.detail.cartCount);
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleLogout = () => {
    setIsBuyerLoggedIn(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleFilterMenu = () => {
    setFilterMenuOpen(!filterMenuOpen);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    
    setLoading(true);
    try {
      // Build the query parameters
      let params = new URLSearchParams();
      
      // Only add search query if it has content
      if (searchQuery.trim()) {
        params.append("query", searchQuery.trim());
      }
      
      // Add category filter if selected
      if (selectedCategory) {
        params.append("category", selectedCategory);
      }
      
      // Add price range if set
      if (priceRange.min) params.append("minPrice", priceRange.min);
      if (priceRange.max) params.append("maxPrice", priceRange.max);
      
      // Add sort parameter if not default
      if (sortBy !== 'default') params.append("sort", sortBy);
      
      // Form the URL with the parameters
      const url = `${config.url}/product/viewallproducts`; // Use viewallproducts instead of search endpoint
      
      // Make the request
      const response = await axios.get(url);
      
      // If we have data, let's filter it client-side to avoid CORS issues
      if (response.data && Array.isArray(response.data)) {
        let filteredResults = response.data;
        
        // Apply client-side filtering
        if (searchQuery.trim()) {
          filteredResults = filteredResults.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        
        // Apply category filter if it exists
        if (selectedCategory) {
          filteredResults = filteredResults.filter(product => 
            product.category === selectedCategory
          );
        }
        
        // Apply price range filter if set
        if (priceRange.min) {
          filteredResults = filteredResults.filter(product => 
            parseFloat(product.cost) >= parseFloat(priceRange.min)
          );
        }
        
        if (priceRange.max) {
          filteredResults = filteredResults.filter(product => 
            parseFloat(product.cost) <= parseFloat(priceRange.max)
          );
        }
        
        // Apply sorting
        if (sortBy === 'priceLow') {
          filteredResults.sort((a, b) => parseFloat(a.cost) - parseFloat(b.cost));
        } else if (sortBy === 'priceHigh') {
          filteredResults.sort((a, b) => parseFloat(b.cost) - parseFloat(a.cost));
        } else if (sortBy === 'newest') {
          filteredResults.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
        
        setSearchResults(filteredResults);
        setShowSearchResults(true);
        
        // If filtering by category only (no search term) and we have results,
        // navigate directly to search results page
        if (selectedCategory && !searchQuery.trim()) {
          navigateToSearchResults(filteredResults);
        }
      } else {
        // Handle empty or invalid response
        setSearchResults([]);
        setShowSearchResults(true);
        
        if (selectedCategory && !searchQuery.trim()) {
          navigateToSearchResults([]);
        }
      }
    } catch (err) {
      console.warn("Error fetching products, falling back to client-side filtering:", err);
      
      // Always use the fallback method to avoid CORS issues
      try {
        const allProducts = await axios.get(`${config.url}/product/viewallproducts`);
        let filtered = allProducts.data || [];
        
        // Apply search term filter if it exists
        if (searchQuery.trim()) {
          filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        
        // Apply category filter if it exists
        if (selectedCategory) {
          filtered = filtered.filter(product => 
            product.category === selectedCategory
          );
        }
        
        // Apply price range filter if set
        if (priceRange.min) {
          filtered = filtered.filter(product => 
            parseFloat(product.cost) >= parseFloat(priceRange.min)
          );
        }
        
        if (priceRange.max) {
          filtered = filtered.filter(product => 
            parseFloat(product.cost) <= parseFloat(priceRange.max)
          );
        }
        
        // Apply sorting
        if (sortBy === 'priceLow') {
          filtered.sort((a, b) => parseFloat(a.cost) - parseFloat(b.cost));
        } else if (sortBy === 'priceHigh') {
          filtered.sort((a, b) => parseFloat(b.cost) - parseFloat(a.cost));
        }
        
        setSearchResults(filtered);
        setShowSearchResults(true);
        
        // If filtering by category only (no search term) and we have results,
        // navigate directly to search results page
        if (selectedCategory && !searchQuery.trim()) {
          navigateToSearchResults(filtered);
        }
      } catch(filterErr) {
        console.error("Error in fallback filtering:", filterErr);
        setSearchResults([]);
        setShowSearchResults(true);
        
        if (selectedCategory && !searchQuery.trim()) {
          navigateToSearchResults([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to navigate to search results page
  const navigateToSearchResults = (results) => {
    navigate('/search-results', { 
      state: { 
        searchQuery: searchQuery.trim() || `Category: ${selectedCategory}`,
        searchResults: results,
        filters: {
          category: selectedCategory,
          priceRange,
          sortBy
        }
      } 
    });
  };

  const handleSelectResult = (productId) => {
    setShowSearchResults(false);
    navigate(`/product/${productId}`);
  };

  const handleViewAllResults = () => {
    setShowSearchResults(false);
    navigate('/search-results', { 
      state: { 
        searchQuery,
        searchResults,
        filters: {
          category: selectedCategory,
          priceRange,
          sortBy
        }
      } 
    });
  };

  const resetFilters = () => {
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSortBy("default");
  };

  const applyFilters = () => {
    setFilterMenuOpen(false);
    handleSearch();
  };

  // Search context value
  const searchContextValue = {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    sortBy, 
    setSortBy,
    handleSearch
  };

  return (
    <SearchContext.Provider value={searchContextValue}>
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* Header with simplified animations */}
        <motion.header 
          className="bg-white shadow-md sticky top-0 z-50"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Increased container width with max-width-8xl instead of 7xl */}
          <div className="max-w-8xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <motion.button
                  className="lg:hidden text-gray-600 focus:outline-none p-2 mr-2 hover:bg-gray-100 rounded"
                  onClick={toggleSidebar}
                  aria-label="Toggle menu"
                  whileTap={{ scale: 0.95 }}
                >
                  <MenuIcon className="h-6 w-6" />
                </motion.button>
                
                <Link to="/" className="flex flex-col group">
                  <div className="text-green-600 font-bold text-2xl relative">
                 SAVE N SERVE
                    {/* Simple underline animation for logo */}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"></span>
                  </div>
                  <span className="text-xs text-gray-500 tracking-wider">Let's Save the food-To donate</span>
                </Link>
              </div>

              {/* Enhanced Search Bar with wider container */}
              <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative search-container">
                <form onSubmit={handleSearch} className="w-full flex">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search for products..."
                      className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (searchResults.length > 0) setShowSearchResults(true);
                      }}
                    />
                    <motion.button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors duration-150"
                      whileTap={{ scale: 0.9 }}
                    >
                      <SearchIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                  
                  {/* Filter Button with simple animation */}
                  <motion.button
                    type="button"
                    onClick={toggleFilterMenu}
                    className={`px-4 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg flex items-center justify-center transition-colors duration-150 ${
                      filterMenuOpen ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                    }`}
                    aria-label="Filter options"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FilterIcon className="h-5 w-5" />
                  </motion.button>
                </form>

                {/* Search Results Dropdown with simple animation */}
                {showSearchResults && searchResults.length > 0 && (
                  <motion.div 
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto search-results"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-700">Search Results</h3>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {searchResults.slice(0, 5).map((product) => (
                        <motion.div 
                          key={product.id}
                          className="p-3 flex items-center hover:bg-green-50 cursor-pointer transition-colors duration-150"
                          onClick={() => handleSelectResult(product.id)}
                          whileHover={{ x: 2 }}
                        >
                          <div className="w-12 h-12 flex-shrink-0 mr-4 bg-gray-100 rounded overflow-hidden">
                            <img 
                              src={`${config.url}/product/displayproductimage?id=${product.id}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/100?text=Product";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                            <p className="text-sm text-gray-500">{product.category}</p>
                          </div>
                          <div className="ml-4">
                            <span className="text-sm font-semibold text-green-600">₹{product.cost}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {searchResults.length > 5 && (
                      <div className="p-3 border-t border-gray-200">
                        <motion.button 
                          className="w-full text-center text-sm text-green-600 font-medium hover:text-green-800"
                          onClick={handleViewAllResults}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          View all {searchResults.length} results
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                )}

                
                        {filterMenuOpen && (
                          <motion.div 
                          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          >
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Food Category</label>
                            <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <AdjustmentsIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <select 
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                              <option value="">-- Select Food Category --</option>
                              <option value="Donate Food For The People">Donate Food For The People</option>
                              <option value="Wastage Food For cattle">Wastage Food For cattle</option>
                              
                    
                              <option value="Others">Others</option>
                            </select>
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Range (kg)</label>
                            <div className="flex space-x-2">
                            <input
                              type="number"
                              placeholder="Min"
                              className="w-1/2 border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                              value={priceRange.min}
                              onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                              min="0"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              className="w-1/2 border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                              value={priceRange.max}
                              onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                              min="0"
                            />
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                            <select 
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            >
                            <option value="default">Relevance</option>
                            <option value="quantityLow">Quantity: Low to High</option>
                            <option value="quantityHigh">Quantity: High to Low</option>
                            <option value="newest">Newest First</option>
                            </select>
                          </div>

                          <div className="flex justify-between">
                            <motion.button
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                            onClick={resetFilters}
                            whileTap={{ scale: 0.95 }}
                            >
                            Reset Filters
                            </motion.button>
                            
                            <div className="space-x-2">
                            <motion.button
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                              onClick={() => setFilterMenuOpen(false)}
                              whileTap={{ scale: 0.95 }}
                            >
                              Cancel
                            </motion.button>
                            <motion.button
                              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                              onClick={applyFilters}
                              whileTap={{ scale: 0.95 }}
                            >
                              Apply
                            </motion.button>
                            </div>
                          </div>
                          </motion.div>
                        )}
                        </div>

                        {/* Nav links with wider spacing and simplified animations */}
              <motion.nav 
                className="hidden lg:flex items-center space-x-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <NavLink
                  to="/"
                  label={<span className="text-green-600">Home</span>}
                  icon={<FaHome className="h-5 w-5 text-green-600" />}
                  currentPath={location.pathname}
                />
                
                <NavLink
                  to="/cart"
                  label="Cart"
                  icon={
                    <div className="relative">
                      <FaCartPlus className="h-5 w-5  text-gray-700" />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </div>
                  }
                  currentPath={location.pathname}
                />
                
                <NavLink
                  to="/buyerprofile"
                  label="Profile"
                  icon={<FaUser className="h-5 w-5  text-gray-700" />}
                  currentPath={location.pathname}
                />
                
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-4 py-2 rounded-lg transition-colors duration-150"
                  whileHover={{ backgroundColor: "#10b981", color: "#ffffff" }}
                  whileTap={{ scale: 0.97 }}
                >
                  <LogoutIcon className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </motion.nav>
            </div>

            {/* Mobile Search Bar with simple animation */}
            <motion.div 
              className="mt-3 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSearch} className="relative">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
                  >
                    <SearchIcon className="h-5 w-5" />
                  </button>
                  <motion.button
                    type="button"
                    onClick={toggleFilterMenu}
                    className={`px-4 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg flex items-center justify-center ${
                      filterMenuOpen ? 'bg-green-50 text-green-600' : 'text-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AdjustmentsIcon className="h-5 w-5" />
                  </motion.button>
                </div>
              </form>

              {/* Mobile Filter Panel with simple animation */}
              {filterMenuOpen && (
                <motion.div 
                  className="mt-2 bg-white rounded-lg shadow-lg p-3 border border-gray-200"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <AdjustmentsIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <select 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">-- Select Category --</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Men's clothing">Men's clothing</option>
                        <option value="Women's clothing">Women's clothing</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Jewellery">Jewellery</option>
                        <option value="Books">Books</option>
                        <option value="Home & Kitchen">Home & Kitchen</option>
                        <option value="Beauty & Health">Beauty & Health</option>
                        <option value="Sports & Outdoors">Sports & Outdoors</option>
                        <option value="Toys & Games">Toys & Games</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-1/2 border border-gray-300 rounded-md p-2"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                        min="0"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-1/2 border border-gray-300 rounded-md p-2"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select 
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="default">Relevance</option>
                      <option value="priceLow">Price: Low to High</option>
                      <option value="priceHigh">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>

                  <div className="flex justify-between">
                    <motion.button
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                      onClick={resetFilters}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reset
                    </motion.button>
                    
                    <div className="space-x-2">
                      <motion.button
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                        onClick={() => setFilterMenuOpen(false)}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                        onClick={applyFilters}
                        whileTap={{ scale: 0.95 }}
                      >
                        Apply
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Active Filters Bar with simple animation */}
            {(selectedCategory || priceRange.min || priceRange.max || sortBy !== 'default') && (
              <motion.div 
                className="mt-3 flex flex-wrap items-center gap-2 p-2 bg-green-50 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-xs font-medium text-gray-600">Active Filters:</span>
                
                {selectedCategory && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {selectedCategory}
                    <motion.button 
                      className="ml-1 text-green-500 hover:text-green-700"
                      onClick={() => setSelectedCategory("")}
                      whileTap={{ scale: 0.9 }}
                    >
                      <XIcon className="h-3 w-3" />
                    </motion.button>
                  </span>
                )}
                
                {(priceRange.min || priceRange.max) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Price: {priceRange.min || '0'} - {priceRange.max || '∞'}
                    <motion.button 
                      className="ml-1 text-green-500 hover:text-green-700"
                      onClick={() => setPriceRange({min: "", max: ""})}
                      whileTap={{ scale: 0.9 }}
                    >
                      <XIcon className="h-3 w-3" />
                    </motion.button>
                  </span>
                )}
                
                {sortBy !== 'default' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {sortBy === 'priceLow' 
                      ? 'Price: Low to High' 
                      : sortBy === 'priceHigh' 
                        ? 'Price: High to Low' 
                        : 'Newest First'
                    }
                    <motion.button 
                      className="ml-1 text-green-500 hover:text-green-700"
                      onClick={() => setSortBy("default")}
                      whileTap={{ scale: 0.9 }}
                    >
                      <XIcon className="h-3 w-3" />
                    </motion.button>
                  </span>
                )}
                
                <motion.button 
                  className="ml-auto text-xs text-green-600 hover:text-green-800 font-medium"
                  onClick={resetFilters}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* Mobile Sidebar with simplified slide animation */}
        <motion.div
          className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-md transform"
          initial={{ x: "-100%" }}
          animate={{ x: sidebarOpen ? 0 : "-100%" }}
          transition={{ duration: 0.3 }}
        >
          {/* Sidebar content with simple animations */}
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <div className="flex flex-col">
              <span className="font-bold text-green-600 text-2xl">LL-CART</span>
              <span className="text-xs text-gray-500 tracking-wider">YOUR NEEDS, OUR PROMISE</span>
            </div>
            <motion.button 
              onClick={toggleSidebar} 
              className="text-gray-500 hover:text-red-500"
              whileTap={{ scale: 0.9 }}
            >
              <XIcon className="h-6 w-6" />
            </motion.button>
          </div>
          
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-full shadow-sm flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <UserIcon className="h-6 w-6" />
              </motion.div>
              <div>
                <div className="font-medium text-lg">Welcome</div>
                <div className="text-sm text-gray-500">Buyer Account</div>
              </div>
            </div>
          </div>

          <nav className="p-5">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">Menu</div>
            <ul className="space-y-2">
              <SidebarNavLink
                to="/"
                label="Home"
                icon={<HomeIcon className="h-5 w-5 text-green-600" />}
                onClick={toggleSidebar}
                currentPath={location.pathname}
              />
              
              <SidebarNavLink
                to="/cart"
                label="Cart"
                icon={<ShoppingBagIcon className="h-5 w-5 text-green-600" />}
                onClick={toggleSidebar}
                currentPath={location.pathname}
              />
              
              <SidebarNavLink
                to="/buyerprofile"
                label="Profile"
                icon={<UserIcon className="h-5 w-5 text-green-600" />}
                onClick={toggleSidebar}
                currentPath={location.pathname}
              />
              
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-6 mb-4">More</div>
              
              <SidebarNavLink
                to="/about"
                label="About Us"
                icon={<InformationCircleIcon className="h-5 w-5" />}
                onClick={toggleSidebar}
                currentPath={location.pathname}
              />
              
              <SidebarNavLink
                to="/faq"
                label="FAQ"
                icon={<QuestionMarkCircleIcon className="h-5 w-5" />}
                onClick={toggleSidebar}
                currentPath={location.pathname}
              />
              
              <SidebarNavLink
                to="/contact"
                label="Contact Us"
                icon={<MailIcon className="h-5 w-5" />}
                onClick={toggleSidebar}
                currentPath={location.pathname}
              />
              
              <li className="border-t border-gray-200 pt-6 mt-6">
                <motion.button
                  onClick={() => {
                    handleLogout();
                    toggleSidebar();
                  }}
                  className="flex items-center justify-center space-x-2 text-red-500 border border-red-500 hover:bg-red-500 hover:text-white w-full py-3 rounded-lg transition-colors duration-150"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ backgroundColor: "#10b981", color: "#ffffff" }}
                >
                  <LogoutIcon className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </li>
            </ul>
          </nav>
        </motion.div>

        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={toggleSidebar}
          ></motion.div>
        )}

        {/* Main Content with wider container and simple animation */}
        <motion.main 
          className="flex-grow bg-gray-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-8xl mx-auto px-6 py-6">
            <div className={`transition-opacity duration-150 ${pageTransition ? 'opacity-0' : 'opacity-100'}`}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Routes>
                  <Route path="/buyerlogin" element={<BuyerLogin />} />
                  <Route path="/buyerprofile" element={<BuyerProfile />} />
                  <Route path="/about" Component={About} />
                  <Route path="/contact" Component={Contact} />
                  <Route path="/faq" Component={FAQ} />
                  <Route path="/" Component={BuyerHome} />
                  <Route path="/search-results" element={<SearchResults />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/product/:productId" element={<ProductDetail/>} />
                  <Route path="*" Component={NotFound} />
                </Routes>
              </motion.div>
            </div>
          </div>
        </motion.main>

        <Footer />
      </div>
    </SearchContext.Provider>
  );
}

// NavLink component for desktop navigation with simple animation
const NavLink = ({ to, label, icon, currentPath }) => {
  const isActive = currentPath === to || (to === '/' && currentPath === '/');
  
  return (
    <Link to={to}>
      <motion.div 
        className={`flex items-center space-x-2 ${
          isActive 
            ? 'text-green-600 font-medium' 
            : 'text-gray-700 hover:text-green-600'
          } transition-colors duration-150`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <div className={`${isActive ? 'text-green-600' : 'text-gray-500'}`}>
          {icon}
        </div>
        <span>{label}</span>
        {isActive && (
          <motion.span 
            className="h-1.5 w-1.5 rounded-full bg-green-600"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

// SidebarNavLink component for sidebar navigation with simplified hover effect
const SidebarNavLink = ({ to, label, icon, onClick, currentPath }) => {
  const isActive = currentPath === to || (to === '/' && currentPath === '/');
  
  return (
    <motion.li whileHover={{ x: 3 }}>
      <Link
        to={to}
        className={`flex items-center justify-between ${
          isActive 
            ? 'bg-green-50 text-green-600 border-l-4 border-green-600' 
            : 'text-gray-700 hover:bg-green-50 hover:text-green-600 border-l-4 border-transparent'
        } p-3 rounded-r-lg transition-colors duration-150`}
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          <div className={`${isActive ? 'text-green-600' : 'text-gray-500'}`}>
            {icon}
          </div>
          <span className={`font-medium ${isActive ? 'text-green-600' : ''}`}>{label}</span>
        </div>
        {isActive && (
          <svg 
            className="h-4 w-4 text-green-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M9 6L15 12L9 18" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        )}
      </Link>
    </motion.li>
  );
};

// SearchResults component with skeleton loading and progressive content loading
const SearchResults = () => {
  const location = useLocation();
  const { searchQuery, searchResults, filters } = location.state || {};
  const { handleSearch, selectedCategory } = useSearch();
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulate initial loading
    const timer1 = setTimeout(() => {
      setLoading(false);
      
      // After skeleton disappears, show content
      setTimeout(() => {
        setContentLoaded(true);
        
        // Finally load images with additional delay
        setTimeout(() => {
          setImagesLoaded(true);
        }, 1200);
      }, 300);
    }, 1800);
    
    return () => {
      clearTimeout(timer1);
    };
  }, [searchResults]);
  
  // Generate placeholders for the skeleton loader
  const skeletonCount = 8;
  const skeletonArray = Array(skeletonCount).fill(0);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        {loading ? (
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded-md skeleton-loading mb-2"></div>
            <div className="h-5 w-32 bg-gray-200 rounded-md skeleton-loading"></div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 animate-content-fade-in">
              {searchQuery.startsWith("Category:") ? searchQuery : `Search Results for "${searchQuery}"`}
            </h1>
            <p className="text-gray-600 mt-2 animate-content-fade-in">
              Found {searchResults?.length || 0} products
            </p>
            {filters?.category && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Category: {filters.category}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {skeletonArray.map((_, index) => (
            <ProductSkeleton key={index} delay={index * 100} />
          ))}
        </div>
      ) : searchResults?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {searchResults.map((product, index) => (
            <motion.div 
              key={product.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -3 }}
              style={{ 
                transitionDelay: `${index * 100}ms`,
                transitionDuration: '500ms'
              }}
            >
              {/* Image container with progressive loading */}
              <div className="relative p-4 bg-gray-100 flex justify-center items-center h-48">
                {imagesLoaded ? (
                  <img 
                    src={`${config.url}/product/displayproductimage?id=${product.id}`} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain animate-image-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200?text=Product+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-gray-400 flex flex-col items-center animate-pulse">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                      </svg>
                      <span className="text-xs">Loading image...</span>
                    </div>
                  </div>
                )}
                
                {contentLoaded && (
                  <div className={`absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-content-fade-in`}>
                    ₹{product.cost}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                {contentLoaded && (
                  <div className="animate-content-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</p>
                      <h3 className="font-semibold text-gray-800 text-lg truncate" title={product.name}>
                        {product.name}
                      </h3>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <motion.button 
                        className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition-colors"
                        whileTap={{ scale: 0.98 }}
                      >
                        Buy Now
                      </motion.button>
                      
                      <motion.button 
                        className="w-full bg-white text-green-600 py-2 rounded font-medium border border-green-600 hover:bg-green-50 transition-colors flex items-center justify-center"
                        whileTap={{ scale: 0.98 }}
                      >
                        <ShoppingBagIcon className="h-5 w-5 mr-2" />
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <img 
            src="https://i.imgur.com/qIufhof.png" 
            alt="No results found" 
            className="w-32 h-32 object-contain opacity-50"
          />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-gray-500">
            {filters?.category 
              ? `We couldn't find any products in the "${filters.category}" category.` 
              : "Try adjusting your search or filter to find what you're looking for."}
          </p>
          <motion.button 
            onClick={() => {
              navigate('/');
            }}
            className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            whileTap={{ scale: 0.95 }}
          >
            Return to Home
          </motion.button>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes contentFadeIn {
          from { opacity: 0.4; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes imageFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .animate-content-fade-in {
          animation: contentFadeIn 0.6s ease-out forwards;
        }
        
        .animate-image-fade-in {
          animation: imageFadeIn 1s ease-out forwards;
        }
        
        .skeleton-loading {
          background: linear-gradient(90deg, #e0f7e0 25%, #c8e6c8 50%, #e0f7e0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </motion.div>
  );
};