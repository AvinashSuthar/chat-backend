import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";
import fileUpload from "express-fileupload";
import cloudinary from "cloudinary";
import bodyParser from "body-parser";
import projectRoutes from "./routes/ProjectRoutes.js";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique file names
import stream from "stream"; // Required for streaming files to Cloudinary

dotenv.config();
const app = express();
const port = process.env.PORT || 3003;
const corsOptions = {
  origin: process.env.ORIGIN, // Frontend URL
  credentials: true, // Allow cookies or Authorization headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};

const databaseUrl = process.env.DATABASE_URL;

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload()); // Middleware to handle file uploads

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Static folder for uploaded files (if required, otherwise Cloudinary handles this)
app.use("/uploads/files", express.static("uploads/files"));
app.use(cookieParser());

// Cloudinary Upload Route for Profile Image
// app.post("/api/auth/add-profile-image", (req, res) => {

// });
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/projects", projectRoutes);

// Cloudinary Image Delete Route
app.delete("/api/remove-profile-image", async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: "No public_id provided" });
    }

    // Remove the image from Cloudinary
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Error removing image from Cloudinary", error });
      }

      res.status(200).json({ message: "Image removed successfully" });
    });
  } catch (error) {
    console.error("Error removing image:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Server setup
const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

setupSocket(server);

// Database connection
mongoose
  .connect(databaseUrl)
  .then(() => console.log("DB connected...."))
  .catch((err) => console.log(err.message));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
