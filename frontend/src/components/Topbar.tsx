import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Search, X, Music2, Globe, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { ListPlus, Play } from "lucide-react";
import type { Song } from "@/types";
import toast from "react-hot-toast";

// ── Add to Playlist dropdown ──────────────────────────────────────────────────
function AddToPlaylistMenu({
  song,
  onClose,
  onSaveExternal,
}: {
  song: Song;
  onClose: () => void;
  onSaveExternal?: () => Promise<Song | null>;
}) {
  const { playlists, fetchPlaylists, createPlaylist, addSongToPlaylist } = usePlaylistStore();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Returns a real MongoDB ObjectId string.
  // For iTunes songs: saves the song to MongoDB first, then returns its _id.
  // For local songs: returns the existing _id directly.
  const getMongoId = async (): Promise<string | null> => {
    const isItunes = song.source === "itunes" || song._id.startsWith("itunes_");

    if (isItunes) {
      if (!onSaveExternal) {
        toast.error("Cannot save this song — missing handler");
        return null;
      }
      setSaving(true);
      try {
        const saved = await onSaveExternal();
        if (!saved?._id) {
          toast.error("Failed to save song to library");
          return null;
        }
        return saved._id;
      } catch (err) {
        console.error("save-external failed:", err);
        toast.error("Failed to save song to library");
        return null;
      } finally {
        setSaving(false);
      }
    }

    return song._id;
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    const songId = await getMongoId();
    if (!songId) return;
    await addSongToPlaylist(playlistId, songId);
    onClose();
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const pl = await createPlaylist(newName.trim());
    if (pl) {
      const songId = await getMongoId();
      if (songId) await addSongToPlaylist(pl._id, songId);
      setNewName("");
      setCreating(false);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl z-[60] min-w-[200px]">
      <p className="px-3 py-2 text-xs text-zinc-400 font-semibold border-b border-zinc-700">
        Add to playlist {saving && <span className="text-green-400 ml-1">Saving…</span>}
      </p>
      <div className="max-h-48 overflow-y-auto">
        {playlists.length === 0 && (
          <p className="px-3 py-2 text-xs text-zinc-500">No playlists yet</p>
        )}
        {playlists.map((pl) => (
          <button
            key={pl._id}
            onClick={() => handleAddToPlaylist(pl._id)}
            className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 truncate"
          >
            {pl.name}
          </button>
        ))}
      </div>
      {creating ? (
        <div className="p-2 border-t border-zinc-700 flex gap-1">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Playlist name"
            className="flex-1 bg-zinc-700 text-white text-xs px-2 py-1 rounded outline-none"
          />
          <button onClick={handleCreate} className="text-green-400 text-xs px-2">
            ✓
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-zinc-700 border-t border-zinc-700"
        >
          + New playlist
        </button>
      )}
    </div>
  );
}

// ── Song row in search results ────────────────────────────────────────────────
function SongRow({
  song,
  onPlay,
  onSaveExternal,
}: {
  song: Song;
  onPlay: (song: Song) => void;
  onSaveExternal?: () => Promise<Song | null>;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div ref={rowRef} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-700 group">
      <img
        src={song.imageUrl}
        alt={song.title}
        className="size-10 rounded object-cover shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{song.title}</p>
        <p className="text-xs text-zinc-400 truncate">
          {song.artist}
          {song.albumName && (
            <span className="text-zinc-500"> · {song.albumName}</span>
          )}
        </p>
      </div>
      {song.duration > 0 && (
        <span className="text-xs text-zinc-500 hidden sm:block mr-1">
          {formatDuration(song.duration)}
        </span>
      )}
      {song.source === "itunes" && (
        <span className="text-[10px] text-zinc-500 bg-zinc-700 px-1.5 py-0.5 rounded hidden sm:block mr-1">
          30s
        </span>
      )}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
        <button
          onClick={() => onPlay(song)}
          className="p-1.5 rounded-full bg-green-500 hover:bg-green-400 text-black"
          title="Play"
        >
          <Play className="size-3 fill-current" />
        </button>
        <SignedIn>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((v) => !v);
            }}
            className="p-1.5 rounded-full bg-zinc-600 hover:bg-zinc-500 text-white"
            title="Add to playlist"
          >
            <ListPlus className="size-3" />
          </button>
          {showMenu && (
            <AddToPlaylistMenu
              song={song}
              onClose={() => setShowMenu(false)}
              onSaveExternal={onSaveExternal}
            />
          )}
        </SignedIn>
      </div>
    </div>
  );
}

// ── Main Topbar ───────────────────────────────────────────────────────────────
export default function Topbar() {
  const { isAdmin } = useAuthStore();
  const {
    searchResults,
    searchQuery,
    isSearching,
    externalResults,
    isExternalSearching,
    searchSongs,
    searchExternal,
    saveExternalSong,
    setSearchQuery,
    clearSearch,
  } = useMusicStore();
  const { playAlbum } = usePlayerStore();

  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "itunes">("library");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search — fires both local + external
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setShowResults(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchSongs(q);
      searchExternal(q);
    }, 400);
  };

  const handleClear = () => {
    clearSearch();
    setShowResults(false);
    inputRef.current?.focus();
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePlayLocal = (song: Song) => {
    const results = searchResults;
    playAlbum(results, results.indexOf(song));
    setShowResults(false);
  };

  const handlePlayExternal = (song: Song) => {
    // Play iTunes preview directly — inject it into the queue
    playAlbum([song], 0);
    setShowResults(false);
    toast("▶ Playing 30-second iTunes preview", { icon: "🎵", duration: 2500 });
  };

  const getSaveExternalFn = (song: Song) => async (): Promise<Song | null> => {
    return saveExternalSong(song);
  };

  const isLoading = activeTab === "library" ? isSearching : isExternalSearching;
  const results = activeTab === "library" ? searchResults : externalResults;

  return (
    <div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10 gap-4">
      {/* Logo */}
      <div className="flex gap-2 items-center shrink-0">
        <img src="/spotify.png" className="size-8" alt="Spotify logo" />
        <span className="hidden sm:inline font-semibold">Spotify</span>
      </div>

      {/* Search bar */}
      <SignedIn>
        <div ref={searchRef} className="relative flex-1 max-w-md">
          {/* Input */}
          <div className="flex items-center bg-zinc-800 rounded-full px-3 py-1.5 gap-2">
            <Search className="size-4 text-zinc-400 shrink-0" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowResults(true)}
              placeholder="Search songs or artists…"
              className="bg-transparent outline-none text-sm text-white placeholder-zinc-500 flex-1 min-w-0"
            />
            {searchQuery && (
              <button type="button" onClick={handleClear} title="Clear search">
                <X className="size-4 text-zinc-400 hover:text-white" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showResults && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden z-50">
              {/* Tabs */}
              <div className="flex border-b border-zinc-700">
                <button
                  onClick={() => setActiveTab("library")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
                    activeTab === "library"
                      ? "text-white border-b-2 border-green-500 bg-zinc-700/50"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Music2 className="size-3" />
                  Your Library
                  {searchResults.length > 0 && (
                    <span className="bg-zinc-600 text-zinc-200 rounded-full text-[10px] px-1.5 py-0.5">
                      {searchResults.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("itunes")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
                    activeTab === "itunes"
                      ? "text-white border-b-2 border-green-500 bg-zinc-700/50"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Globe className="size-3" />
                  iTunes
                  {externalResults.length > 0 && (
                    <span className="bg-zinc-600 text-zinc-200 rounded-full text-[10px] px-1.5 py-0.5">
                      {externalResults.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {isLoading && (
                  <div className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-400">
                    <div className="size-3 border-2 border-zinc-500 border-t-green-500 rounded-full animate-spin" />
                    Searching…
                  </div>
                )}

                {!isLoading && results.length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-zinc-400">
                      {activeTab === "library"
                        ? `No songs found in your library for "${searchQuery}"`
                        : `No iTunes results for "${searchQuery}"`}
                    </p>
                    {activeTab === "library" && (
                      <button
                        onClick={() => setActiveTab("itunes")}
                        className="mt-2 text-xs text-green-400 hover:text-green-300 underline"
                      >
                        Try searching iTunes →
                      </button>
                    )}
                  </div>
                )}

                {!isLoading &&
                  results.map((song) =>
                    activeTab === "library" ? (
                      <SongRow
                        key={song._id}
                        song={song}
                        onPlay={handlePlayLocal}
                      />
                    ) : (
                      <SongRow
                        key={song._id}
                        song={song}
                        onPlay={handlePlayExternal}
                        onSaveExternal={getSaveExternalFn(song)}
                      />
                    )
                  )}
              </div>

              {/* Footer hint for iTunes tab */}
              {activeTab === "itunes" && externalResults.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-2 border-t border-zinc-700 bg-zinc-800/50">
                  <Clock className="size-3 text-zinc-500" />
                  <p className="text-[11px] text-zinc-500">
                    iTunes previews are 30 seconds. Add to playlist to save the song.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </SignedIn>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">
        {isAdmin && (
          <Link to="/admin" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            <LayoutDashboardIcon className="size-4 mr-2" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}
        <SignedOut>
          <SignInOAuthButtons />
        </SignedOut>
        <UserButton />
      </div>
    </div>
  );
}