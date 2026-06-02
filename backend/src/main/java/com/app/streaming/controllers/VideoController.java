package com.app.streaming.controllers;

import com.app.streaming.AppConstants;
import com.app.streaming.entities.Video;
import com.app.streaming.payload.CustomMessage;
import com.app.streaming.services.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;
import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/v1/videos")
@CrossOrigin("*")
public class VideoController {

    @Autowired
    private VideoService videoService;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${files.video.hls}")
    private String HLS_DIR_NAME;
    
    private String HLS_DIR;

    @PostConstruct
    public void init() {
        String[] possiblePaths = {
            HLS_DIR_NAME,
            "../" + HLS_DIR_NAME,
            "backend/" + HLS_DIR_NAME
        };

        for (String p : possiblePaths) {
            File f = new File(p);
            if (f.exists() && f.isDirectory()) {
                // Check if this directory contains any subdirectories (videoId folders)
                String[] list = f.list();
                if (list != null && list.length > 0) {
                    HLS_DIR = f.getAbsolutePath();
                    System.out.println("====== HLS DIRECTORY FOUND (with content): " + HLS_DIR + " ======");
                    break;
                }
                // If it's the first one that exists, keep it as fallback
                if (HLS_DIR == null) {
                    HLS_DIR = f.getAbsolutePath();
                }
            }
        }
        
        if (HLS_DIR == null) {
            HLS_DIR = new File(HLS_DIR_NAME).getAbsolutePath();
        }
        System.out.println("====== HLS DIRECTORY SELECTED: " + HLS_DIR + " ======");
    }

    @PostMapping("/live/{streamName}/{type}")
    public ResponseEntity<String> proxyLive(
            @PathVariable("streamName") String streamName,
            @PathVariable("type") String type,
            @RequestBody String sdp
    ) {
        // Đổi về localhost để chắc chắn kết nối được trên Windows
        String mediaMtxUrl = "http://localhost:8889/" + streamName + "/" + type;
        try {
            HttpHeaders newHeaders = new HttpHeaders();
            newHeaders.setContentType(MediaType.parseMediaType("application/sdp"));
            
            HttpEntity<String> entity = new HttpEntity<>(sdp, newHeaders);
            ResponseEntity<String> response = restTemplate.exchange(mediaMtxUrl, HttpMethod.POST, entity, String.class);
            
            // Fix "chunked, chunked" error by stripping hop-by-hop headers
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.addAll(response.getHeaders());
            responseHeaders.remove(HttpHeaders.TRANSFER_ENCODING);
            responseHeaders.remove(HttpHeaders.CONNECTION);
            
            return new ResponseEntity<>(response.getBody(), responseHeaders, response.getStatusCode());
        } catch (Exception e) {
            System.err.println("MediaMTX Proxy Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("MediaMTX connection failed: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description
    ){
        Video video = new Video();
        video.setTitle(title);
        video.setDescription(description);
        video.setVideoId(UUID.randomUUID().toString());

        Video saveVideo = videoService.saveVideo(video, file);
        if (saveVideo != null) {
            return ResponseEntity.ok(saveVideo);
        } else {
            return ResponseEntity.ok(new CustomMessage("Video Upload Failed", false));
        }
    }

    @GetMapping()
    public List<Video> getAllVideos() {
        return videoService.getAllVideos();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Video>> searchVideos(@RequestParam(name = "q", defaultValue = "") String query) {
        return ResponseEntity.ok(videoService.searchVideos(query));
    }

    @GetMapping("/search/exact/{title}")
    public ResponseEntity<Video> getVideoByTitle(@PathVariable String title) {
        return ResponseEntity.ok(videoService.getVideoByTitle(title));
    }

    @GetMapping("/stream/{videoId}")
    public ResponseEntity<Resource> stream(@PathVariable("videoId") String videoId){
        Video video = videoService.getVideoById(videoId);
        String contentType = video.getContentType();
        String filePath = video.getFilePath();
        Resource resource = new FileSystemResource(filePath);
        if (contentType == null){
            contentType = "application/octet-stream";
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @GetMapping("/stream/range/{videoId}")
    public ResponseEntity<Resource> streamVideoRange(
            @PathVariable("videoId") String videoId,
            @RequestHeader(value="Range", required = false) String range
    ){
        Video video = videoService.getVideoById(videoId);
        Path path = Paths.get(video.getFilePath());
        Resource resource = new FileSystemResource(path);
        String contentType = video.getContentType();
        if (contentType == null){
            contentType = "application/octet-stream";
        }

        long fileLength = path.toFile().length();
        if (range == null){
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        }

        long rangeStart;
        long rangeEnd;
        String[] ranges = range.replace("bytes=", "").split("-");
        rangeStart = Long.parseLong(ranges[0]);
        rangeEnd = rangeStart + AppConstants.CHUNK_SIZE;
        if (rangeEnd >= fileLength){
            rangeEnd = fileLength - 1;
        }

        try (InputStream inputStream = Files.newInputStream(path)) {
            long skip = inputStream.skip(rangeStart);
            long contentLength = rangeEnd - rangeStart + 1;
            byte[] data = new byte[(int) contentLength];
            int read = inputStream.read(data, 0, data.length);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Range", "bytes " + rangeStart + "-" + rangeEnd + "/" + fileLength);
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("X-Content-Type-Options", "nosniff");
            headers.setContentLength(contentLength);

            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .headers(headers)
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(new ByteArrayResource(data));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{videoId}/{segment}.ts")
    public ResponseEntity<Resource> serveSegment(
            @PathVariable("videoId") String videoId,
            @PathVariable("segment") String segment
    ){
        Path path = Paths.get(HLS_DIR, videoId, segment + ".ts");
        if (!Files.exists(path)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Resource resource = new FileSystemResource(path);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "video/MP2T")
                .body(resource);
    }

    @GetMapping("/{videoId}/master.m3u8")
    public ResponseEntity<Resource> serveMasterFile(@PathVariable("videoId") String videoId) {
        Path path = Paths.get(HLS_DIR, videoId, "master.m3u8");
        if (!Files.exists(path)){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Resource resource = new FileSystemResource(path);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.apple.mpegurl")
                .body(resource);
    }
}
