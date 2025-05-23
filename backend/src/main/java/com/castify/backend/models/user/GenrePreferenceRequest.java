package com.castify.backend.models.user;

import lombok.Data;

import java.util.List;

@Data
public class GenrePreferenceRequest {
    private List<String> genreIds;
}
