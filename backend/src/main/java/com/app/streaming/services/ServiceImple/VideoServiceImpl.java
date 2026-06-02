package com.app.streaming.services.ServiceImple;

import com.app.streaming.entities.Video;
import com.app.streaming.repositories.VideoRepository;
import com.app.streaming.services.VideoService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
@Service
public class VideoServiceImpl implements VideoService {

    @Autowired
    private VideoRepository videoRepository;
    @Value("${files.video}")
    String DIR;

    @Value("${files.video.hls}")
    String HLS_DIR;

    @PostConstruct
    public void init() {
        // Resolve DIR (videos/)
        String[] possibleVideoPaths = { DIR, "../" + DIR, "backend/" + DIR };
        for (String p : possibleVideoPaths) {
            File f = new File(p);
            if (f.exists() && f.isDirectory() && (f.list() != null && f.list().length > 0)) {
                DIR = f.getAbsolutePath();
                break;
            }
        }
        
        // Resolve HLS_DIR (videos_hls/)
        String[] possibleHlsPaths = { HLS_DIR, "../" + HLS_DIR, "backend/" + HLS_DIR };
        for (String p : possibleHlsPaths) {
            File f = new File(p);
            if (f.exists() && f.isDirectory() && (f.list() != null && f.list().length > 0)) {
                HLS_DIR = f.getAbsolutePath();
                break;
            }
        }

        System.out.println("Resolved Video DIR: " + new File(DIR).getAbsolutePath());
        System.out.println("Resolved HLS DIR: " + new File(HLS_DIR).getAbsolutePath());

        try {
            Files.createDirectories(Paths.get(HLS_DIR));
            Files.createDirectories(Paths.get(DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not create directories", e);
        }
    }

    @Override
    public Video saveVideo(Video video, MultipartFile file) {

        try {

            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();
            InputStream inputStream = file.getInputStream();

            System.out.println(fileName + " |||||| " + contentType + " ||||||| " + inputStream);
            // Folder Create

            String cleanFileName = StringUtils.cleanPath(fileName);
            String cleanFolder = StringUtils.cleanPath(DIR);
            Path path = Paths.get(cleanFolder, cleanFileName);

            // Copy the file to the specified path+
            Files.copy(inputStream,path, StandardCopyOption.REPLACE_EXISTING);

            // Video meta data
            video.setContentType(contentType);
            video.setFilePath(path.toString());

            // Save the video to the database
            Video save = videoRepository.save(video);

            //processing Video
            processVideo(save.getVideoId());

            //delete actual file and database entry  if exception occurs


            return save;


        }catch (IOException e){
            e.printStackTrace();
            return null;
        }

    }

    @Override
    public Video getVideoById(String videoId) {
        Video video = videoRepository.findByVideoId(videoId).orElseThrow(() -> new RuntimeException("Video Not Found"));
        return video;
    }

    @Override
    public Video getVideoByTitle(String title) {
        return videoRepository.findByTitle(title).orElseThrow(() -> new RuntimeException("Video Not Found with title: " + title));
    }

    @Override
    public List<Video> searchVideos(String title) {
        return videoRepository.findByTitleContainingIgnoreCase(title);
    }

    @Override
    public List<Video> getAllVideos() {

        return videoRepository.findAll();
    }

    @Override
    public void getAll() {

    }

    @Override
    @Async
    public String processVideo(String videoId) {

        System.out.println("Processing video ......");
        Video video = this.getVideoById(videoId);
        String filePath = video.getFilePath();
        //path where to store data :

        Path videoPath = Paths.get(filePath);

        try {
            // ffmpeg Command
            Path outputPath=Paths.get(HLS_DIR,videoId);
            Files.createDirectories(outputPath);

            // Using double quotes and absolute paths for FFmpeg to handle spaces and Windows paths correctly
            String ffmpegCmd = String.format(
                    "ffmpeg -i \"%s\" -c:v libx264 -c:a aac -strict -2 -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename \"%s/segment_%%3d.ts\"  \"%s/master.m3u8\" ",
                    videoPath.toAbsolutePath().toString(), 
                    outputPath.toAbsolutePath().toString().replace("\\", "/"), 
                    outputPath.toAbsolutePath().toString().replace("\\", "/")
            );

            System.out.println(ffmpegCmd);
            
            ProcessBuilder processBuilder;
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                processBuilder = new ProcessBuilder("cmd.exe", "/c", ffmpegCmd);
            } else {
                processBuilder = new ProcessBuilder("/bin/bash", "-c", ffmpegCmd);
            }
            
            processBuilder.inheritIO();
            Process process = processBuilder.start();

            int exit = process.waitFor();
            if (exit != 0) {
                System.err.println("Video processing failed for videoId: " + videoId);
            }

            return videoId;
        } catch (IOException | InterruptedException e) {
            System.err.println("Exception during video processing: " + e.getMessage());
            return null;
        }
    }
}
