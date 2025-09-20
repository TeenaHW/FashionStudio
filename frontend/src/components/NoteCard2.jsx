import { BellIcon, PenSquareIcon, Trash2Icon } from "lucide-react"
import { Link ,useNavigate} from "react-router"
import { formatDate } from "../lib/utils"
import api from "../lib/axios"
import toast from "react-hot-toast"

const NoteCard2 = ({product,setProducts}) => {
    const navigate = useNavigate();
    const handleDelete = async(e,id) => {
     e.preventDefault(); // get rid of the navigation behavior
    
     if(!window.confirm("Are you sure to delete this product?")) return;

     try{
      await api.delete(`/products/${id}`);
      setProducts((prev)=> prev.filter(product => product._id!== id)) // get rid of the deleted one from the array
      toast.success("product deleted successfully!")
     }
     catch(error){
        console.log("Error in handleDelete",error);
      toast.error("Failed to delete the product");

     }

    }

  return (
    <Link to={`/product/${product._id}/details`}
        className="card bg-base-100 shadow-md transition-all duration-200 border-t-4 border-solid border-gray-400 w-70 h-100">
    
    <div className="card-body">
      
       <img 
  className="w-52 h-52 mt-2 object-contain" 
  src={product.image} 
  alt={product.title}
/>
       <h3 className="card-title text-base-content">
            {product.title}
        </h3>
     

       
       <h5 className="card-title text-sm text-base-content">Category:</h5>

       <p className="text-base-content/70 line-clamp-3">

        {product.category}
       </p>
       
      
         <h5 className="card-title text-sm text-base-content">Re-order-level:</h5>

       <p className="text-base-content/70 line-clamp-3">

        {product.reorderLevel}
       </p>

     <div className="card-actions justify-between items-center mt-4">
     <span className="text-sm text-base-content/60 ">
        {formatDate(new Date(product.createdAt))}
     </span>
     <div className="flex items-center gap-1">
           <button
  className="btn btn-ghost btn-xs"
  onClick={(e) => {
    

    e.preventDefault(); // stop the Link wrapping card
    navigate(`/product/${product._id}`); // ✅ goes to NoteDetailPage
  }}
>
  <PenSquareIcon className="size-4" />
</button>
       <button className="btn btn-ghost btn-xs text-error"onClick={(e) => handleDelete(e,product._id)}>
        <Trash2Icon className="size-4" />
       </button>
 <button
  className="btn btn-warning btn-xs"
  onClick={async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${product._id}/notify`);
      toast.success("Supplier notified by email!");
    } catch (error) {
      console.error("Error notifying supplier:", error);
      toast.error("Failed to notify supplier");
    }
  }}
>
 <BellIcon className="size-4"/>
</button> 


     </div>
     </div>

    </div>
    
    
    </Link>
  )
}
export default NoteCard2