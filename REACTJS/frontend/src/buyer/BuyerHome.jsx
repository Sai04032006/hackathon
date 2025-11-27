import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { FaShoppingCart, FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai';
import FoodItemCard from '../components/FoodItemCard';
import sampleFoodItems from '../components/SampleFoodData';

export default function BuyerHome() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [productsVisible, setProductsVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const skeletonCount = 8;
  const skeletonArray = Array(skeletonCount).fill(0);

  useEffect(() => {
    fetchProducts();
    sessionStorage.removeItem('selectedCategory');
    sessionStorage.removeItem('priceRange');
    sessionStorage.removeItem('sortBy');
    const handlePageRefresh = (event) => {
      if (event.persisted) {
        fetchProducts();
      }
    };
    window.addEventListener('pageshow', handlePageRefresh);
    return () => {
      window.removeEventListener('pageshow', handlePageRefresh);
    };
  }, []);

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
      const response = await axios.get(`${config.url}/product/viewallproducts`);
      const shuffledProducts = shuffleArray(response.data);
      setData(shuffledProducts);
      setError("");
      setTimeout(() => {
        setLoading(false);
        setProductsVisible(true);
        setTimeout(() => {
          setImagesLoaded(true);
        }, 1500);
      }, 2000);
    } catch (err) {
      setError("Failed to fetch products: " + (err.response?.data || err.message));
      setLoading(false);
    }
  };

  // Stats
  const totalDonations = data.length;
  const activeDonations = data.filter(p => !isProductExpired(p)).length;
  const expiredDonations = data.filter(p => isProductExpired(p)).length;

  // Helper to check if product is expired
  function isProductExpired(product) {
    if (!product.timer || !product.createdAt) return false;
    const created = new Date(product.createdAt);
    const expiresAt = new Date(created.getTime() + product.timer * 60000);
    return new Date() > expiresAt;
  }

  // Unique categories for filter
  const categories = Array.from(new Set(data.map(p => p.category).filter(Boolean)));

  // Filtering
  const filteredData = data
    .filter(product => !isProductExpired(product))
    .filter(product =>
      (!categoryFilter || product.category === categoryFilter) &&
      (product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase()))
    );

  const handleAddToCollectList = (product) => {
    // Add to collection list
    const collectItems = JSON.parse(localStorage.getItem('collectItems')) || [];
    const isProductInList = collectItems.some(item => item.id === product.id);
    if (!isProductInList) {
      const collectItem = {
        id: product.id,
        name: product.name,
        category: product.category,
        quantity: product.cost,
        addedAt: new Date().toISOString()
      };
      collectItems.push(collectItem);
      localStorage.setItem('collectItems', JSON.stringify(collectItems));
      window.dispatchEvent(new CustomEvent('collectUpdated', { detail: { collectCount: collectItems.length } }));
      toast.success('Added to collection list!');
    } else {
      toast.info('This item is already in your collection list');
    }

    // Also add to cart
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const isProductInCart = cartItems.some(item => item.id === product.id);
    if (!isProductInCart) {
      const cartItem = {
        id: product.id,
        name: product.name,
        category: product.category,
        cost: product.cost,
        quantity: 1,
        addedAt: new Date().toISOString()
      };
      cartItems.push(cartItem);
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cartCount: cartItems.length } }));
      // Optionally: toast.success('Added to cart!');
    }
  };

  const handleAddToCart = (product) => {
    // Add to cart logic (same as add to collection list, but for cart)
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const isProductInCart = cartItems.some(item => item.id === product.id);
    if (isProductInCart) {
      toast.info('This item is already in your cart');
      return;
    }
    if (cartItems.length >= 10) {
      toast.error('Cart is full! Maximum 10 items allowed. Please remove some before adding more.');
      return;
    }
    const cartItem = {
      id: product.id,
      name: product.name,
      category: product.category,
      cost: product.cost,
      quantity: 1,
      addedAt: new Date().toISOString()
    };
    cartItems.push(cartItem);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cartCount: cartItems.length } }));
    toast.success('Added to cart!');
  };

  const handleRequestCollection = (product, event) => {
    if (event) event.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const navigateToProductDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-white text-green-800 py-12 mb-8">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-sm">
              {loading ? (
                <div className="h-12 w-64 bg-gray-200 rounded-md skeleton-loading"></div>
              ) : (
                "Food Rescue Hub"
              )}
            </h1>
            <p className="text-xl text-gray-700 mb-6 max-w-2xl">
              Join our mission to reduce food waste and help those in need. Browse available donations below.
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-green-100 rounded-xl px-4 py-3 text-center border border-green-200 shadow-sm">
                <p className="text-3xl font-bold text-green-800">{totalDonations}</p>
                <p className="text-sm text-green-700">Total Items</p>
              </div>
              <div className="bg-green-100 rounded-xl px-4 py-3 text-center border border-green-200 shadow-sm">
                <p className="text-3xl font-bold text-green-800">{activeDonations}</p>
                <p className="text-sm text-green-700">Available</p>
              </div>
              <div className="bg-green-100 rounded-xl px-4 py-3 text-center border border-green-200 shadow-sm">
                <p className="text-3xl font-bold text-green-800">{expiredDonations}</p>
                <p className="text-sm text-green-700">Expired</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="fill-gray-50 h-16 w-full">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" />
          </svg>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-6 mb-7 mt-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 transform -mt-10 relative z-10">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for food donations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
              />
            </div>
            <div className="w-full md:w-1/4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white appearance-none transition-all duration-200"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-bold">Failed to fetch products</p>
            </div>
            <p className="mt-2 ml-9">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="container mx-auto px-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {skeletonArray.map((_, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl overflow-hidden shadow-md border border-green-200 animate-pulse"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-48 bg-green-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-green-300 to-green-200 skeleton-loading"></div>
                </div>
                <div className="p-4">
                  <div className="h-4 w-16 bg-green-200 rounded skeleton-loading mb-2"></div>
                  <div className="h-6 bg-green-200 rounded skeleton-loading mb-3"></div>
                  <div className="h-4 bg-green-200 rounded skeleton-loading mb-2"></div>
                  <div className="h-4 bg-green-200 rounded skeleton-loading mb-4 w-5/6"></div>
                  <div className="mt-4 space-y-2">
                    <div className="h-10 bg-green-200 rounded skeleton-loading"></div>
                    <div className="h-10 bg-green-200 rounded skeleton-loading"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="container mx-auto px-6 mb-8">
          <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No food donations found.</p>
          </div>
          
          {/* Sample Food Items Section */}
          <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-semibold text-green-800 mb-6 border-b pb-3">Sample Food Items Available</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sampleFoodItems && sampleFoodItems.map((item) => {
                // Check if item is in cart
                const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
                const isInCart = cartItems.some(cartItem => cartItem.id === item.id);
                
                return (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300 transform hover:-translate-y-1"
                  >
                    <FoodItemCard 
                      item={item}
                      isInCart={isInCart}
                      onAddToCart={() => handleAddToCart(item)}
                      onRemoveFromCart={() => {
                        const updatedCart = cartItems.filter(cartItem => cartItem.id !== item.id);
                        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
                        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cartCount: updatedCart.length } }));
                        toast.success('Removed from cart!');
                        setData([...data]);
                      }}
                      onImageError={(e) => {
                        e.target.src = `https://source.unsplash.com/600x400/?${encodeURIComponent(item.category || 'food')},meal,fresh`;
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredData && filteredData.map((product, index) => {
              if (!product) return null;
              // Check if product is in cart
              const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
              const isInCart = cartItems.some(item => item && item.id === product.id);
              
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300 transform ${
                    productsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  } animate-fade-in`}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                    transitionDuration: '500ms',
                  }}
                >
                  <div 
                    className="relative bg-green-50 h-52 cursor-pointer group"
                    onClick={() => navigateToProductDetail(product.id)}
                  >
                    {imagesLoaded ? (
                      <img 
                        src={`${config.url}/product/displayproductimage?id=${product.id}`} 
                        alt={product.name} 
                        className="w-full h-full object-cover animate-image-fade-in group-hover:scale-[1.02] transition-transform duration-300"
                        style={{ animationDelay: `${index * 150}ms` }}
                        onError={(e) => {
                          e.target.src = `https://source.unsplash.com/600x400/?${encodeURIComponent(product.category || 'food')},meal,fresh`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-100">
                        <div className="text-green-400 flex flex-col items-center animate-pulse">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs">Loading image...</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                    <div className="absolute top-2 right-2 bg-green-600/90 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-full animate-content-fade-in shadow">
                      {product.cost} kg
                    </div>
                    {product.timer && product.createdAt && (
                      <div className="absolute bottom-2 left-2 bg-white/90 text-green-800 text-xs px-2 py-1 rounded shadow">
                        Expires: {new Date(new Date(product.createdAt).getTime() + (product.timer || 0) * 60000).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="p-4 animate-content-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="mb-2">
                      <p className="text-xs text-green-700 uppercase tracking-wider">{product.category}</p>
                      <h3 className="font-semibold text-gray-900 text-lg truncate" title={product.name}>
                        {product.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="mt-4 space-y-2">
                      {isInCart ? (
                        <button 
                          className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex items-center justify-center shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Remove from cart
                            const updatedCart = cartItems.filter(item => item.id !== product.id);
                            localStorage.setItem('cartItems', JSON.stringify(updatedCart));
                            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cartCount: updatedCart.length } }));
                            toast.success('Removed from cart!');
                            // Force re-render
                            setData([...data]);
                          }}
                        >
                          <FaShoppingCart className="mr-2" />
                          Remove from Cart
                        </button>
                      ) : (
                        <button 
                          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center justify-center shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                            // Force re-render
                            setData([...data]);
                          }}
                        >
                          <FaShoppingCart className="mr-2" />
                          Add to Cart
                        </button>
                      )}
                      <button 
                        className="w-full py-2 px-4 bg-white text-green-700 border border-green-300 hover:bg-green-50 rounded-md transition-colors flex items-center justify-center shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestCollection(product, e);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}