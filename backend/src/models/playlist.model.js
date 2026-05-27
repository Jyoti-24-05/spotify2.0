import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true }, // clerkId
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);