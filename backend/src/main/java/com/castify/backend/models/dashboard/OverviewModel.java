package com.castify.backend.models.dashboard;

import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.models.user.BasicUserModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OverviewModel {
    private List<BasicUserModel> newUsers = new ArrayList<>();
//    private List<BasicUserModel> activeUsers = new ArrayList<>();
    private List<PodcastModel> newPodcasts = new ArrayList<>();
    private long totalUsers;
    private long totalPodcasts;
    private long totalLikes;
    private long totalComments;
//    private long totalViews;
//    private long totalReportsAwait;
}
