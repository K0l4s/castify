import React, { useState } from 'react';
import { AiOutlineLike, AiOutlineDislike } from 'react-icons/ai';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

interface ReplyProps {
    avatarSrc?: string;
    username: string;
    timestamp: string;
    content: string;
    likes: number;
    dislikes: number;
}

interface CommentProps {
    avatarSrc?: string;
    username: string;
    timestamp: string;
    content: string;
    likes: number;
    dislikes: number;
    replies?: ReplyProps[];
}

const Reply: React.FC<ReplyProps> = ({
    avatarSrc = '/default-avatar.png',
    username,
    timestamp,
    content,
    likes,
    dislikes
}) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(likes);
    const [dislikeCount, setDislikeCount] = useState(dislikes);

    const handleLike = () => {
        if (!isLiked) {
            setLikeCount(prev => prev + 1);
            if (isDisliked) {
                setDislikeCount(prev => prev - 1);
                setIsDisliked(false);
            }
        } else {
            setLikeCount(prev => prev - 1);
        }
        setIsLiked(!isLiked);
    };

    const handleDislike = () => {
        if (!isDisliked) {
            setDislikeCount(prev => prev + 1);
            if (isLiked) {
                setLikeCount(prev => prev - 1);
                setIsLiked(false);
            }
        } else {
            setDislikeCount(prev => prev - 1);
        }
        setIsDisliked(!isDisliked);
    };

    return (
        <div className="flex space-x-3 p-4 border-b border-gray-200 ml-12">
            <img 
                src={avatarSrc} 
                alt={username} 
                className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm">{username}</span>
                    <span className="text-gray-500 text-xs">{timestamp}</span>
                </div>
                <p className="text-sm mt-1">{content}</p>
                <div className="flex items-center space-x-4 mt-2">
                    <button 
                        className={`flex items-center space-x-1 ${isLiked ? 'text-blue-500' : 'text-gray-500'}`}
                        onClick={handleLike}
                    >
                        <AiOutlineLike className="text-lg" />
                        <span className="text-xs">{likeCount}</span>
                    </button>
                    <button 
                        className={`flex items-center space-x-1 ${isDisliked ? 'text-red-500' : 'text-gray-500'}`}
                        onClick={handleDislike}
                    >
                        <AiOutlineDislike className="text-lg" />
                        <span className="text-xs">{dislikeCount}</span>
                    </button>
                    <button className="text-gray-500 text-xs">Reply</button>
                </div>
            </div>
        </div>
    );
};

const Comment: React.FC<CommentProps> = ({
    avatarSrc = '/default-avatar.png',
    username,
    timestamp,
    content,
    likes,
    dislikes,
    replies = []
}) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(likes);
    const [dislikeCount, setDislikeCount] = useState(dislikes);
    const [showReplies, setShowReplies] = useState(false);

    const handleLike = () => {
        if (!isLiked) {
            setLikeCount(prev => prev + 1);
            if (isDisliked) {
                setDislikeCount(prev => prev - 1);
                setIsDisliked(false);
            }
        } else {
            setLikeCount(prev => prev - 1);
        }
        setIsLiked(!isLiked);
    };

    const handleDislike = () => {
        if (!isDisliked) {
            setDislikeCount(prev => prev + 1);
            if (isLiked) {
                setLikeCount(prev => prev - 1);
                setIsLiked(false);
            }
        } else {
            setDislikeCount(prev => prev - 1);
        }
        setIsDisliked(!isDisliked);
    };

    return (
        <div>
            <div className="flex space-x-3 p-4 border-b border-gray-200">
                <img 
                    src={avatarSrc} 
                    alt={username} 
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">{username}</span>
                        <span className="text-gray-500 text-xs">{timestamp}</span>
                    </div>
                    <p className="text-sm mt-1">{content}</p>
                    <div className="flex items-center space-x-4 mt-2">
                        <button 
                            className={`flex items-center space-x-1 ${isLiked ? 'text-blue-500' : 'text-gray-500'}`}
                            onClick={handleLike}
                        >
                            <AiOutlineLike className="text-lg" />
                            <span className="text-xs">{likeCount}</span>
                        </button>
                        <button 
                            className={`flex items-center space-x-1 ${isDisliked ? 'text-red-500' : 'text-gray-500'}`}
                            onClick={handleDislike}
                        >
                            <AiOutlineDislike className="text-lg" />
                            <span className="text-xs">{dislikeCount}</span>
                        </button>
                        <button className="text-gray-500 text-xs">Reply</button>
                        {replies.length > 0 && (
                            <button 
                                className="text-gray-500 text-xs flex items-center space-x-1"
                                onClick={() => setShowReplies(!showReplies)}
                            >
                                <span>{replies.length} replies</span>
                                {showReplies ? <BsChevronUp /> : <BsChevronDown />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {showReplies && replies.map((reply, index) => (
                <Reply key={index} {...reply} />
            ))}
        </div>
    );
};

export default Comment;
