package com.castify.backend.service.search;

import com.castify.backend.entity.SearchHistoryEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.repository.SearchHistoryRepository;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SearchServiceImpl implements ISearchService {
    @Autowired
    private SearchHistoryRepository searchHistoryRepository;
    @Autowired
    private IUserService userService = new UserServiceImpl();
    @Override
    public void saveKeyword(String keyword) throws Exception {
        try {
            UserEntity currentUser = userService.getUserByAuthentication();
            SearchHistoryEntity newSearch = new SearchHistoryEntity();
            newSearch.setKeyword(keyword);
            newSearch.setUserId(currentUser.getId());
            searchHistoryRepository.save(newSearch);
        } catch (Exception ignored){

        }
    }
}
