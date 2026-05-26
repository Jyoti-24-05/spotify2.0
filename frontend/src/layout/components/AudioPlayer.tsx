import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";
import ReactPlayer from "react-player";

const ReactPlayerAny = ReactPlayer as any;

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);

	const { currentSong, isPlaying, playNext } = usePlayerStore();


	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !currentSong) return;

		if (currentSong.youtubeVideoId) {
			audio.pause();
			audio.removeAttribute("src");
			audio.load();
			return;
		}

		if (!currentSong.audioUrl) {
			console.warn("Current song missing audioUrl:", currentSong);
			return;
		}

		audio.src = currentSong.audioUrl;
		audio.currentTime = 0;

		if (isPlaying) {
			audio.play().catch((err) => {
				console.warn("Unable to play audio:", err);
			});
		} else {
			audio.pause();
		}
	}, [currentSong, isPlaying]);

	// Handle song ends for local audio
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handleEnded = () => playNext();

		audio.addEventListener("ended", handleEnded);

		return () => audio.removeEventListener("ended", handleEnded);
	}, [playNext]);

	return (
		<>
			{currentSong?.audioUrl && !currentSong.youtubeVideoId && (
				<audio ref={audioRef} onEnded={playNext} />
			)}
			{currentSong?.youtubeVideoId && (
				<div className="hidden">
					<ReactPlayerAny
						url={`https://www.youtube.com/watch?v=${currentSong.youtubeVideoId}`}
						playing={isPlaying}
						onEnded={playNext}
						width="0"
						height="0"
						config={{
							youtube: {
								playerVars: {
									autoplay: 1,
									controls: 0,
									modestbranding: 1,
								},
							},
						} as any}
					/>
				</div>
			)}
		</>
	);
};

export default AudioPlayer;