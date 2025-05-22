import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Comment } from '../../models/CommentModel';
import { addComment, deleteComment, editComment, getCommentReplies, getPodcastComments, likeComment } from '../../services/CommentService';

interface CommentsState {
  comments: Comment[];
  loading: boolean;
  hasMore: boolean;
  page: number;
}

const initialState: CommentsState = {
  comments: [],
  loading: false,
  hasMore: true,
  page: 0,
};

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ podcastId, page, sortBy, isAuthenticated }: { podcastId: string; page: number; sortBy: string; isAuthenticated: boolean }) => {
    const response = await getPodcastComments(podcastId, page, 10, sortBy, isAuthenticated);
    return response;
  }
);

export const fetchCommentReplies = createAsyncThunk(
  'comments/fetchCommentReplies',
  async ({ commentId, isAuthenticated } : {commentId: string, isAuthenticated: boolean}) => {
    const response = await getCommentReplies(commentId, isAuthenticated);
    return { commentId, replies: response };
  }
);

export const addNewComment = createAsyncThunk(
  'comments/addNewComment',
  async ({ podcastId, content, parentId, mentionedUser }: { podcastId: string; content: string; parentId?: string; mentionedUser?: string }) => {
    const response = await addComment({ podcastId, content, parentId, mentionedUser });
    return response;
  }
);

export const likeCommentAction = createAsyncThunk(
  'comments/likeComment',
  async ({ commentId }: { commentId: string }) => {
    const response = await likeComment(commentId);
    return { commentId, liked: response };
  }
);

export const deleteCommentAction = createAsyncThunk(
  'comments/deleteComment',
  async ({ commentIds }: { commentIds: string[] }) => {
    await deleteComment(commentIds);
    return commentIds;
  }
);

export const editCommentAction = createAsyncThunk(
  'comments/editComment',
  async ({ commentId, content }: { commentId: string; content: string }) => {
    const response = await editComment(commentId, content);
    return response;
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    resetComments: (state) => {
      state.comments = [];
      state.page = 0;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<any>) => {
        const { content, currentPage, totalPages } = action.payload;
        const newComments = content.filter(
          (newComment: Comment) => !state.comments.some((comment) => comment.id === newComment.id)
        );
        state.comments = [...state.comments, ...newComments];
        state.hasMore = currentPage < totalPages - 1;
        state.page = currentPage;
        state.loading = false;
      })
      .addCase(fetchComments.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchCommentReplies.fulfilled, (state, action: PayloadAction<{ commentId: string, replies: Comment[] }>) => {
        const { commentId, replies } = action.payload;
        const comment = state.comments.find(comment => comment.id === commentId);
        if (comment) {
          comment.replies = replies;
        }
      })
      .addCase(addNewComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        if (action.payload.parentId) {
          const parentComment = state.comments.find(comment => comment.id === action.payload.parentId);
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies = [...parentComment.replies, action.payload];
            parentComment.totalReplies = (parentComment.totalReplies || 0) + 1;
            // console.log("Updated parent comment:", parentComment); // Log to check updates
          }
        } else {
          state.comments = [action.payload, ...state.comments];
        }
        // console.log("Updated state:", state); // Log to check the entire state
      })
      .addCase(likeCommentAction.fulfilled, (state, action: PayloadAction<{ commentId: string, liked: boolean }>) => {
        const { commentId, liked } = action.payload;
        const comment = state.comments.find(comment => comment.id === commentId);
        if (comment) {
          comment.liked = liked;
          comment.totalLikes += liked ? 1 : -1;
        } else {
          state.comments.forEach(comment => {
            const reply = comment.replies?.find(reply => reply.id === commentId);
            if (reply) {
              reply.liked = liked;
              reply.totalLikes += liked ? 1 : -1;
            }
          });
        }
      })
      .addCase(deleteCommentAction.fulfilled, (state, action: PayloadAction<string[]>) => {
        const commentIds = action.payload;
        state.comments = state.comments.filter(comment => !commentIds.includes(comment.id));
        state.comments.forEach(comment => {
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => !commentIds.includes(reply.id));
          }
        });
      })
      .addCase(editCommentAction.fulfilled, (state, action) => {
        const editedComment = action.payload;
        
        // Find and update the comment in the main comments list
        const commentIndex = state.comments.findIndex(c => c.id === editedComment.id);
        if (commentIndex !== -1) {
          state.comments[commentIndex] = {
            ...state.comments[commentIndex],
            content: editedComment.content,
            lastModified: editedComment.lastModified
          };
        } else {
          // If not found in main list, check all replies
          state.comments.forEach(comment => {
            if (comment.replies) {
              const replyIndex = comment.replies.findIndex(r => r.id === editedComment.id);
              if (replyIndex !== -1) {
                comment.replies[replyIndex] = {
                  ...comment.replies[replyIndex],
                  content: editedComment.content,
                  lastModified: editedComment.lastModified
                };
              }
            }
          });
        }
      });
  },
});

export const { resetComments } = commentsSlice.actions;
export default commentsSlice.reducer;