import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Comment } from '../../models/CommentModel';
import { addComment, getPodcastComments, likeComment } from '../../services/CommentService';

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

export const addNewComment = createAsyncThunk(
  'comments/addNewComment',
  async ({ podcastId, content }: { podcastId: string; content: string }) => {
    const response = await addComment({ podcastId, content });
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
        const { content, currentPage, totalPage } = action.payload;
        state.comments = [...state.comments, ...content];
        state.hasMore = currentPage < totalPage - 1;
        state.page = currentPage;
        state.loading = false;
      })
      .addCase(fetchComments.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addNewComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        state.comments = [action.payload, ...state.comments];
      })
      .addCase(likeCommentAction.fulfilled, (state, action: PayloadAction<{ commentId: string, liked: boolean }>) => {
        const { commentId, liked } = action.payload;
        const comment = state.comments.find(comment => comment.id === commentId);
        if (comment) {
          comment.liked = liked;
          comment.totalLikes += liked ? 1 : -1;
        }
      });
  },
});

export const { resetComments } = commentsSlice.actions;
export default commentsSlice.reducer;