import React, { useState } from 'react';
import { Character } from '../types';
import { FaArrowLeft, FaCog, FaImages, FaSpinner } from 'react-icons/fa';
import * as geminiService from '../services/geminiService';

interface SettingsAppProps {
    onBack: () => void;
    onUpdateCharacter: (updatedFields: Partial<Character>) => void;
    character: Character;
}

const SettingsApp: React.FC<SettingsAppProps> = ({ onBack, onUpdateCharacter }) => {
    const [view, setView] = useState<'main' | 'wallpapers'>('main');
    const [wallpapers, setWallpapers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateWallpapers = async () => {
        setIsLoading(true);
        setWallpapers([]);
        try {
            const generated = await geminiService.generateWallpapers();
            setWallpapers(generated);
        } catch (error) {
            console.error("Failed to generate wallpapers", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetWallpaper = (url: string) => {
        onUpdateCharacter({ wallpaperUrl: url });
        // Optionally, show a confirmation and go back
        setView('main');
    };

    const renderMain = () => (
        <div className="p-4">
            <div
                onClick={() => setView('wallpapers')}
                className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
            >
                <p className="font-semibold flex items-center gap-2"><FaImages/> Wallpapers</p>
                <p className="text-sm text-gray-400">Customize your home screen</p>
            </div>
        </div>
    );

    const renderWallpapers = () => (
        <div className="p-4 flex-grow overflow-y-auto">
            <button
                onClick={handleGenerateWallpapers}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-500 mb-4"
            >
                {isLoading ? <FaSpinner className="animate-spin" /> : <FaImages />}
                Generate New Wallpapers
            </button>

            {isLoading && wallpapers.length === 0 && (
                 <div className="flex justify-center items-center h-3/4">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-purple-400 mx-auto" />
                        <p className="mt-2 text-gray-400">Conjuring pixels...</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {wallpapers.map((url, index) => (
                    <div key={index} className="relative aspect-[9/16] bg-gray-700 rounded-lg overflow-hidden group">
                        <img src={url} alt={`Wallpaper ${index + 1}`} className="w-full h-full object-cover" />
                        <div 
                            onClick={() => handleSetWallpaper(url)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <span className="text-white font-bold text-sm bg-purple-600 px-3 py-1 rounded-full">Apply</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col bg-gray-800 text-white">
            <header className="bg-gray-900/70 backdrop-blur-sm p-3 flex items-center flex-shrink-0">
                <button onClick={view === 'main' ? onBack : () => setView('main')} className="text-xl mr-4"><FaArrowLeft /></button>
                <h1 className="text-lg font-bold flex items-center gap-2"><FaCog /> {view === 'main' ? 'Settings' : 'Wallpapers'}</h1>
            </header>
            
            {view === 'main' ? renderMain() : renderWallpapers()}
        </div>
    );
};

export default SettingsApp;