interface ShimmerProps {
  theme?: "light" | "dark";
}

const Shimmer: React.FC<ShimmerProps> = ({ theme = "light" }) => {
  return (
    <div className={`min-h-screen w-full flex items-center justify-center ${theme === "light" ? "bg-white" : "bg-gray-900"}`}>
      <div className="w-full max-w-4xl p-8 space-y-8">
        {/* Header Shimmer */}
        <div className="h-16 rounded-md animate-shimmer"></div>

        {/* Content Shimmer */}
        <div className="space-y-4">
          <div className="h-8 rounded-md animate-shimmer w-3/4"></div>
          <div className="h-4 rounded-md animate-shimmer w-full"></div>
          <div className="h-4 rounded-md animate-shimmer w-5/6"></div>
        </div>

        {/* Card Grid Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
              <div className="h-24 rounded-md animate-shimmer"></div>
              <div className="h-6 rounded-md animate-shimmer w-2/3"></div>
              <div className="h-4 rounded-md animate-shimmer w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shimmer;
