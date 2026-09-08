import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

if(!process.env.MONGO_URL){
    throw new Error("MONGO_URL is not defined in the environment variables.");
    console.error("MONGO_URL is not defined in the environment variables.");
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in the environment variables.");
    console.error("JWT_SECRET is not defined in the environment variables.");
}

mongoose.set('strictQuery', true);
const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Mongoose Connected!");
    }
    catch(error){
        console.log("Connection failed",error);
        process.exit(1);
    }
}

export default connectDB;