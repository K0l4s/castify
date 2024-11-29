package com.castify.backend.service.podcast;

import com.castify.backend.models.PageDTO;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.podcast.CreatePodcastModel;
import com.castify.backend.models.podcast.PodcastModel;

import java.util.List;
import java.util.Map;

public interface IPodcastService {
    PodcastModel createPodcast(CreatePodcastModel createPodcastModel);
    Map<String, Object> getAllSelfPodcasts(int page, int size, Integer minViews,
                                           Integer minComments, String sortByViews,
                                           String sortByComments, String sortByCreatedDay);
    PodcastModel getPodcastById(String id);
    PodcastModel getPodcastByIdAnonymous(String id);
    String toggleLikeOnPodcast(String id) throws Exception;
    PageDTO<PodcastModel> getRecentPodcasts(int page, int size);
}
