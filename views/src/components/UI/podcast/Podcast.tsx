import React from 'react';

interface PodcastProps {
    videoSrc: string;
    avatarSrc: string;
    title: string;
    author: string;
    voteCount: number;
    dislikeCount: number;
    commentCount: number;
    shareCount: number;
    description: string;
}

const Podcast: React.FC<PodcastProps> = ({
    videoSrc,
    avatarSrc,
    title,
    author,
    voteCount,
    dislikeCount,
    commentCount,
    shareCount,
    description,
}) => {
    return (
        <div className="relative w-full h-screen bg-black text-white overflow-hidden">
            {/* Video */}
            <video
                src={videoSrc}
                autoPlay
                loop
                muted
                controls
                className="absolute top-0 left-0 w-full h-full object-cover"
                poster="https://innovavietnam.vn/wp-content/uploads/poster-561x800.jpg"
            />

            {/* Overlay Content */}
            <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black to-transparent">
                {/* Video Description */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm">@{author}</p>
                    <p className="text-sm mt-2">{description}</p>
                </div>

                {/* Right-Side Buttons */}
                <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-4">
                    {/* Profile Picture */}
                    <img
                        src={avatarSrc}
                        alt={author}
                        className="w-12 h-12 rounded-full border-2 border-white mb-2"
                    />

                    {/* Actions */}
                    <div className="text-center">
                        <button className="text-white mb-2">
                            👍 {voteCount}
                        </button>
                        <button className="text-white mb-2">
                            👎 {dislikeCount}
                        </button>
                        <button className="text-white mb-2">
                            💬 {commentCount}
                        </button>
                        <button className="text-white">
                            🔄 {shareCount}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Podcast;
