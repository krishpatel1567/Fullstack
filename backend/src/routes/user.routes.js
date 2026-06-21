import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile,getUserChannelProfileById, getWatcherHistory, loginUser, logOutUser, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountDetails);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);
router.route("/:username").post(verifyJWT,getUserChannelProfile);
router.route("/history").get(verifyJWT,getWatcherHistory);
router.route("/channel/:userId").get(verifyJWT,getUserChannelProfileById);

export default router