import React, { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom'; // Make sure to import useHistory

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate(); // Use useHistory hook to navigate
  const [isReturning, setIsReturning] = useState(false);

  const handleGoHome = () => {
    setIsReturning(true);
    setTimeout(() => {
      navigate('/'); // Navigate to the home page
    }, 1000);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);


  return (
    <div className={`min-h-screen bg-gray-900 flex items-center justify-center p-4 overflow-hidden transition-all duration-1000 ${isReturning ? 'scale-150 opacity-0' : ''}`}>
      {/* Background stars */}
      {[...Array(500)].map((_, i) => (
        <div
          key={i}
          id="star"
          className={`absolute w-[2px] h-[2px] bg-white rounded-full animate-twinkle transition-all duration-1000 animate-pulse ${isReturning ? 'scale-0' : ''}`}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${1 + Math.random() * 2}s`,
            transform: `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`,
            filter: `blur(${Math.random() * 1}px)`,
            opacity: Math.random() * 0.5 
          }}
        />
      ))}

      
      <div className={`text-center relative z-10 transition-all duration-1000 ${isReturning ? 'scale-0 translate-y-[-100vh]' : ''}`}>
        {/* 404 Text */}
        <h1 className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x mb-2">404</h1>
        <p className="text-2xl text-gray-300 mb-8 font-light tracking-wide">
          <span className="animate-pulse">✦</span> Oops! You seem to be lost in space <span className="animate-pulse">✦</span>
        </p>
        
        {/* Return Home Button */}
        <button
          onClick={handleGoHome}
          className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium rounded-xl
            hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 ease-out
            transform hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500
            shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
          disabled={isReturning}
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Return to Earth
          </span>
        </button>
      </div>

      <div className={`absolute inset-0 flex items-center justify-center overflow-hidden transition-all duration-1000 ${isReturning ? 'scale-[5] opacity-0' : ''}`}>
        {/* Solar System Animation */}
        <div className="relative w-[600px] h-[600px] mx-auto">
          {/* Sun (Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_60px_#fbbf24]" />
          
          {/* Planet Orbits */}
          {[
            { 
              name: 'Mercury', 
              size: 3*4, 
              color: 'bg-gradient-to-r from-gray-400 to-gray-600', 
              orbitSize: 80*2, 
              speed: 4.1 
            },
            { 
              name: 'Venus', 
              size: 4*4, 
              color: 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-orange-400', 
              orbitSize: 120*2, 
              speed: 10.5 
            },
            { 
              name: 'Earth', 
              size: 4*4, 
              color: 'bg-gradient-to-r from-blue-600 via-green-500 to-blue-400', 
              orbitSize: 160*2, 
              speed: 17 
            },
            { 
              name: 'Mars', 
              size: 3.5*4, 
              color: 'bg-gradient-to-r from-red-700 via-red-600 to-red-500', 
              orbitSize: 200*2, 
              speed: 32 
            },
            { 
              name: 'Jupiter', 
              size: 10*4, 
              color: 'bg-gradient-to-r from-orange-700 via-yellow-600 to-orange-500', 
              orbitSize: 280*2, 
              speed: 100 
            },
            { 
              name: 'Saturn', 
              size: 9*4, 
              color: 'bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-500', 
              orbitSize: 340*2, 
              speed: 250 
            },
            { 
              name: 'Uranus', 
              size: 6*4, 
              color: 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400', 
              orbitSize: 400*2, 
              speed: 500 
            },
            { 
              name: 'Neptune', 
              size: 6*4, 
              color: 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700', 
              orbitSize: 460*2, 
              speed: 1000 
            }
          ].map((planet) => (
            <div 
              key={planet.name}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-700`}
              style={{
                width: `${planet.orbitSize}px`,
                height: `${planet.orbitSize}px`,
                animation: `spin ${planet.speed}s linear infinite`
              }}
            >
              {/* Planet */}
              <div 
                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                  ${planet.color} rounded-full`}
                style={{
                  width: `${planet.size}px`,
                  height: `${planet.size}px`
                }}
              />
              {/* Special case for Saturn's rings */}
              {planet.name === 'Saturn' && (
                <>
                  {/* Inner ring */}
                  <div 
                    className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                      bg-yellow-100/40 rounded-full blur-[0.5px]`}
                    style={{
                      width: `${100}px`,
                      height: `${3}px`,
                      transform: 'rotate(30deg) translateX(-40px) translateY(25px)',
                      boxShadow: '0 0 4px rgba(254, 240, 138, 0.4)'
                    }}
                  />
                  {/* Outer ring */}
                  <div 
                    className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                      bg-yellow-50/20 rounded-full blur-[0.2px]`}
                    style={{
                      width: `${100}px`,
                      height: `${5}px`,
                      transform: 'rotate(30deg) translateX(-40px) translateY(25px)',
                      boxShadow: '0 0 9px rgba(254, 240, 138, 0.2)'
                    }}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }

          @keyframes twinkle {
            0% { 
              opacity: 0;
              transform: translate(0, 0) scale(1);
            }
            25% {
              opacity: 0.5;
              transform: translate(3px, -3px) scale(1.2);
            }
            50% { 
              opacity: 1;
              transform: translate(-2px, 2px) scale(1);
            }
            75% {
              opacity: 0.5;
              transform: translate(1px, -1px) scale(0.8);
            }
            100% { 
              opacity: 0;
              transform: translate(0, 0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotFoundPage;
