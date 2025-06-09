package com.castify.backend.models.search;

import com.castify.backend.models.playlist.PlaylistModel;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.models.user.UserSimple;
import com.castify.backend.models.watchParty.WatchPartyRoomModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchResultModel {
    private String keyword;
    private List<PodcastModel> podcasts;
    private List<UserSimple> users;
    private List<PlaylistModel> playlists;
    private List<WatchPartyRoomModel> watchPartyRooms;
    private long searchDuration;
}