package com.castify.backend.service.podcastLike;

import com.castify.backend.models.PageDTO;
import com.castify.backend.models.podcast.PodcastModel;

public interface IPodcastLikeService {
    PageDTO<PodcastModel> getLikedPodcastsByUser(int page, int size);
}
