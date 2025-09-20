import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true
    },

    content:{
        type: String,
         required: true
    },
     price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    
    brand: {
      type: String,
    },
image: {
  type: String,        // ← You changed it to String
  default: ""
},
qrCode: {
  type: String,  // will store the QR code as a base64 image string
  default: ""
}
,
category:{
type:String,
default:""

},
reorderLevel: {
  type: Number,
  default: 0, // will be calculated automatically
},
 discount: {
      type: Number,
      required: true,
      default: 0,
    },
    unitPrice:{
     type:Number,
     default:0,
     required:true,
    },

colors: [
  {
    name: { type: String }, // color name
    sizes: [
      {
        label: { type: String },   // size label e.g., S, M, L
        quantity: { type: Number, default: 0 }
      }
    ]
  }
],



    
} ,

{timestamps:true} // created, updated at

);

const Product = mongoose.model("Product", productSchema, "products");

export default Product;