import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    //TODO: create playlist
    if ([name, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and description are required");
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        videos: [],
        owner: req.user?._id
    })

    if (!playlist) throw new ApiError(500, "Failed to save playlist, try again");
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID")

    const playlist = await Playlist.findOne({ owner: userId })

    let message;
    if (!playlist) { message = "no playlist foung for the given user" } else { message = "successfully fetched the playlists" }
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlist,
            message
        ))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) throw new ApiError(404, "PLaylist not found")

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: { videos: videoId }
        }, { new: true }
    )

    if (!updatePlaylist) throw new ApiError(500, "Something went wrong while adding playlist")

    return res
        .status(200)
        .json(new ApiResponse(200, updatePlaylist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        }, { new: true }
    )

    if (!updatePlaylist) throw new ApiError(500, "Something went wrong while removing playlist")

    return res
        .status(200)
        .json(new ApiResponse(200, updatePlaylist, "Video removed to playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    if (playlist.owner.toString() !== req.user?._id) {
        throw new ApiError(403, "you are not authorized to delete the video")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return req
        .status(200)
        .json(new ApiError(200, {}, "Playlist succesfully deleted"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid Playlist ID")

    if (!name && !description) throw new ApiError(403, "Atleast one object need to update")

    const oldPlaylist = await Playlist.findById(playlistId)

    if (oldPlaylist.owner !== req.user?._id) throw new ApiError(403, "You are not authorized to update Playlist")

    if (oldPlaylist.name.toString() !== name.toString()) { throw new ApiError(412, "Can't update with same name") } else { oldPlaylist.name = name }
    if (oldPlaylist.description.toString() !== description.toString()) { throw new ApiError(412, "Can't update with same description") } else { oldPlaylist.description = description }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Successfully updated playlist"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}