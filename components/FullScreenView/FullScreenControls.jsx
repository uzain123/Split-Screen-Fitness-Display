import { Button } from "../ui/button";

const FullscreenControls = ({
  showControls,
  isAllPlaying,
  isAllMuted,
  onPlayPause,
  onMuteUnmute
}) => {
  return (
    <div
      className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
        showControls ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center gap-4 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-600/50">
        <Button
          variant="secondary"
          size="lg"
          onClick={onPlayPause}
          className="h-12 w-12 p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200"
        >
          {isAllPlaying ? (
            <div className="w-4 h-4 bg-white rounded-sm" />
          ) : (
            <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1" />
          )}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={onMuteUnmute}
          className="h-12 w-12 p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200"
        >
          {isAllMuted ? (
            <div className="text-white text-lg">🔇</div>
          ) : (
            <div className="text-white text-lg">🔊</div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FullscreenControls;
