import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique file names
import cloudinary from "cloudinary";

const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "credientials missing" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email" });
    }

    const user = await User.create({ email, password });

    res.cookie("jwt", createToken(email, user._id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "something went wrong try again later" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with given email not found" });
    }

    const auth = await compare(password, user.password);
    if (!auth) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Create token
    const token = createToken(email, user.id);

    // Set cookie with security flags
    res.cookie("jwt", token, {
      maxAge,
      secure: true,
      sameSite: "None",
      httpOnly: true, // Security improvement
    });

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.colors,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).send("User with given email not found");
    }

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.colors,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal server error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req;
    const { firstName, lastName, colors } = req.body;
    if (!firstName || !lastName) {
      res.status(400).send("Firstname, lastname and color is required.");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        colors,
        profileSetup: true,
      },
      {
        runValidators: true,
        new: true,
      }
    );
    if (!userData) {
      return res.status(404).send("User with given email not found");
    }

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.colors,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal server error");
  }
};

export const addProfileImage = async (req, res) => {
  try {
    // Check if the file is uploaded
    if (!req.files || !req.files["profile-image"]) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the uploaded file from the request
    const file = req.files["profile-image"];

    // Create a promise for Cloudinary upload to avoid callback hell
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              public_id: `profile-images/${uuidv4()}`, // Optional: Unique ID for image
              folder: "profile-images", // Optional: Cloudinary folder for organization
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
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        image: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
      },
      { new: true } // Get the updated document back
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the updated image URL
    res.status(200).json({
      image: cloudinaryResult.secure_url,
    });
  } catch (error) {
    console.error("Error in file upload:", error);
    res.status(500).json({
      message: "Error uploading file",
      error: error.message,
    });
  }
};

export const removeProfileImage = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }
    if (user.image) {
      const publicId = user.public_id; // Get the last part of the URL, which is the public ID
      await cloudinary.v2.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Cloudinary Delete Error:", error);
          return res.status(500).send("Error deleting image from Cloudinary");
        }
        console.log("Cloudinary delete result:", result);
      });
    }
    user.image = null;
    user.public_id = null;
    await user.save();
    return res.status(200).send("Profile image removed successfully");
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).send("Internal server error");
  }
};

// export const removeProfileImage = async (req, res) => {
//   try {
//     const { userId } = req;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).send("user not found");
//     }
//     if (user.image) {
//       unlinkSync(user.image);
//     }
//     user.image = null;
//     await user.save();

//     return res.status(200).send("Profile image removed succesfully");
//   } catch (error) {
//     console.log({ error });
//     return res.status(500).send("Internal server error");
//   }
// };

// export const addProfileImage = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send("File is required");
//     }
//     const date = Date.now();
//     let fileName = "uploads/profiles/" + date + req.file.originalname;
//     renameSync(req.file.path, fileName);
//     const updateUser = await User.findByIdAndUpdate(
//       req.userId,
//       { image: fileName },
//       { new: true, runValidators: true }
//     );

//     return res.status(200).json({
//       image: updateUser.image,
//     });
//   } catch (error) {
//     console.log({ error });
//     return res.status(500).send("Internal server error");
//   }
// };

export const logout = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt", { secure: true, sameSite: "None", httpOnly: true });

    return res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
