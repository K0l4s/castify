package com.castify.backend.service.setting;

import com.castify.backend.entity.BannerEntity;

import java.util.List;

public interface ISettingService {
    List<BannerEntity> getAll();

    void saveBanner(BannerEntity banner);

    void deleteBanner(String id);

    BannerEntity updateBanner(BannerEntity banner);
}
