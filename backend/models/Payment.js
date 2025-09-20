import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
   orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
   },
    method: { 
        type: String, 
        required: true 
    }, // e.g., "GovPay"
    amount: { 
        type: Number, 
        required: true,
        set: v => Number(parseFloat(v).toFixed(2))
    },
    currency: { 
        type: String, 
        default: 'LKR' 
    },
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'pending' 
    },
    transactionId: String,
},
    { timestamps: true }//createdAt,updatesAt
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;