import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [isEscaping, setIsEscaping] = useState(false);

  const handleGoHome = () => {
    setIsEscaping(true);
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  return (
    <div className={`min-h-screen min-w-screen bg-red-900 flex items-center justify-center p-4 overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] transition-all duration-1000 ${isEscaping ? 'scale-150 opacity-0' : ''}`}>
      {/* Mars Surface Texture */}
      <div className={`absolute inset-0 bg-gradient-to-b from-red-800 to-red-900 overflow-hidden transition-transform duration-1000 ${isEscaping ? 'scale-150 rotate-12' : ''}`}>
        {/* Craters */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-red-950 transition-all duration-1000 ${isEscaping ? 'scale-0' : ''}`}
            style={{
              width: `${20 + Math.random() * 100}px`,
              height: `${20 + Math.random() * 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.3,
              boxShadow: 'inset 2px 2px 10px rgba(0,0,0,0.3)'
            }}
          />
        ))}
        
        {/* UFOs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-float transition-all duration-1000 ${isEscaping ? 'translate-y-[-100vh] scale-0' : ''}`}
            style={{
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 80}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 7}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            <div className="w-12 h-4 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-green-400 rounded-full opacity-50 animate-pulse" />
            </div>
          </div>
        ))}

        {/* Alien Creatures */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute transition-all duration-1000 ${isEscaping ? 'translate-x-[100vw] rotate-[720deg]' : ''}`}
            style={{
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
              animation: `
                bounce ${2 + Math.random() * 3}s ${Math.random() * 3}s infinite,
                float ${8 + Math.random() * 5}s linear infinite,
                spin ${5 + Math.random() * 3}s linear infinite
              `,
            }}
          >
            <div className="text-4xl transform hover:scale-110 transition-transform cursor-pointer">👾</div>
          </div>
        ))}

        {/* Dust Particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-[1px] h-[1px] bg-red-400 rounded-full animate-float transition-all duration-1000 ${isEscaping ? 'scale-0' : ''}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className={`text-center relative z-10 transition-all duration-1000 ${isEscaping ? 'scale-0 translate-y-[-100vh]' : ''}`}>
        {/* 403 Text */}
        <h1 className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-gradient-x mb-2">403</h1>
        <p className="text-2xl text-red-200 mb-8 font-light tracking-wide">
          <span className="animate-pulse">👽</span> Access Denied! The Martians won't let you pass! <span className="animate-pulse">🛸</span>
        </p>
        
        {/* Return Home Button */}
        <button
          onClick={handleGoHome}
          className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white text-lg font-medium rounded-xl
            hover:from-red-500 hover:to-orange-500 transition-all duration-300 ease-out
            transform hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-900 focus:ring-red-500
            shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]
            "
            disabled={isEscaping}
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Escape from Mars
          </span>
        </button>
      </div>

      {/* Mars Planet in Background */}
      <div className={`absolute bottom-40 right-40 w-96 h-96 rounded-full bg-gradient-to-br from-red-700 via-red-800 to-red-900 opacity-30 transition-all duration-1000 ${isEscaping ? 'scale-[5] opacity-0' : ''}`}>
        <div className="absolute inset-0 rounded-full shadow-inner" 
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)'
          }}
        />
      </div>
    </div>
  );
};

export default NotAccessPage;
