package com.castify.backend.service.location;

import com.castify.backend.entity.location.CityEntity;
import com.castify.backend.entity.location.DistrictEntity;
import com.castify.backend.entity.location.WardEntity;
import com.castify.backend.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public interface ILocationService {

    List<CityEntity> getAllCities();

    List<DistrictEntity> getDistrictsByCity(String cityId);

    List<WardEntity> getWardsByDistrict(String districtId);
}
