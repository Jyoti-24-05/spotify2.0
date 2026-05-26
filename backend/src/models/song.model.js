import mongoose from "mongoose";

// const songSchema = new mongoose.Schema(
const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
    },
    imageUrl: String,
    audioUrl: String,
    // NEW FIELDS FOR YOUTUBE INTEGRATION
    youtubeVideoId: {
      type: String,
      unique: true,
      sparse: true, // Allow null for local songs
    },
    duration: {
      type: Number, // in seconds
    },
    youtubeDescription: String,
    youtubePublishedAt: Date,
    youtubeViewCount: Number,
    // END NEW FIELDS
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Song = mongoose.model("Song", songSchema);
// export const Song = mongoose.model("Song", songSchema);