package com.castify.backend.service.podcast;

import com.castify.backend.models.podcast.CreatePodcastModel;
import com.castify.backend.models.podcast.PodcastModel;

public interface IPodcastService {
    PodcastModel createPodcast(CreatePodcastModel createPodcastModel);
}
