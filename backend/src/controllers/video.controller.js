import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteCloudinaryFile, uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    // Step 1: Build the match stage
    const matchStage = {
        $match: {
            isPublished: true
        }
    };

    if (userId && isValidObjectId(userId)) {
        matchStage.$match.owner = new mongoose.Types.ObjectId(userId);
    }

    if (query) {
        matchStage.$match.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    // Step 2: Build the pipeline for aggregatePaginate
    const pipeline = [
        matchStage,
        // New: Populate owner details
        {
            $lookup: {
                from: "users", // The name of the users collection in MongoDB
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner" // Converts the owner array into an object
        },
        {
            $project: {
                "owner.password": 0, // Exclude sensitive fields
                "owner.refreshToken": 0,
                "owner.watchHistory": 0
            }
        }
    ];

    // Step 3: Build the sort stage
    const sortStage = {};
    if (sortBy) {
        const allowedSortFields = ["views", "createdAt", "duration", "title"];
        const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
        sortStage[finalSortBy] = sortType === "asc" ? 1 : -1;
    } else {
        sortStage.createdAt = -1;
    }
    
    // Add sort to pipeline
    pipeline.push({ $sort: sortStage });

    // Step 4: Use aggregatePaginate
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos"
        }
    };

    const result = await Video.aggregatePaginate(
        Video.aggregate(pipeline),
        options
    );

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Videos fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    // 1. Validate inputs
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and description are required");
    }

    // 2. Get local file paths from multer (set up by the route)
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) throw new ApiError(400, "Video file is required");
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

    // 3. Upload both to Cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) throw new ApiError(500, "Video upload to Cloudinary failed");
    if (!thumbnail) throw new ApiError(500, "Thumbnail upload to Cloudinary failed");

    // 4. Save the document to MongoDB
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title: title.trim(),
        description: description.trim(),
        duration: videoFile.duration,   // Cloudinary returns this automatically
        owner: req.user?._id,           // set by verifyJWT middleware
        isPublished: true,
    });

    if (!video) throw new ApiError(500, "Failed to save video, try again");

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true }
    ).populate("owner", "username email avatar");

    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { watchHistory: videoId }
    })

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            video,
            "video found"
        ))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!title && !description && !req.file) {
        throw new ApiError(400, "Atleast 1 file is need to update")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const updateData = {}
    if (title?.trim()) updateData.title = title.trim()
    if (description?.trim()) updateData.description = description.trim()

    if (req.file) {
        if (video.thumbnail) {
            await deleteCloudinaryFile(video.thumbnail)
        }
        const newthumbnail = await uploadOnCloudinary(req.file.path)
        if (!newthumbnail) {
            throw new ApiError(500, "thumbnail upload failed")
        }
        updateData.thumbnail = newthumbnail.url
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedVideo,
            "Video updated succesfully"
        ))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "you are not authorized to delete the video")
    }

    await Video.findByIdAndDelete(videoId)

    const deletedvideo = await deleteCloudinaryFile(video.videoFile)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video succesfully deleted"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "you are not authorized to toggle Publish status of the video")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unpublished"}`));


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}