package com.castify.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "transcript")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TranscriptEntity {
    @Id
    private String id;

    private double start;
    private double end;

    @Column(columnDefinition = "TEXT")
    private String text;

    private String podcastId;

    public TranscriptEntity(double start, double end, String text, String podcastId) {
        this();
        this.start = start;
        this.end = end;
        this.text = text;
        this.podcastId = podcastId;
    }
}
