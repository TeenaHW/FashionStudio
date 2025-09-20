import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
         quantity: { 
            type: Number, 
            required: true 
        },
        price: { 
            type: Number, 
            required: true 
        },
        color: String,
        size: String,

    }],
    totalAmount: { 
        type: Number, 
        required: true,
        set: v => Number(parseFloat(v).toFixed(2))
    },
     paymentMethod: { 
        type: String, 
        required: true 
    }, // e.g., "GovPay"
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'failed'], 
        default: 'pending' 
    },
    govPayTransactionId: String,
    govPayReference: String,
    Address: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
},
    { timestamps: true }//createdAt,updatesAt
);

const Order = mongoose.model("Order", orderSchema);
export default Order;