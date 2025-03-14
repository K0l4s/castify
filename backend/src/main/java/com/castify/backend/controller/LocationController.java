package com.castify.backend.controller;

import com.castify.backend.entity.location.CityEntity;
import com.castify.backend.entity.location.DistrictEntity;
import com.castify.backend.entity.location.WardEntity;
import com.castify.backend.models.genre.GenreSimple;
import com.castify.backend.service.location.ILocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
public class LocationController {
    @Autowired
    private ILocationService locationService;

    @GetMapping("/cities")
    public ResponseEntity<?> getAllCities() {
        try {
            List<CityEntity> cities = locationService.getAllCities();
            return new ResponseEntity<>(cities, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/wards")
    public ResponseEntity<?> getAllWards(@RequestParam String districtId) {
        try {
            List<WardEntity> wards = locationService.getWardsByDistrict(districtId);
            return new ResponseEntity<>(wards, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/districts")
    public ResponseEntity<?> getAllDistricts(@RequestParam String cityId) {
        try {
            List<DistrictEntity> districts = locationService.getDistrictsByCity(cityId);
            return new ResponseEntity<>(districts, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
