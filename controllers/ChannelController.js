import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique file names
import cloudinary from "cloudinary";

export const createChannel = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;
    const admin = await User.findById(userId);
    if (!admin) {
      res.status(400).send("Admin user not found");
    }
    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return res.status(400).send("Some members are not valid users");
    }
    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });
    await newChannel.save();
    return res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal server error");
  }
};

export const getUserChannels = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return res.status(201).json({ channels });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal server error");
  }
};

export const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName _id email color image",
      },
    });
    if (!channel) {
      return res.status(404).send("channel not found");
    }
    const messages = channel.messages;
    return res.status(201).json({ messages });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal server error");
  }
};

export const addChannelImage = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.userId;
    const channel = await Channel.findById(channelId).populate({
      path: "admin",
      select: "_id",
    });

    if (!channel) {
      return res.status(404).send("channel not found");
    }
    const isAdmin = channel.admin._id.toString() === userId.toString();
    if (isAdmin) {
      if (!req.files || !req.files["group-image"]) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get the uploaded file from the request
      const file = req.files["group-image"];

      // Create a promise for Cloudinary upload to avoid callback hell
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          cloudinary.v2.uploader
            .upload_stream(
              {
                public_id: `group-images/${uuidv4()}`, // Optional: Unique ID for image
                folder: "group-images", // Optional: Cloudinary folder for organization
              },
              (error, result) => {
                if (error) {
                  return reject(error);
                }
                resolve(result); // Resolve with the upload result
              }
            )
            .end(file.data); // End the stream with the file data
        });
      };

      // Upload file to Cloudinary and handle the result
      const cloudinaryResult = await uploadToCloudinary();

      // After successful upload, update the user record in the database
      const updatedChannel = await Channel.findByIdAndUpdate(
        channelId,
        {
          channelImage: cloudinaryResult.secure_url,
          public_id: cloudinaryResult.public_id,
        },
        { new: true } // Get the updated document back
      );

      if (!updatedChannel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      // Respond with the updated image URL
      res.status(200).json({
        channelImage: cloudinaryResult.secure_url,
      });
    }
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal server error");
  }
};
