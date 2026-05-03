import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
import authRoute from './routes/UserRoutes.js';
import cookieParser from 'cookie-parser';

// app.use(cors(
//     {
//         origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
//         credentials: true,
//     }
// ));

const allowedOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

app.options("*", cors());

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);

app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await connectDB();
});