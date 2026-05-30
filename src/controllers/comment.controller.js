import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId && !isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")

    const video = await Video.findById(videoId)

    if (!video) throw new ApiError(404, "Video not found")

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalComments",
            docs: "comments"
        }
    };

    const videoComments = await Comment.aggregatePaginate(
        Comment.aggregate([
            {
                $match: { video: new mongoose.Types.ObjectId(videoId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "commentOwnerDetails"
                }
            },
            {
                $unwind: "$commentOwnerDetails"
            },
            {
                $project: {
                    _id: 0,
                    content: 1,
                    ownerAvatar: "$commentOwnerDetails.avatar",
                    commentedAt: { $toDate: "$_id" }
                }
            }
        ]),
        options
    )

    return res
        .status(200)
        .json(new ApiResponse(200, videoComments, "Video comments fetched successfully"))


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const content = req.body.content
    
    if (!isValidObjectId(videoId) || !isValidObjectId(owner)) throw new ApiError(400, `${!isValidObjectId(videoId) ? "Invalid video id" : "Invalid user id"}`)

    if (content.toString() === "") throw new ApiError(400, "Content is required for comment")

    const comment = await Comment.create({
        content: content.toString(),
        video: videoId,
        owner: owner,
    })

    if (!comment) throw new ApiError(500, "Failed to save the comment")
    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment added for the video"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const newContent = req.body.content

    if (!commentId || !isValidObjectId(commentId)) throw new ApiError(400, "Invald comment ID")

    if (!newContent) throw new ApiError(400, "Content required to update")

    const comment = await Comment.findById(commentId)
    if (!comment) throw new ApiError(404, "Comment not found")
    const oldContent = comment.content
    if (newContent.toString() === oldContent.toString()) throw new ApiError(412, "Can't update with same content")

    if (comment.owner.toString() !== req.user?._id.toString()) throw new ApiError(403, "You are not authirized to update this comment")

    comment.content = newContent
    await comment.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment updated"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!commentId || !isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment ID")

    const comment = await Comment.findById(commentId)

    if (!comment) throw new ApiError(404, "Comment not found")

    if (comment.owner.toString() !== req.user?._id.toString()) throw new ApiError(403, "You are not authorized to delete this comment")

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment successfully deleted"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}