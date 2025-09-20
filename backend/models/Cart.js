import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
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
        required: true 
    },
    couponCode: String,
},
    { timestamps: true }//createdAt,updatesAt
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;