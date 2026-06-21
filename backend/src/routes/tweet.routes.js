import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
    getAllTweets
} from "../controllers/tweet.controller.js"
import { verifyJWT, verifyOptionalJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/create").post(verifyJWT, createTweet);
router.route("/user/:userId").get(verifyOptionalJWT, getUserTweets);
router.route("/update/:tweetId").patch(verifyJWT, updateTweet);
router.route("/delete/:tweetId").delete(verifyJWT, deleteTweet);
router.route("/").get(verifyOptionalJWT, getAllTweets);

export default router