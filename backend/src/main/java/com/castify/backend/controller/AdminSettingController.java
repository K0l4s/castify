package com.castify.backend.controller;


import com.castify.backend.entity.BannerEntity;
import com.castify.backend.service.setting.ISettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1/admin/setting")
@RestController
public class AdminSettingController {
    @Autowired
    private ISettingService settingService;
    @GetMapping("")
    private ResponseEntity<?> getAll(
    ) throws Exception {
        try{
                return ResponseEntity.ok(
                        settingService.getAll());
        }
        catch (Exception ex){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex);
        }
    }
    @PutMapping("")
    private ResponseEntity<?> update(@RequestBody BannerEntity bannerEntity) throws Exception {
        try{
            return ResponseEntity.ok(settingService.updateBanner(bannerEntity));
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex);

        }
    }
    @DeleteMapping("")
    private ResponseEntity<?> delete(@RequestParam String id) throws Exception {
        try{
            settingService.deleteBanner(id);
            return ResponseEntity.ok("Delete success!");
        }catch(Exception ex){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex);

        }
    }
}
