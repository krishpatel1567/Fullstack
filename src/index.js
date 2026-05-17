import connectDB from "./db/index.js";
import express from "express";
const app = express();
import dotenv from "dotenv";

dotenv.config({
    path:"./env"
});

connectDB();

// (async ()=>{
//     try{
//         await mongoose.connect(`$(process.env.MONGODB_URI)/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR",error);
//             throw error
            
//         })
//         app.listen(process.env.PORT || 3000,()=>{
//             console.log("Server is running on port",${process.env.PORT || 3000})
//         })
//     } catch(error){
//         console.error("ERROR:",error)
//         throw err
//     }
// })()