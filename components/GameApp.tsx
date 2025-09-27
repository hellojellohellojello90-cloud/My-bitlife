import React, { useState } from 'react';
import { LifeEvent } from '../types';
import * as geminiService from '../services/geminiService';
import { FaArrowLeft, FaGamepad, FaSpinner, FaPlay } from 'react-icons/fa';

interface GameAppProps {
    onBack: () => void;
    onTriggerEvent: (event: LifeEvent) => void;
}

const GameApp: React.FC<GameAppProps> = ({ onBack, onTriggerEvent }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handlePlayGame = async () => {
        setIsLoading(true);
        try {
            const event = await geminiService.generateGameEvent();
            onTriggerEvent(event);
        } catch (error) {
            console.error("Failed to generate game event", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-800 text-white">
            <header className="bg-gray-900/70 backdrop-blur-sm p-3 flex items-center flex-shrink-0">
                <button onClick={onBack} className="text-xl mr-4"><FaArrowLeft /></button>
                <h1 className="text-lg font-bold flex items-center gap-2"><FaGamepad /> Games</h1>
            </header>
            
            <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                <FaGamepad className="text-8xl text-purple-400 mb-4" />
                <h2 className="text-2xl font-bold">Generic Mobile Game</h2>
                <p className="text-gray-400 mb-8">A highly addictive, microtransaction-fueled time-waster.</p>

                <button
                    onClick={handlePlayGame}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-500 w-48"
                >
                    {isLoading ? <FaSpinner className="animate-spin" /> : <><FaPlay /> Play Game</>}
                </button>
            </main>
        </div>
    );
};

export default GameApp;