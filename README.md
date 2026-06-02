# 🎥 StreamFlow - Advanced Video Streaming & Live Broadcasting Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Processed-red.svg)](https://ffmpeg.org/)
[![MediaMTX](https://img.shields.io/badge/MediaMTX-Live-lightgrey.svg)](https://github.com/bluenviron/mediamtx)

**StreamFlow** is a comprehensive, full-stack video streaming platform designed for both On-Demand content and Live Broadcasting. Built with a focus on scalability and performance, it leverages modern technologies like Spring Boot, React, and FFmpeg to deliver a seamless streaming experience.

---

## 🌟 Key Features

### 🎞️ Video On-Demand (VOD)
- **High-Efficiency Upload:** Seamlessly upload large video files with robust backend handling.
- **HLS Transcoding:** Automatic conversion of MP4 files into HLS (HTTP Live Streaming) format using FFmpeg, enabling adaptive bitrate streaming.
- **Byte-Range Streaming:** Support for partial content requests, allowing users to seek instantly without downloading the entire file.
- **Video Management:** Full CRUD operations for video metadata, including titles, descriptions, and categorized storage.

### 📡 Live Broadcasting
- **Real-Time Streaming:** Integrated with **MediaMTX** for low-latency RTSP/RTMP/WebRTC/HLS live streaming.
- **Stream Status Monitoring:** Real-time feedback on stream availability and health.
- **Interactive Chat:** Built-in chat system for live broadcasts, allowing viewers to engage in real-time.

### 🎨 Modern UI/UX
- **Responsive Design:** Fully responsive interface built with Tailwind CSS and Flowbite.
- **Advanced Video Player:** Custom player integration using `video.js` and `hls.js` for optimized playback across all browsers.
- **Toasts & Notifications:** Real-time feedback for user actions via `react-hot-toast`.

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3.3.3 (Java 21)
- **Database:** MySQL (Persistence for metadata)
- **ORM:** Spring Data JPA / Hibernate
- **Processing:** FFmpeg (HLS segmenting and transcoding)
- **Messaging:** Custom REST-based Chat implementation

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS, Flowbite
- **Streaming:** HLS.js, Video.js
- **API Client:** Axios

### Infrastructure & Tools
- **Media Server:** MediaMTX (RTSP/RTMP/HLS)
- **Public Tunneling:** Cloudflare Tunnel (for remote testing)
- **Build Tools:** Maven (Backend), NPM (Frontend)

---

## 🚀 Getting Started

### Prerequisites
- **Java 21** installed.
- **Node.js & NPM** installed.
- **MySQL** server running.
- **FFmpeg** installed and added to your system's PATH.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Video-Streaming-Project.git
   cd Video-Streaming-Project
   ```

2. **Backend Setup:**
   - Configure your MySQL credentials in `backend/src/main/resources/application.properties`.
   - Run the backend:
     ```bash
     cd backend
     ./mvnw spring-boot:run
     ```

3. **Frontend Setup:**
   - Install dependencies:
     ```bash
     cd frontend/video-streaming-app
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```

4. **Media Server Setup:**
   - Run the MediaMTX executable:
     ```bash
     cd mediamtx
     ./mediamtx.exe
     ```

---

## 🏗️ Architecture Overview

The system architecture is designed for modularity and high availability:

1.  **Frontend (React):** Communicates with the Spring Boot API for metadata and the MediaMTX server for live stream data.
2.  **Backend (Spring Boot):** Orchestrates video processing tasks, manages the database, and provides chat functionality.
3.  **FFmpeg:** Triggered by the backend to process uploaded videos into HLS segments (`.m3u8` and `.ts` files).
4.  **MediaMTX:** Acts as the ingestion and distribution point for live broadcasts.

---

## 📸 Screenshots

*(Add your project screenshots here)*

---

## 🔮 Future Enhancements
- [ ] User Authentication & Authorization (OAuth2/JWT).
- [ ] Multi-quality adaptive bitrate transcoding (360p, 720p, 1080p).
- [ ] S3/Cloud Storage integration for video assets.
- [ ] Live stream recording and DVR capabilities.

---

## 📧 Contact

Your Name - [your.email@example.com](mailto:your.email@example.com)

Project Link: [https://github.com/your-username/Video-Streaming-Project](https://github.com/your-username/Video-Streaming-Project)

---
*Created as part of a portfolio project to demonstrate full-stack engineering and multimedia processing capabilities.*
