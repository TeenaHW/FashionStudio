import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../lib/axios";
import HeaderP from"../components/HeaderP";
import FooterP from"../components/FooterP";
const CreateTransactionPage = () => {
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/transactions", {
        description: description.trim(),
        total_amount: amount,
      });

      if (res.status === 201) {
        toast.success("Transaction created successfully!");
        setDescription("");
        setTotalAmount("");
      }
    } catch (error) {
      console.error("Transaction creation error:", error);
      toast.error("Failed to create transaction! Check console for details.");
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
            <ArrowLeftIcon className="size-5" /> Back to Dashboard
          </Link>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Create New Transaction</h2>

              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Transaction description"
                    className="input input-bordered"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Amount</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Transaction amount"
                    className="input input-bordered"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                </div>

                <div className="card-action justify-end">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Creating..." : "Create Transaction"}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>

      
   <div>

    <FooterP/>
   </div>



    </div>
  
  );
};

export default CreateTransactionPage;
