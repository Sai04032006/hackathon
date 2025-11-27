import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import config from '../config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaHandsHelping, 
  FaRecycle, 
  FaUtensils, 
  FaWarehouse, 
  FaChartPie, 
  FaChevronLeft, 
  FaChevronRight, 
  FaShoppingCart 
} from "react-icons/fa";
import savenserve3 from '../images/savenserve3.webp'; 
import savenserve1 from '../images/savenserve1.webp';
import savenserve2 from '../images/savenserve2.webp'; 

// Error boundary wrapper
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 text-center mt-4">Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [productsVisible, setProductsVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  // Refs for carousel auto-play
  const sliderRef = useRef(null);
  const sliderIntervalRef = useRef(null);

  // Banners data for hero/slider (kept minimal)
  const banners = [
    { id: 1, title: "Save Food, Serve People", subtitle: "Connect donors with recipients in minutes", image: savenserve1 },
    { id: 2, title: "Zero Waste Mission", subtitle: "Turn surplus into smiles", image: savenserve2 },
    { id: 3, title: "Together Against Hunger", subtitle: "Donate. Collect. Impact.", image: savenserve3 },
  ];

  // Categories for quick navigation
  const categories = [
    { id: 1, name: "Donations", icon: <FaHandsHelping size={24} className="text-green-500" /> }, // For donated food
    { id: 2, name: "Compost", icon: <FaRecycle size={24} className="text-green-500" /> },        // For waste processed into compost
    { id: 3, name: "Leftover Food", icon: <FaUtensils size={24} className="text-green-500" /> }, // Tracking leftover food
    { id: 4, name: "Inventory", icon: <FaWarehouse size={24} className="text-green-500" /> },    // Food inventory management
    { id: 5, name: "Reports", icon: <FaChartPie size={24} className="text-green-500" /> },       // Analytics and data reports
  ];
  
  // Motives data
  const motives = [
    { id: 1, title: "Save Food, Save Lives", description: "We aim to reduce food wastage and help those in need.", color: "bg-red-500" },
    { id: 2, title: "Reduce Waste", description: "Promoting sustainable practices to minimize waste.", color: "bg-blue-500" },
    { id: 3, title: "Food Rescue", description: "Rescuing surplus food to feed the hungry.", color: "bg-green-500" },
    { id: 4, title: "Hunger Relief", description: "Providing meals to those who need them the most.", color: "bg-yellow-500" },
    { id: 5, title: "Zero Waste Challenge", description: "Encouraging everyone to join the zero-waste movement.", color: "bg-violet-500" },
  ];

  // Generate placeholders for the skeleton loader
  const skeletonCount = 8;
  const skeletonArray = Array(skeletonCount).fill(0);

  useEffect(() => {
    fetchProducts();
    sessionStorage.removeItem('selectedCategory');
    sessionStorage.removeItem('priceRange');
    sessionStorage.removeItem('sortBy');
    startSliderAutoPlay();
    return () => {
      if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    };
  }, []);

  // Function to start auto-play for slider
  const startSliderAutoPlay = () => {
    sliderIntervalRef.current = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % banners.length);
    }, 5000);
  };

  // Function to reset autoplay timer when manually changing slides
  const resetSliderTimer = () => {
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
      startSliderAutoPlay();
    }
  };

  // Function to shuffle array randomly
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setProductsVisible(false);
      setImagesLoaded(false);
      
      // Get the products data
      const response = await axios.get(`${config.url}/product/viewallproducts`);
      
      // Shuffle the products to randomize their order
      const shuffledProducts = shuffleArray(response.data);
      
      // Set aside first 4 products for featured section
      const featured = shuffledProducts.slice(0, 4);
      const remaining = shuffledProducts.slice(4);
      
      setFeaturedProducts(featured);
      setProducts(remaining);
      setError("");
      
      // First phase: Show product cards without images (text content only)
      setTimeout(() => {
        setLoading(false);
        setProductsVisible(true);
        
        // Second phase: After more seconds, start loading images
        setTimeout(() => {
          setImagesLoaded(true);
        }, 1000);
      }, 1500);
      
    } catch (err) {
      setError("Failed to fetch items: " + (err.response?.data || err.message));
      console.error("Error fetching items:", err);
      setLoading(false);
    }
  };

  // Redirect to login for all interactions
  const redirectToLogin = (action) => {
    toast.info(`Please login to ${action}`);
    setTimeout(() => {
      navigate('/buyerlogin');
    }, 1000);
  };

  const handleAddToCart = () => {
    redirectToLogin('add items to cart');
  };

  const handleBuyNow = () => {
    redirectToLogin('buy products');
  };

  // Redirect all category navigation to login as well
  const navigateToCategory = () => {
    redirectToLogin('browse categories');
  };

  const handleBannerClick = () => {
    redirectToLogin('view offers');
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    resetSliderTimer();
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
    resetSliderTimer();
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + banners.length) % banners.length);
    resetSliderTimer();
  };
  
  // Product Card Component for reusability
  const ProductCard = ({ product, index, delay }) => (
    <div 
      key={product.id}
      className={`bg-white rounded-xl overflow-hidden shadow-md border border-green-100 hover:shadow-xl transition-all duration-300 ${
        productsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
      onClick={() => redirectToLogin('view product details')}
    >
      {/* Product image */}
      <div className="relative h-56 bg-green-50" style={{ cursor: 'pointer' }}>
        {imagesLoaded ? (
          <img 
            src={`${config.url}/product/displayproductimage?id=${product.id}`} 
            alt={product.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://source.unsplash.com/600x400/?${encodeURIComponent(product.category || 'food')},meal,fresh`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-400 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
        
        {/* Price tag */}
        <div className="absolute bottom-2 left-2 bg-green-600/90 text-white text-sm font-bold px-2 py-1 rounded-md shadow">
          ₹{product.cost}
        </div>
      </div>
      
      {/* Product content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg truncate" title={product.name}>
          {product.name}
        </h3>
        <div className="flex items-center mt-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            ))}
          </div>
          <span className="text-gray-500 text-xs ml-1">(42)</span>
        </div>
        
        <div className="mt-4 space-y-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow();
            }}
            className="w-full bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            Buy Now
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="w-full bg-white text-green-700 py-2 rounded-md font-medium border border-green-300 hover:bg-green-50 transition-colors flex items-center justify-center shadow-sm"
          >
            <FaShoppingCart className="mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  // Skeleton Card Component for loading state
  const SkeletonCard = ({ index }) => (
    <div 
      key={index} 
      className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200 skeleton-loading"></div>
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded skeleton-loading mb-3"></div>
        <div className="h-4 bg-gray-200 rounded skeleton-loading mb-4 w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded skeleton-loading mb-2"></div>
        <div className="h-8 bg-gray-200 rounded skeleton-loading"></div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="bg-gray-50 min-h-screen">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl shadow-md mb-10" ref={sliderRef}>
            <div className="relative h-64 md:h-80 lg:h-96">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
                    <h1 className="text-white text-2xl md:text-4xl font-bold max-w-2xl drop-shadow">{banner.title}</h1>
                    <p className="text-white/90 text-sm md:text-lg mt-2 max-w-xl drop-shadow">{banner.subtitle}</p>
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => handleBannerClick()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow">
                        Browse Donations
                      </button>
                      <button onClick={() => redirectToLogin('become a donor')} className="bg-white/90 hover:bg-white text-green-700 px-4 py-2 rounded-md shadow">
                        Become a Donor
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Controls */}
            <button onClick={prevSlide} className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white">
              <FaChevronLeft className="text-gray-700" />
            </button>
            <button onClick={nextSlide} className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white">
              <FaChevronRight className="text-gray-700" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button key={index} onClick={() => goToSlide(index)} className={`w-2.5 h-2.5 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/60'}`} />
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((c) => (
              <button key={c.id} onClick={() => navigateToCategory(c)} className="px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-full text-sm hover:bg-green-50">
                <span className="inline-block mr-1 align-middle">{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>

          {/* Our Motives Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Our Motives</h2>
            <div className="flex overflow-x-auto pb-2 hide-scrollbar">
              {motives.map((motive) => (
                <div 
                  key={motive.id} 
                  className={`flex-shrink-0 w-64 mr-4 rounded-lg ${motive.color} text-white p-4 shadow-md`}
                >
                  <h3 className="font-bold text-lg mb-1">{motive.title}</h3>
                  <p className="text-sm">{motive.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Products Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Available items</h2>
            
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4 mb-6 shadow-sm">
                <p className="font-medium">{error}</p>
              </div>
            )}
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                  <SkeletonCard key={index} index={index} />
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index} 
                    delay={index * 100}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* All Products Grid */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">All Donations</h2>
              <button 
                onClick={() => redirectToLogin('view all donations')}
                className="text-green-700 text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {skeletonArray.map((_, index) => (
                  <SkeletonCard key={index} index={index} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No items found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index} 
                    delay={index * 50}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CSS Styles */
        }
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          .skeleton-loading {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}