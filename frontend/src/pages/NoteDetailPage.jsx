import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "react-hot-toast";
import Header from "../components/HeaderP";
import Footer from "../components/FooterP";

const NoteDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.log("Error in fetching product", error);
        toast.error("Failed to fetch the product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      navigate("/");
    } catch (error) {
      console.log("Error in deleting", error);
      toast.error("Failed to delete the product");
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSave = async () => {
    // Basic validations
    if (!product.title?.trim()) return toast.error("Product title is required");
    if (!product.content?.trim()) return toast.error("Product description/content is required");
    if (!product.category?.trim()) return toast.error("Product category is required");
    if (!product.price || product.price <= 0) return toast.error("Product price must be greater than 0");
    if (!product.unitPrice || product.unitPrice <= 0) return toast.error("Product unit price must be greater than 0");

  // Clothing-specific validation
if (product.category?.toLowerCase() === "clothing") {
  if (!product.colors || product.colors.length === 0)
    return toast.error("At least one color is required for clothing");

  for (const color of product.colors) {
    if (!color.name.trim()) return toast.error("Each color must have a name");
    if (!color.sizes || color.sizes.length === 0)
      return toast.error(`Color "${color.name}" must have at least one size`);

    for (const size of color.sizes) {
      if (!size.label.trim())
        return toast.error(`Color "${color.name}" has a size without a label`);
      if (size.quantity < 10)
        return toast.error(
          `Quantity must be at least 10 for size "${size.label}" of color "${color.name}"`
        );
    }
  }
} else {
  if (product.quantity === null || product.quantity === undefined || product.quantity < 10) {
    return toast.error("Quantity must be at least 10 for non-clothing products");
  }
}


    if (!product.image) return toast.error("Product image is required");

    // Save product
    setSaving(true);
    try {
      await api.put(`/products/${id}`, product);
      toast.success("Product updated successfully!");
      navigate(`/product/${product._id}/details`);
    } catch (error) {
      console.log("Error in updating", error);
      toast.error("Failed to update the product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <LoaderIcon className="animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Header/>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to={`/product/${product._id}/details`} className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" /> Back
            </Link>
            <button onClick={handleDelete} className="btn btn-error btn-outline">
              <Trash2Icon className="h-5 w-5" /> Delete Item
            </button>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">

              {/* Title */}
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Title</span></label>
                <input
                  type="text"
                  placeholder="Product name"
                  className="input input-bordered"
                  value={product.title}
                  onChange={(e) => setProduct({ ...product, title: e.target.value })}
                />
              </div>

              {/* Content */}
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Content</span></label>
                <textarea
                  placeholder="Write the description here..."
                  className="textarea textarea-bordered"
                  value={product.content}
                  onChange={(e) => setProduct({ ...product, content: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Category</span></label>
                <input
                  type="text"
                  placeholder="Product category"
                  className="input input-bordered"
                  value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })}
                />
              </div>

              {/* Quantity (Non-clothing) */}
              {product.category?.toLowerCase() !== "clothing" && (
                <div className="form-control mb-4">
                  <label className="label"><span className="label-text">Quantity</span></label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Product quantity"
                    className="input input-bordered"
                    value={product.quantity}
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    onChange={(e) => setProduct({ ...product, quantity: Math.max(0, parseInt(e.target.value) || 0) })}
                  />
                </div>
              )}

              {/* Clothing: Colors & Sizes */}
              {product.category?.toLowerCase() === "clothing" && (
                <div className="form-control mb-4">
                  <label className="label"><span className="label-text">Colors & Sizes</span></label>

                  {product.colors?.map((color, colorIndex) => (
                    <div key={colorIndex} className="mb-4 border p-2 rounded">

                      {/* Color Name */}
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Color Name"
                          className="input input-bordered flex-1"
                          value={color.name}
                          onChange={(e) => {
                            const newColors = [...product.colors];
                            newColors[colorIndex].name = e.target.value;
                            setProduct({ ...product, colors: newColors });
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-error btn-sm"
                          onClick={() => {
                            const newColors = product.colors.filter((_, i) => i !== colorIndex);
                            setProduct({ ...product, colors: newColors });
                          }}
                        >✕ Color</button>
                      </div>

                      {/* Sizes */}
                      {color.sizes?.map((size, sizeIndex) => (
                        <div key={sizeIndex} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Size Label (S, M, L)"
                            className="input input-bordered flex-1"
                            value={size.label}
                            onChange={(e) => {
                              const newColors = [...product.colors];
                              newColors[colorIndex].sizes[sizeIndex].label = e.target.value;
                              setProduct({ ...product, colors: newColors });
                            }}
                          />
                          <input
                            type="number"
                            min={0}
                            placeholder="Quantity"
                            className="input input-bordered w-28"
                            value={size.quantity}
                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                            onChange={(e) => {
                              const newColors = [...product.colors];
                              newColors[colorIndex].sizes[sizeIndex].quantity = Math.max(0, parseInt(e.target.value) || 0);
                              setProduct({ ...product, colors: newColors });
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-error btn-sm"
                            onClick={() => {
                              const newColors = [...product.colors];
                              newColors[colorIndex].sizes = newColors[colorIndex].sizes.filter((_, i) => i !== sizeIndex);
                              setProduct({ ...product, colors: newColors });
                            }}
                          >✕ Size</button>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="btn btn-outline btn-sm mt-2"
                        onClick={() => {
                          const newColors = [...product.colors];
                          newColors[colorIndex].sizes.push({ label: "", quantity: 0 });
                          setProduct({ ...product, colors: newColors });
                        }}
                      >+ Add Size</button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline btn-sm mt-2"
                    onClick={() => {
                      const newColors = product.colors ? [...product.colors] : [];
                      setProduct({ ...product, colors: [...newColors, { name: "", sizes: [] }] });
                    }}
                  >+ Add Color</button>
                </div>
              )}

              {/* Price */}
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Price</span></label>
                <input
                  type="number"
                  min={0}
                  placeholder="Product selling price"
                  className="input input-bordered"
                  value={product.price}
                  onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                  onChange={(e) => setProduct({ ...product, price: Math.max(0, parseInt(e.target.value) || 0) })}
                />
              </div>

              {/* Unit Price */}
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Unit Price</span></label>
                <input
                  type="number"
                  min={0}
                  placeholder="Unit price"
                  className="input input-bordered"
                  value={product.unitPrice}
                  onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                  onChange={(e) => setProduct({ ...product, unitPrice: Math.max(0, parseInt(e.target.value) || 0) })}
                />
              </div>

              {/* Image */}
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Image</span></label>
                {product.image && (
                  <img src={product.image} alt="Current" className="w-full h-40 object-cover rounded-md mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const dataUrl = await convertToBase64(file);
                    setProduct({ ...product, image: dataUrl });
                  }}
                />
              </div>

              {/* Save button */}
              <div className="card-actions justify-end">
                <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                  {saving ? "Saving ..." : "Save Changes"}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default NoteDetailPage;