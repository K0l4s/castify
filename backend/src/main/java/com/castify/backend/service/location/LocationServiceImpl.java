package com.castify.backend.service.location;

import com.castify.backend.entity.location.CityEntity;
import com.castify.backend.entity.location.DistrictEntity;
import com.castify.backend.entity.location.WardEntity;
import com.castify.backend.repository.CityRepository;
import com.castify.backend.repository.DistrictRepository;
import com.castify.backend.repository.WardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationServiceImpl implements ILocationService{
    @Autowired
    private CityRepository cityRepository;
    @Autowired
    private DistrictRepository districtRepository;
    @Autowired
    private WardRepository wardRepository;
    @Override
    public List<CityEntity> getAllCities(){
        return cityRepository.findAll();
    }
    @Override
    public List<DistrictEntity> getDistrictsByCity(String cityId){
        return districtRepository.findAllByCity_Id(cityId);
    }
    @Override
    public List<WardEntity> getWardsByDistrict(String districtId){
        return wardRepository.findAllByDistrict_Id(districtId);
    }
}
