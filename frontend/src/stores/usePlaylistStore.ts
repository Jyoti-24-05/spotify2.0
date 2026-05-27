import { axiosInstance } from "@/lib/axios";
import type { Playlist } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface PlaylistStore {
	playlists: Playlist[];
	currentPlaylist: Playlist | null;
	isLoading: boolean;

	fetchPlaylists: () => Promise<void>;
	fetchPlaylistById: (id: string) => Promise<void>;
	createPlaylist: (name: string) => Promise<Playlist | null>;
	addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
	removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
	deletePlaylist: (id: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
	playlists: [],
	currentPlaylist: null,
	isLoading: false,

	fetchPlaylists: async () => {
		set({ isLoading: true });
		try {
			const res = await axiosInstance.get("/playlists");
			set({ playlists: res.data });
		} catch (e) {
			console.error(e);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchPlaylistById: async (id) => {
		set({ isLoading: true });
		try {
			const res = await axiosInstance.get(`/playlists/${id}`);
			set({ currentPlaylist: res.data });
		} catch (e) {
			console.error(e);
		} finally {
			set({ isLoading: false });
		}
	},

	createPlaylist: async (name) => {
		try {
			const res = await axiosInstance.post("/playlists", { name });
			set((state) => ({ playlists: [res.data, ...state.playlists] }));
			toast.success("Playlist created!");
			return res.data;
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Failed to create playlist");
			return null;
		}
	},

	addSongToPlaylist: async (playlistId, songId) => {
		try {
			const res = await axiosInstance.post(`/playlists/${playlistId}/songs`, { songId });
			set((state) => ({
				playlists: state.playlists.map((p) => (p._id === playlistId ? res.data : p)),
				currentPlaylist: state.currentPlaylist?._id === playlistId ? res.data : state.currentPlaylist,
			}));
			toast.success("Added to playlist!");
		} catch (e: any) {
			toast.error(e?.response?.data?.message || "Failed to add song");
		}
	},

	removeSongFromPlaylist: async (playlistId, songId) => {
		try {
			const res = await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
			set((state) => ({
				playlists: state.playlists.map((p) => (p._id === playlistId ? res.data : p)),
				currentPlaylist: state.currentPlaylist?._id === playlistId ? res.data : state.currentPlaylist,
			}));
			toast.success("Removed from playlist");
		} catch (e: any) {
			toast.error("Failed to remove song");
		}
	},

	deletePlaylist: async (id) => {
		try {
			await axiosInstance.delete(`/playlists/${id}`);
			set((state) => ({
				playlists: state.playlists.filter((p) => p._id !== id),
				currentPlaylist: state.currentPlaylist?._id === id ? null : state.currentPlaylist,
			}));
			toast.success("Playlist deleted");
		} catch (e) {
			toast.error("Failed to delete playlist");
		}
	},
}));