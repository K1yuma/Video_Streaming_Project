import React, { useState, useRef, useEffect } from "react";
import { Button, TextInput, Label, Card } from "flowbite-react";
import toast from "react-hot-toast";
import ChatBox from "./ChatBox";

const LiveWatch = () => {
  const [streamName, setStreamName] = useState("mystream");
  const [isWatching, setIsWatching] = useState(false);
  const videoRef = useRef(null);
  const pcRef = useRef(null);

  const stopWatching = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWatching(false);
  };

  const startWatching = async () => {
    try {
      stopWatching(); 

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch(`/api/v1/videos/live/${streamName}/whep`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Content-Type": "application/sdp",
        },
      });

      if (!response.ok) {
        throw new Error("Không tìm thấy luồng livestream này.");
      }

      const answerSdp = await response.text();
      await pc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });

      setIsWatching(true);
      toast.success("Đang xem livestream!");
    } catch (error) {
      console.error("WHEP error:", error);
      toast.error(error.message);
      stopWatching();
    }
  };

  useEffect(() => {
    return () => stopWatching();
  }, []);

  return (
    <div className="w-full mx-auto max-w-[1600px] flex flex-col min-h-screen">
      {/* Control Panel - More compact for mobile */}
      <div className="px-2 mb-4">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="streamNameWatch" value="Tên phòng live" className="mb-1 block text-xs" />
            <TextInput
              id="streamNameWatch"
              placeholder="Nhập tên phòng..."
              value={streamName}
              onChange={(e) => setStreamName(e.target.value)}
              required
              sizing="sm"
            />
          </div>
          <Button onClick={isWatching ? stopWatching : startWatching} color={isWatching ? "gray" : "info"} size="sm">
            {isWatching ? "Dừng xem" : "Xem ngay"}
          </Button>
        </div>
      </div>

      {/* Main Layout: Responsive Grid/Flex */}
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        
        {/* Left/Top Content: Video & Info */}
        <div className="w-full md:w-[60%] lg:w-[70%] xl:w-[75%] flex flex-col gap-3">
          
          {/* Video: Zero margin on mobile portrait */}
          <div className="relative aspect-video bg-black sm:rounded-2xl overflow-hidden shadow-2xl border-b sm:border border-gray-200 dark:border-gray-800">
            <video
              ref={videoRef}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-contain"
            />
            {isWatching && (
              <div className="absolute top-3 left-3 flex items-center bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white z-10 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping mr-2" />
                Trực tiếp
              </div>
            )}
          </div>
          
          {/* Stream Info: Compact for vertical viewing */}
          <div className="px-3 py-3 bg-white dark:bg-gray-800 sm:rounded-2xl border-y sm:border border-gray-100 dark:border-gray-700 shadow-sm">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {streamName || "Phòng livestream"}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-[11px] sm:text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isWatching ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                {isWatching ? "Đang kết nối" : "Ngoại tuyến"}
              </span>
              <span>•</span>
              <span>Giao thức WHEP</span>
            </div>
          </div>
        </div>

        {/* Right/Bottom Content: Chat Box */}
        {/* Constrained height to prevent stretching too far down */}
        <div className="w-full md:w-[40%] lg:w-[30%] xl:w-[25%] h-[500px] md:h-[600px] lg:h-[700px] sticky top-4">
          <ChatBox streamName={streamName} />
        </div>
      </div>
      
      {/* Safe area spacer for mobile */}
      <div className="h-8 md:hidden"></div>
    </div>
  );
};

export default LiveWatch;
