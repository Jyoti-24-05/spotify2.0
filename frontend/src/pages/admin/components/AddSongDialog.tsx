import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Upload, Music } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { YoutubeSearchDialog } from "./YoutubeSearchDialog";

interface NewSong {
  title: string;
  artist: string;
  album: string;
  duration: string;
  youtubeVideoId?: string;
  youtubeDescription?: string;
  youtubePublishedAt?: string;
  youtubeViewCount?: number;
}

interface FileData {
  audio: File | null;
  image: File | null;
}

const AddSongDialog = () => {
  const { albums } = useMusicStore();
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isYoutubeMode, setIsYoutubeMode] = useState(false);

  const [newSong, setNewSong] = useState<NewSong>({
    title: "",
    artist: "",
    album: "none",
    duration: "0",
  });

  const [files, setFiles] = useState<FileData>({
    audio: null,
    image: null,
  });

  const [youtubeImageUrl, setYoutubeImageUrl] = useState<string>("");

  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Handle YouTube song selection
  const handleYoutubeSongSelect = (youtubeSong: any) => {
    setIsYoutubeMode(true);
    setNewSong({
      title: youtubeSong.title,
      artist: youtubeSong.artist,
      album: "none",
      duration: String(youtubeSong.duration),
      youtubeVideoId: youtubeSong.youtubeVideoId,
      youtubeDescription: youtubeSong.description,
      youtubePublishedAt: youtubeSong.publishedAt,
      youtubeViewCount: youtubeSong.viewCount,
    });
    setYoutubeImageUrl(youtubeSong.imageUrl);
    // Clear file inputs
    setFiles({ audio: null, image: null });
    toast.success("YouTube song details loaded!");
  };

  // Reset to local upload mode
  const handleResetToLocalMode = () => {
    setIsYoutubeMode(false);
    setNewSong({
      title: "",
      artist: "",
      album: "none",
      duration: "0",
    });
    setYoutubeImageUrl("");
    setFiles({ audio: null, image: null });
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!newSong.title.trim()) {
      toast.error("Please enter song title");
      return false;
    }
    if (!newSong.artist.trim()) {
      toast.error("Please enter artist name");
      return false;
    }
    if (!newSong.duration || parseInt(newSong.duration) <= 0) {
      toast.error("Please enter valid duration");
      return false;
    }
    if (!isYoutubeMode) {
      // Local mode requires files
      if (!files.audio) {
        toast.error("Please upload audio file");
        return false;
      }
      if (!files.image) {
        toast.error("Please upload image file");
        return false;
      }
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", newSong.title);
      formData.append("artist", newSong.artist);
      formData.append("duration", newSong.duration);

      if (newSong.album && newSong.album !== "none") {
        formData.append("albumId", newSong.album);
      }

      // YouTube fields
      if (isYoutubeMode && newSong.youtubeVideoId) {
        formData.append("youtubeVideoId", newSong.youtubeVideoId);
        if (newSong.youtubeDescription) {
          formData.append("youtubeDescription", newSong.youtubeDescription);
        }
        if (newSong.youtubePublishedAt) {
          formData.append("youtubePublishedAt", newSong.youtubePublishedAt);
        }
        if (newSong.youtubeViewCount) {
          formData.append("youtubeViewCount", String(newSong.youtubeViewCount));
        }
        // For YouTube songs, use the YouTube image URL (backend can download it)
        formData.append("imageUrl", youtubeImageUrl);
      } else {
        // Local upload mode - require files
        if (files.audio) formData.append("audioFile", files.audio);
        if (files.image) formData.append("imageFile", files.image);
      }

      if (isYoutubeMode) {
        // YouTube songs: send as JSON
        const youtubeData = {
          title: newSong.title,
          artist: newSong.artist,
          imageUrl: youtubeImageUrl,
          youtubeVideoId: newSong.youtubeVideoId,
          duration: parseInt(newSong.duration),
          youtubeDescription: newSong.youtubeDescription,
          youtubePublishedAt: newSong.youtubePublishedAt,
          youtubeViewCount: newSong.youtubeViewCount,
        };
        await axiosInstance.post("/admin/songs/youtube", youtubeData);
      } else {
        // Local songs: send as multipart form data
        await axiosInstance.post("/admin/songs", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Reset form
      setNewSong({
        title: "",
        artist: "",
        album: "none",
        duration: "0",
      });
      setFiles({ audio: null, image: null });
      setYoutubeImageUrl("");
      setIsYoutubeMode(false);
      setSongDialogOpen(false);

      toast.success("Song added successfully");
    } catch (error: any) {
      console.error("Error adding song:", error);
      toast.error(
        "Failed to add song: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-black">
          <Plus className="mr-2 h-4 w-4" />
          Add Song
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-zinc-900 border-zinc-700 max-h-[85vh] overflow-auto lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Song</DialogTitle>
          <DialogDescription>
            Add a song from YouTube Music or upload locally
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* YouTube Search Section */}
          <div className="border border-dashed border-emerald-500 rounded-lg p-4 bg-emerald-500/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-emerald-500" />
                <h3 className="font-semibold text-sm">YouTube Music</h3>
              </div>
              {isYoutubeMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={handleResetToLocalMode}
                >
                  Switch to Local Upload
                </Button>
              )}
            </div>
            <YoutubeSearchDialog onSongSelect={handleYoutubeSongSelect} />
          </div>

          {/* YouTube Song Preview */}
          {isYoutubeMode && youtubeImageUrl && (
            <div className="border border-emerald-500/30 rounded-lg p-3 bg-zinc-800/50">
              <div className="flex gap-3">
                <img
                  src={youtubeImageUrl}
                  alt={newSong.title}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{newSong.title}</p>
                  <p className="text-xs text-zinc-400">{newSong.artist}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    YouTube • {newSong.youtubeViewCount?.toLocaleString()} views
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Local Upload Section */}
          {!isYoutubeMode && (
            <>
              <div className="border-t border-zinc-700 pt-4">
                <h3 className="font-semibold text-sm mb-3">Local Upload</h3>

                {/* Image upload area */}
                <div
                  className="flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Input
                    type="file"
                    ref={imageInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      setFiles((prev) => ({
                        ...prev,
                        image: e.target.files?.[0] || null,
                      }))
                    }
                  />
                  <div className="text-center">
                    {files.image ? (
                      <div className="space-y-2">
                        <div className="text-sm text-emerald-500">
                          Image selected:
                        </div>
                        <div className="text-xs text-zinc-400">
                          {files.image.name.slice(0, 25)}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-zinc-800 rounded-full inline-block mb-2">
                          <Upload className="h-6 w-6 text-zinc-400" />
                        </div>
                        <div className="text-sm text-zinc-400 mb-2">
                          Upload artwork
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Choose File
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Audio upload */}
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">Audio File</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      ref={audioInputRef}
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) =>
                        setFiles((prev) => ({
                          ...prev,
                          audio: e.target.files?.[0] || null,
                        }))
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() => audioInputRef.current?.click()}
                      className="w-full "
                    >
                      {files.audio
                        ? files.audio.name.slice(0, 25)
                        : "Choose Audio File"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-zinc-700 pt-4 space-y-4">
            <h3 className="font-semibold text-sm">Song Details</h3>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newSong.title}
                onChange={(e) =>
                  setNewSong({ ...newSong, title: e.target.value })
                }
                placeholder="Song title"
                className="bg-zinc-800 border-zinc-700"
                disabled={isYoutubeMode}
              />
            </div>

            {/* Artist */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Artist</label>
              <Input
                value={newSong.artist}
                onChange={(e) =>
                  setNewSong({ ...newSong, artist: e.target.value })
                }
                placeholder="Artist name"
                className="bg-zinc-800 border-zinc-700"
                disabled={isYoutubeMode}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (seconds)</label>
              <Input
                type="number"
                min="0"
                value={newSong.duration}
                onChange={(e) =>
                  setNewSong({
                    ...newSong,
                    duration: e.target.value || "0",
                  })
                }
                placeholder="0"
                className="bg-zinc-800 border-zinc-700"
                disabled={isYoutubeMode}
              />
            </div>

            {/* Album */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Album (Optional)</label>
              <Select
                value={newSong.album}
                onValueChange={(value) =>
                  setNewSong({ ...newSong, album: value })
                }
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Select album" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="none">No Album (Single)</SelectItem>
                  {albums.map((album) => (
                    <SelectItem key={album._id} value={album._id}>
                      {album.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* YouTube Info Display */}
            {isYoutubeMode && newSong.youtubeVideoId && (
              <div className="bg-zinc-800/50 border border-zinc-700 rounded p-3 text-xs space-y-1">
                <p className="text-zinc-400">
                  <span className="font-semibold">Video ID:</span>{" "}
                  {newSong.youtubeVideoId}
                </p>
                {newSong.youtubePublishedAt && (
                  <p className="text-zinc-400">
                    <span className="font-semibold">Published:</span>{" "}
                    {new Date(newSong.youtubePublishedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setSongDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? isYoutubeMode
                ? "Adding from YouTube..."
                : "Uploading..."
              : "Add Song"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSongDialog;