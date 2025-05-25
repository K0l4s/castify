package com.castify.backend.service.setting;

import com.castify.backend.entity.BannerEntity;
import com.castify.backend.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SettingServiceImpl implements ISettingService {
    @Autowired
    private BannerRepository bannerRepository;

    @Override
    public List<BannerEntity> getAll(){
        return bannerRepository.findAll();
    }
    @Override
    public void saveBanner(BannerEntity banner){
        bannerRepository.save(banner);
    }
    @Override
    public void deleteBanner(String id){
        bannerRepository.deleteById(id);
    }
    @Override
    public BannerEntity updateBanner(BannerEntity banner)
    {
        return bannerRepository.save(banner);
    }
}
