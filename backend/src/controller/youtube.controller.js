import axios from "axios";

const YT_API_KEY = process.env.YT_API_KEY;
const YT_BASE_URL = "https://www.googleapis.com/youtube/v3";

// Helper: convert ISO 8601 duration to seconds
// PT3M45S → 225 seconds
const parseDuration = (iso8601) => {
  if (!iso8601) return 0;
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
};

// Search for songs/music on YouTube
// Query: artist name + song title (e.g., "adele hello")
export const searchSongs = async (req, res) => {
  try {
    const { q, maxResults = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    // Step 1: Search for videos
    const searchResponse = await axios.get(`${YT_BASE_URL}/search`, {
      params: {
        part: "snippet",
        type: "video",
        topicId: "/m/04rlf", // Music topic ID (filters for music content)
        q: q.trim(),
        maxResults: Math.min(maxResults, 50), // YouTube API max 50
        safeSearch: "moderate",
        key: YT_API_KEY,
      },
    });

    const videoIds = searchResponse.data.items
      .map((item) => item.id.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return res.json([]);
    }

    // Step 2: Get video details (contentDetails for duration, snippet for metadata)
    const videosResponse = await axios.get(`${YT_BASE_URL}/videos`, {
      params: {
        part: "contentDetails,snippet,statistics",
        id: videoIds.join(","),
        key: YT_API_KEY,
      },
    });

    // Step 3: Format response
    const songs = videosResponse.data.items.map((item) => ({
      youtubeVideoId: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      imageUrl:
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        "",
      duration: parseDuration(item.contentDetails.duration),
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount || 0,
      description: item.snippet.description || "",
    }));

    res.json(songs);
  } catch (error) {
    console.error("YouTube search error:", error.message);
    res.status(500).json({
      error: "Failed to search YouTube",
      message: error.message,
    });
  }
};

// Get details for specific videos
export const getVideoDetails = async (req, res) => {
  try {
    const { ids } = req.query; // comma-separated video IDs

    if (!ids) {
      return res.status(400).json({ error: "Parameter 'ids' is required" });
    }

    const response = await axios.get(`${YT_BASE_URL}/videos`, {
      params: {
        part: "contentDetails,snippet,statistics",
        id: ids,
        key: YT_API_KEY,
      },
    });

    const videos = response.data.items.map((item) => ({
      youtubeVideoId: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      imageUrl:
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        "",
      duration: parseDuration(item.contentDetails.duration),
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount || 0,
    }));

    res.json(videos);
  } catch (error) {
    console.error("YouTube video details error:", error.message);
    res.status(500).json({
      error: "Failed to fetch video details",
      message: error.message,
    });
  }
};