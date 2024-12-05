import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Comment } from '../../models/CommentModel';
import { addComment, getCommentReplies, getPodcastComments, likeComment } from '../../services/CommentService';

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
        state.comments = [...state.comments, ...content];
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
            console.log("Updated parent comment:", parentComment); // Log to check updates
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
      });
  },
});

export const { resetComments } = commentsSlice.actions;
export default commentsSlice.reducer;