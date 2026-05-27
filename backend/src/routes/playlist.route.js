import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
} from "../controller/playlist.controller.js";

const router = Router();

router.get("/", protectRoute, getUserPlaylists);
router.get("/:id", protectRoute, getPlaylistById);
router.post("/", protectRoute, createPlaylist);
router.post("/:id/songs", protectRoute, addSongToPlaylist);
router.delete("/:id/songs/:songId", protectRoute, removeSongFromPlaylist);
router.delete("/:id", protectRoute, deletePlaylist);

export default router;