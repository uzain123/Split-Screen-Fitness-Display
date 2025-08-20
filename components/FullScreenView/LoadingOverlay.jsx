import VideoLoadingCard from "./VideoLoadingCard";

const LoadingOverlay = ({ assignments, videosReady, videoErrors }) => {
  const readyCount = videosReady.filter(Boolean).length + videoErrors.filter(Boolean).length;
  const totalCount = assignments.filter(Boolean).length;
  const progressPercentage = (readyCount / totalCount) * 100;

  return (
    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 text-center py-8">
          <div className="text-white text-4xl mb-4 font-bold">🚀 Preparing Your Videos</div>
          <div className="text-gray-300 text-xl">Each video is loading independently...</div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div
            className="grid gap-6 max-w-7xl mx-auto"
            style={{
              gridTemplateColumns: `repeat(${Math.min(3, assignments.length)}, 1fr)`,
              gridAutoRows: "min-content"
            }}
          >
            {assignments.map(
              (assignment, index) =>
                assignment && (
                  <VideoLoadingCard
                    key={index}
                    assignment={assignment}
                    index={index}
                    isLoaded={videosReady[index]}
                    hasError={videoErrors[index]}
                  />
                )
            )}
          </div>
        </div>

        <div className="flex-shrink-0 bg-gray-900/80 border-t border-gray-700 px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white text-lg font-semibold">Overall Progress</span>
              <span className="text-gray-300">
                {readyCount} of {totalCount} ready
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
