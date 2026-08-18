export default function UploadProgress({
  loading = false,
  progress = 0,
  message = "Uploading..."
}) {
  if (!loading) return null;

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-blue-700">
          {message}
        </span>

        <span className="text-sm font-semibold text-blue-700">
          {progress}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 bg-blue-600 transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}