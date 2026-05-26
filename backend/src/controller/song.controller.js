import { Song } from "../models/song.model.js";

export const getAllSongs = async (req, res, next) => {
	try {
		// -1 = Descending => newest -> oldest
		// 1 = Ascending => oldest -> newest
		const songs = await Song.find().sort({ createdAt: -1 });
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getFeaturedSongs = async (req, res, next) => {
	try {
		// fetch 6 random songs using mongodb's aggregation pipeline
		const songs = await Song.aggregate([
			{
				$sample: { size: 6 },
			},
			{
				$project: {
					_id: 1,
					title: 1,
					artist: 1,
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getMadeForYouSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					title: 1,
					artist: 1,
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getTrendingSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					title: 1,
					artist: 1,
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const addYoutubeSong = async (req, res, next) => {
  try {
    const { 
      title, 
      artist, 
      imageUrl, 
      youtubeVideoId, 
      duration, 
      youtubeDescription, 
      youtubePublishedAt, 
      youtubeViewCount 
    } = req.body;

    // Check if it's already in the database
    let song = await Song.findOne({ youtubeVideoId });
    
    if (!song) {
      song = new Song({
        title,
        artist,
        imageUrl,
        audioUrl: "", // Empty because we play via YouTube ID
        youtubeVideoId,
        duration,
        youtubeDescription,
        youtubePublishedAt,
        youtubeViewCount,
      });
			await song.save();
    }

    res.status(201).json(song);
  } catch (error) {
    next(error);
  }
};