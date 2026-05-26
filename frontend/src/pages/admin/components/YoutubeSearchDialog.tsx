import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { axiosInstance } from "@/lib/axios";
import { Loader, Search } from "lucide-react";
import type { Song } from "@/types";

interface YoutubeSearchDialogProps {
  onSongSelect: (song: Omit<Song, "_id" | "createdAt" | "updatedAt">) => void;
}

export const YoutubeSearchDialog = ({ onSongSelect }: YoutubeSearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get("/youtube/search", {
        params: { q: query, maxResults: 20 },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Failed to search YouTube");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSong = (result: any) => {
    onSongSelect({
      title: result.title,
      artist: result.artist,
      imageUrl: result.imageUrl,
      audioUrl: "", // No direct audio from YouTube for now
      albumId: null,
      duration: result.duration,
      youtubeVideoId: result.youtubeVideoId,
      youtubeDescription: result.description,
      youtubePublishedAt: result.publishedAt,
      youtubeViewCount: result.viewCount,
    });
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          Search YouTube Music
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search YouTube Music</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search (e.g., Adele Hello)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((song) => (
                <div
                  key={song.youtubeVideoId}
                  className="p-3 border rounded-lg flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {song.imageUrl && (
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{song.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {song.artist}
                      </p>
                      <p className="text-xs text-gray-500">
                        Duration: {Math.floor(song.duration / 60)}:
                        {String(song.duration % 60).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelectSong(song)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
          {!loading && results.length === 0 && query && (
            <p className="text-sm text-gray-500">No results found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};