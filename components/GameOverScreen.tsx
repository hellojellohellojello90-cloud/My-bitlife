import React from 'react';
import { Character } from '../types';

interface GameOverScreenProps {
    character: Character;
    onRestart: () => void;
    achievements: string[];
    deathCause: string;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ character, onRestart, achievements, deathCause }) => {
    return (
        <div className="flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg p-8 shadow-2xl animate-fade-in">
            <h2 className="text-4xl font-bold text-red-500 mb-4">Game Over</h2>
            <div className="text-center border-t border-b border-white/20 py-6 my-6 w-full max-w-md">
                <p className="text-2xl font-semibold text-white">{`${character.firstName} ${character.lastName}`}</p>
                <p className="text-lg text-gray-400">Lived to the age of {character.age}</p>
                 <p className="text-md text-gray-400 mt-4 italic">"{deathCause}"</p>
                
                <div className="mt-6 text-left">
                    <h4 className="text-lg font-semibold text-purple-300 text-center mb-2">Achievements Unlocked</h4>
                    {achievements.length > 0 ? (
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                            {achievements.map((ach, index) => <li key={index}>{ach}</li>)}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic text-center">No achievements were unlocked in this life.</p>
                    )}
                </div>
            </div>

            <p className="text-gray-300 mb-8 text-center">Your life has concluded. Would you like to begin another?</p>
            <button
                onClick={onRestart}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300"
            >
                Start a New Life
            </button>
        </div>
    );
};

export default GameOverScreen;