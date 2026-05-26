import express from "express";
import { requireAuth } from "@clerk/express";
import { searchSongs, getVideoDetails } from "../controller/youtube.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Search songs by query
router.get("/search",requireAuth(),protectRoute, searchSongs);

// Get details for specific video IDs
router.get("/videos",requireAuth(),protectRoute, getVideoDetails);

export default router;