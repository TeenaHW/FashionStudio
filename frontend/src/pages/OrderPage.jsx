import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import OrderItemCard from "../components/OrderItemCard";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";

const OrderPage = () => {
  const navigate = useNavigate();
  const userId = "64f123abc456def789012345"; // Replace with logged-in user id

  const [cartItems, setCartItems] = useState([]);
  const [userDetails, setUserDetails] = useState({
    name: "Wasana Nimali",
    email: "wasana@example.com",
    phone: "0712345678",
    addressLine1: "No. 123, Colombo, Sri Lanka",
    addressLine2: "",
    state: "",
    city: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [savedUserDetails, setSavedUserDetails] = useState({ ...userDetails });

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get(`/carts/${userId}`);
        const validItems = (res.data.items || []).filter(item => item.productId);
        setCartItems(validItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = cartItems.reduce(
    (sum, item) => sum + ((item.productId.discount || 0) / 100) * item.price * item.quantity,
    0
  );
  const finalTotal = subtotal - totalDiscount;

  // Handle editable user details
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  // Checkout and create order in DB, then navigate to payment
  const handleCheckout = async () => {
    if (!cartItems.length) { toast.error('Your cart is empty'); return; }
    if (!paymentMethod) { toast.error('Please select a payment method'); return; }

    try {
      setLoading(true);

      const orderPayload = {
        userId,
        items: cartItems.map(ci => ({
          productId: ci.productId._id,
          quantity: ci.quantity,
          price: ci.price,
          size: ci.size,
          color: ci.color,
        })),
        totalAmount: finalTotal,
        paymentMethod,
        paymentStatus: 'pending',
        Address: [
          userDetails.addressLine1,
          userDetails.addressLine2,
          `${userDetails.city || ''}${userDetails.state ? ', ' + userDetails.state : ''} ${userDetails.zipCode || ''}`
        ].filter(Boolean).join(', '),
        email: userDetails.email,
        phone: userDetails.phone,
      };

      const res = await api.post('/orders', orderPayload);
      const createdOrder = res.data;

      // Navigate to payment with the new orderId
      localStorage.setItem('selectedPaymentMethod', paymentMethod);
      localStorage.setItem('checkoutCart', JSON.stringify(cartItems));

      toast.dismiss('order-create');
      toast.success('Order created successfully', { id: 'order-create' });
      navigate('/payment', { 
        state: { 
          orderId: createdOrder._id || createdOrder.id,
          finalTotal: finalTotal,
          paymentMethod,
          items: cartItems,
          userDetails,
        } 
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = () => {
    console.log('handleSaveAddress called'); // Debug log
    // First, dismiss any existing toasts with the same ID
    toast.dismiss('save-address');
    
    // Save the user details
    setSavedUserDetails({...userDetails});
    
    // Show the success toast
    toast.success("Shipping details saved!", { 
      id: 'save-address',
      duration: 3000
    });
    
    // Close the edit mode
    setIsEditingAddress(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Breadcrumb: Cart > Place Order > Pay > Order Complete */}
      <div className="bg-green-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm">
          <nav className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="text-gray-600 hover:text-black"
            >
              Cart
            </button>
            <span className="text-gray-400">›</span>
            <span className="text-black font-semibold">Place Order</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-400">Pay</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-400">Order Complete</span>
          </nav>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6 mt-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-yellow-400">🛒 My Order</h1>

        {loading ? (
          <p className="text-center text-gray-400">Loading order details...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - User Details & Order Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Details Section */}
              <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg relative">
                {!isEditingAddress ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Shipping Address</h2>
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium py-1.5 px-3 rounded-md transition-colors"
                        aria-label="Edit address"
                      >
                        EDIT ADDRESS
                      </button>
                    </div>
                    
                    <div className="space-y-3 bg-white p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-1 h-16 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <p className="font-semibold text-gray-800 text-base">{userDetails.name}</p>
                          <p className="text-gray-600 text-sm">{userDetails.phone}</p>
                          <p className="text-gray-600 text-sm">{userDetails.email}</p>
                          <p className="text-gray-600 text-sm">{userDetails.addressLine1}</p>
                          {userDetails.addressLine2 && (
                            <p className="text-gray-600 text-sm">{userDetails.addressLine2}</p>
                          )}
                          <p className="text-gray-600 text-sm">{userDetails.city}, {userDetails.state} {userDetails.zipCode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Shipping Details</h2>
                      <button
                        onClick={() => {
                          setIsEditingAddress(false);
                          // Reset form to original values when closing
                          setUserDetails(prev => ({
                            ...prev,
                            ...savedUserDetails
                          }));
                        }}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                        aria-label="Close editing"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={userDetails.name}
                            onChange={handleUserChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={userDetails.phone}
                            onChange={handleUserChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={userDetails.email}
                          onChange={handleUserChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                          placeholder="Enter your email"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={userDetails.addressLine1}
                          onChange={handleUserChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                          placeholder="House/Flat no, Building name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={userDetails.addressLine2}
                          onChange={handleUserChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                          placeholder="Area, Street, Sector, Village"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            name="city"
                            value={userDetails.city}
                            onChange={handleUserChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <select
                            name="state"
                            value={userDetails.state}
                            onChange={handleUserChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                          >
                            <option value="">Province*</option>
                            <option value="Western Province">Western Province</option>
                            <option value="Central Province">Central Province</option>
                            <option value="Southern Province">Southern Province</option>
                            <option value="Northern Province">Northern Province</option>
                            <option value="Eastern Province">Eastern Province</option>
                            <option value="North Western Province">North Western Province</option>
                            <option value="North Central Province">North Central Province</option>
                            <option value="Uva Province">Uva Province</option>
                            <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                          <input
                            type="text"
                            name="zipCode"
                            value={userDetails.zipCode}
                            onChange={handleUserChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                            placeholder="Enter ZIP code"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <button
                          onClick={handleSaveAddress}
                          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-3 px-6 rounded-lg font-medium transition-colors"
                        >
                          SAVE 
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-4 bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-800">Order Items</h2>
                {cartItems.length ? cartItems.map(item => (
                  <OrderItemCard key={item.productId._id} item={item} />
                )) : (
                  <p className="text-gray-600 text-center py-4">No items in cart.</p>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg sticky top-6">
                
                <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>
                
                {/* Price Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-Rs. {totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Estimated Price:</span>
                      <span>Rs. {finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-bold text-gray-800">Payment Method</h3>
                  
                  {/* Payment Method Selection */}
                  <div className="space-y-2">
                    <label className="text-gray-800 font-medium">Select Payment Method:</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="upi">UPI Payment</option>
                      <option value="netbanking">Net Banking</option>
                      <option value="wallet">Digital Wallet</option>
                      <option value="qr">QR Code Payment</option>
                    </select>
                  </div>

                  {/* Standard Payment Methods Icons */}
                  <div className="mt-3">
                    <p className="text-base font-bold text-gray-800 mb-1">We Accept</p>
                    <img 
                      src="/12.png" 
                      alt="Payment Methods" 
                      className="w-full h-auto mb-0"
                    />
                    <div className="flex items-center justify-center text-sm text-gray-600 -mt-1">
                      <svg className="w-4 h-4 mr-1.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Secure SSL Encrypted Payment</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Now Button with Item Count */}
                <div className="relative mb-4">
                  <button
                    onClick={handleCheckout}
                    disabled={loading || !cartItems.length}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-colors relative ${
                      loading || !cartItems.length
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800 text-white uppercase tracking-wider text-sm flex items-center justify-center'
                    }`}
                  >
                    {loading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <div className="relative w-full">
                          <span className="block w-full text-center">CHECKOUT NOW</span>
                          {cartItems.length > 0 && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {cartItems.reduce((total, item) => total + item.quantity, 0)}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </button>
                  
                  {!cartItems.length && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      SOLD OUT
                    </div>
                  )}
                </div>

                {!cartItems.length && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    Your cart is empty. Add items to proceed.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
