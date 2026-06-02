import React, { useRef, useState, useEffect } from "react";
import { Button, TextInput, Label, Card } from "flowbite-react";
import toast from "react-hot-toast";
import ChatBox from "./ChatBox";

const LiveBroadcast = () => {
  const [streamName, setStreamName] = useState("mystream");
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const initCamera = async () => {
    try {
      if (localStreamRef.current) return localStreamRef.current;
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Không thể truy cập Camera. Hãy kiểm tra quyền truy cập.");
      return null;
    }
  };

  useEffect(() => {
    initCamera();
    return () => {
      // Cleanup when changing tabs
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startStreaming = async () => {
    try {
      const stream = await initCamera();
      if (!stream) return;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch(`/api/v1/videos/live/${streamName}/whip`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Content-Type": "application/sdp",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to connect to MediaMTX WHIP endpoint");
      }

      const answerSdp = await response.text();
      await pc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });

      setIsStreaming(true);
      toast.success("Đang phát trực tiếp!");
    } catch (error) {
      console.error("Error starting stream:", error);
      toast.error("Lỗi khi bắt đầu live: " + error.message);
      stopStreaming();
    }
  };

  const stopStreaming = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setIsStreaming(false);
    toast.info("Đã dừng phát trực tiếp.");
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
      <Card className="mb-6 bg-white dark:bg-gray-800 border-none shadow-md">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <div className="mb-2 block">
              <Label htmlFor="streamName" value="Tên phòng livestream" />
            </div>
            <TextInput
              id="streamName"
              placeholder="e.g. phong-cua-toi"
              value={streamName}
              onChange={(e) => setStreamName(e.target.value)}
              disabled={isStreaming}
              required
            />
          </div>
          <div className="w-full md:w-auto">
            {!isStreaming ? (
              <Button onClick={startStreaming} color="failure" className="w-full px-8">
                Bắt đầu Live
              </Button>
            ) : (
              <Button onClick={stopStreaming} color="gray" className="w-full px-8">
                Dừng Live
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Camera Preview */}
        <div className="lg:w-2/3 xl:w-3/4">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {isStreaming && (
              <div className="absolute top-4 left-4 flex items-center bg-red-600/90 px-3 py-1 rounded-md z-10 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-white animate-ping mr-2" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">Đang phát trực tiếp</span>
              </div>
            )}
            {!isStreaming && (
              <div className="absolute top-4 left-4 flex items-center bg-gray-600/80 px-3 py-1 rounded-md z-10 shadow-lg">
                <span className="text-white text-xs font-bold uppercase tracking-wider">Xem trước Camera</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Bảng điều khiển Live
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Phòng: <span className="font-semibold text-blue-600">{streamName}</span>
                </p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${isStreaming ? 'text-red-500' : 'text-gray-500'}`}>
                  {isStreaming ? "Trạng thái: Trực tiếp" : "Trạng thái: Chờ"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Box */}
        <div className="lg:w-1/3 xl:w-1/4 h-[500px] lg:h-[650px] sticky top-4">
          <ChatBox streamName={streamName} isStreamer={true} />
        </div>
      </div>
    </div>
  );
};

export default LiveBroadcast;
