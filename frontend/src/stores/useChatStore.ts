import { axiosInstance } from "@/lib/axios";
import type { Message, User } from "@/types";
import { create } from "zustand";
import { io } from "socket.io-client";

interface ChatStore {
	users: User[];
	isLoading: boolean;
	error: string | null;
	socket: any;
	isConnected: boolean;
	onlineUsers: Set<string>;
	userActivities: Map<string, string>;
	messages: Message[];
	readMessageIds: Set<string>;
	selectedUser: User | null;

	fetchUsers: () => Promise<void>;
	initSocket: (userId: string) => void;
	disconnectSocket: () => void;
	sendMessage: (receiverId: string, senderId: string, content: string) => void;
	fetchMessages: (userId: string) => Promise<void>;
	setSelectedUser: (user: User | null) => void;
	markMessagesReadForUser: (userId: string) => void;
}

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

const socket = io(baseURL, {
	autoConnect: false, // only connect if user is authenticated
	withCredentials: true,
});

export const useChatStore = create<ChatStore>((set, get) => ({
	users: [],
	isLoading: false,
	error: null,
	socket: socket,
	isConnected: false,
	onlineUsers: new Set(),
	userActivities: new Map(),
	messages: [],
	readMessageIds: new Set(JSON.parse(localStorage.getItem("chat.readMessageIds") || "[]")),
	selectedUser: null,

	setSelectedUser: (user) => set({ selectedUser: user }),

	markMessagesReadForUser: (userId: string) => {
		const msgs = get().messages;
		const readIds = new Set(get().readMessageIds);
		for (const m of msgs) {
			if (m.receiverId === userId) readIds.add(m._id);
		}
		const arr = Array.from(readIds);
		try {
			localStorage.setItem("chat.readMessageIds", JSON.stringify(arr));
		} catch (e) {}
		set({ readMessageIds: readIds });
	},

	fetchUsers: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/users");
			set({ users: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	initSocket: (userId) => {
		if (!get().isConnected) {
			socket.auth = { userId };
			socket.connect();

			socket.emit("user_connected", userId);

			socket.on("users_online", (users: string[]) => {
				set({ onlineUsers: new Set(users) });
			});

			socket.on("activities", (activities: [string, string][]) => {
				set({ userActivities: new Map(activities) });
			});

			socket.on("user_connected", (userId: string) => {
				set((state) => ({
					onlineUsers: new Set([...state.onlineUsers, userId]),
				}));
			});

			socket.on("user_disconnected", (userId: string) => {
				set((state) => {
					const newOnlineUsers = new Set(state.onlineUsers);
					newOnlineUsers.delete(userId);
					return { onlineUsers: newOnlineUsers };
				});
			});

			const pushUniqueMessage = (message: Message) => {
				set((state) => {
					const existingIds = new Set(state.messages.map((m) => m._id));
					if (existingIds.has(message._id)) return {};
					return { messages: [...state.messages, message] };
				});
			};

			socket.on("receive_message", (message: Message) => {
				pushUniqueMessage(message);
			});

			socket.on("message_sent", (message: Message) => {
				pushUniqueMessage(message);
			});

			socket.on("activity_updated", ({ userId, activity }) => {
				set((state) => {
					const newActivities = new Map(state.userActivities);
					newActivities.set(userId, activity);
					return { userActivities: newActivities };
				});
			});

			set({ isConnected: true });
		}
	},

	disconnectSocket: () => {
		if (get().isConnected) {
			socket.disconnect();
			set({ isConnected: false });
		}
	},

	sendMessage: async (receiverId, senderId, content) => {
		const socket = get().socket;
		if (!socket) return;

		socket.emit("send_message", { receiverId, senderId, content });
	},

	fetchMessages: async (userId: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/messages/${userId}`);
			// dedupe server response and existing messages
			const existing = get().messages.reduce((map, m) => (map.set(m._id, m), map), new Map<string, Message>());
			for (const m of response.data as Message[]) existing.set(m._id, m);
			set({ messages: Array.from(existing.values()) });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},
}));