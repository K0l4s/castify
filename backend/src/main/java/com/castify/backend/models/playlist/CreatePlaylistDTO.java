package com.castify.backend.models.playlist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreatePlaylistDTO {
    @NotBlank(message = "Playlist name must not be blank")
    private String name;

    private String description;

    private List<String> podcastId;

    private boolean publish;
}
