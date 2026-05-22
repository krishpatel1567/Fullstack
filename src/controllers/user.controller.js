import { asyncHandler } from "../utils/assyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/apiResponse.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId)=> {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}


    }catch(error){
        throw error
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body

    if (
        [fullName, email, username, password].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const normalizedUsername = username?.trim().toLowerCase()
    const normalizedEmail = email?.trim().toLowerCase()

    const existedUser = await User.findOne({
        $or:[{username:normalizedUsername},{email:normalizedEmail}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already existed")
    }

    const allUploadedFiles = req.files && Object.values(req.files).flat()
    const avatarFile = allUploadedFiles?.find(
        (file) => file.fieldname === 'avatar' || file.fieldname === 'avatar[]'
    ) || req.files?.avatar?.[0] || req.file || allUploadedFiles?.[0]

    const avatarLocalPath = avatarFile?.path || req.body?.avatar

    let coverImageLocalPath
    const coverImageFile = allUploadedFiles?.find(
        (file) => file.fieldname === 'coverImage' || file.fieldname === 'coverImage[]'
    ) || req.files?.coverImage?.[0] || allUploadedFiles?.[1]

    if (coverImageFile) {
        coverImageLocalPath = coverImageFile.path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required. Send the request as multipart/form-data with field name 'avatar'.")
    }

    const avatar = typeof avatarLocalPath === 'string' && avatarLocalPath.startsWith('http')
        ? { url: avatarLocalPath }
        : await uploadOnCloudinary(avatarLocalPath)
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null

    if (!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while regestering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered succesfully")
    )

})

const loginUser = asyncHandler(async (req,res)=>{
    const {email,username,password} = req.body

    if(!(email || username)){
        throw new ApiError(400,"username or email is required")
    }

    const normalizedUsername = username?.trim().toLowerCase()
    const normalizedEmail = email?.trim().toLowerCase()

    const query = normalizedEmail
        ? { email: normalizedEmail }
        : { username: normalizedUsername }

    const user = await User.findOne(query)

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Password invalid")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    const options ={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in successfully"
        )
    )

})

const logOutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options ={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if (incomingRefreshToken){
        throw new ApiError(401,"unathorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken._id)
    
        if(!user){
            throw new ApiError(401,"invalid user token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh token expired")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(201)
        .cookie("accesToken",accessToken)
        .cookie("refreshToken",newRefreshToken)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "access token refreshed"
            )
        )
    } catch (error) {
        throw error
    }
})


export { 
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken
 }