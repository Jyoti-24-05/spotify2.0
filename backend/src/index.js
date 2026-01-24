import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from '@clerk/express';
import { connectDB } from "./lib/db.js";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";


import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import albumRoutes from "./routes/album.route.js";
import songRoutes from "./routes/song.route.js";
import statRoutes from "./routes/stat.route.js";

dotenv.config();

const __dirname= path.resolve();
const app= express();
const PORT= process.env.PORT|| 5000;

app.use(cors(
  {
    origin: "http://localhost:5000",
    credentials: true,
  }
));

app.use(express.json());//to parse req.body
app.use(clerkMiddleware());//to add auth to req obj
app.use(fileUpload({
  useTempFiles:true,
  tempFileDir:path.join(__dirname,"tmp"),
  createParentPath:true,
  limits:{
    fileSize:10 * 1024 *1024, //10mb max file size
  },
})
);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

//error handle
app.use((err,req,res,next)=>{
  res.send(500).json({message: proccess.env.NODE_ENV==="production"? "Internal server error": err.message});
})


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

//todo socket.io