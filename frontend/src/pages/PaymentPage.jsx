import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import PaymentMethodCard from "../components/PaymentMethodCard";
import jsPDF from 'jspdf';

// Use local public assets for a professional look
const paymentOptions = [
  { id: "card", name: "Credit / Debit Card", image: "/credit or debit card.png", supports: ["Visa", "Mastercard", "AmEx", "Discover"] },
  { id: "upi", name: "UPI", image: "/UPi.avif", supports: ["GPay", "PhonePe", "Paytm", "BHIM"] },
  { id: "netbanking", name: "Net Banking", image: "/net banking.jpg", supports: ["HDFC", "SBI", "ICICI", "Axis"] },
  { id: "wallet", name: "Digital Wallet", image: "/digital wallet.jpg", supports: ["Paytm", "Amazon Pay", "PhonePe"] },
  { id: "qr", name: "QR Code", image: "/qr code.png", supports: ["Any UPI App"] },
];

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, finalTotal: finalTotalFromState, paymentMethod: methodFromState, items: itemsFromState, userDetails } = location.state || {};

  const [step, setStep] = useState("select");
  const [paymentMethod, setPaymentMethod] = useState(methodFromState || null);
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState(null);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [upiId, setUpiId] = useState("");
  const [upiPin, setUpiPin] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const [bankId, setBankId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [walletId, setWalletId] = useState("");
  const [walletPin, setWalletPin] = useState("");

  const [qrScanned, setQrScanned] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [rzpReady, setRzpReady] = useState(!!window.Razorpay);

  // Configuration for UPI QR payments (set these in your frontend .env as VITE_UPI_VPA and VITE_UPI_PN)
  const UPI_VPA = import.meta.env.VITE_UPI_VPA || 'yourvpa@upi';
  const UPI_PN = import.meta.env.VITE_UPI_PN || 'Fashion Studio';
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Load Razorpay script on demand
  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => { setRzpReady(true); resolve(true); };
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const startRazorpayUpiCheckout = async () => {
    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) { toast.error('Unable to load Razorpay'); return; }
    try {
      setLoading(true);
      // Fetch public key and create an order from backend
      const keyRes = await api.get('/razorpay/key');
      const orderRes = await api.post('/razorpay/orders', { amount: Number(amountToPay || 0) });
      const key = keyRes.data?.key;
      const order = orderRes.data; // {id, amount, currency}

      const rzp = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Fashion Studio',
        description: `Order ${orderId || ''}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            if (orderId) {
              await api.post('/payments', {
                orderId,
                method: 'qr',
                amount: amountToPay,
                gateway: 'razorpay',
                rzp: response,
              });
              await api.put(`/orders/${orderId}/status`, { status: 'paid' });
            }
            setTransaction({
              transactionId: response.razorpay_payment_id || order.id,
              method: 'qr',
              amount: amountToPay,
              orderId: orderId || 'LOCAL',
            });
            setStep('success');
            toast.success('Payment Successful!');
          } catch (err) {
            console.error(err);
            toast.error('Payment captured, but saving failed.');
          }
        },
        theme: { color: '#111' },
        config: {
          display: {
            blocks: {
              upi: { name: 'UPI', instruments: [{ method: 'upi' }] },
            },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: false },
          },
        },
      });
      rzp.open();
    } catch (e) {
      console.error(e);
      toast.error('Failed to start UPI payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 16);
    value = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(value);
  };

  const handlePaymentMethodClick = (method) => {
    setPaymentMethod(method);
    setStep("form");
  };

  const handleBack = () => {
    setStep("select");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setUpiId("");
    setUpiPin("");
    setOtp("");
    setOtpSent(false);
    setBankId("");
    setUsername("");
    setPassword("");
    setWalletId("");
    setWalletPin("");
    setQrScanned(false);
  };

  const handleSendOtp = () => {
    const fakeOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(fakeOtp);
    setOtpSent(true);
    alert(`Your OTP is: ${fakeOtp}`);
  };

  const handleFakePayment = async () => {
    if (paymentMethod === "card" && (!cardNumber || !expiry || !cvv)) return toast.error("Fill all card fields");
    if (paymentMethod === "upi") {
      if (!upiId || !upiPin) return toast.error("Fill UPI fields");
      if (otpSent && otp !== generatedOtp) return toast.error("Enter correct OTP");
    }
    if (paymentMethod === "netbanking" && (!bankId || !username || !password)) return toast.error("Complete netbanking fields");
    if (paymentMethod === "wallet" && (!walletId || !walletPin)) return toast.error("Complete wallet fields");

    setLoading(true);
    setTimeout(async () => {
      try {
        if (orderId) {
          const paymentRes = await api.post("/payments", {
            orderId,
            method: paymentMethod,
            amount: amountToPay,
          });

          await api.put(`/orders/${orderId}/status`, { status: 'paid' });

          setTransaction({
            transactionId: paymentRes.data.transactionId || "TXN" + Math.floor(Math.random() * 1000000),
            method: paymentMethod,
            amount: amountToPay,
            orderId,
          });
        } else {
          // No orderId: simulate a local success
          setTransaction({
            transactionId: "TXN" + Math.floor(Math.random() * 1000000),
            method: paymentMethod,
            amount: amountToPay,
            orderId: "LOCAL",
          });
        }

        setStep("success");
        toast.dismiss('payment');
        toast.success("Payment Successful!", { id: 'payment' });
      } catch (e) {
        console.error(e);
        toast.error("Payment failed");
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  // Single source of truth for form validation
  const isFormValid = () => {
    switch (paymentMethod) {
      case "card": {
        const digits = cardNumber.replace(/\s/g, "");
        const [mm, yy] = (expiry || "").split("/");
        const hasExpiry = mm?.length === 2 && yy?.length === 2;
        const hasCvv = cvv.length === 3 || cvv.length === 4;
        return digits.length === 16 && hasExpiry && hasCvv;
      }
      case "upi":
        return upiId && upiPin && (!otpSent || (otp && otp === generatedOtp));
      case "netbanking":
        return bankId && username && password;
      case "wallet":
        return walletId && walletPin;
      case "qr":
        return true; // handled via Razorpay Checkout
      default:
        return false;
    }
  };

  // Load items from state or localStorage as fallback
  const items = itemsFromState || JSON.parse(localStorage.getItem('checkoutCart') || '[]');

  // Compute totals if not provided
  const computedSubtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const computedDiscount = items.reduce((sum, it) => {
    const d = it.productId?.discount || 0;
    return sum + ((d / 100) * it.price * it.quantity);
  }, 0);
  const computedFinal = computedSubtotal - computedDiscount;
  const amountToPay = typeof finalTotalFromState === 'number' ? finalTotalFromState : computedFinal;

  useEffect(() => {
    // If a method was chosen on OrderPage, jump directly to form
    if (methodFromState) {
      setPaymentMethod(methodFromState);
      setStep("form");
    }
  }, [methodFromState]);

  // Generate and download invoice directly (no navigation)
  const handleDownloadInvoice = () => {
    try {
      if (!transaction) { toast.error('No transaction available'); return; }
      const { transactionId } = transaction;
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const black = [17,24,39];
      const gray600 = [75,85,99];
      const gray300 = [209,213,219];

      // Header
      doc.setFont('helvetica','bold'); doc.setFontSize(26); doc.setTextColor(...black); doc.text('Fashion Studio',50,60);
      doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(...gray600);
      doc.text('123 Galle Road, Colombo 03, Sri Lanka',50,78);
      doc.text('Phone: +94 11 234 5678 | Email: support@fashionstudio.com',50,92);
      doc.text('Website: www.fashionstudio.com | Hotline: 1999 (24/7)',50,106);
      // Badge
      doc.setDrawColor(...black); doc.setFillColor(...black); doc.roundedRect(420,40,140,26,4,4,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(255,255,255); doc.text('SALES INVOICE',490,57,{align:'center'});
      // Separator
      doc.setDrawColor(...black); doc.setLineWidth(1); doc.line(50,120,540,120);
      // Meta
      const label=(t,x,y)=>{doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(...black);doc.text(t,x,y);} ;
      const value=(t,x,y)=>{doc.setFont('helvetica','normal');doc.setFontSize(11);doc.setTextColor(...gray600);doc.text(t,x,y);} ;
      const todayIso=new Date().toISOString().slice(0,10);
      const buyerName=userDetails?.name||'Guest User';
      const billingAddr=[userDetails?.addressLine1,userDetails?.addressLine2,`${userDetails?.city||''}${userDetails?.state?`, ${userDetails.state}`:''}`.trim(),userDetails?.country||'Sri Lanka'].filter(Boolean).join(', ');
      label('Bill To:',50,145); value(buyerName,140,145);
      label('Billing Address:',50,165); value(billingAddr||'—',150,165);
      label('Delivery Address:',50,185); value(billingAddr||'—',170,185);
      label('Invoice No:',380,145); value(transactionId||'N/A',460,145);
      label('Invoice Date:',380,165); value(todayIso,460,165);
      label('Invoice Detail',50,315);
      // Header bar
      doc.setFillColor(245,158,11); doc.rect(50,328,490,24,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(255,255,255);
      doc.text('Description',60,345); doc.text('Quantity',365,345); doc.text('Amount (LKR)',455,345);
      // Rows
      let y=370; let subtotal=0; const list=items||[];
      list.forEach((it)=>{
        const qty=it.quantity||1; const line=(it.price||0)*qty; subtotal+=line;
        doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...black);
        const fallbackDesc=it.productId?.description||it.description||'';
        const name=it.name||it.productName||it.productId?.title||it.title||(fallbackDesc||'Item');
        doc.text(name,60,y);
        const raw=(it.productId?.category||it.category||'').toLowerCase();
        const cat=(raw?raw:(/(ring|earring|necklace|jewel|bracelet)/.test((name||'').toLowerCase())?'jewelry':'outfit'));
        doc.setFont('helvetica','italic'); doc.setFontSize(9); doc.setTextColor(...gray600); doc.text(cat.charAt(0).toUpperCase()+cat.slice(1),60,y+16);
        doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor(...black); doc.text(String(qty),390,y); doc.text(line.toFixed(2),520,y,{align:'right'});
        y+=44; doc.setDrawColor(...gray300); doc.line(50,y-16,540,y-16);
      });
      // Totals
      const totalsY=Math.max(y+10,500); const currency=(n)=>`LKR ${(Number(n)||0).toFixed(2)}`;
      doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...black);
      doc.text('Subtotal:',405,totalsY); doc.text(currency(subtotal),520,totalsY,{align:'right'});
      doc.text('Grand Total:',390,totalsY+22); doc.text(currency(subtotal),520,totalsY+22,{align:'right'});
      // Footer
      doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(...gray600);
      doc.text('Thank you for shopping with Fashion Studio!',300,780,{align:'center'});
      doc.text('For any inquiries, please contact:',300,796,{align:'center'});
      doc.text('Email: support@fashionstudio.com | Phone: +94 11 234 5678 | Hotline: 1999',300,812,{align:'center'});
      doc.text('Business Hours: Monday - Saturday, 9:00 AM - 8:00 PM',300,828,{align:'center'});
      doc.save(`FashionStudio_Invoice_${transactionId}.pdf`);
    } catch (e) {
      console.error(e); toast.error('Failed to generate invoice');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-green-50 border-b border-green-100">
        <div className="max-w-5xl mx-auto px-4 py-3 text-sm">
          <nav className="flex items-center space-x-2">
            <button type="button" onClick={() => navigate('/cart')} className="text-gray-600 hover:text-black">Cart</button>
            <span className="text-gray-400">›</span>
            <button type="button" onClick={() => navigate('/order')} className="text-gray-600 hover:text-black">Place Order</button>
            <span className="text-gray-400">›</span>
            <span className="text-black font-semibold">Pay</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-400">Order Complete</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center"> Complete Your Payment</h1>
        <div className="text-center mb-10">
          <p className="text-lg font-medium text-gray-800">Total Amount</p>
          <p className="text-4xl font-extrabold text-green-600 mt-1">Rs. {Number(amountToPay || 0).toFixed(2)}</p>
        </div>

        {/* Single column content */}
        <div className="space-y-8">
          {/* Step 1: Payment selection */}
          {step === "select" && (
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Method</h2>
              <div className="space-y-3" role="radiogroup" aria-label="Payment Method">
                {paymentOptions.map((opt) => (
                  <PaymentMethodCard
                    key={opt.id}
                    method={opt}
                    selectedMethod={paymentMethod}
                    onSelect={handlePaymentMethodClick}
                  />
                ))}
              </div>

              {/* Sticky footer with Continue button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  disabled={!paymentMethod}
                  className={`px-6 py-2 rounded-md font-semibold transition ${!paymentMethod ? 'bg-gray-300 cursor-not-allowed text-gray-600' : 'bg-black text-white hover:bg-gray-800'}`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2 and Step 3 */}
          {step === "form" && (
            <div className="relative bg-white p-8 rounded-2xl shadow-md border border-gray-100">
              {/* Close (X) button top-right */}
              <button
                type="button"
                aria-label="Close payment"
                onClick={() => setShowLeaveModal(true)}
                className="absolute -top-3 -right-3 md:top-4 md:right-4 inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M5.47 5.29a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Back button to return to payment method selection */}
              <button
                type="button"
                onClick={handleBack}
                className="absolute -top-3 -left-3 md:top-4 md:left-4 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M13.28 16.28a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 111.06 1.06L9.06 11l4.22 4.22a.75.75 0 010 1.06z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>

              {/* Selected method header removed as requested */}

              {paymentMethod === "card" && (
                <>
                  {/* Header with Card image on top and centered */}
                  <div className="flex flex-col items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Card Information <span role="img" aria-label="lock">🔒</span></h2>
                    <img src="/credit or debit card.png" alt="Credit / Debit Cards" className="mt-2 h-12 sm:h-16 object-contain" />
                  </div>

                  {/* Compact, centered form body */}
                  <div className="max-w-md mx-auto w-full">
                    {/* Card number */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Please enter card number."
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      inputMode="numeric"
                      className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:outline-none focus:shadow-md"
                    />

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-1">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expire Date <span className="text-red-500">*</span></label>
                        <select
                          value={expiry.split('/')[0] || ''}
                          onChange={(e) => {
                            const month = e.target.value;
                            const year = expiry.split('/')[1] || '';
                            setExpiry(month && year ? `${month}/${year}` : month);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-yellow-500 focus:outline-none focus:shadow-md"
                        >
                          <option value="">Month</option>
                          {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 invisible sm:visible">&nbsp;</label>
                        <select
                          value={expiry.split('/')[1] || ''}
                          onChange={(e) => {
                            const year = e.target.value;
                            const month = expiry.split('/')[0] || '';
                            setExpiry(month && year ? `${month}/${year}` : year);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-yellow-500 focus:outline-none focus:shadow-md"
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 12 }).map((_, i) => {
                            const y = new Date().getFullYear() + i;
                            return <option key={y} value={String(y).slice(2)}>{y}</option>;
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Security code <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="3-4 digits"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength="4"
                            className="w-20 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:outline-none focus:shadow-md"
                          />
                          <span className="text-xs text-gray-500 whitespace-nowrap">What is a security code?</span>
                        </div>
                      </div>
                    </div>

                    {/* Remember card */}
                    {/* Removed remember card checkbox */}

                    {/* Bottom centered CONFIRM button for Card */}
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={handleFakePayment}
                        disabled={loading || !isFormValid()}
                        className={`px-10 py-3 rounded-md font-bold ${loading || !isFormValid() ? 'bg-gray-300 cursor-not-allowed text-gray-600' : 'bg-black text-white hover:bg-gray-800'}`}
                      >
                        CONFIRM
                      </button>
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === "upi" && (
                <>
                  {/* Header with UPI image on top and centered */}
                  <div className="flex flex-col items-center mb-4">
                    <img src="/UPi.avif" alt="UPI" className="h-12 sm:h-16 w-auto object-contain" />
                    <h2 className="mt-2 text-2xl font-bold text-gray-800">UPI Payment</h2>
                  </div>

                  {/* Compact, centered form body */}
                  <div className="max-w-md mx-auto w-full">
                    {!otpSent ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="name@bank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:outline-none focus:shadow-md"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-1">UPI PIN <span className="text-red-500">*</span></label>
                        <input
                          type="password"
                          placeholder="****"
                          value={upiPin}
                          onChange={(e) => setUpiPin(e.target.value)}
                          className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:outline-none focus:shadow-md"
                        />
                        <div className="flex justify-center">
                          <button
                            onClick={handleSendOtp}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Send OTP
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full mb-6 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:outline-none focus:shadow-md"
                        />
                      </>
                    )}
                  </div>
                </>
              )}

              {paymentMethod === "netbanking" && (
                <>
                  {/* Header with Net Banking image on top and centered */}
                  <div className="flex flex-col items-center mb-4">
                    <img src="/net banking.jpg" alt="Net Banking" className="h-16 sm:h-24 w-auto object-contain" />
                    <h2 className="mt-2 text-2xl font-bold text-gray-800">Net Banking</h2>
                  </div>

                  {/* Compact, centered form body */}
                  <div className="max-w-md mx-auto w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank <span className="text-red-500">*</span></label>
                    <select value={bankId} onChange={(e) => setBankId(e.target.value)} className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-yellow-500 focus:outline-none focus:shadow-md">
                      <option value="">Select Bank</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="SBI">SBI</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="AXIS">Axis Bank</option>
                    </select>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-yellow-500 focus:outline-none focus:shadow-md" />

                    <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-2 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-yellow-500 focus:outline-none focus:shadow-md" />
                  </div>
                </>
              )}

              {paymentMethod === "wallet" && (
                <>
                  {/* Header with Wallet image on top and centered */}
                  <div className="flex flex-col items-center mb-4">
                    <img src="/digital wallet.jpg" alt="Digital Wallet" className="h-16 sm:h-24 w-auto object-contain" />
                    <h2 className="mt-2 text-2xl font-bold text-gray-800">Wallet Payment</h2>
                  </div>

                  {/* Compact, centered form body */}
                  <div className="max-w-md mx-auto w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wallet ID <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Wallet ID" value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-yellow-500 focus:outline-none focus:shadow-md" />

                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN <span className="text-red-500">*</span></label>
                    <input type="password" placeholder="PIN" value={walletPin} onChange={(e) => setWalletPin(e.target.value)} className="w-full mb-2 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-yellow-500 focus:outline-none focus:shadow-md" />
                  </div>
                </>
              )}

              {paymentMethod === "qr" && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">UPI QR Payment</h2>
                  {/* Order summary */}
                  <div className="text-left max-w-xl mx-auto w-full bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Order Summary</h3>
                    <ul className="divide-y divide-gray-200">
                      {items.map((it, idx) => (
                        <li key={idx} className="py-2 flex justify-between text-sm text-gray-700">
                          <span className="truncate pr-2">{it.productId?.title || it.title || 'Item'} × {it.quantity}</span>
                          <span>Rs. {(it.price * it.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex justify-between items-center text-sm">
                      <span className="font-semibold text-gray-900">Amount to Pay</span>
                      <span className="font-bold text-green-600">Rs. {Number(amountToPay || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  {(() => {
                    const am = Number(amountToPay || 0).toFixed(2);
                    const tn = `Order ${orderId || ''}`.trim();
                    const upiIntent = `upi://pay?pa=${encodeURIComponent(UPI_VPA)}&pn=${encodeURIComponent(UPI_PN)}&am=${encodeURIComponent(am)}&cu=INR&tn=${encodeURIComponent(tn)}`;
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiIntent)}`;
                    // Popular app-specific deep links
                    const phonepe = `phonepe://upi/pay?pa=${encodeURIComponent(UPI_VPA)}&pn=${encodeURIComponent(UPI_PN)}&am=${encodeURIComponent(am)}&cu=INR&tn=${encodeURIComponent(tn)}`;
                    const paytm = `paytmmp://pay?pa=${encodeURIComponent(UPI_VPA)}&pn=${encodeURIComponent(UPI_PN)}&am=${encodeURIComponent(am)}&cu=INR&tn=${encodeURIComponent(tn)}`;
                    // Android generic intent (fallback)
                    const androidIntent = `intent://pay?pa=${encodeURIComponent(UPI_VPA)}&pn=${encodeURIComponent(UPI_PN)}&am=${encodeURIComponent(am)}&cu=INR&tn=${encodeURIComponent(tn)}#Intent;scheme=upi;end`;
                    const copyToClipboard = async () => {
                      try {
                        await navigator.clipboard.writeText(upiIntent);
                        toast.success('UPI link copied');
                      } catch {
                        toast.error('Copy failed');
                      }
                    };
                    return (
                      <div className="flex flex-col items-center gap-3 mb-4">
                        <img src={qrUrl} alt="UPI QR Code" className="h-48 w-48 rounded-lg border border-gray-200 shadow-sm bg-white" />
                        {isMobile ? (
                          <a
                            href={upiIntent}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center mt-1 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                          >
                            Open in UPI app
                          </a>
                        ) : null}
                        {/* Centered short Confirm button for QR */}
                        <div className="mt-2 flex justify-center">
                          <button
                            onClick={handleFakePayment}
                            disabled={loading}
                            className={`px-10 py-3 rounded-md font-bold ${loading ? 'bg-gray-300 cursor-not-allowed text-gray-600' : 'bg-black text-white hover:bg-gray-800'}`}
                          >
                            CONFIRM
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Final action per method */}
              {paymentMethod === 'upi' || paymentMethod === 'netbanking' || paymentMethod === 'wallet' ? (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handleFakePayment}
                    disabled={loading || !isFormValid()}
                    className={`px-10 py-3 rounded-md font-bold ${loading || !isFormValid() ? 'bg-gray-300 cursor-not-allowed text-gray-600' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    CONFIRM
                  </button>
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">🔒</span>
                  <span>SSL Secure • 256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>PCI-DSS Compliant</span>
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="mt-10 bg-white p-10 rounded-3xl shadow-xl border border-green-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
                <h2 className="mt-4 text-4xl font-extrabold text-green-600">Payment Successful!</h2>
                <p className="mt-2 text-gray-600">Thank you. Your payment has been received.</p>
                <p className="mt-1 text-gray-900 font-semibold">Amount Paid: Rs. {Number(amountToPay || 0).toFixed(2)}</p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleDownloadInvoice}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Invoice
                  </button>
                  <button 
                    onClick={() => navigate('/')} 
                    className="px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm6 3a1 1 0 10-2 0v6a1 1 0 102 0V8zm-4 1a1 1 0 10-2 0v5a1 1 0 102 0V9z" clipRule="evenodd" />
                    </svg>
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leave payment modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">Leave payment?</h3>
            <p className="mt-1 text-sm text-gray-600">Your entered information will be lost. Do you want to leave this payment?</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setShowLeaveModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100">NO</button>
              <button onClick={() => {
                setShowLeaveModal(false);
                handleBack();
              }} className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800">YES</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
