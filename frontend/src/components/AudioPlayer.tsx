// src/components/AudioPlayer.tsx
import { useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { usePlayerStore } from "@/stores/usePlayerStore";


export const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentSong, isPlaying, playNext } = usePlayerStore();

  useEffect(() => {
    if (!currentSong) return;

    if (currentSong.audioUrl && audioRef.current) {
      if (isPlaying) audioRef.current.play();
      else audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  if (!currentSong) return null;

  return (
    <>
      {/* CASE 1: Local MP3 File */}
      {currentSong.audioUrl && (
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          onEnded={() => {/* Logic for next song */}}
        />
      )}

      {/* CASE 2: YouTube Song (Hidden) */}
      {currentSong.youtubeVideoId && (
        <div className="hidden">
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${currentSong.youtubeVideoId}`}
            playing={isPlaying}
            volume={0.5}
            width="0px"
            height="0px"
            onEnded={playNext} 
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1, 
                  controls: 0,
                  modestbranding: 1,
                },
              },
            }}
          />
        </div>
      )}
    </>
  );
};


