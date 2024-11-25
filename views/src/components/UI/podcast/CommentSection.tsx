import React, { useState, useRef, useEffect } from "react";
import { IoFilter, IoSend } from "react-icons/io5";
import { MdEdit, MdMoreVert } from "react-icons/md";
import { RxReset } from "react-icons/rx";
import { formatDateTime } from "../../../utils/DateUtils";
import { HeartIcon } from "../custom/SVG_Icon";
import CustomButton from "../custom/CustomButton";
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import "./style.css";
import Tooltip from "../custom/Tooltip";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { FaFlag } from "react-icons/fa";
import { useToast } from "../../../context/ToastProvider";
import { useNavigate } from "react-router-dom";
import { addNewComment, fetchComments, resetComments } from "../../../redux/slice/commentSlice";

interface CommentSectionProps {
  podcastId: string;
  totalComments: number;
  currentUserId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ podcastId, totalComments, currentUserId }) => {
  const [commentContent, setCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [showCommentToggle, setShowCommentToggle] = useState<{ [key: string]: boolean }>({});
  const [showOptions, setShowOptions] = useState<{ [key: string]: boolean }>({});

  const commentDivRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { comments, loading, hasMore, page } = useSelector((state: RootState) => state.comments);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRedux = useSelector((state: RootState) => state.auth.user);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Fetching comments for podcastId:', podcastId);
    dispatch(resetComments())
    dispatch(fetchComments({ podcastId, page: 0 }));
  }, [dispatch, podcastId]);

  const handleCommentSubmit = async () => {
    if (commentContent.trim() === "") return;

    try {
      const formattedContent = commentContent.replace(/<div><br><\/div>/g, "\n").replace(/<br>/g, "\n").replace(/<div>/g, "\n").replace(/<\/div>/g, "");
      // await addComment({ podcastId, content: formattedContent });
      await dispatch(addNewComment({ podcastId, content: formattedContent }));
      setCommentContent(""); // Clear the input field
      if (commentDivRef.current) {
        commentDivRef.current.innerText = ""; // Clear the content of the div
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleReplySubmit = async (commentId: string) => {
    if (replyContent[commentId]?.trim() === "") return;

    try {
      // await addComment({ podcastId, content: replyContent[commentId] });
      setReplyContent({ ...replyContent, [commentId]: "" }); // Clear the input field
      setReplyingTo(null); // Close the reply input
      // const commentsData = await getPodcastComments(podcastId); // Refresh comments
      // setComments(commentsData);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleReplyCancel = () => {
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setCommentContent(e.currentTarget.innerHTML || "");
  };

  const handleReplyInput = (commentId: string, e: React.FormEvent<HTMLDivElement>) => {
    setReplyContent({ ...replyContent, [commentId]: e.currentTarget.innerHTML || "" });
  };

  const handeResetInput = () => {
    setCommentContent("");
    if (commentDivRef.current) {
      commentDivRef.current.innerText = ""; // Clear the content of the div
    }
  };

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const toggleOptions = (commentId: string) => {
    setShowOptions((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReport = (commentId: string) => {
    console.log(`Report comment: ${commentId}`);
    // Thêm logic xử lý báo cáo ở đây
  };

  const handleDelete = (commentId: string) => {
    console.log(`Delete comment: ${commentId}`);
    // Thêm logic xử lý xóa ở đây
  };

  const handleEdit = (commentId: string) => {
    console.log(`Edit comment: ${commentId}`);
    // Thêm logic xử lý chỉnh sửa ở đây
  };

  useEffect(() => {
    comments.forEach(comment => {
      const commentRef = document.getElementById(`comment-${comment.id}`);
      if (commentRef) {
        const lineHeight = parseInt(window.getComputedStyle(commentRef).lineHeight, 10);
        const lines = commentRef.scrollHeight / lineHeight;
        setShowCommentToggle(prev => ({ ...prev, [comment.id]: lines > 5 }));
      }
    });
  }, [comments]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!(target as Element).closest(".comment-options")) {
        setShowOptions({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      // setPage((prevPage) => prevPage + 1);
      dispatch(fetchComments({ podcastId, page: page + 1 }));
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 my-2">
        <h2 className="text-xl font-semibold mb-2">{totalComments} comments</h2>
        <CustomButton 
          text="Filter"
          variant="ghost"
          rounded="lg"
          icon={<IoFilter size={24} />}  
          className="mb-2 text-black dark:text-white"
        />
      </div>
      
      {isAuthenticated ? (
        <div className="flex mb-4 gap-2">
          <img 
            src={userRedux?.avatarUrl || defaultAvatar} 
            alt="avatar" 
            className="w-10 h-10 rounded-full mr-2 cursor-pointer" 
            onClick={() => navigate(`/profile/${userRedux?.username}`)}
          />
          <div className="flex flex-col w-full items-end gap-4">
            <div
              ref={commentDivRef}
              contentEditable
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              className="comment-input flex-1 p-2 w-full border rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white resize-none h-auto min-h-[43px] overflow-auto"
              style={{ whiteSpace: "pre-wrap" }}
              data-placeholder="Add a comment..."
            />
            <div className="flex gap-3">
              <Tooltip text="Undo">
                <CustomButton
                  icon={<RxReset size={20} />}
                  onClick={handeResetInput}
                  variant="ghost"
                  className="py-3"
                />
              </Tooltip>

              <Tooltip text="Send">
                <CustomButton
                  icon={<IoSend size={20} />}
                  onClick={handleCommentSubmit}
                  variant="primary"
                  className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-500 py-3"
                />
              </Tooltip>
              
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto my-2 text-center">
          <CustomButton 
            text="Please login to add a comment" 
            variant="ghost"
          />
        </div>
      )}

      {comments.map(comment => (
        <div key={comment.id} className="mb-4 p-4 border rounded-lg bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
          <div className="relative flex items-center mb-2">
            <img 
              src={comment.user.avatarUrl || defaultAvatar} 
              alt="avatar" 
              className="w-10 h-10 rounded-full mr-2 cursor-pointer" 
              onClick={() => navigate(`/profile/${comment.user.username}`)}
            />
            <span 
              className="text-base font-medium text-gray-800 dark:text-gray-200 cursor-pointer"
              onClick={() => navigate(`/profile/${comment.user.username}`)}
            >
              @{comment.user.username}
            </span>
            <span className="ml-auto">{formatDateTime(comment.timestamp)}</span>
            <CustomButton
              icon={<MdMoreVert size={20}/>}
              variant="ghost"
              rounded="full"
              size="xs"
              onClick={() => toggleOptions(comment.id)}
              className="ml-2 text-black dark:text-white dark:hover:bg-gray-900"
            />
            {showOptions[comment.id] && (
              <div className="comment-options absolute -translate-y-1/2 -top-10 -right-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg mt-2 z-50">
                <ul className="py-1">
                  {comment.user.id === currentUserId ? (
                    <>
                      <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                        onClick={() => handleEdit(comment.id)}>
                          <MdEdit className="inline-block mb-1 mr-2" />
                          Edit
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                        onClick={() => handleDelete(comment.id)}>
                          <RiDeleteBin6Line className="inline-block mb-1 mr-2" />
                          Delete
                      </li>
                    </>
                  ) : (
                    <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                      onClick={() => { 
                        if (!isAuthenticated) {
                          toast.warning("Please login to do this action");
                        }
                        handleReport(comment.id)} 
                      }>
                        <FaFlag className="inline-block mb-1 mr-2" />
                        Report
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <pre id={`comment-${comment.id}`} className={`text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap ${expandedComments[comment.id] ? '' : 'line-clamp-5'}`} style={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
            {comment.content}
          </pre>
          {showCommentToggle[comment.id] && (
            <button onClick={() => toggleCommentExpansion(comment.id)} className="text-blue-600 dark:text-blue-300 font-medium mt-2">
              {expandedComments[comment.id] ? 'Show less' : 'Show more'}
            </button>
          )}
          <div className="flex items-center text-gray-600 dark:text-gray-400 mt-2">
            <Tooltip text="Reaction">
            <CustomButton 
              icon={<HeartIcon filled={comment.liked} color={comment.liked ? "#991f00" : "gray"} strokeColor="#991f00" />}
              variant="ghost"
              rounded="full"
              size="xs"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.warning("Please login to do this action");
                }
              }}
            />
            </Tooltip>
            <span className="text-black dark:text-white font-medium">{comment.totalLikes}</span>
            <CustomButton 
              text="Reply"
              variant="ghost"
              rounded="full"
              className="ml-2 dark:hover:bg-gray-900"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.warning("Please login to do this action");
                }
                setReplyingTo(comment.id)
              }}
            />
          </div>
          {(replyingTo === comment.id && isAuthenticated) && (
            <div className="flex mt-4 ml-4 gap-2">
              <img src={defaultAvatar} alt="avatar" className="w-10 h-10 rounded-full mr-2" />
              <div className="flex flex-col items-end w-full gap-3">
                <div
                  contentEditable
                  onInput={(e) => handleReplyInput(comment.id, e)}
                  className="comment-input flex-1 p-2 w-full border rounded-lg bg-gray-300 dark:bg-gray-700 dark:text-white resize-none h-auto min-h-[43px] overflow-auto"
                  style={{ whiteSpace: "pre-wrap" }}
                  data-placeholder="Add a reply..."
                />
                <div className="flex gap-3">
                  <Tooltip text="Cancel">
                    <CustomButton
                      icon={<RxReset size={20} />}
                      onClick={handleReplyCancel}
                      variant="ghost"
                      className="py-3 dark:hover:bg-gray-900"
                    />
                  </Tooltip>
                  <Tooltip text="Send">
                    <CustomButton
                      icon={<IoSend size={20} />}
                      onClick={() => handleReplySubmit(comment.id)}
                      variant="primary"
                      className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-500 py-3"
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {loading && <div className="text-center my-4">Loading...</div>}
      {hasMore && !loading && (
        <div className="text-center my-4">
          <CustomButton 
            text="Load more comments" 
            variant="primary" 
            onClick={handleLoadMore} 
          />
        </div>
      )}
    </div>
  );
};

export default CommentSection;