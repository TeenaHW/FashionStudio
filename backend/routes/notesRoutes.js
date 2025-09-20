import express from "express";
import { getAllProducts,createAProduct,
  updateAProduct,
  deleteAProduct,getProductById,notifySupplier} from "../controllers/notesController.js";

const router =express.Router();

router.get("/",getAllProducts);

router.get("/:id",getProductById);

router.post("/",createAProduct);

router.put("/:id",updateAProduct);

router.delete("/:id",deleteAProduct);

router.post("/:id/notify", notifySupplier);
export default router;

//app.get("/api/notes", (req,res) => {
   // res.status(200).send("you got 5 notes")
//});
//app.post("/api/notes",(req,res) => {
 //   res.status(201).json({message:"note created successfully!"})
//});
//app.put("/api/notes/:id",(req,res) => {
//    res.status(200).json({message:"note updated successfully!"})
//});
//app.delete("/api/notes/:id",(req,res) => {
//    res.status(200).json({message:"note deleted successfully!"})
//});