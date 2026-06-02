package com.app.streaming.repositories;

import com.app.streaming.entities.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video,String> {
    Optional<Video> findByTitle(String title);
    List<Video> findByTitleContainingIgnoreCase(String title);
    Optional<Video> findByVideoId(String videoId);

}
