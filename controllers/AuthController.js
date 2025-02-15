import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync } from "fs";

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
      return res.status(400).json({message:"credientials missing"});
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
      return res.status(409).json({ message: "User already exists with this email" });
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
    console.log(error.message)
    return res.status(500).json({message: "something went wrong try again later"});
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with given email not found" });
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
      }
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
    if (!req.file) {
      return res.status(400).send("File is required");
    }
    const date = Date.now();
    let fileName = "uploads/profiles/" + date + req.file.originalname;
    renameSync(req.file.path, fileName);
    const updateUser = await User.findByIdAndUpdate(
      req.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      image: updateUser.image,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal server error");
  }
};

export const removeProfileImage = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("user not found");
    }
    if (user.image) {
      unlinkSync(user.image);
    }
    user.image = null;
    await user.save();

    return res.status(200).send("Profile image removed succesfully");
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal server error");
  }
};

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

