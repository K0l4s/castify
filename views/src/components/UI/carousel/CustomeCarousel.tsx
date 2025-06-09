import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Slide {
    title?: string;
    descript?: string;
    content?: JSX.Element;
    imageUrl?: string;
    button1Text?: string;
}

interface CustomCarouselProps {
    slides: Slide[];
}

const CustomCarousel: React.FC<CustomCarouselProps> = ({ slides }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const delay = 4000;

    // Drag
    const startX = useRef<number | null>(null);
    const isDragging = useRef(false);

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, delay);
        return () => clearInterval(interval);
    }, [currentIndex, slides.length]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? slides.length - 1 : prevIndex - 1
        );
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        startX.current = e.clientX;
        isDragging.current = true;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || startX.current === null) return;
        const diff = e.clientX - startX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
            isDragging.current = false;
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        startX.current = null;
    };

    return (
        <div
            className="relative w-full h-[420px] mx-auto rounded-3xl overflow-hidden mb-8 select-none shadow-2xl bg-gradient-to-br from-blue-50 via-white to-purple-100"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Slides */}
            <div className="overflow-hidden relative w-full h-full">
                <div
                    className="flex w-full h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className="min-w-full h-full relative flex flex-col items-center justify-center"
                        >
                            {/* Background Image */}
                            {slide.imageUrl && (
                                <img
                                    src={slide.imageUrl}
                                    alt={slide.title || `slide-${index}`}
                                    className="absolute inset-0 w-full object-cover z-0 blur-[2px] brightness-90"
                                />
                            )}
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
                            {/* Content */}
                            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-8">
                                {slide.content ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        {slide.content}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        {slide.title && (
                                            <h2 className="text-4xl font-bold text-white drop-shadow-lg text-center animate-fade-in-up">
                                                {slide.title}
                                            </h2>
                                        )}
                                        {slide.descript && (
                                            <p className="text-lg text-white/90 text-center max-w-xl animate-fade-in-up delay-100">
                                                {slide.descript}
                                            </p>
                                        )}
                                        {slide.button1Text && (
                                            <button className="mt-4 px-7 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 animate-fade-in-up delay-200">
                                                {slide.button1Text}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Left Arrow */}
            <button
                className="absolute top-1/2 left-6 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-blue-700 shadow-lg p-3 rounded-full z-30 transition-all border border-blue-200 backdrop-blur"
                onClick={prevSlide}
                aria-label="Previous Slide"
            >
                <FaChevronLeft size={22} />
            </button>

            {/* Right Arrow */}
            <button
                className="absolute top-1/2 right-6 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-blue-700 shadow-lg p-3 rounded-full z-30 transition-all border border-blue-200 backdrop-blur"
                onClick={nextSlide}
                aria-label="Next Slide"
            >
                <FaChevronRight size={22} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`w-4 h-4 rounded-full border-2 border-white shadow transition-all duration-200
                            ${currentIndex === index
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 scale-125 border-blue-400"
                                : "bg-white/60 hover:bg-blue-200"
                            }`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>

            {/* Animations */}
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(30px);}
                    100% { opacity: 1; transform: translateY(0);}
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.7s cubic-bezier(.4,0,.2,1) both;
                }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
            `}</style>
        </div>
    );
};

export default CustomCarousel;
