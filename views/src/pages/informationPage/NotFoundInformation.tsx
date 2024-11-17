import { Link } from "react-router-dom";

const NotFoundInformation = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Content Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The content you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundInformation;
