import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import config from '../config';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const upiId = "gurukalyanakki@bank";
  const navigate = useNavigate();

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(storedItems);
    setLoading(false);
  }, []);

  const handleRemoveItem = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
      localStorage.setItem('cartItems', JSON.stringify([]));
      toast.info('Cart has been cleared');
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10;
    const updatedCart = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const handleImageLoad = (itemId) => {
    setImagesLoaded(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => {
    return total + (Number(item.cost) * item.quantity);
  }, 0);

  const upiAmount = cartItems.reduce((sum, item) => sum + ((parseFloat(item.cost) || 0) * (parseInt(item.quantity) || 1)), 0);

  const handleProceedToCheckout = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    setCartItems([]);
    localStorage.setItem('cartItems', JSON.stringify([]));
    toast.success("Payment successful! Thank you for supporting food rescue.");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-green-800">Your food Cart</h2>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 bg-green-50 rounded-lg border-2 border-dashed border-green-300">
          <FaShoppingCart className="text-green-400 text-6xl mb-4" />
          <h3 className="text-xl font-medium text-green-700 mb-2">Your cart is empty</h3>
          <p className="text-green-500 text-center mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/" className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors flex items-center">
            <FaArrowLeft className="mr-2" />
            Continue on ordering the items
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50 border-b">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-medium text-green-500 uppercase tracking-wider">Product</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-green-500 uppercase tracking-wider">Price</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-green-500 uppercase tracking-wider">Quantity</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-green-500 uppercase tracking-wider">Total</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-green-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-200">
                  {cartItems.map(item => (
                    <tr key={item.id} className="hover:bg-green-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 mr-4 bg-green-100 rounded overflow-hidden">
                            {!imagesLoaded[item.id] && (
                              <div className="w-full h-full flex items-center justify-center bg-green-200 animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <img
                              src={`${config.url}/product/displayproductimage?id=${item.id}`}
                              alt={item.name}
                              className={`w-full h-full object-contain ${!imagesLoaded[item.id] ? 'opacity-0' : 'opacity-100'}`}
                              style={{ transition: 'opacity 0.3s' }}
                              onLoad={() => handleImageLoad(item.id)}
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/100?text=Product";
                                handleImageLoad(item.id);
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-800">{item.name}</h4>
                            <p className="text-sm text-green-500">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-green-800">₹{item.cost}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <button
                            className="text-green-500 hover:text-green-800 bg-green-100 rounded-l-md px-2 py-1 border border-green-300"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="w-12 text-center border-t border-b border-green-300 py-1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            min="1"
                            max="10"
                          />
                          <button
                            className="text-green-500 hover:text-green-800 bg-green-100 rounded-r-md px-2 py-1 border border-green-300"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-green-800">
                        ₹{(item.cost * item.quantity).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-6 md:mb-0">
              <Link to="/" className="flex items-center text-green-600 hover:text-green-800 transition-colors">
                <FaArrowLeft className="mr-2" />
                Continue ..
              </Link>
              <button
                onClick={handleClearCart}
                className="flex items-center text-red-500 hover:text-red-700 transition-colors mt-4"
              >
                <FaTrash className="mr-2" />
                Clear Cart
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-80">
              <div className="flex justify-between mb-2">
                <span className="text-green-600">Subtotal</span>
                <span className="text-green-800 font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-green-200 pt-2 mb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors text-lg font-bold shadow-lg"
                type="button"
              >
                <FaShoppingCart className="inline mr-2" />
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Enhanced Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-xl w-full relative animate-slideUp border-2 border-green-200">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl"
              onClick={() => setShowPaymentModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex flex-col items-center mb-6">
              <FaShoppingCart className="text-green-600 text-5xl mb-2" />
              <h2 className="text-3xl font-bold text-green-700 mb-1 text-center">Checkout & Payment</h2>
              <p className="text-gray-600 text-center text-base">Review your order and complete your payment below.</p>
            </div>
            <div className="mb-8 w-full">
              <h4 className="font-semibold text-green-700 mb-3 text-lg">Order Summary</h4>
              <ul className="divide-y divide-green-100 max-h-40 overflow-y-auto mb-2">
                {cartItems.map(item => (
                  <li key={item.id} className="flex justify-between py-2 text-base">
                    <span>
                      <span className="font-medium">{item.name}</span> <span className="text-gray-400">x{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-green-700">₹{(item.cost * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold text-xl border-t pt-3 mt-2">
                <span>Total</span>
                <span className="text-green-700">₹{upiAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-center gap-4 mb-6">
                <button
                  className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-200 ${selectedPayment === "upi" ? "bg-green-600 text-white scale-105" : "bg-gray-200 text-gray-700"}`}
                  onClick={() => setSelectedPayment("upi")}
                >
                  UPI
                </button>
                <button
                  className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-200 ${selectedPayment === "bank" ? "bg-green-600 text-white scale-105" : "bg-gray-200 text-gray-700"}`}
                  onClick={() => setSelectedPayment("bank")}
                >
                  Bank Transfer
                </button>
              </div>
              {selectedPayment === "upi" && (
                <div className="text-center">
                  <p className="text-gray-700 mb-2 font-semibold text-lg">Pay using your UPI app</p>
                  <div className="text-gray-600 text-base mb-2">
                    <div>UPI ID: <span className="font-semibold">{upiId}</span></div>
                    <div>Amount: <span className="font-semibold">₹{upiAmount.toFixed(2)}</span></div>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      className="border px-2 py-2 rounded w-full font-mono text-center text-lg"
                      value={upiId}
                      readOnly
                      onClick={e => {navigator.clipboard.writeText(upiId); toast.info("UPI ID copied!");}}
                      style={{ cursor: "pointer" }}
                    />
                    <span className="text-xs text-gray-400">Tap to copy UPI ID and pay using your UPI app</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Please pay the above amount to the UPI ID using your preferred UPI app (Google Pay, PhonePe, Paytm, etc.), then click below to complete.
                  </div>
                </div>
              )}
              {selectedPayment === "bank" && (
                <div className="text-center">
                  <p className="text-gray-700 mb-2 font-semibold text-lg">Bank Transfer Details</p>
                  <div className="text-gray-600 text-base mb-2">
                    <div>Bank Name: <span className="font-semibold">State Bank of India</span></div>
                    <div>Account Number: <span className="font-semibold">1234567890</span></div>
                    <div>IFSC: <span className="font-semibold">SBIN0001234</span></div>
                    <div>Account Holder: <span className="font-semibold">FoodWasteRescue</span></div>
                    <div>Amount: <span className="font-semibold">₹{upiAmount.toFixed(2)}</span></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Please transfer the above amount to the given bank account, then click below to complete.
                  </div>
                </div>
              )}
            </div>
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded font-bold mt-4 transition text-xl shadow-lg"
              onClick={handlePaymentComplete}
            >
              I've Paid, Complete Order
            </button>
            <div className="mt-8 text-xs text-gray-400 text-center">
              <span>Need help? Contact support at <a href="mailto:support@foodwasterescue.org" className="underline">support@foodwasterescue.org</a></span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}