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
    // avatarSrc,
    // title,
    // author,
    // voteCount,
    // dislikeCount,
    // commentCount,
    // shareCount,
    // description,
}) => {
    const height = (16 * 100) / 9;
    console.log(height);
    return (
        <div className="w-full max-w-96 m-auto mb-5">
            <div className={`relative bg-white shadow-lg rounded-lg overflow-hidden pb-[165%]`}>
                {/* <img
        src={avatarSrc}
        alt={title}
        className="absolute top-0 left-0 w-full h-full object-cover"
      /> */}
                <video
                    src={videoSrc}
                    controls
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    poster="https://innovavietnam.vn/wp-content/uploads/poster-561x800.jpg"
                />
            </div>
        </div>

    );
};

export default Podcast;
