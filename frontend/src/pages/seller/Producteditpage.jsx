import { FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";

export const Producteditpage = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white p-10 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-xl w-full"
      >
        <FaExclamationTriangle className="text-red-500 text-7xl mb-6 animate-pulse" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
          Oops! Something Went Wrong
        </h1>
        <p className="text-gray-600 text-base md:text-lg mb-8">
          Please try again later, or contact our support team if the problem persists.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            Retry
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all"
          >
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};
