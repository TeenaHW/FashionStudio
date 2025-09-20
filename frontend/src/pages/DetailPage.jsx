import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/axios";
import { BellIcon, PenSquareIcon, Trash2Icon, ArrowLeftIcon } from "lucide-react";
import toast from "react-hot-toast";
import Header from "../components/HeaderP";  // ✅ Import Header
import Footer from "../components/Footer";  // ✅ Import Footer

const DetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure to delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted successfully!");
      navigate("/"); 
    } catch (error) {
      console.error("Error in handleDelete", error);
      toast.error("Failed to delete the product");
    }
  };

  const handleNotify = async (e, id) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/notify`);
      toast.success("Supplier notified by email!");
    } catch (error) {
      console.error("Error notifying supplier:", error);
      toast.error("Failed to notify supplier");
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ✅ Header */}
      <Header />

      {/* ✅ Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative card bg-base-100 shadow-md transition-all duration-200 border-t-4 border-solid border-gray-400 max-w-5xl w-full">
          
          <Link
            to="/"
            className="absolute top-4 left-4 btn btn-ghost btn-sm flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Dashboard
          </Link>

          <div className="card-body flex flex-col md:flex-row gap-6">
            {/* LEFT: Product Image */}
            <div className="flex-1 flex items-center justify-center">
              <img
                className="max-w-xs md:max-w-sm rounded-lg"
                src={product.image}
                alt={product.title}
              />
            </div>

            {/* RIGHT: Product Details */}
            <div className="flex-1">
              <h3 className="card-title text-base-content mb-4">{product.title}</h3>
              <h5 className="card-title text-sm text-base-content">Description:</h5>
              <p className="text-base-content/70 mb-3">{product.content}</p>

              <h5 className="card-title text-sm text-base-content">Category:</h5>
              <p className="text-base-content/70 mb-3">{product.category}</p>

              <h5 className="card-title text-sm text-base-content">Unit Price:</h5>
              <p className="text-base-content/70 mb-3">{product.unitPrice}</p>

              <h5 className="card-title text-sm text-base-content">Price:</h5>
              <p className="text-base-content/70 mb-3">{product.price}</p>

              <h5 className="card-title  text-sm text-base-content">Brand:</h5>
              <p className="text-base-content/70 mb-3">{product.brand}</p>

              <h5 className="card-title text-sm text-base-content">Re-Order-level:</h5>
              <p className="text-base-content/70 mb-3">{product.reorderLevel}</p>

              <h5 className="card-title text-sm text-base-content">Discount:</h5>
              <p className="text-base-content/70 mb-3">{product.discount}</p>

              {product.category?.toLowerCase() !== "clothing" && (
                <>
                  <h5 className="card-title text-sm text-base-content">Quantity:</h5>
                  <p className="text-base-content/70 mb-3">{product.quantity}</p>
                </>
              )}

              {product.category?.toLowerCase() === "clothing" && product.colors?.length > 0 && (
                <>
                  <h5 className="card-title text-sm text-base-content">Colors, Sizes & Quantities:</h5>
                  {product.colors.map((color, cIndex) => (
                    <div key={cIndex} className="mb-2">
                      <p className="font-semibold text-base-content">{color.name}</p>
                      {color.sizes.map((size, sIndex) => (
                        <p key={sIndex} className="text-base-content/70 ml-4">
                          {size.label}: {size.quantity}
                        </p>
                      ))}
                    </div>
                  ))}
                </>
              )}

              {product.qrCode && (
                <div className="mt-4">
                  <img src={product.qrCode} alt="QR Code" className="w-32 h-32" />
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 mt-6">
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <PenSquareIcon className="size-4" />
                </button>

                <button
                  className="btn btn-ghost btn-xs text-error"
                  onClick={(e) => handleDelete(e, product._id)}
                >
                  <Trash2Icon className="size-4" />
                </button>

                <button
                  className="btn btn-warning btn-xs"
                  onClick={(e) => handleNotify(e, product._id)}
                >
                  <BellIcon className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Footer */}
      <Footer />
    </div>
  );
};

export default DetailPage;
