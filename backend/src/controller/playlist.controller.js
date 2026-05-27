import { Playlist } from "../models/playlist.model.js";
import { Song } from "../models/song.model.js";

// Get all playlists for the current user
export const getUserPlaylists = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const playlists = await Playlist.find({ userId }).populate("songs").sort({ createdAt: -1 });
    res.json(playlists);
  } catch (error) {
    next(error);
  }
};

// Get a single playlist by id
export const getPlaylistById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findById(id).populate("songs");
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

// Create a new playlist
export const createPlaylist = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Playlist name is required" });

    const playlist = new Playlist({ name, userId, songs: [] });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

// Add a song to a playlist
export const addSongToPlaylist = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const { songId } = req.body;

    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    // prevent duplicates — compare as strings since songId comes in as a string
    if (playlist.songs.some((s) => s.toString() === String(songId))) {
      return res.status(400).json({ message: "Song already in playlist" });
    }

    // use first song's image if playlist has no image
    if (!playlist.imageUrl && songId) {
      const song = await Song.findById(songId);
      if (song) playlist.imageUrl = song.imageUrl;
    }

    playlist.songs.push(songId);
    await playlist.save();

    const updated = await Playlist.findById(id).populate("songs");
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Remove a song from a playlist
export const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id, songId } = req.params;

    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    playlist.songs = playlist.songs.filter((s) => s.toString() !== songId);
    await playlist.save();

    const updated = await Playlist.findById(id).populate("songs");
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete a playlist
export const deletePlaylist = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const playlist = await Playlist.findOneAndDelete({ _id: id, userId });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    res.json({ message: "Playlist deleted" });
  } catch (error) {
    next(error);
  }
};