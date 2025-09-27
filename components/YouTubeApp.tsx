import React, { useState, useEffect } from 'react';
import { Character, YouTubeVideo } from '../types';
import * as geminiService from '../services/geminiService';
import { FaArrowLeft, FaYoutube, FaSpinner } from 'react-icons/fa';

interface YouTubeAppProps {
    onBack: () => void;
    character: Character;
}

const YouTubeApp: React.FC<YouTubeAppProps> = ({ onBack, character }) => {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

    useEffect(() => {
        const fetchFeed = async () => {
            setIsLoading(true);
            try {
                const feed = await geminiService.generateYouTubeFeed(character);
                setVideos(feed);
            } catch (error) {
                console.error("Failed to fetch YouTube feed", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeed();
    }, [character]);

    if (selectedVideo) {
        return (
            <div className="h-full flex flex-col bg-black text-white">
                <header className="bg-gray-900/70 backdrop-blur-sm p-3 flex items-center flex-shrink-0 z-10">
                    <button onClick={() => setSelectedVideo(null)} className="text-xl mr-4"><FaArrowLeft /></button>
                    <h1 className="text-md font-bold truncate">{selectedVideo.title}</h1>
                </header>
                <main className="flex-grow flex flex-col">
                    <div className="aspect-video w-full bg-black">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                            title={selectedVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="p-4 overflow-y-auto">
                        <p className="text-lg font-semibold">{selectedVideo.title}</p>
                    </div>
                </main>
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col bg-gray-800 text-white">
            <header className="bg-gray-900/70 backdrop-blur-sm p-3 flex items-center flex-shrink-0">
                <button onClick={onBack} className="text-xl mr-4"><FaArrowLeft /></button>
                <h1 className="text-lg font-bold flex items-center gap-2"><FaYoutube className="text-red-500" /> YouTube</h1>
            </header>
            <main className="flex-grow p-2 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <FaSpinner className="animate-spin text-4xl text-red-500" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {videos.map(video => (
                            <div key={video.videoId} onClick={() => setSelectedVideo(video)} className="bg-gray-700 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-gray-600 transition-colors">
                                <img src={`https://i3.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} alt={video.title} className="w-32 h-20 object-cover rounded-l-lg flex-shrink-0" />
                                <div className="flex-1 pr-2 py-2">
                                    <p className="font-semibold text-sm line-clamp-3">{video.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default YouTubeApp;
