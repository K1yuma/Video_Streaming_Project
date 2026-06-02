import { useState } from "react";
import "./App.css";
import VideoUpload from "./components/VideoUpload";
import { Toaster, toast } from "react-hot-toast";
import VideoPlayer from "./components/VideoPlayer";
import VideoSearch from "./components/VideoSearch";
import LiveBroadcast from "./components/LiveBroadcast";
import LiveWatch from "./components/LiveWatch";
import { Navbar, Button, Dropdown } from "flowbite-react";

function App() {
  const [activeTab, setActiveTab] = useState("search");
  const [currentVideo, setCurrentVideo] = useState({
    id: "b8adfab4-f5e4-47e9-ac5f-f888c67186d6",
    title: "Video mặc định"
  });

  const handleVideoSelect = (video) => {
    // video lúc này là một Object chứa videoId và title
    if (video && video.videoId) {
      setCurrentVideo({
        id: video.videoId,
        title: video.title || "Video không tiêu đề"
      });
      setActiveTab("watch");
      toast.success(`Đang phát: ${video.title || 'Video đã chọn'}`);
    } else {
      console.error("Dữ liệu video không hợp lệ:", video);
      toast.error("Không thể phát video này");
    }
  };

  const navItems = [
    { key: 'search', label: 'Tìm kiếm', color: 'info' },
    { key: 'watch', label: 'Xem', color: 'info' },
    { key: 'upload', label: 'Tải lên', color: 'info' },
    { key: 'live', label: 'Phát trực tiếp', color: 'failure' },
    { key: 'watch-live', label: 'Xem Live', color: 'info' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-center" />
      
      {/* Navigation Bar */}
      <Navbar fluid rounded className="border-b dark:border-gray-700 sticky top-0 z-50 px-2 sm:px-4">
        <Navbar.Brand>
          <span className="self-center whitespace-nowrap text-lg sm:text-xl font-bold dark:text-white text-blue-600">
            StreamFlow
          </span>
        </Navbar.Brand>
        
        {/* Mobile Dropdown Menu */}
        <div className="flex md:hidden order-2">
          <Dropdown
            label={navItems.find(i => i.key === activeTab)?.label || "Menu"}
            color={navItems.find(i => i.key === activeTab)?.color || "gray"}
            size="sm"
          >
            {navItems.map(item => (
              <Dropdown.Item key={item.key} onClick={() => setActiveTab(item.key)}>
                {item.label}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>

        {/* Desktop Menu */}
        <Navbar.Collapse className="hidden md:flex">
          <div className="flex space-x-2">
            {navItems.map(item => (
              <Button 
                key={item.key}
                size="sm"
                color={activeTab === item.key ? item.color : 'gray'} 
                onClick={() => setActiveTab(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </Navbar.Collapse>
      </Navbar>

      <main className="w-full max-w-[1600px] mx-auto py-4 sm:py-8 px-2 sm:px-6">
        <header className="mb-6 sm:mb-8 text-center sm:text-left px-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-gray-100 capitalize">
            {activeTab === 'watch' ? 'Đang phát video' : activeTab.replace('-', ' ')}
          </h1>
        </header>

        {/* Tab Content */}
        <section className="w-full">
          {activeTab === "search" && (
            <VideoSearch onVideoSelect={handleVideoSelect} />
          )}

          {activeTab === "watch" && (
            <div className="flex flex-col items-center space-y-4">
               <div className="w-full aspect-video shadow-2xl rounded-xl overflow-hidden border dark:border-gray-700 bg-black">
                  {currentVideo.id ? (
                    <VideoPlayer
                      key={currentVideo.id} // Thêm key để React ép load lại trình phát khi ID thay đổi
                      src={`/api/v1/videos/${currentVideo.id}/master.m3u8`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">Chưa chọn video</div>
                  )}
               </div>
               <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentVideo.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">ID: <span className="font-mono">{currentVideo.id}</span></p>
               </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="flex justify-center px-2">
              <div className="w-full max-w-2xl">
                <VideoUpload />
              </div>
            </div>
          )}

          {activeTab === "live" && (
            <LiveBroadcast />
          )}

          {activeTab === "watch-live" && (
            <LiveWatch />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
