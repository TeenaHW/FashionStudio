import { useState, useEffect } from "react";
import api from "../lib/axios";
import NavbarP from "../components/NavbarP"; 
import Footer from "../components/FooterP"; 
import RateLimitedUI from "../components/RateLimitedUI";
import toast from "react-hot-toast"
import NotesNotFound from "../components/NotesNotFound";
import NoteCard2 from "../components/NoteCard2";


const HomePage = () => {
  const [israteLimited,setIsRateLimited]=useState(false);
  const [products,setProducts] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search, setSearch] = useState("");
 const productsToDisplay = search.trim()
  ? products.filter((n) =>
      (n.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (n.brand ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (n.category ?? "").toLowerCase().includes(search.toLowerCase())
    )
  : products;



  useEffect(() =>{
    const fetchProducts = async () => {

      try{
       const res= await api.get("/products");
    
       console.log(res.data)
       setProducts(res.data)
       setIsRateLimited(false)
      } catch(error){
       console.log("Error fetching products");
       console.log(error);
       if(error.response?.status === 429){
        setIsRateLimited(true)
       }
       else{
       toast.error("Failed to load products");

        
      }
      }
      finally{
        setLoading(false)
      }
      
    }
    fetchProducts();
  },[])
  return (
    
    <div className="min-h-screen bg-white">
      <NavbarP />
      {israteLimited && <RateLimitedUI/>}
      <div className="mt-6 mb-6 flex justify-center">
<input
    type="text"
    list="brandOptions"
    placeholder="Search by title or brand..."
    className="input input-bordered w-full max-w-md"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
  <datalist id="brandOptions">
    {[...new Set(products
      .map(n => (n.brand ?? "").trim())
      .filter(Boolean)
    )].map(b => <option key={b} value={b} />)}
  </datalist>
</div>



    <div className="max-w-7xl mx-auto p-4 mt-6">

      {loading && <div className="text-center text-primary py-10">Loading products... </div>}

      {products.length === 0 && !israteLimited && <NotesNotFound />}
{search && !loading && productsToDisplay.length === 0 && (
  <div className="text-center text-base-content/70 py-10">
    No matches for “{search}”.
  </div>
)}




{productsToDisplay.length > 0 && !israteLimited && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {productsToDisplay.map((product) => (
      <NoteCard2 key={product._id} product={product} setProducts={setProducts}/>
    ))}
  </div>
)}


    </div>

 <Footer />
    </div>
  )
}

export default HomePage
