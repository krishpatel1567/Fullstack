//used to upload files that are already being uploaded to the server , now needed to br uploaded to the cloud
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null

    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        await fs.unlink(localFilePath).catch(() => {})
        
        fs.unlinkSync(localFilePath)
        return result
    } catch (error) {
        await fs.unlink(localFilePath).catch(() => {})
        return null
    }
}
export { uploadOnCloudinary }