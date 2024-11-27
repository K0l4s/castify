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
import { FaAngleDown, FaAngleUp, FaFlag } from "react-icons/fa";
import { useToast } from "../../../context/ToastProvider";
import { useNavigate } from "react-router-dom";
import { addNewComment, fetchCommentReplies, fetchComments, likeCommentAction, resetComments } from "../../../redux/slice/commentSlice";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

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
  const [showCommentOptions, setShowCommentOptions] = useState<{ [key: string]: boolean }>({});
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [filter, setFilter] = useState("latest");
  const [filterLoading, setFilterLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  const commentDivRef = useRef<HTMLDivElement>(null);
  const replyDivRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const replyInputRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});

  const [mentionedUser, setMentionedUser] = useState<{ [key: string]: string | null }>({});

  const dispatch = useDispatch<AppDispatch>();
  const { comments, loading, hasMore, page } = useSelector((state: RootState) => state.comments);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRedux = useSelector((state: RootState) => state.auth.user);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(resetComments())
    dispatch(fetchComments({ podcastId, page: 0, sortBy: filter, isAuthenticated }));
  }, [dispatch, podcastId, isAuthenticated]);
  
  const handleFetchReplies = (commentId: string) => {
    if (expandedReplies[commentId]) {
      // Nếu replies đang mở, thu gọn lại
      setExpandedReplies({ ...expandedReplies, [commentId]: false });
    } else {
      // Nếu replies đang đóng, mở ra và fetch replies
      setExpandedReplies({ ...expandedReplies, [commentId]: true });
      dispatch(fetchCommentReplies({ commentId, isAuthenticated }));
    }
  };

  const handleCommentSubmit = async () => {
    if (commentContent.trim() === "") return;

    try {
      const formattedContent = commentContent.replace(/<div><br><\/div>/g, "\n").replace(/<br>/g, "\n").replace(/<div>/g, "\n").replace(/<\/div>/g, "");
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
      const replyText = replyContent[commentId].replace(/<div><br><\/div>/g, "\n").replace(/<br>/g, "\n").replace(/<div>/g, "\n").replace(/<\/div>/g, "");
      let parentCommentId = commentId;

      // Tìm comment cha (comment cấp cao nhất)
      const parentComment = comments.find(comment => 
        comment.id === commentId || 
        comment.replies?.some(reply => reply.id === commentId)
      );

      if (parentComment) {
        parentCommentId = parentComment.id;
      }

      const mentionedUserString = mentionedUser[commentId] ? mentionedUser[commentId] : undefined;

      await dispatch(addNewComment({
        podcastId,
        content: replyText,
        parentId: parentCommentId,
        mentionedUser: mentionedUserString
      }));

      setReplyContent({ ...replyContent, [commentId]: "" }); // Clear the input field
      setReplyingTo(null); // Close the reply input
      setMentionedUser({ ...mentionedUser, [commentId]: null });
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  useEffect(() => {
    if (replyingTo) {
      const replyInputRef = replyInputRefs.current[replyingTo];
      if (replyInputRef) {
        const replyText = replyContent[replyingTo] || "";
        replyInputRef.textContent = replyText;
      }
    }
  }, [replyingTo, replyContent]);

  const handleReplyClick = (commentId: string, username: string) => {
    if (!isAuthenticated) {
      toast.warning("Please login to do this action");
      return;
    }

    setReplyingTo(commentId);
    const replyText = username === userRedux?.username ? "" : `@${username} `;
    setReplyContent({ ...replyContent, [commentId]: replyText });
    if (replyDivRef.current[commentId]) {
      replyDivRef.current[commentId]!.scrollIntoView({ behavior: "smooth", block: "center" });
      replyDivRef.current[commentId]!.focus();
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
    setShowCommentOptions((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const toggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
  }

  const handleFilterChange = (sortBy: string) => {
    setFilterLoading(true);
    setFilter(sortBy);
    setShowFilterOptions(false);
    dispatch(resetComments());
    setTimeout(() => {
      dispatch(fetchComments({ podcastId, page: 0, sortBy, isAuthenticated }));
      setFilterLoading(false);
    }, 500);
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

  const handleLike = (commentId: string) => {
    if (!isAuthenticated) {
      toast.warning("Please login to do this action");
      return;
    }
    dispatch(likeCommentAction({ commentId }));
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
        setShowCommentOptions({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLoadMore = () => {
    setLoadMoreLoading(true);
    if (!loading && hasMore) {
      setTimeout(() => {
        dispatch(fetchComments({ podcastId, page: page + 1, sortBy: filter, isAuthenticated }));
        setLoadMoreLoading(false);
      }, 500)
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!(target as Element).closest(".filter-options")) {
        setShowFilterOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRemoveMentionedUser = (commentId: string) => {
    setMentionedUser({ ...mentionedUser, [commentId]: null });
  };
  
  const handleKeyDownReply = (e: React.KeyboardEvent<HTMLDivElement>, commentId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Breakline
    }

    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleReplySubmit(commentId);
    } else if (e.key === "Delete" && mentionedUser[commentId]) {
      handleRemoveMentionedUser(commentId);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 my-2">
        <h2 className="text-xl font-semibold mb-2">{totalComments} comments</h2>
        <div className="relative">
          <CustomButton 
            text="Filter"
            variant="ghost"
            rounded="lg"
            icon={<IoFilter size={24} />}  
            onClick={toggleFilterOptions}
            className="mb-2 text-black dark:text-white"
          />
          {showFilterOptions && (
            <div className="filter-options absolute -top-20 -left-20 translate-x-full w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <ul className="py-1">
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleFilterChange('latest')}>
                  Latest
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleFilterChange('oldest')}>
                  Oldest
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Add comment Input Div */}
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

      {(loading || filterLoading) && 
        <div className="text-center my-4 font-bold ">
          <AiOutlineLoading3Quarters className="inline-block mb-1 mr-2 animate-spin"/>
          Loading...
        </div>
      }

      {/* Render Comments */}
      {comments.map(comment => (
        <div key={comment.id} className="mb-4 p-4 border rounded-lg bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
          <div className="relative flex items-center mb-2">
            <img 
              src={comment.user.avatarUrl || defaultAvatar} 
              alt="avatar" 
              className="w-8 h-8 rounded-full mr-2 cursor-pointer" 
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
            {showCommentOptions[comment.id] && (
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
                onClick={() => handleLike(comment.id)}
              />
            </Tooltip>
            <span className="text-black dark:text-white font-medium">{comment.totalLikes}</span>
            <CustomButton 
              text="Reply"
              variant="ghost"
              rounded="full"
              className="ml-2 dark:hover:bg-gray-900"
              onClick={() => handleReplyClick(comment.id, comment.user.username)}
            />
          </div>
          
          {comment.totalReplies > 0 && (
            <CustomButton 
              text={`${comment.totalReplies} replies`}
              icon={expandedReplies[comment.id] ? <FaAngleUp size={20} /> : <FaAngleDown size={20} />}
              rounded="full"
              variant="ghost"
              onClick={() => handleFetchReplies(comment.id)}
              className="dark:hover:bg-gray-900 text-blue-700 dark:text-blue-500"
            />
          )}

          {/* Render Replies */}
          {expandedReplies[comment.id] && comment.replies && comment.replies.map(reply => (
            <div key={reply.id} className="ml-8 mt-4 p-4 border rounded-lg bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
              <div className="relative flex items-center mb-2">
                <img 
                  src={reply.user.avatarUrl || defaultAvatar} 
                  alt="avatar" 
                  className="w-8 h-8 rounded-full mr-2 cursor-pointer" 
                  onClick={() => navigate(`/profile/${reply.user.username}`)}
                />
                <span 
                  className="text-base font-medium text-gray-800 dark:text-gray-200 cursor-pointer"
                  onClick={() => navigate(`/profile/${reply.user.username}`)}
                >
                  @{reply.user.username}
                </span>
                <span className="ml-auto">{formatDateTime(reply.timestamp)}</span>

                <CustomButton
                  icon={<MdMoreVert size={20}/>}
                  variant="ghost"
                  rounded="full"
                  size="xs"
                  onClick={() => toggleOptions(reply.id)}
                  className="ml-2 text-black dark:text-white dark:hover:bg-gray-900"
                />
                {showCommentOptions[reply.id] && (
                  <div className="comment-options absolute -translate-y-1/2 -top-10 -right-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg mt-2 z-50">
                    <ul className="py-1">
                      {reply.user.id === userRedux?.id ? (
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
              <pre className="text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap" style={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
                {reply.content}
              </pre>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mt-2">
                <Tooltip text="Reaction">
                  <CustomButton 
                    icon={<HeartIcon filled={reply.liked} color={reply.liked ? "#991f00" : "gray"} strokeColor="#991f00" />}
                    variant="ghost"
                    rounded="full"
                    size="xs"
                    onClick={() => handleLike(reply.id)}
                  />
                </Tooltip>
                <span className="text-black dark:text-white font-medium">{reply.totalLikes}</span>
                <CustomButton 
                  text="Reply"
                  variant="ghost"
                  rounded="full"
                  className="ml-2 dark:hover:bg-gray-900"
                  onClick={() => handleReplyClick(reply.id, reply.user.username)}
                />
              </div>
              
              {/* Reply to a reply Input Div*/}
              {(replyingTo === reply.id && isAuthenticated) && (
                <div className="flex mt-4 ml-4 gap-2">
                  <img src={userRedux?.avatarUrl || defaultAvatar} alt="avatar" className="w-10 h-10 rounded-full mr-2" />
                  <div className="flex flex-col items-end w-full gap-3">
                    <div
                      ref={(el) => {
                        replyInputRefs.current[reply.id] = el;
                        if (el && replyContent[reply.id]) {
                          el.textContent = replyContent[reply.id];
                        }
                      }}
                      contentEditable
                      className="comment-input flex-1 p-2 w-full border rounded-lg bg-gray-300 dark:bg-gray-700 dark:text-white resize-none h-auto min-h-[43px] overflow-auto"
                      style={{ whiteSpace: "pre-wrap" }}
                      data-placeholder="Add a reply..."
                      onInput={(e) => {
                        const target = e.target as HTMLDivElement;
                        let content = target.innerHTML;

                        // Loại bỏ thẻ <br/> nếu nó là nội dung duy nhất
                        if (content === "<br>") {
                          content = "";
                          target.innerHTML = "";
                        }

                        setReplyContent({ ...replyContent, [reply.id]: content });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          e.preventDefault();
                          handleReplySubmit(reply.id);
                        }
                      }}
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
                          onClick={() => handleReplySubmit(reply.id)}
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

          {/* Reply a comment Input Div */}
          {(replyingTo === comment.id && isAuthenticated) && (
            <div className="flex mt-4 ml-4 gap-2" ref={(el) => (replyDivRef.current[comment.id] = el)}>
              <img src={userRedux?.avatarUrl || defaultAvatar} alt="avatar" className="w-10 h-10 rounded-full mr-2" />
              <div className="flex flex-col items-end w-full gap-3">
                <div
                  ref={(el) => {
                    replyInputRefs.current[comment.id] = el;
                    if (el && replyContent[comment.id]) {
                      el.textContent = replyContent[comment.id];
                    }
                  }}
                  contentEditable
                  className="comment-input flex-1 p-2 w-full border rounded-lg bg-gray-300 dark:bg-gray-700 dark:text-white resize-none h-auto min-h-[43px] overflow-auto"
                  style={{ whiteSpace: "pre-wrap" }}
                  data-placeholder="Add a reply..."
                  onInput={(e) => {
                    const target = e.target as HTMLDivElement;
                    const content = target.innerHTML.replace(/<br>/g, "\n");
                    
                    setReplyContent({ ...replyContent, [comment.id]: content });
                    
                  }}
                  onKeyDown={(e) => handleKeyDownReply(e, comment.id)}
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
      {hasMore && !loading && (
        <div className="text-center my-4">
        {loadMoreLoading ? (
          <div className="font-bold">
            <AiOutlineLoading3Quarters className="inline-block mb-1 mr-2 animate-spin" />
            Loading...
          </div>
        ) : (
          <CustomButton 
            text="Load more comments"
            variant="primary" 
            onClick={handleLoadMore} 
          />
        )}
      </div>
      )}
    </div>
  );
};

export default CommentSection;