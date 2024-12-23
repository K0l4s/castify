package com.castify.backend.config;

import com.castify.backend.utils.VNPayUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

public class VNPAYConfig {
    @Value("${vnpay.tmn-code}")
    public String tmnCode;

    @Value("${vnpay.hash-secret}")
    public static String hashSecret;

    @Value("${vnpay.pay-url}")
    public String payUrl;

    @Value("${vnpay.return-url}")
    public String returnUrl;
    private static final Logger logger = LoggerFactory.getLogger(VNPAYConfig.class);



}
