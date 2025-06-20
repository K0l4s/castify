package com.castify.backend.service.blacklist;

public interface IBlacklistService {
    int calculateViolationScore(String text);

    String censorViolationWords(String text);
}
