import Product from "../modules/Product.js";
import QRCode from "qrcode";
import { calculateReorderLevel } from "../services/reorderService.js";


import nodemailer from "nodemailer";



export const notifySupplier = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await Product.findById(itemId).lean();
if (!item) {
  return res.status(404).json({ success: false, message: "Item not found" });
}

    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");
    console.log("SUPPLIER_EMAIL:", process.env.SUPPLIER_EMAIL);

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

   const subject = item.category.toLowerCase() === "clothing"
  ? `Low Stock: ${item.title} — check sizes`
  : `Low Stock: ${item.title} — only ${item.quantity} left`;


const textBody = `
The following item is low on stock:
- Name: ${item.title}
- Brand: ${item.brand || "-"}
- Category:${item.category}

`;

const htmlBody = `
<h2>Low Stock Alert 🚨</h2>
<p>The following item is low on stock:</p>
<ul>
  <li><strong>Name:</strong> ${item.title}</li>
  <li><strong>Brand:</strong> ${item.brand || "-"}</li>
      <li><strong>Category:</strong> ${item.category}</li>
  ${
    item.category.toLowerCase() === "clothing"
      ? `<li><strong>Sizes:</strong> ${JSON.stringify(item.colors || [])}</li>`
      : `<li><strong>Quantity:</strong> ${item.quantity}</li>`
  }


</ul>


`;



   
let info = await transporter.sendMail({
  from: `"Fashion Studio" <${process.env.EMAIL_USER}>`,
  to: process.env.SUPPLIER_EMAIL,
  subject,
  text: textBody,
  html: htmlBody
});


    console.log("Message sent: %s", info.messageId);
    res.status(200).json({ success: true, message: "Notification sent to supplier!" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
  }
};


export async function getAllProducts  (_,res)  {
   try{
   const products = await Product.find().sort({createdAt:-1}); // show the newest first
   res.status(200).json(products);
   }
   catch(error){
    console.error("Error in getAllproducts controller", error);
    res.status(500).json({message:"Internal server error"});
   }
}

export async function createAProduct(req, res) {
  try {
    const {
      title,
      content,
      price,
      quantity,
      brand,
      image,
      category,
      discount,
      unitPrice,
      sizes, // Expect array for clothing
    } = req.body;

  const productData = {
  title,
  content,
  price,
  brand,
  image: image || "",
  category,
  discount,
};

// ✅ only add unitPrice if it was provided
if (unitPrice !== undefined) {
  productData.unitPrice = unitPrice;
}


if (category.toLowerCase() === "clothing") {
  productData.colors = req.body.colors || []; // use colors instead of sizes
} else {
  productData.quantity = quantity || 0;
}

const qrData = category.toLowerCase() === "clothing"
  ? `Item: ${title}, Brand: ${brand}, Price: ${price}, Category: ${category}, Colors: ${JSON.stringify(req.body.colors)}`
  : `Item: ${title}, Brand: ${brand}, Price: ${price}, Category: ${category}, Quantity: ${quantity}`;



    productData.qrCode = await QRCode.toDataURL(qrData);

    const product = new Product(productData);
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Create error details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateAProduct(req, res) {
  try {
    const {
      title,
      content,
      price,
      quantity,
      brand,
      image,
      category,
      discount,
      unitPrice,
      sizes, // handle multiple sizes
    } = req.body;

  const updateData = {
  title,
  content,
  price,
  brand,
  image,
  category,
  discount,
};

// ✅ only update unitPrice if it was provided
if (unitPrice !== undefined) {
  updateData.unitPrice = unitPrice;
}


  if (category.toLowerCase() === "clothing") {
    updateData.colors = req.body.colors || []; // ✅ expect colors directly
    updateData.quantity = undefined;
  } else {
    updateData.quantity = quantity || 0;
    updateData.colors = undefined;
  }



     const qrData = category.toLowerCase() === "clothing"
    ? `Item: ${title}, Brand: ${brand}, Price: ${price}, Category: ${category}, Colors: ${JSON.stringify(req.body.colors)}`
    : `Item: ${title}, Brand: ${brand}, Price: ${price}, Category: ${category}, Quantity: ${quantity}`;



    updateData.qrCode = await QRCode.toDataURL(qrData);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    await calculateReorderLevel(updatedProduct._id);

    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    console.error("Error in updateAProduct controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}



export async function deleteAProduct (req,res)  {
   try{
 const deletedProduct = await Product.findByIdAndDelete(req.params.id);
 
   res.status(200).json({message:"products deleted successfully!"});
 
   }
   catch(error){
    if (error.name === "CastError") {
    return res.status(404).json({ message: "product not found" });
  }
 console.error("Error in deleteAproduct controller", error);
  res.status(500).json({ message: "Internal server error" });

   }
}


export async function getProductById(req,res){

try{
const product= await Product.findById(req.params.id);
if(!product) return res.status(404).json({message:"product not found"});
res.json(product);
}
catch(error){
if (error.name === "CastError") {
    return res.status(404).json({ message: "product not found" });
  }

console.error("Error in getproductById controller", error);
  res.status(500).json({ message: "Internal server error" });

}




}