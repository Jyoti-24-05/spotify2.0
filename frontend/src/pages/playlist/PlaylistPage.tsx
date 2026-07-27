//frontend/src/pages/playlist/PlaylistPage.tsx

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock, Play, Pause, Trash2, Music2, Shuffle,
  MoreVertical, ExternalLink
} from "lucide-react";
import type { Song } from "@/types";

// ── helpers ──────────────────────────────────────────────────────────────────

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const totalDuration = (songs: Song[]) => {
  const t = songs.reduce((a, s) => a + (s.duration || 0), 0);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  return h > 0 ? `${h} hr ${m} min` : `${m} min`;
};

// ── skeleton ─────────────────────────────────────────────────────────────────

function PlaylistSkeleton() {
  return (
    <div className="h-full animate-pulse">
      <div className="h-full rounded-md overflow-hidden">
        <div className="p-6 flex gap-6 pb-8">
          <div className="w-[200px] h-[200px] rounded bg-zinc-800 shrink-0" />
          <div className="flex flex-col justify-end gap-3 flex-1">
            <div className="h-3 w-16 bg-zinc-700 rounded" />
            <div className="h-10 w-64 bg-zinc-700 rounded" />
            <div className="h-3 w-24 bg-zinc-700 rounded" />
          </div>
        </div>
        <div className="px-6 space-y-2 mt-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-2">
              <div className="w-4 h-4 bg-zinc-800 rounded" />
              <div className="size-10 bg-zinc-800 rounded" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-40 bg-zinc-800 rounded" />
                <div className="h-2 w-24 bg-zinc-800 rounded" />
              </div>
              <div className="h-3 w-10 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── row context menu ──────────────────────────────────────────────────────────

function SongRowMenu({
  song,
  playlistId,
  onRemove,
}: {
  song: Song;
  playlistId: string;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Open row menu"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-zinc-600 text-zinc-400 hover:text-white transition-all"
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 py-1 min-w-[160px]">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-700"
          >
            <Trash2 className="size-3.5" />
            Remove from playlist
          </button>
          {song.source === "itunes" && song.audioUrl && (
            <a
              href={song.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
            >
              <ExternalLink className="size-3.5" />
              Open preview
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

const PlaylistPage = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { currentPlaylist, fetchPlaylistById, isLoading, removeSongFromPlaylist, deletePlaylist } =
    usePlaylistStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (playlistId) fetchPlaylistById(playlistId);
  }, [playlistId, fetchPlaylistById]);

  if (isLoading) return <PlaylistSkeleton />;
  if (!currentPlaylist)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-500">
        <Music2 className="size-12 opacity-40" />
        <p>Playlist not found</p>
      </div>
    );

  const songs: Song[] = currentPlaylist.songs;
  const isCurrentPlaylistPlaying =
    isPlaying && songs.some((s) => s._id === currentSong?._id);

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    if (isCurrentPlaylistPlaying) togglePlay();
    else playAlbum(songs, 0);
  };

  const handleShuffle = () => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playAlbum(shuffled, 0);
  };

  const handleDelete = async () => {
    await deletePlaylist(currentPlaylist._id);
    navigate("/");
  };

  return (
    <div className="h-full">
      <ScrollArea className="h-full rounded-md">
        <div className="relative min-h-full">
          {/* gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-900/60 via-zinc-900/80 to-zinc-900 pointer-events-none" />

          <div className="relative z-10">
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row p-6 gap-6 pb-6">
              {/* Cover art */}
              <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-lg shadow-2xl bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 mx-auto sm:mx-0">
                {currentPlaylist.imageUrl ? (
                  <img
                    src={currentPlaylist.imageUrl}
                    alt={currentPlaylist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music2 className="size-20 text-zinc-600" />
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-end gap-2 text-center sm:text-left">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                  Playlist
                </p>
                <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
                  {currentPlaylist.name}
                </h1>
                <p className="text-sm text-zinc-400">
                  {songs.length} song{songs.length !== 1 ? "s" : ""}
                  {songs.length > 0 && (
                    <span className="text-zinc-500"> · {totalDuration(songs)}</span>
                  )}
                </p>
              </div>
            </div>

            {/* ── Controls ───────────────────────────────────────────── */}
            <div className="px-6 pb-6 flex items-center gap-3 flex-wrap">
              {/* Play / Pause */}
              <button
                onClick={handlePlayAll}
                disabled={songs.length === 0}
                className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 shadow-lg shadow-green-900/30"
              >
                {isCurrentPlaylistPlaying ? (
                  <Pause className="size-6 text-black fill-black" />
                ) : (
                  <Play className="size-6 text-black fill-black ml-0.5" />
                )}
              </button>

              {/* Shuffle */}
              <button
                onClick={handleShuffle}
                disabled={songs.length === 0}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all disabled:opacity-40"
                title="Shuffle play"
              >
                <Shuffle className="size-5" />
              </button>

              {/* Delete */}
              {confirmDelete ? (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm text-zinc-400">Delete playlist?</span>
                  <button
                    onClick={handleDelete}
                    className="text-sm text-red-400 hover:text-red-300 font-medium"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm text-zinc-500 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="ml-2 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="size-4" />
                  Delete
                </button>
              )}
            </div>

            {/* ── Song list ──────────────────────────────────────────── */}
            <div className="bg-black/20 backdrop-blur-sm mx-2 rounded-xl mb-4">
              {songs.length === 0 ? (
                <div className="py-16 text-center">
                  <Music2 className="size-12 mx-auto mb-3 text-zinc-600" />
                  <p className="text-zinc-400 text-sm font-medium">No songs yet</p>
                  <p className="text-zinc-600 text-xs mt-1">
                    Search for songs above and add them here
                  </p>
                </div>
              ) : (
                <>
                  {/* header row */}
                  <div className="grid grid-cols-[24px_1fr_1fr_52px_36px] gap-3 px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                    <span>#</span>
                    <span>Title</span>
                    <span className="hidden sm:block">Artist</span>
                    <span className="flex justify-center"><Clock className="size-3.5" /></span>
                    <span />
                  </div>

                  {/* song rows */}
                  <div className="py-2">
                    {songs.map((song, index) => {
                      const isCurrent = currentSong?._id === song._id;
                      return (
                        <div
                          key={song._id}
                          onClick={() => playAlbum(songs, index)}
                          className={`grid grid-cols-[24px_1fr_1fr_52px_36px] gap-3 px-6 py-2.5 items-center group cursor-pointer rounded-lg mx-2 transition-colors
                            ${isCurrent ? "bg-white/10" : "hover:bg-white/5"}`}
                        >
                          {/* index / playing indicator */}
                          <div className="flex items-center justify-center text-sm">
                            {isCurrent && isPlaying ? (
                              <span className="text-green-400 text-base">♫</span>
                            ) : (
                              <>
                                <span className={`group-hover:hidden text-xs ${isCurrent ? "text-green-400" : "text-zinc-500"}`}>
                                  {index + 1}
                                </span>
                                <Play className="size-3.5 hidden group-hover:block text-white fill-white" />
                              </>
                            )}
                          </div>

                          {/* title + image */}
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={song.imageUrl}
                              alt={song.title}
                              className="size-10 rounded object-cover shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/40";
                              }}
                            />
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${isCurrent ? "text-green-400" : "text-white"}`}>
                                {song.title}
                              </p>
                              {/* artist shown on mobile (hidden in artist col on desktop) */}
                              <p className="text-xs text-zinc-400 truncate sm:hidden">
                                {song.artist}
                              </p>
                              {song.source === "itunes" && (
                                <span className="text-[10px] text-zinc-500 bg-zinc-700/70 px-1.5 py-0.5 rounded hidden sm:inline-block mt-0.5">
                                  iTunes preview
                                </span>
                              )}
                            </div>
                          </div>

                          {/* artist (desktop) */}
                          <p className="text-sm text-zinc-400 truncate hidden sm:block">
                            {song.artist}
                          </p>

                          {/* duration */}
                          <p className="text-sm text-zinc-500 text-center">
                            {fmt(song.duration)}
                          </p>

                          {/* menu */}
                          <div
                            className="flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SongRowMenu
                              song={song}
                              playlistId={currentPlaylist._id}
                              onRemove={() =>
                                removeSongFromPlaylist(currentPlaylist._id, song._id)
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlaylistPage;