package com.castify.backend.service.podcast;

import com.castify.backend.models.PageDTO;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.podcast.CreatePodcastModel;
import com.castify.backend.models.podcast.EditPodcastDTO;
import com.castify.backend.models.podcast.PodcastModel;

import java.util.List;
import java.util.Map;

public interface IPodcastService {
    PodcastModel createPodcast(CreatePodcastModel createPodcastModel);
    PageDTO<PodcastModel> getAllSelfPodcasts(int page, int size, Integer minViews,
                                           Integer minComments, String sortByViews,
                                           String sortByComments, String sortByCreatedDay);
    PodcastModel getPodcastById(String id) throws Exception;
    PodcastModel getPodcastBySelf(String podcastId) throws Exception;
    PodcastModel getPodcastByIdAnonymous(String id);
    String toggleLikeOnPodcast(String id) throws Exception;
    PageDTO<PodcastModel> getRecentPodcasts(int page, int size);
    PageDTO<PodcastModel> getPodcastsByGenre(String genreId, int page, int size);
    PageDTO<PodcastModel> getSuggestedPodcastsByGenres(List<String> genreIds, String currentPodcastId, int page, int size);
    void incrementPodcastViews(String podcastId);
    PageDTO<PodcastModel> getUserPodcasts(String username, int page, int size, String sortBy) throws Exception;

    PageDTO<PodcastModel> searchPodcast(int page, int size, String keyword) throws Exception;

    void togglePodcastDisplayMode(List<String> podcastIds) throws Exception;
    PodcastModel updatePodcast(String podcastId, EditPodcastDTO editPodcastDTO);
    void deletePodcastsByIds(List<String> podcastIds, boolean isAdmin) throws Exception;
}
