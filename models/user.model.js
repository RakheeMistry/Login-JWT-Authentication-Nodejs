import  mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Name is required"],
        minlength:3
    },
    email:{
        type:String,
        required:[true, "Email is required"],
        unique: [true, "Email already exists"],
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    mobile:{
        type: String,
        required: [true, "Mobile number is required"],
        match: /^[0-9]{10}$/,
    },
    password:{
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
    }
},{timestamps: true});

export default mongoose.model("UserData",userSchema);