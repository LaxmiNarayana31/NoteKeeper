import { Router } from "express";
import {
  createAccount,
  loginUser,
  addNote,
  editNote,
  getAllNotes,
  deleteNote,
  pinNote,
  getAllUsers,
  searchNotes,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-account").post(createAccount);
router.route("/login").post(loginUser);
router.route("/add-note").post(authenticateToken, addNote);
router.route("/edit-note/:noteId").put(authenticateToken, editNote);
router.route("/all-notes").get(authenticateToken, getAllNotes);
router.route("/delete-note/:noteId").delete(authenticateToken, deleteNote);
router.route("/update-pin-note/:noteId").put(authenticateToken, pinNote);
router.route("/get-user").get(authenticateToken, getAllUsers);
router.route("/search-notes").get(authenticateToken, searchNotes);

export default router;
