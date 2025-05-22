import React, { useState, useRef, useEffect } from "react";
import { IoFilter, IoInformationCircleOutline } from "react-icons/io5";
import { MdEdit, MdMoreVert } from "react-icons/md";
import { formatLastUpdatedFromNow } from "../../../utils/DateUtils";
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
import { addNewComment, deleteCommentAction, editCommentAction, fetchCommentReplies, fetchComments, likeCommentAction, resetComments } from "../../../redux/slice/commentSlice";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import ReportModal from "../../modals/report/ReportModal";
import { ReportType } from "../../../models/Report";
import ConfirmModal from "../../modals/utils/ConfirmDelete";
import Avatar from "../user/Avatar";
import "./comment.css";
import CustomCommentInput from "../custom/CustomCommentInput";
import EditCommentModal from "./EditCommentModal";

interface CommentSectionProps {
  podcastId: string;
  totalComments: number;
  currentUserId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ podcastId, totalComments, currentUserId }) => {
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [showCommentToggle, setShowCommentToggle] = useState<{ [key: string]: boolean }>({});
  const [showCommentOptions, setShowCommentOptions] = useState<{ [key: string]: boolean }>({});
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [filter, setFilter] = useState("latest");
  const [filterLoading, setFilterLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [isOpenCommentReportModal, setIsOpenCommentReportModal] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  const replyDivRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const replyInputRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});

  const [mentionedUser, setMentionedUser] = useState<{ [key: string]: string | null }>({});

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [commentToEdit, setCommentToEdit] = useState<{ id: string; content: string } | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { comments, loading, hasMore, page } = useSelector((state: RootState) => state.comments);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRedux = useSelector((state: RootState) => state.auth.user);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(resetComments())
    dispatch(fetchComments({ podcastId, page: 0, sortBy: filter, isAuthenticated }));
  }, [dispatch, podcastId, isAuthenticated, filter]);
  
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

  const handleReplySubmit = async (commentId: string, content: string) => {
    if (!content.trim()) return;

    try {
      let parentCommentId = commentId;

      // Tìm comment cha (comment cấp cao nhất)
      const parentComment = comments.find(comment => 
        comment.id === commentId || 
        comment.replies?.some(reply => reply.id === commentId)
      );

      if (parentComment) {
        // console.log("Parent comment:", parentComment);
        parentCommentId = parentComment.id;
      }

      const mentionedUserName = mentionedUser[commentId];

      // const mentionedUserString = mentionedUser[commentId] ? mentionedUser[commentId] : undefined;

      await dispatch(addNewComment({
        podcastId,
        content,
        parentId: parentCommentId,
        mentionedUser: mentionedUserName || undefined
      }));

      setExpandedReplies(prev => ({ ...prev, [parentCommentId]: true }));

      // setReplyContent({ ...replyContent, [commentId]: "" }); // Clear the input field
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
    setMentionedUser({ ...mentionedUser, [commentId]: username === userRedux?.username ? null : username });
    // const replyText = username === userRedux?.username ? "" : `@${username} `;
    setReplyContent({ ...replyContent, [commentId]: "" });
    if (replyDivRef.current[commentId]) {
      replyDivRef.current[commentId]!.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        const inputEl = replyInputRefs.current[commentId];
        if (inputEl) {
          inputEl.focus();
        }
      }, 100);
    }
  };
  
  const handleRemoveMention = (commentId: string) => {
    setMentionedUser({ ...mentionedUser, [commentId]: null });
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

  const toggleCommentReportModal = (commentId: string) => {
    if (!isAuthenticated) {
      toast.warning("Please login to do this action");
    }
    setTargetId(commentId);
    setIsOpenCommentReportModal(!isOpenCommentReportModal);
  }

  const handleDelete = async (commentId: string) => {
    setCommentToDelete(commentId);
    setIsConfirmDeleteOpen(true);
  };
  
  const confirmDelete = async () => {
    if (commentToDelete) {
      try {
        dispatch(deleteCommentAction({ commentIds: [commentToDelete] }));
        toast.success("Comment deleted successfully");
      } catch (error) {
        console.error(`Failed to delete comment: ${commentToDelete}`, error);
        toast.error("Failed to delete comment");
      } finally {
        setIsConfirmDeleteOpen(false);
        setCommentToDelete(null);
      }
    }
  };

  const handleEdit = (commentId: string, content: string) => {
    if (!isAuthenticated) {
      toast.warning("Please login to do this action");
      return;
    }
    
    setCommentToEdit({ id: commentId, content });
    setIsEditModalOpen(true);
    
    // Close options menu
    setShowCommentOptions({});
  };

  const handleLike = (commentId: string) => {
    if (!isAuthenticated) {
      toast.warning("Please login to do this action");
      return;
    }
    dispatch(likeCommentAction({ commentId }));
  };

  const handleSaveEdit = async (commentId: string, newContent: string) => {
    try {
      await dispatch(editCommentAction({ commentId, content: newContent }));
      toast.success('Comment updated successfully');
      // Reset edit state
      setIsEditModalOpen(false);
      setCommentToEdit(null);
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
    }
  };

  useEffect(() => {
    // Check if any comments have just received their first reply
    comments.forEach(comment => {
      if (comment.totalReplies === 1 && !expandedReplies[comment.id]) {
        // Automatically expand and fetch replies for comments that just got their first reply
        setExpandedReplies(prev => ({ ...prev, [comment.id]: true }));
        dispatch(fetchCommentReplies({ commentId: comment.id, isAuthenticated }));
      }
    });
  }, [comments]);

  
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

  // Helper function to parse content and highlight mentions
  const renderContentWithMentions = (content: string) => {
    // Regex to match @username patterns at the beginning of a line
    const mentionRegex = /^@([a-zA-Z0-9_]+)/;
    
    // Split content by newlines to preserve formatting
    const lines = content.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Check if the line starts with @username
      const mentionMatch = line.match(mentionRegex);
      
      if (mentionMatch && mentionMatch[1]) {
        const username = mentionMatch[1];
        const restOfLine = line.substring(mentionMatch[0].length);
        
        return (
          <React.Fragment key={lineIndex}>
            <span>
              <span 
                className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/profile/${username}`, '_blank');
                }}
              >
                @{username}
              </span>
              {restOfLine}
            </span>
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }
      
      // Regular line without mention
      return (
        <React.Fragment key={lineIndex}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="mt-4 min-h-screen">
      <div className="flex items-center gap-4 my-2">
        <h2 className="text-xl text-black dark:text-white font-semibold mb-2">{totalComments} comments</h2>
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
        {/* How to use*/}
        <div className="mb-2 text-black dark:text-white ml-auto hover:text-blue-600 dark:hover:text-blue-600">
          <Tooltip 
            text="Press Shift+Enter to break a line"
            position="left"
            maxWidth="220px"
            backgroundColor="#374151"
            textColor="white"
            fontSize="0.875rem"
            delay={200}
            showArrow={true}
          >
            <div className="cursor-help">
              <IoInformationCircleOutline size={24} />
            </div>
          </Tooltip>
        </div>
      </div>
      
      {/* Add comment Input Div */}
      {isAuthenticated ? (
        <div className="flex mb-4 gap-2">
          {/* <img 
            src={userRedux?.avatarUrl || defaultAvatar} 
            alt="avatar" 
            className="w-10 h-10 rounded-full mr-2 cursor-pointer" 
            onClick={() => navigate(`/profile/${userRedux?.username}`)}
          /> */}
          <Avatar
            width='w-10'
            height='h-10'
            avatarUrl={userRedux?.avatarUrl || defaultAvatar}
            usedFrame={userRedux?.usedFrame}
            onClick={() => navigate(`/profile/${userRedux?.username}`)}
          />
          <CustomCommentInput
            onSubmit={(content) => {
              dispatch(addNewComment({ podcastId, content }));
            }}
            placeholder="Add a comment..."
            maxLength={2000}
          />
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
            {/* <img 
              src={comment.user.avatarUrl || defaultAvatar} 
              alt="avatar" 
              className="w-8 h-8 rounded-full mr-2 cursor-pointer" 
              onClick={() => navigate(`/profile/${comment.user.username}`)}
            /> */}
            <Avatar
              width='w-8'
              height='h-8'
              avatarUrl={comment.user.avatarUrl || defaultAvatar}
              usedFrame={comment.user.usedFrame}
              onClick={() => navigate(`/profile/${comment.user.username}`)}
            />
            <span 
              className="text-base font-medium text-gray-800 dark:text-gray-200 cursor-pointer"
              onClick={() => navigate(`/profile/${comment.user.username}`)}
            >
              @{comment.user.username}
            </span>
            {comment.lastModified ? (
              <span className="ml-auto text-black dark:text-white">Edited {formatLastUpdatedFromNow(comment.lastModified)}</span>
            ) : (
              <span className="ml-auto text-black dark:text-white">{formatLastUpdatedFromNow(comment.timestamp)}</span>
            )}
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
                        onClick={() => handleEdit(comment.id, comment.content)}>
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
                      onClick={() => toggleCommentReportModal(comment.id)} 
                      >
                        <FaFlag className="inline-block mb-1 mr-2" />
                        Report
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <pre 
            id={`comment-${comment.id}`} 
            className={`text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap ${expandedComments[comment.id] ? '' : 'line-clamp-5'}`} 
            style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            {renderContentWithMentions(comment.content)}
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
                {/* <img 
                  src={reply.user.avatarUrl || defaultAvatar} 
                  alt="avatar" 
                  className="w-8 h-8 rounded-full mr-2 cursor-pointer" 
                  onClick={() => navigate(`/profile/${reply.user.username}`)}
                /> */}
                <Avatar
                  width='w-8'
                  height='h-8'
                  avatarUrl={reply.user.avatarUrl || defaultAvatar}
                  usedFrame={reply.user.usedFrame}
                  onClick={() => navigate(`/profile/${reply.user.username}`)}
                />
                <span 
                  className="text-base font-medium text-gray-800 dark:text-gray-200 cursor-pointer"
                  onClick={() => navigate(`/profile/${reply.user.username}`)}
                >
                  @{reply.user.username}
                </span>
                {reply.lastModified ? (
                  <span className="ml-auto text-black dark:text-white">Edited {formatLastUpdatedFromNow(reply.lastModified)}</span>
                ) : (
                  <span className="ml-auto text-black dark:text-white">{formatLastUpdatedFromNow(reply.timestamp)}</span>
                )}

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
                            onClick={() => handleEdit(reply.id, reply.content)}>
                              <MdEdit className="inline-block mb-1 mr-2" />
                              Edit
                          </li>
                          <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                            onClick={() => handleDelete(reply.id)}>
                              <RiDeleteBin6Line className="inline-block mb-1 mr-2" />
                              Delete
                          </li>
                        </>
                      ) : (
                        <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                          onClick={() => toggleCommentReportModal(reply.id)}>
                            <FaFlag className="inline-block mb-1 mr-2" />
                            Report
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <pre 
                className="text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap" 
                style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                {renderContentWithMentions(reply.content)}
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
                  {/* <img src={userRedux?.avatarUrl || defaultAvatar} alt="avatar" className="w-10 h-10 rounded-full mr-2" /> */}
                  <Avatar
                    width='w-10'
                    height='h-10'
                    avatarUrl={userRedux?.avatarUrl || defaultAvatar}
                    usedFrame={userRedux?.usedFrame}
                    onClick={() => navigate(`/profile/${userRedux?.username}`)}
                  />
                  <CustomCommentInput
                    onSubmit={(content) => {
                      handleReplySubmit(reply.id, content);
                    }}
                    placeholder="Add a reply..."
                    maxLength={2000}
                    mentionedUser={mentionedUser[reply.id]}
                    onRemoveMention={() => handleRemoveMention(reply.id)}
                    autoFocus
                  />
                </div>
              )}

            </div>
          ))}

          {/* Reply a comment Input Div */}
          {(replyingTo === comment.id && isAuthenticated) && (
            <div className="flex mt-4 ml-4 gap-2" ref={(el) => (replyDivRef.current[comment.id] = el)}>
              {/* <img src={userRedux?.avatarUrl || defaultAvatar} alt="avatar" className="w-10 h-10 rounded-full mr-2" /> */}
              <Avatar
                width='w-10'
                height='h-10'
                avatarUrl={userRedux?.avatarUrl || defaultAvatar}
                usedFrame={userRedux?.usedFrame}
                onClick={() => navigate(`/profile/${userRedux?.username}`)}
              />
              <CustomCommentInput
                onSubmit={(content) => {
                  handleReplySubmit(comment.id, content);
                }}
                placeholder="Add a reply..."
                maxLength={2000}
                mentionedUser={mentionedUser[comment.id]}
                onRemoveMention={() => handleRemoveMention(comment.id)}
                autoFocus
              />
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
      {/* Report Modal */}
      <ReportModal
        isOpen={isOpenCommentReportModal}
        onClose={() => toggleCommentReportModal(targetId!)}
        targetId={targetId!}
        reportType={ReportType.C}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        title="Are you sure to delete?"
        onConfirm={confirmDelete}
      />
      {commentToEdit && (
        <EditCommentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          commentId={commentToEdit.id}
          initialContent={commentToEdit.content}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default CommentSection;