import React, { useState } from "react";
import { TextInput, Button, Card } from "flowbite-react";
import axios from "axios";
import { toast } from "react-hot-toast";

function VideoSearch({ onVideoSelect }) {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);

  const handleSearch = async () => {
    if (!query) {
      toast.error("Please enter a search term");
      return;
    }
    try {
      const response = await axios.get(
        `/api/v1/videos/search?q=${query}`
      );
      setVideos(response.data);
      if (response.data.length === 0) {
        toast.error("No videos found");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error searching for videos");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex space-x-2 mb-8">
        <TextInput
          className="flex-grow"
          placeholder="Search videos by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video) => (
          <Card
            key={video.videoId}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onVideoSelect(video)}
          >
            <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {video.title}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400 line-clamp-2">
              {video.description}
            </p>
            <div className="flex justify-end">
               <Button size="sm" color="info">Watch Now</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default VideoSearch;
