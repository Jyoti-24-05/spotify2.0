import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);

	const { currentSong, isPlaying, playNext } = usePlayerStore();

	// handle play/pause
	useEffect(() => {
		if (isPlaying) audioRef.current?.play().catch(() => {});
		else audioRef.current?.pause();
	}, [isPlaying]);

	// handle song ends → play next
	useEffect(() => {
		const audio = audioRef.current;
		const handleEnded = () => playNext();
		audio?.addEventListener("ended", handleEnded);
		return () => audio?.removeEventListener("ended", handleEnded);
	}, [playNext]);

	// handle song changes
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;
		const isSongChange = prevSongRef.current !== currentSong.audioUrl;

		if (isSongChange) {
			audio.src = currentSong.audioUrl;
			audio.currentTime = 0;
			prevSongRef.current = currentSong.audioUrl;

			if (isPlaying) {
				audio.play().catch((err) => {
					console.warn("Audio play error:", err);
				});
			}
		}
	}, [currentSong, isPlaying]);

	return <audio ref={audioRef} crossOrigin="anonymous" />;
};

export default AudioPlayer;