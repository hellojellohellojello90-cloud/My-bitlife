import React from 'react';
import { GameSummary } from '../types';
import { FaSkull } from 'react-icons/fa';

interface GameHistoryProps {
    history: GameSummary[];
    onClearHistory: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ history, onClearHistory }) => {
    if (history.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 bg-black/30 backdrop-blur-sm rounded-lg p-6 shadow-2xl w-full max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-2xl font-bold text-white">Previous Lives</h3>
                 <button 
                    onClick={onClearHistory}
                    className="bg-red-600/50 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-lg shadow-md transition-colors"
                 >
                    Clear History
                 </button>
            </div>
           
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {history.map((game) => (
                    <div key={game.id} className="bg-black/20 p-4 rounded-lg border border-white/10 animate-fade-in">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xl font-bold text-purple-400">{game.firstName} {game.lastName}</p>
                                <p className="text-sm text-gray-400">Lived to age {game.age}</p>
                            </div>
                            <div className="flex items-center text-red-400 text-sm">
                                <FaSkull className="mr-2" />
                                <span>Deceased</span>
                            </div>
                        </div>
                        <p className="text-sm italic text-gray-500 mt-2">"{game.deathCause}"</p>
                        {game.achievements.length > 0 && (
                             <div className="mt-3 pt-3 border-t border-white/10">
                                <h5 className="text-xs font-bold text-gray-300 mb-1">ACHIEVEMENTS</h5>
                                <div className="flex flex-wrap gap-2">
                                    {game.achievements.map((ach, index) => (
                                        <span key={index} className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2 py-1 rounded-full">
                                            {ach}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameHistory;
