import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema(
    {
        username:{
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true
        },
        email:{
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        fullName:{
            type : String,
            required : true,
            trim : true,
            index : true
        },
        avatar:{
            type : String,
            required : true
        },
        coverImage:{
            type : String
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type : String,
            required : true
        },
        refreshToken:{
            type : String
        }
    },
    {
        timestamps:true
    }
)

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    const accessTokenExpiry =process.env.ACCESS_TOKEN_EXPIRY || '15m'

    return jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: accessTokenExpiry
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d'

    return jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: refreshTokenExpiry
        }
    )
}
export const User = mongoose.model("User",userSchema)