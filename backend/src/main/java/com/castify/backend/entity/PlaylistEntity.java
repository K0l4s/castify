package com.castify.backend.entity;

import com.castify.backend.enums.PlaylistType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "playlist")
@CompoundIndexes({
        @CompoundIndex(
                name = "unique_watch_later_idx",
                def = "{'owner.$id': 1, 'type': 1}",
                unique = true,
                partialFilter = "{ type: 'WATCH_LATER'}"
        )
})
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlaylistEntity {
    @Id
    private String id;

    private String name;
    private String description;
    private boolean publish; // true: public, false: private
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    @DBRef
    private UserEntity owner;

    private List<PlaylistItem> items;
    private PlaylistType type;
}
