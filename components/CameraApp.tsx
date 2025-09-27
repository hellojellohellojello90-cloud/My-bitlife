import React, { useState } from 'react';
import { LifeEvent } from '../types';
import * as geminiService from '../services/geminiService';
import { FaArrowLeft, FaCamera, FaSpinner } from 'react-icons/fa';

interface CameraAppProps {
    onBack: () => void;
    onTriggerEvent: (event: LifeEvent) => void;
}

const CameraApp: React.FC<CameraAppProps> = ({ onBack, onTriggerEvent }) => {
    const [isTakingPhoto, setIsTakingPhoto] = useState(false);

    const handleTakePhoto = async () => {
        setIsTakingPhoto(true);
        try {
            const event = await geminiService.generateCameraEvent();
            onTriggerEvent(event);
        } catch (error) {
            console.error("Failed to generate camera event", error);
            // Optionally, handle the error in the UI
            setIsTakingPhoto(false); // Reset state on error
        }
        // Don't reset isTakingPhoto here, as the modal will close
    };

    return (
        <div className="h-full flex flex-col bg-black text-white">
             <header className="bg-black/50 backdrop-blur-sm p-3 flex items-center flex-shrink-0 z-10 absolute top-0 left-0 right-0">
                <button onClick={onBack} className="text-xl mr-4"><FaArrowLeft /></button>
                <h1 className="text-lg font-bold flex items-center gap-2"><FaCamera /> Camera</h1>
            </header>
            
            {/* Fake camera view */}
            <div className="flex-grow bg-gray-700 flex items-center justify-center text-gray-500">
                <p>Camera View</p>
            </div>

            <footer className="h-24 bg-black/80 flex items-center justify-center">
                <button
                    onClick={handleTakePhoto}
                    disabled={isTakingPhoto}
                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-gray-500 disabled:opacity-50"
                    aria-label="Take Photo"
                >
                    {isTakingPhoto && <FaSpinner className="animate-spin text-black text-2xl" />}
                </button>
            </footer>
        </div>
    );
};

export default CameraApp;