import React from 'react';
import {useNavigate } from 'react-router-dom'; // Make sure to import useHistory

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate(); // Use useHistory hook to navigate

  const handleGoHome = () => {
    navigate('/'); // Navigate to the home page
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-pink-500 text-white overflow-x-hidden">
      {/* Solar System Animation */}
      <div className="relative w-72 md:w-96 h-72 md:h-96 flex items-center justify-center scale-[0.75]">
        <div className="rounded-full bg-white w-28 h-28 flex items-center justify-center absolute">
          <div className="absolute -top-4 text-white text-sm flex flex-col items-center">Sun</div>
          <div className="rounded-full bg-white w-20 h-20 animate-ping"></div>
        </div>

        <div className="rounded-full border border-white/50 w-36 h-36 flex items-center justify-center absolute animate-spin" style={{ animationDuration: '2.5s' }}>
          <div className="absolute -top-6 text-white text-sm flex flex-col items-center">
            Mercury
            <div className="rounded-full h-1.5 w-1.5 bg-white"></div>
          </div>
        </div>

        <div className="rounded-full border w-48 h-48 flex items-center justify-center absolute animate-spin" style={{ animationDuration: '8s' }}>
          <div className="absolute -top-7 text-white text-sm flex flex-col items-center">
            Venus
            <div className="rounded-full h-3 w-3 bg-white"></div>
          </div>
        </div>

        <div className="rounded-full border w-60 h-60 flex items-center justify-center absolute animate-spin" style={{ animationDuration: '10s' }}>
          <div className="absolute -top-7 text-white text-sm flex flex-col items-center">
            Earth
            <div className="rounded-full h-[0.78rem] w-[0.78rem] bg-white"></div>
          </div>
        </div>

        <div className="rounded-full border w-72 h-72 flex items-center justify-center absolute animate-spin" style={{ animationDuration: '14s' }}>
          <div className="absolute -top-[1.48rem] text-white text-sm flex flex-col items-center">
            Mars
            <div className="rounded-full h-2 w-2 bg-white"></div>
          </div>
        </div>

        <div className="rounded-full border w-[25rem] h-[25rem] flex items-center justify-center absolute animate-spin" style={{ animationDuration: '35s' }}>
          <div className="absolute -top-14 text-white text-sm flex flex-col items-center">
            Jupiter
            <div className="rounded-full h-[4.5rem] w-[4.5rem] bg-white"></div>
          </div>
        </div>

        <div className="rounded-full border w-[36rem] h-[36rem] flex items-center justify-center absolute animate-spin" style={{ animationDuration: '60s' }}>
          <div className="absolute -top-11 text-white text-sm flex flex-col items-center">
            Saturn
            <div className="rounded-full h-[3.5rem] w-[3.5rem] bg-white"></div>
          </div>
        </div>

        <div className="rounded-full border w-[43.2rem] h-[43.2rem] flex items-center justify-center absolute animate-spin" style={{ animationDuration: '90s' }}>
          <div className="absolute -top-9 text-white text-sm flex flex-col items-center">
            Uranus
            <div className="rounded-full h-[2rem] w-[2rem] bg-white"></div>
          </div>
        </div>

        <div className="rounded-full border w-[49rem] h-[49rem] flex items-center justify-center absolute animate-spin" style={{ animationDuration: '130s' }}>
          <div className="absolute -top-9 text-white text-sm flex flex-col items-center">
            Neptune
            <div className="rounded-full h-[1.6rem] w-[1.6rem] bg-white"></div>
          </div>
        </div>
      </div>

      {/* 404 Text and Button */}
      <div className="flex flex-col items-center justify-center ml-0 md:ml-8 w-11/12 text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-4">404</h1>
        <p className="text-lg md:text-2xl mb-4">Oops! Page not found.</p>
        <button
          onClick={handleGoHome}
          className="mt-4 px-6 py-2 bg-white text-purple-500 font-bold rounded hover:bg-gray-200 transition duration-300"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
