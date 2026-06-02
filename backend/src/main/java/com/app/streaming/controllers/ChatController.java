/**
 * Controller xử lý các yêu cầu liên quan đến phòng chat và trạng thái livestream.
 * Quản lý danh sách tin nhắn và kiểm tra tính khả dụng của luồng live.
 */
package com.app.streaming.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin("*")
public class ChatController {

    private final Map<String, List<Map<String, Object>>> chatHistory = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/{streamName}/send")
    public List<Map<String, Object>> sendMessage(
            @PathVariable String streamName,
            @RequestBody Map<String, Object> message
    ) {
        chatHistory.putIfAbsent(streamName, Collections.synchronizedList(new ArrayList<>()));
        List<Map<String, Object>> messages = chatHistory.get(streamName);
        
        message.put("id", UUID.randomUUID().toString());
        message.put("serverTime", System.currentTimeMillis());
        messages.add(message);
        
        if (messages.size() > 50) {
            messages.remove(0);
        }
        
        return messages;
    }

    @GetMapping("/{streamName}/messages")
    public List<Map<String, Object>> getMessages(@PathVariable String streamName) {
        return chatHistory.getOrDefault(streamName, new ArrayList<>());
    }

    // API kiểm tra trạng thái live từ MediaMTX
    @GetMapping("/{streamName}/status")
    public Map<String, Object> getStreamStatus(@PathVariable String streamName) {
        Map<String, Object> status = new HashMap<>();
        try {
            // Gọi tới API của MediaMTX (đã bật ở bước 1)
            String url = "http://localhost:9997/v3/paths/list";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("items")) {
                List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
                boolean isLive = items.stream().anyMatch(item -> 
                    streamName.equals(item.get("name")) && item.get("ready") != null && (boolean)item.get("ready")
                );
                status.put("live", isLive);
            } else {
                status.put("live", false);
            }
        } catch (Exception e) {
            status.put("live", false);
            status.put("error", e.getMessage());
        }
        return status;
    }
}
