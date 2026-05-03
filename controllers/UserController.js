import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
dotenv.config();
export const registerUser = async (req, res) => {
   try{
      const {name, email, mobile, password} = req.body;
      if(!name || !email || !mobile || !password){
         return res.status(400).json({message: "All fields are required"});
      }

      const existingUser = await User.findOne({email});
      if(existingUser){
         return res.status(400).json({message: "Email already registered"});
      }
      const hashed = await bcrypt.hash(password,10);

      const user = new User({name,email,mobile,password:hashed});
      await user.save();

      res.status(201).json({message:"User Registration Successfully"});
   }
   catch(error){
     console.log(error);
     res.status(500).json({message:"Server error"});
   } 
} 

export const loginUser = async(req,res) =>{
   try{
      console.log(req.body);
      const {email, password} = req.body;
      if(!email || !password){
         return res.status(400).json({message:"All fields are required"});
      }
      const user = await User.findOne({email});
      if(!user){
         return res.status(400).json({message:"User not exists"});
      }
      const isMatch = await bcrypt.compare(password,user.password);
      if(!isMatch){
         return res.status(400).json({message:"Invalid Password"});
      }

      const token = jwt.sign({userID:user._id},process.env.JWT_SECRET,{expiresIn:'1d'});
      // console.log(token);
      res.cookie("token",token,{
         httpOnly: true,
         secure: true,
         sameSite: "None",
         maxAge:1 * 24 * 60 * 60 * 1000,
      })
      res.status(200).json({
         message:'Login Successfull',
         token
      });
   }
   catch(error){
      res.status(500).json({message:"Server error",error});
   }
}

export const getUserDetails = async(req, res) => {
   try{
      console.log("Cookies:", req.cookies);
      const token = req.cookies.token;
      if(!token){
         return res.status(401).json({message: "Token missing"});
      }
      const decoded = jwt.verify(token,process.env.JWT_SECRET);
      console.log(decoded);
      // const user=await User.findOne({ _id: decoded.userID });
      const user = await User.findById(decoded.userID).select("-password");
      if(!user){
         return res.status(404).json({message:"User Not Found"});
      }
      res.status(200).json({
         success: true,
         user
      });
   }
   catch(error){
      res.status(500).json({message:"Server error",error});
   }
}

export const logout = async(req, res) => {
   try{
      res.cookie("token", "", {
         httpOnly: true,
         secure: true,
         sameSite: "None",
         expires: new Date(0),
      });
      res.status(200).json({success: true, 
         message: "Logout Successfull"
      });
   }
   catch(error){
      res.status(500).json({success: false, 
         message:"Server error",
         error: error.message,});
   }
}