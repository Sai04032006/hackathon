import React, { useState, useRef, useEffect } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope, FaPhone, FaFacebook, FaTwitter, FaInstagram,
  FaUser, FaStore, FaBars, FaTimes, FaUserPlus,
  FaSearch, FaHome, FaAngleDown, FaSignInAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import BuyerLogin from '../buyer/BuyerLogin';
import BuyerRegistration from '../buyer/BuyerRegistration';
import Home from './Home';
import NotFound from '../buyer/NotFound';
import About from './About';
import Contact from './Contact';
import FAQ from './FAQ';
import AdminLogin from './../admin/AdminLogin';
import SellerLogin from './../seller/SellerLogin';
import SellerRegistration from '../seller/SellerRegistration';
import Footer from './Footer';
import ForgotPassword from './../buyer/ForgotPassword';
import ResetPassword from '../buyer/ResetPassword';
import SForgotPassword from '../seller/SForgotPassword';
import SResetPassword from '../seller/SResetPassword';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleLoginDropdown = () => setLoginDropdownOpen(!loginDropdownOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info('Please login to search products');
      navigate('/buyerlogin');
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link to="/" className="flex flex-col">
            <span className="text-green-700 font-bold text-2xl">SAVE N SERVE</span>
            <span className="text-xs italic text-gray-500">Let's Save the food - We help the food to serve</span>
          </Link>

       
          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-green-600 text-gray-700 font-medium flex items-center transition duration-200">
              <FaHome className="mr-1" /> Home
            </Link>
            <Link to="/buyerregistration" className="hover:text-green-600 text-gray-700 font-medium flex items-center transition duration-200">
              <FaUserPlus className="mr-1" /> Registration
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button onClick={toggleLoginDropdown} className="hover:text-green-600 text-gray-700 font-medium flex items-center transition duration-200">
                <FaSignInAlt className="mr-1" /> Login <FaAngleDown className="ml-1" />
              </button>
              {loginDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border rounded-md shadow-lg z-50">
                  <Link to="/buyerlogin" className="block px-4 py-2 text-gray-700 hover:bg-green-50 transition duration-200" onClick={() => setLoginDropdownOpen(false)}>
                    <FaUser className="mr-2 text-green-600 inline" /> Reciptent Login
                  </Link>
                  <Link to="/sellerlogin" className="block px-4 py-2 text-gray-700 hover:bg-green-50 transition duration-200" onClick={() => setLoginDropdownOpen(false)}>
                    <FaStore className="mr-2 text-green-600 inline" /> Donor Login
                  </Link>
                </div>
              )}
            </div>
            <Link
              to="/sellerregistration"
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 flex items-center transition duration-200"
            >
              <FaStore className="mr-2" /> Become a Donor
            </Link>
          </nav>

          {/* Mobile Icons */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={handleSearch}>
              <FaSearch className="text-gray-600" />
            </button>
            <button onClick={toggleSidebar}>
              <FaBars className="text-gray-600 text-xl" />
            </button>
          </div>
        </div>

        {/* Search Mobile */}
        <div className="block md:hidden px-4 pb-4">
          <form onSubmit={handleSearch} className="relative">
            <FaSearch className="absolute left-4 text-gray-400 top-3" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </header>

      {/* Sidebar Mobile */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        <div className="p-5 flex justify-between items-center border-b">
          <h2 className="text-green-700 font-bold text-lg">Menu</h2>
          <button onClick={toggleSidebar}>
            <FaTimes className="text-gray-600 text-xl" />
          </button>
        </div>
        <nav className="p-5 space-y-5">
          <Link to="/" className="flex items-center text-gray-700 hover:text-green-600 transition duration-200" onClick={toggleSidebar}>
            <FaHome className="mr-2 text-green-600" /> Home
          </Link>
          <Link to="/buyerregistration" className="flex items-center text-gray-700 hover:text-green-600 transition duration-200" onClick={toggleSidebar}>
            <FaUserPlus className="mr-2 text-green-600" /> Registration
          </Link>
          <div className="border-t border-b py-4">
            <div className="text-sm uppercase text-gray-600 mb-3">Login Options</div>
            <Link to="/buyerlogin" className="block text-gray-700 hover:text-green-600 mb-2 transition duration-200" onClick={toggleSidebar}>
              <FaUser className="mr-2 text-green-600 inline" /> Reciptent Login
            </Link>
            <Link to="/sellerlogin" className="block text-gray-700 hover:text-green-600 transition duration-200" onClick={toggleSidebar}>
              <FaStore className="mr-2 text-green-600 inline" /> Donor Login
            </Link>
          </div>
          <Link to="/sellerregistration" className="w-full text-center bg-green-600 text-white py-2 rounded-lg shadow hover:bg-green-700 transition duration-200" onClick={toggleSidebar}>
            <FaStore className="mr-2" /> Become a Donor
          </Link>
        </nav>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleSidebar}></div>
      )}

      {/* Routes */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buyerlogin" element={<BuyerLogin />} />
          <Route path="/buyerregistration" element={<BuyerRegistration />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/sellerlogin" element={<SellerLogin />} />
          <Route path="/sellerregistration" element={<SellerRegistration />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/sforgotpassword" element={<SForgotPassword />} />
          <Route path="/sreset-password" element={<SResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
