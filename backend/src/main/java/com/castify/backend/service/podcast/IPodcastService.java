package com.castify.backend.service.podcast;

import com.castify.backend.models.podcast.CreatePodcastModel;
import com.castify.backend.models.podcast.PodcastModel;

import java.util.List;
import java.util.Map;

public interface IPodcastService {
    PodcastModel createPodcast(CreatePodcastModel createPodcastModel, String videoPath);
    Map<String, Object> getAllSelfPodcasts(int page, int size, Integer minViews,
                                           Integer minComments, String sortByViews,
                                           String sortByComments, String sortByCreatedDay);
}
