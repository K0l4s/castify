import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Banner from "./Banner";

interface Slide {
    title?: string;
    content?: JSX.Element;
    imageUrl?: string;
    button1Text?: string;
}

const slides: Slide[] = [
    {
        content: (
            <Banner
                title="Blankcil is a platform for podcast lovers"
                linkTo="/certificate"
                buttonText="See All Certifications"
                imageUrl="https://images3.alphacoders.com/103/1038857.jpg"
            />
        ),
    },
    {
        content: (
            <Banner
                title="You can create your own podcast"
                linkTo="/courses"
                imageUrl="https://www.skyweaver.net/images/media/wallpapers/wallpaper1.jpg"
                buttonText="Enroll now"
            />
        ),
    },
    {
        content: (
            <Banner
                title="Register to become a creator"
                linkTo="/job"
                imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlfxps-j1QZ0F36RZ8PnlC9FCEe5npD_fX7qKLk6u1ICB1YCJkJz2fr4JWi6ghgt-TVYY&usqp=CAU"
                buttonText="See Pathway"
            />
        ),
    },
];

const CustomCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const delay = 3000;

    // Kéo chuột
    const startX = useRef<number | null>(null);
    const isDragging = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, delay);
        return () => clearInterval(interval);
    }, [currentIndex]);

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
            className="relative w-full h-50 mx-auto rounded-lg overflow-hidden mb-2 select-none"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className="overflow-hidden relative">
                <div
                    className="flex w-full transition-transform duration-700"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className="min-w-full flex flex-col items-center bg-gray-100 rounded-lg"
                        >
                            {slide.content ? (
                                slide.content
                            ) : (
                                <>
                                    <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
                                    {slide.button1Text && (
                                        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg mr-2">
                                            {slide.button1Text}
                                        </button>
                                    )}
                                    {slide.imageUrl && (
                                        <img
                                            src={slide.imageUrl}
                                            alt={slide.title}
                                            className="mt-6 max-w-full h-auto rounded-lg"
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Buttons */}
            <button
                className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white py-2 rounded-l-lg hover:bg-gray-700/50"
                onClick={prevSlide}
            >
                <FaChevronLeft />
            </button>

            <button
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white py-2 rounded-r-lg hover:bg-gray-700/50"
                onClick={nextSlide}
            >
                <FaChevronRight />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${currentIndex === index ? "bg-blue-500" : "bg-gray-300"}`}
                        onClick={() => setCurrentIndex(index)}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default CustomCarousel;
