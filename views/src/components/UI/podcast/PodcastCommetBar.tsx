import { IoMdClose } from "react-icons/io";
import Comment from "./Comment";

interface PodcastCommentBarProps {
    isOpen: boolean;
    onClose: () => void;
}

const PodcastCommentBar = ({ onClose }: PodcastCommentBarProps) => {
    return (
        <div className="bg-white rounded-lg shadow
        
        ">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold">Comments</h3>
                <button 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    <IoMdClose size={24} />
                </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
                <Comment 
                    username="John Doe"
                    timestamp="2 hours ago"
                    content="This is an amazing podcast! Really enjoyed the discussion about technology trends."
                    likes={42}
                    dislikes={3}
                    replies={[
                        {
                            username: "Sarah Smith",
                            timestamp: "1 hour ago",
                            content: "Totally agree! The AI discussion was particularly insightful.",
                            likes: 15,
                            dislikes: 1
                        },
                        {
                            username: "Mike Johnson",
                            timestamp: "45 minutes ago",
                            content: "The predictions about future tech were spot on!",
                            likes: 8,
                            dislikes: 0
                        }
                    ]}
                />
                <Comment
                    username="Emily Chen"
                    timestamp="3 hours ago" 
                    content="The segment about blockchain technology was very well explained. Would love to hear more about DeFi in future episodes!"
                    likes={38}
                    dislikes={2}
                    replies={[
                        {
                            username: "David Wilson",
                            timestamp: "2 hours ago",
                            content: "Agreed! The technical concepts were broken down really well.",
                            likes: 12,
                            dislikes: 1
                        }
                    ]}
                />
                <Comment
                    username="Alex Thompson"
                    timestamp="5 hours ago"
                    content="Great episode! But I think you missed some important points about quantum computing."
                    likes={25}
                    dislikes={8}
                    replies={[
                        {
                            username: "Dr. Lisa Kumar",
                            timestamp: "4 hours ago",
                            content: "Actually, they covered the fundamentals quite well. The target audience isn't quantum physicists.",
                            likes: 45,
                            dislikes: 2
                        },
                        {
                            username: "Alex Thompson",
                            timestamp: "3 hours ago",
                            content: "Fair point, I was thinking from a more technical perspective.",
                            likes: 15,
                            dislikes: 1
                        }
                    ]}
                />
                <Comment
                    username="Robert Martinez"
                    timestamp="6 hours ago"
                    content="The guest speaker was incredibly knowledgeable! Can we have them back for another episode?"
                    likes={56}
                    dislikes={1}
                    replies={[
                        {
                            username: "Jane Foster",
                            timestamp: "5 hours ago",
                            content: "Yes please! Their insights on machine learning were fascinating.",
                            likes: 28,
                            dislikes: 0
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default PodcastCommentBar;
