package com.castify.backend.config;


import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.user.UserDetailModel;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
       ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setAmbiguityIgnored(true);  // Bỏ qua các sự mơ hồ
        modelMapper.validate();


        return modelMapper;


    }
}
