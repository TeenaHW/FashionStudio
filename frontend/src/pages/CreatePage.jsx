import { ArrowLeftIcon, LucideSlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../lib/axios";
import FooterP from "../components/FooterP";
import HeaderP from "../components/HeaderP";

const CreatePage = () => {
  const [title,setTitle] = useState("");
  const [content,setContent]=useState("");
  const[loading,setLoading] = useState(false);
  const[brand,setBrand] = useState("");
 const[image,setImage]=useState(null);
  const[price,setPrice]=useState(0);
  const[quantity,setQuantity]=useState(0);
  const[category,setCategory]=useState("");
   const[discount,setDiscount]=useState(0);
   const[unitPrice,setUnitPrice]=useState(0);
  const navigate = useNavigate();

  const [sizes, setSizes] = useState([{ label: "", quantity: 0 }]);
  // Only for clothing items
const [colors, setColors] = useState([
  { name: "", sizes: [{ label: "", quantity: 0 }] },
]);

// Add a new color
const addColor = () => setColors([...colors, { name: "", sizes: [{ label: "", quantity: 0 }] }]);

// Remove a color
const removeColor = (index) => setColors(colors.filter((_, i) => i !== index));

// Manage sizes within a color
const handleColorSizeChange = (colorIndex, sizeIndex, field, value) => {
  const newColors = [...colors];
  newColors[colorIndex].sizes[sizeIndex][field] = value;
  setColors(newColors);
};

// Add size to a specific color
const addSizeToColor = (colorIndex) => {
  const newColors = [...colors];
  newColors[colorIndex].sizes.push({ label: "", quantity: 0 });
  setColors(newColors);
};

// Remove size from a specific color
const removeSizeFromColor = (colorIndex, sizeIndex) => {
  const newColors = [...colors];
  newColors[colorIndex].sizes.splice(sizeIndex, 1);
  setColors(newColors);
};


// Add new size row
const addSize = () => {
  setSizes([...sizes, { label: "", quantity: 0 }]);
};

// Update size field
const handleSizeChange = (index, field, value) => {
  const newSizes = [...sizes];
  newSizes[index][field] = value;
  setSizes(newSizes);
};

// Remove a size row
const removeSize = (index) => {
  const newSizes = sizes.filter((_, i) => i !== index);
  setSizes(newSizes);
};


const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
    


  const handleSubmit = async (e) => {
  e.preventDefault();

  // Basic validations
  if (!title.trim()) return toast.error("Product name is required");
  if (!content.trim()) return toast.error("Product description/content is required");
  if (!brand.trim()) return toast.error("Brand is required");
  if (!category.trim()) return toast.error("Category is required");
  if (!image) return toast.error("Product image is required");
  if (isNaN(unitPrice) || unitPrice <= 0) return toast.error("Unit price must be greater than 0");
  if (isNaN(price) || price <= 0) return toast.error("Price must be greater than 0");

  // Non-clothing products: quantity must be >= 10
  if (category.toLowerCase() !== "clothing") {
    if (isNaN(quantity) || quantity < 10) {
      return toast.error("Quantity must be at least 10 for non-clothing products");
    }
  }

  // Clothing products: colors & sizes
  if (category.toLowerCase() === "clothing") {
    if (colors.length === 0 || colors.every(c => !c.name.trim())) {
      return toast.error("At least one color is required for clothing items");
    }

    for (const color of colors) {
      if (!color.name.trim()) return toast.error("Color name cannot be empty");
      if (color.sizes.length === 0) return toast.error(`At least one size is required for color "${color.name}"`);

      for (const size of color.sizes) {
        if (!size.label.trim()) return toast.error(`Size label is required for color "${color.name}"`);
        if (isNaN(size.quantity) || size.quantity < 10) {
          return toast.error(`Quantity must be at least 10 for size "${size.label}" of color "${color.name}"`);
        }
      }
    }
  }

  // Continue with the API call...
  setLoading(true);
  try {
    let imageBase64 = null;
    if (image) {
      imageBase64 = await convertToBase64(image); // Full data URL
    }

    const payload = {
      title,
      content,
      category,
      brand,
      price: parseFloat(price),
      image: imageBase64,
      discount: parseInt(discount),
      unitPrice: parseFloat(unitPrice),
    };

    if (category.toLowerCase() === "clothing") {
      payload.colors = colors;
    } else {
      payload.quantity = parseInt(quantity);
    }

    const res = await api.post("/products", payload);
    if (res.status === 201) {
      toast.success("Product created successfully!");
      navigate("/");
    }
  } catch (error) {
    console.log("Full creation error:", error);
    if (error.response?.status === 429) {
      toast.error("Slow down! You're creating products too fast");
    } else {
      toast.error("Failed to create product! Check console for details.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-base-200">
      <HeaderP/>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to={"/"} className="btn btn-ghost mb-6">
          <ArrowLeftIcon className="size-5"></ArrowLeftIcon>
          Back to Dashboard
          </Link>
          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4"> 
               Add New Item
              </h2>
             <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label  className="label">
                  <span className="label-text">Name</span>
                </label>
               <input type="text" 
               placeholder=" Product Name"
               className="input input-bordered"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               />
              </div>
              <div className="form-control mb-4">
             <label className="label">
              <span className="label-text">Content</span>

             </label>
             <textarea 
             placeholder="Write product content here..."
             className="textarea textarea-bordered h-32"
             value={content}
             onChange={(e) => setContent(e.target.value)}
             
             />
             </div>

          <div className="form-control mb-4">
             <label className="label">
              <span className="label-text">Brand</span>

             </label>
            <input type="text" 
               placeholder="Product brand"
               className="input input-bordered"
               value={brand}
               onChange={(e) => setBrand(e.target.value)}
               />
             

              </div>
               <div className="form-control mb-4">
             <label className="label">
              <span className="label-text">Category</span>

             </label>
            <input type="text" 
               placeholder="Product category"
               className="input input-bordered"
               value={category}
               onChange={(e) => setCategory(e.target.value)}
               />
             

              </div>

          <div className="form-control mb-4">
             <label className="label">
              <span className="label-text">Image</span>

             </label>
            <input 
               type="file"
               accept="image/*" 
               placeholder="Product image"
               className="input input-bordered"
               //value={image}
               onChange={(e) => setImage(e.target.files[0])}
               />
             

              </div>
               <div className="form-control mb-4">
    <label className="label">
      <span className="label-text">Unit Price:</span>
    </label>
<input 
  type="number"
  placeholder="Product unit price"
  className="input input-bordered"
  value={unitPrice}
  min={0}
  onKeyDown={(e) => { if(e.key === '-' || e.key === 'e') e.preventDefault(); }}
  onChange={(e) => setUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
/>


  </div>

            {category.toLowerCase() !== "clothing" && (
  <div className="form-control mb-4">
    <label className="label">
      <span className="label-text">Quantity</span>
    </label>
  <input 
  type="number"
  placeholder="Product Quantity"
  className="input input-bordered"
  value={quantity}
  min={0}
  onKeyDown={(e) => { if(e.key === '-' || e.key === 'e') e.preventDefault(); }}
  onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
/>

  </div>
)}


              
          <div className="form-control mb-4">
             <label className="label">
              <span className="label-text">Price</span>

             </label>
            <input 
  type="number"
  placeholder="Product Price"
  className="input input-bordered"
  value={price}
  min={0}
  onKeyDown={(e) => { if(e.key === '-' || e.key === 'e') e.preventDefault(); }}
  onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
/>

             

              </div>
               <div className="form-control mb-4">
             <label className="label">
              <span className="label-text">Discount</span>

             </label>
           <input 
  type="number"
  placeholder="Product discount"
  className="input input-bordered"
  value={discount}
  min={0}
  onKeyDown={(e) => { if(e.key === '-' || e.key === 'e') e.preventDefault(); }}
  onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
/>

             

              </div>
           {category.toLowerCase() === "clothing" ? (
  <div className="form-control mb-4">
    <label className="label">
      <span className="label-text">Colors & Sizes</span>
    </label>

    {colors.map((color, colorIndex) => (
      <div key={colorIndex} className="mb-4 border p-2 rounded">
        {/* Color Name */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="Color Name"
            className="input input-bordered flex-1"
            value={color.name}
            onChange={(e) => {
              const newColors = [...colors];
              newColors[colorIndex].name = e.target.value;
              setColors(newColors);
            }}
          />
          <button
            type="button"
            className="btn btn-error btn-sm"
            onClick={() => removeColor(colorIndex)}
          >
            ✕ Color
          </button>
        </div>

        {/* Sizes inside color */}
        {color.sizes.map((size, sizeIndex) => (
          <div key={sizeIndex} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Size Label (S, M, L)"
              className="input input-bordered flex-1"
              value={size.label}
              onChange={(e) =>
                handleColorSizeChange(colorIndex, sizeIndex, "label", e.target.value)
              }
            />
            <input
  type="number"
  placeholder="Quantity"
  className="input input-bordered w-28"
  value={size.quantity}
  min={0}
  onKeyDown={(e) => { if(e.key === '-' || e.key === 'e') e.preventDefault(); }}
  onChange={(e) =>
    handleColorSizeChange(colorIndex, sizeIndex, "quantity", Math.max(0, parseInt(e.target.value) || 0))
  }
/>

            <button
              type="button"
              className="btn btn-error btn-sm"
              onClick={() => removeSizeFromColor(colorIndex, sizeIndex)}
            >
              ✕ Size
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-outline btn-sm mt-2"
          onClick={() => addSizeToColor(colorIndex)}
        >
          + Add Size
        </button>
      </div>
    ))}

    <button type="button" className="btn btn-outline btn-sm mt-2" onClick={addColor}>
      + Add Color
    </button>
  </div>
) : null}



             <div className="card-action justify-end">
              <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ?"Creating..." : "Create Products"}
              </button>
             </div>


             </form>
            </div>

          </div>

        </div>

      </div>
      <FooterP/>
    </div>
  )
}

export default CreatePage




