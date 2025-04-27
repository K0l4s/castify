package com.castify.backend.auditing;

import com.castify.backend.entity.BlacklistEntity;
import com.castify.backend.models.blacklist.PosModel;
import com.castify.backend.repository.BlacklistRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.*;

@Component
public class BlacklistImporter implements CommandLineRunner {

    @Autowired
    private BlacklistRepository blacklistRepository;

    @Override
    public void run(String... args) throws Exception {
//        File file = new File("src/main/resources/blacklist.json"); // ← chỉnh path nếu cần
//        ObjectMapper mapper = new ObjectMapper();
//        JsonNode root = mapper.readTree(file);
//
//        Iterator<Map.Entry<String, JsonNode>> fields = root.fields();
//        while (fields.hasNext()) {
//            Map.Entry<String, JsonNode> entry = fields.next();
//            String word = entry.getKey();
//            JsonNode node = entry.getValue();
//
//            BlacklistEntity bl = new BlacklistEntity();
//            bl.setValue(word);
//            bl.setLabel(node.get("label").asInt());
//            bl.setType(node.get("type").asInt());
//
////            Map<String, Integer> posMap = new HashMap<>();
//            List<PosModel> posMap = new ArrayList<>();
//            JsonNode posNode = node.get("pos");
//            if (posNode != null) {
//                Iterator<Map.Entry<String, JsonNode>> posFields = posNode.fields();
//                while (posFields.hasNext()) {
//                    Map.Entry<String, JsonNode> posEntry = posFields.next();
//                    PosModel pos = new PosModel();
//                    pos.setPos(posEntry.getKey());
//                    pos.setLabel(posEntry.getValue().asInt());
//                    posMap.add(pos);
////                    posMap.put(posEntry.getKey(), posEntry.getValue().asInt());
//                }
//            }
//
//            bl.setPos(posMap);
//            blacklistRepository.save(bl);
//        }
//
//        System.out.println("✅ Đã import xong blacklist vào MongoDB");
    }
}
