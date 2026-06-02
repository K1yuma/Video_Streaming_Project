package com.app.streaming;

import com.app.streaming.entities.Video;
import com.app.streaming.repositories.VideoRepository;
import com.app.streaming.services.VideoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SearchTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testSearchEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/videos/search").param("q", "test"))
                .andExpect(status().isOk());
    }
}
