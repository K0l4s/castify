package com.castify.backend.service.search;


import com.castify.backend.repository.SearchHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchCleanupService {

    private final SearchHistoryRepository searchHistoryRepository;

    // Cleanup old search history every day at 2 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldSearchHistory() {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90); // Keep 90 days
            searchHistoryRepository.deleteByLastSearchedBefore(cutoffDate);
            log.info("Cleaned up search history older than 90 days");
        } catch (Exception e) {
            log.error("Error during search history cleanup", e);
        }
    }
}