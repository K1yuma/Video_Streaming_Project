# 🎥 Simple Video Streaming App

A basic full-stack project to learn about video streaming and live broadcasting. This project uses Spring Boot for the backend and React for the frontend.

---

## Features

### Video Upload & Watch
- **Upload Videos:** A simple way to upload MP4 files.
- **Video Streaming:** Uses FFmpeg to convert videos to HLS format so they can be played in chunks.
- **Basic Playback:** Watch uploaded videos using a standard web player.

### Live Stream & Chat
- **Live Streaming:** Basic integration with MediaMTX to see how live streams work.
- **Chat Box:** A simple room where you can send messages while watching a stream.

---

## Tech Stack

- **Backend:** Java 21 & Spring Boot
- **Frontend:** React (Vite) & Tailwind CSS
- **Database:** MySQL
- **Video Processing:** FFmpeg
- **Media Server:** MediaMTX

---

## How to Run

### 1. Prerequisites
- Install **Java 21**.
- Install **Node.js**.
- Install **MySQL**.
- Install **FFmpeg** (make sure it's in your system path).

### 2. Setup Database
- Create a MySQL database and update the credentials in `backend/src/main/resources/application.properties`.

### 3. Run the Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 4. Run the Frontend
```bash
cd frontend/video-streaming-app
npm install
npm run dev
```

### 5. Run the Media Server (For Live)
```bash
cd mediamtx
./mediamtx.exe
```

---

## Project Structure

- `backend/`: Spring Boot code for handling uploads and chat.
- `frontend/`: React components for the user interface.
- `mediamtx/`: A tool used to handle the live stream data.
- `videos/`: Folder where uploaded videos are kept.

---

## Contact
Your Name - [your.email@example.com]

Project Link: [https://github.com/your-username/Video-Streaming-Project]
