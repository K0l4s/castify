package com.castify.backend.service.podcast;

import com.castify.backend.models.PodcastModel;

public interface IPodcastService {
    PodcastModel createPodcast(PodcastModel podcastModel);
}
