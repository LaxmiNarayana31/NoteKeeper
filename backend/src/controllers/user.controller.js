import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Note from "../models/note.model.js";
import { generateAccessToken } from "../utils/tokenUtils.js";

// Create account
const createAccount = asyncHandler(async (req, resp) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "Full name is required"));
  }
  if (!email) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "Email is required"));
  }
  if (!password) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "Password is required"));
  }

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "User already exists"));
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
  });

  await user.save();

  // Generate access token using the utility function
  const accessToken = generateAccessToken(user);

  return resp
    .status(201)
    .json(
      new ApiResponse(201, { user, accessToken }, "Registration successful")
    );
});

// Login user
const loginUser = asyncHandler(async (req, resp) => {
  const { email, password } = req.body;

  if (!email) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "Email is required"));
  }
  if (!password) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "Password is required"));
  }

  const userInfo = await User.findOne({ email: email });
  if (!userInfo) {
    return resp.status(400).json(new ApiResponse(400, null, "User not found"));
  }

  const isPasswordValid = await bcrypt.compare(password, userInfo.password);
  if (isPasswordValid) {
    const accessToken = generateAccessToken(userInfo);

    return resp
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: userInfo, accessToken },
          "Login successful"
        )
      );
  } else {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "Invalid credentials"));
  }
});

// Get all users
const getAllUsers = asyncHandler(async (req, resp) => {
  const userId = req.user?.userId;
  if (!userId) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "User ID not found in request"));
  }

  const isUser = await User.findById(userId);
  if (!isUser) {
    return resp.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  try {
    const users = await User.find();
    const formattedUsers = users.map((user) => ({
      fullName: user.fullName,
      userId: user._id,
      email: user.email,
      createdOn: user.createdOn,
    }));

    return resp
      .status(200)
      .json(
        new ApiResponse(200, formattedUsers, "All users fetched successfully")
      );
  } catch (error) {
    console.error("Error fetching all users:", error);
    return resp
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// Add note
const addNote = asyncHandler(async (req, resp) => {
  const { title, content, tags } = req.body;
  const userId = req.user.userId;

  if (!title) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "Title is required"));
  }

  if (!content) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "Content is required"));
  }

  try {
    const note = await Note.create({
      title,
      content,
      tags: tags || [],
      userId,
    });

    return resp
      .status(201)
      .json(new ApiResponse(201, note, "Note added successfully"));
  } catch (error) {
    console.error("Error adding note:", error);

    return resp
      .status(500)
      .json(new ApiResponse(500, null, error.message || "Failed to add note"));
  }
});

// Edit note
const editNote = asyncHandler(async (req, resp) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const userId = req.user.userId;

  if (!title && !content && !tags) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "At least one field is required"));
  }

  try {
    // Find the note by ID and user ID
    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return resp
        .status(404)
        .json(new ApiResponse(404, null, "Note not found"));
    }

    // Update fields only if they are provided in the request
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();

    return resp
      .status(200)
      .json(new ApiResponse(200, note, "Note updated successfully"));
  } catch (error) {
    console.error("Error updating note:", error);
    return resp
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// Get all notes
const getAllNotes = asyncHandler(async (req, resp) => {
  const { userId } = req.user;

  if (!userId) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "User ID not found in request"));
  }

  try {
    const notes = await Note.find({ userId }).sort({ isPinned: -1 });

    if (notes.length === 0) {
      console.log("No notes found for userId:", userId);
      return resp
        .status(404)
        .json(new ApiResponse(404, null, "No notes found"));
    }

    return resp
      .status(200)
      .json(new ApiResponse(200, notes, "All notes fetched successfully"));
  } catch (error) {
    console.error("Error fetching notes:", error);
    return resp
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// Delete note
const deleteNote = asyncHandler(async (req, resp) => {
  const noteId = req.params.noteId;
  const userId = req.user.userId;

  try {
    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return resp
        .status(404)
        .json(new ApiResponse(404, null, "Note not found"));
    }

    await Note.deleteOne({ _id: noteId, userId });

    return resp
      .status(200)
      .json(new ApiResponse(200, null, "Note deleted successfully"));
  } catch (error) {
    console.error("Error deleting note:", error);
    return resp
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// Update isPinned Value
const pinNote = asyncHandler(async (req, resp) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  if (!isPinned) {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "isPinned is required"));
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return resp
        .status(404)
        .json(new ApiResponse(404, null, "Note not found"));
    }

    note.isPinned = isPinned;

    await note.save();

    return resp
      .status(200)
      .json(new ApiResponse(200, note, "Note updated successfully"));
  } catch (error) {
    return resp
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// Search notes
const searchNotes = asyncHandler(async (req, resp) => {
  const userId = req.user.userId;
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return resp
      .status(400)
      .json(new ApiResponse(400, null, "Search query is required"));
  }

  try {
    const notes = await Note.find({
      userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    });

    if (notes.length === 0) {
      return resp
        .status(404)
        .json(new ApiResponse(404, null, "No notes found matching the query"));
    }

    return resp
      .status(200)
      .json(new ApiResponse(200, notes, "Notes retrieved successfully"));
  } catch (error) {
    console.error("Error searching notes:", error);
    return resp
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

export {
  createAccount,
  loginUser,
  addNote,
  editNote,
  getAllNotes,
  deleteNote,
  pinNote,
  getAllUsers,
  searchNotes,
};
