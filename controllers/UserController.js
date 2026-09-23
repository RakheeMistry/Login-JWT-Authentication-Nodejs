import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
dotenv.config();
import sessionModel from "../models/session.model.js";


export const registerUser = async (req, res) => {
   try{
      const {name, email, mobile, password} = req.body;
      if(!name || !email || !mobile || !password){
         return res.status(400).json({message: "All fields are required"});
      }

      const existingUser = await User.findOne({email});
      if(existingUser){
         return res.status(409).json({message: "Email already registered"});
      }

      const hashed = await bcrypt.hash(password,10);

      //const user = new User({name,email,mobile,password:hashed});
      const user = await User.create({name,email,mobile,password:hashed});

       const refreshToken = jwt.sign(
         {id:user._id},    
         process.env.JWT_SECRET,
         {expiresIn:'7d'}  
      );

      const refreshTokenHash = bcrypt.hash("sha256").update(refreshToken).digest("hex");

      const session = await sessionModel.create({
         userId: user._id,
         refreshTokenHash,
         ip: req.ip,
         userAgent: req.headers["user-agent"]
      })

      const accesstoken = jwt.sign(
         {id:user._id,
          sessionId: session._id,
         },
         process.env.JWT_SECRET,
         {expiresIn:'15m'}
      );
      
     

      res.cookie("refreshtoken", refreshToken, {
         httpOnly: true,
         secure: true,
         sameSite: "strict",
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      //await user.save();

      res.status(201).json({message:"User Registration Successfully",
         user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile }, 
         accesstoken });
   }
   catch(error){
     console.log(error);
     res.status(500).json({message:"Server error"});
   } 
} 

export const loginUser = async(req,res) =>{
   try{
      const {email, password} = req.body;
      console.log("Body:",req.body);

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

      const accesstoken = jwt.sign({userID:user._id},process.env.JWT_SECRET,{expiresIn:'15m'});
      // console.log(token);
      
      res.status(200).json({
         message:'Login Successfull',
         token: accesstoken,
      });
   }
   catch(error){
      res.status(500).json({message:"Server error",error});
   }
}

export const getUserDetails = async (req, res) => {
   try {
      const authHeader = req.headers.authorization;
      console.log("Authorization Header:", authHeader);
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
         return res.status(401).json({ message: "Token missing" });
      }

      const token = authHeader.split(" ")[1];

      let decoded;
      try {
         decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
         return res.status(401).json({ message: "Invalid or expired token" });
      }

      const user = await User.findById(decoded.userID).select("-password");

      if (!user) {
         return res.status(404).json({ message: "User Not Found" });
      }

      res.status(200).json({
         success: true,
         user
      });
   } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
   }
}

export const refreshToken = async (req, res) => {
   try {
      const refreshToken = req.cookies.refreshtoken;
      if (!refreshToken) {
         return res.status(401).json({ message: "Refresh token missing" });
      }
      const decoded = jwt.verify(refreshToken, 
         process.env.JWT_SECRET);

      const accesstoken = jwt.sign(
         {userID: decoded.userID}, 
         process.env.JWT_SECRET, 
         {expiresIn: '15m'});

      const newRefreshToken = jwt.sign(
         {userID: decoded.userID}, 
         process.env.JWT_SECRET, 
         {expiresIn: '7d'});

      res.cookie("refreshtoken", newRefreshToken, {
         httpOnly: true,
         secure: true,
         sameSite: "strict",
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
         success: "Access token refreshed successfully",
         accesstoken
      });
   } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
   }
}

export const logout = async(req, res) => {
   try{
      // res.cookie("token", "", {
      //    httpOnly: true,
      //    secure: process.env.NODE_ENV === "production",
      //    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      //    expires: new Date(0),
      // });
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