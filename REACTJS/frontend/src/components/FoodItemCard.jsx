import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const FoodItemCard = ({ item, showActions = true }) => {
  const [isInCart, setIsInCart] = useState(false);
  const [animation, setAnimation] = useState('');

  // Check if item is in cart on mount and when cart updates
  useEffect(() => {
    checkIfInCart();
    window.addEventListener('cartUpdated', checkIfInCart);
    return () => window.removeEventListener('cartUpdated', checkIfInCart);
  }, []);

  const checkIfInCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    setIsInCart(cartItems.some(cartItem => cartItem.id === item.id));
  };

  const handleAddToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if (isInCart) {
      toast.info('This item is already in your cart');
      return;
    }
    
    if (cartItems.length >= 10) {
      toast.error('Cart is full! Maximum 10 items allowed. Please remove some before adding more.');
      return;
    }
    
    const cartItem = {
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      cost: item.cost,
      image: item.image,
      quantity: 1,
      addedAt: new Date().toISOString()
    };
    
    cartItems.push(cartItem);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cartCount: cartItems.length } }));
    
    setIsInCart(true);
    setAnimation('added');
    setTimeout(() => setAnimation(''), 1000);
    
    toast.success('Added to cart!');
  };

  const handleRemoveFromCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const updatedCart = cartItems.filter(cartItem => cartItem.id !== item.id);
    
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cartCount: updatedCart.length } }));
    
    setIsInCart(false);
    setAnimation('removed');
    setTimeout(() => setAnimation(''), 1000);
    
    toast.success('Removed from cart!');
  };

  // Prefer stable category-specific fallbacks to avoid blank images
  const categoryFallbacks = {
    Vegetables: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
    Fruits: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?q=80&w=1200&auto=format&fit=crop',
    'Baked Goods': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
    Dairy: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop',
    Others: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop'
  };
  const imageUrl = item.image || categoryFallbacks[item.category] || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop';

  return (
    <div 
      className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform ${
        animation === 'added' ? 'scale-[1.02] ring-2 ring-green-500' : 
        animation === 'removed' ? 'scale-95 opacity-80' : ''
      } mb-4 hover:-translate-y-1`}
    >
      <div className="relative h-56 overflow-hidden bg-green-50">
        <img 
          src={imageUrl} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://via.placeholder.com/600x400/f0fdf0/166534?text=${encodeURIComponent(item.name || 'Food Item')}`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
        <div className="absolute top-2 left-2 bg-green-600/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
          {item.category || 'Food Item'}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-base md:text-lg font-semibold text-white truncate drop-shadow">{item.name}</h3>
        </div>
      </div>
      
      <div className="p-5">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {item.description || 'Delicious food item available for order. Click for more details.'}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-green-700 font-bold text-lg">₹{item.cost}</span>
          {showActions && (
            <div className="flex space-x-2">
              <button 
                className="p-2 rounded-lg bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors shadow-sm"
                title="View details"
              >
                <FaInfoCircle className="text-gray-700" />
              </button>
              {isInCart ? (
                <button 
                  onClick={handleRemoveFromCart}
                  className="p-2 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
                  title="Remove from cart"
                >
                  <FaTrash className="text-red-600" />
                </button>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm"
                  title="Add to cart"
                >
                  <FaShoppingCart />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;