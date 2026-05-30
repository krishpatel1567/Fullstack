import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriberId = req.user?._id 
    
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    // Validate that subscriber is not subscribing to themselves
    if (channelId === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }

    // Check if channel (user) exists
    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    let message
    if (existingSubscription) {
        // If subscription exists, delete it (unsubscribe)
        await Subscription.findByIdAndDelete(existingSubscription._id)
        message = "Unsubscribed successfully"
    } else {
        // If subscription doesn't exist, create it (subscribe)
        await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        })
        message = "Subscribed successfully"
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, message))
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $project: {
                _id: 0,
                subscriber: "$subscriberDetails._id",
                username: "$subscriberDetails.username",
                email: "$subscriberDetails.email",
                avatar: "$subscriberDetails.avatar",
                subscribedAt: "$createdAt"
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    // Find all subscriptions where this user is the subscriber
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $project: {
                _id: 0,
                channel: "$channelDetails._id",
                username: "$channelDetails.username",
                email: "$channelDetails.email",
                avatar: "$channelDetails.avatar",
                subscribedAt: "$createdAt"
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}