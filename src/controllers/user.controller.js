import {asyncHandler} from "../utils/assyncHandler.js";

const registerUser = asyncHandler( async (req,res)=>{
    res.status(200).json({
        message:"ok"
    })
})

export {registerUser}