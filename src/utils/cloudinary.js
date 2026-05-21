//used to upload files that are already being uploaded to the server , now needed to br uploaded to the cloud
import { v2 as cloudinary } from "cloudinary"; //just not liked to use v2 so used as cloudinary , just change in the name , not much ocmplex thing
import { response } from "express";
import fs from "fs"
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        //first we will check if the file paath is there or not 
        if (!localFilePath) return null
        //upload file on cloudinary 
        cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("file is uploaded on cloudinary", response.url);
        return response
    }
    catch {
        fs.unlink(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null
    }
}