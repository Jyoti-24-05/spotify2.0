import { Song } from "../models/song.model.js";

export const getAllSongs = async (req, res, next) => {
	try {
		const songs = await Song.find().sort({ createdAt: -1 });
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getFeaturedSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{ $sample: { size: 6 } },
			{ $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1 } },
		]);
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getMadeForYouSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{ $sample: { size: 4 } },
			{ $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1 } },
		]);
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getTrendingSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{ $sample: { size: 4 } },
			{ $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1 } },
		]);
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const searchSongs = async (req, res, next) => {
	try {
		const { q } = req.query;
		if (!q || q.trim() === "") return res.json([]);

		const songs = await Song.find({
			$or: [
				{ title: { $regex: q, $options: "i" } },
				{ artist: { $regex: q, $options: "i" } },
			],
		}).limit(20);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

// Search iTunes API (free, no key needed) — proxied here to avoid CORS
export const externalSearchSongs = async (req, res, next) => {
	try {
		const { q } = req.query;
		if (!q || q.trim() === "") return res.json([]);

		const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=25&country=IN`;
		const response = await fetch(url);

		if (!response.ok) {
			return res.status(502).json({ message: "iTunes API unavailable" });
		}

		const data = await response.json();

		const songs = (data.results || [])
			.filter((track) => track.previewUrl) // only include tracks with playable preview
			.map((track) => ({
				_id: `itunes_${track.trackId}`,
				itunesId: String(track.trackId),
				title: track.trackName || "Unknown Title",
				artist: track.artistName || "Unknown Artist",
				imageUrl: (track.artworkUrl100 || "").replace("100x100bb", "300x300bb"),
				audioUrl: track.previewUrl,
				duration: Math.round((track.trackTimeMillis || 30000) / 1000),
				albumId: null,
				albumName: track.collectionName || "",
				source: "itunes",
			}));

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

// Save an iTunes song to MongoDB so it can be added to playlists
export const saveExternalSong = async (req, res, next) => {
	try {
		const { itunesId, title, artist, imageUrl, audioUrl, duration, albumName } = req.body;

		// Validate required fields
		if (!itunesId) return res.status(400).json({ message: "itunesId is required" });
		if (!title)    return res.status(400).json({ message: "title is required" });
		if (!artist)   return res.status(400).json({ message: "artist is required" });
		if (!audioUrl) return res.status(400).json({ message: "audioUrl is required" });

		// Return existing record if already saved (idempotent)
		let song = await Song.findOne({ itunesId: String(itunesId) });

		if (!song) {
			song = new Song({
				title:     String(title),
				artist:    String(artist),
				imageUrl:  imageUrl  || "https://via.placeholder.com/300",
				audioUrl:  String(audioUrl),
				duration:  Number(duration) || 30,
				albumName: albumName || "",
				itunesId:  String(itunesId),
			});
			await song.save();
		}

		res.json(song);
	} catch (error) {
		console.error("[save-external] error:", error.message, error.code);
		// Duplicate key on itunesId — another request already saved it, just return it
		if (error.code === 11000) {
			const existing = await Song.findOne({ itunesId: String(req.body.itunesId) });
			if (existing) return res.json(existing);
		}
		next(error);
	}
};