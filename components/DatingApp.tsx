import React, { useState, useEffect, useCallback } from 'react';
import { Character, DatingProfile } from '../types';
import * as geminiService from '../services/geminiService';
import { FaArrowLeft, FaHeart, FaTimes, FaUserFriends, FaSpinner, FaBan, FaCheck } from 'react-icons/fa';

interface DatingAppProps {
    character: Character;
    onBack: () => void;
    onBlockRelationship: (name: string) => void;
    onNewPartner: (profile: DatingProfile) => void;
}

const DatingApp: React.FC<DatingAppProps> = ({ character, onBack, onBlockRelationship, onNewPartner }) => {
    const [profiles, setProfiles] = useState<DatingProfile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<'swiping' | 'matches'>('swiping');
    const [matchNotification, setMatchNotification] = useState<DatingProfile | null>(null);

    const fetchProfiles = useCallback(async () => {
        setIsLoading(true);
        try {
            const newProfiles = await geminiService.generateDatingProfiles(character, 5);
            setProfiles(prev => [...prev, ...newProfiles]);
        } catch (error) {
            console.error("Failed to fetch dating profiles:", error);
        } finally {
            setIsLoading(false);
        }
    }, [character]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleSwipe = (liked: boolean) => {
        if (currentIndex >= profiles.length) return;

        const swipedProfile = profiles[currentIndex];

        if (liked) {
            // Guaranteed match on like
            onNewPartner(swipedProfile);
            setMatchNotification(swipedProfile);
        }

        // Move to the next profile
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);

        // Fetch more profiles if we're near the end
        if (nextIndex >= profiles.length - 2) {
            fetchProfiles();
        }
    };
    
    const handleBlock = () => {
        if (currentIndex >= profiles.length) return;
        const profileToBlock = profiles[currentIndex];
        onBlockRelationship(profileToBlock.name);
        
        // Remove from current stack and move to next
        setProfiles(prev => prev.filter(p => p.name !== profileToBlock.name));
        // No need to increment currentIndex as the array has shifted
    };

    const currentProfile = profiles[currentIndex];
    const matches = character.relationships.filter(r => (r.type === 'Match' || r.type === 'Partner') && !r.blocked);

    const renderSwipingView = () => {
        if (isLoading && !currentProfile) {
            return <div className="flex justify-center items-center h-full"><FaSpinner className="animate-spin text-4xl text-purple-400" /></div>;
        }
        if (!currentProfile) {
            return <div className="text-center p-8 text-gray-400">No more profiles right now. Check back later!</div>;
        }
        return (
            <div className="p-4 flex flex-col justify-between h-full">
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg flex-grow flex flex-col">
                    <h3 className="text-2xl font-bold">{currentProfile.name}, <span className="font-light">{currentProfile.age}</span></h3>
                    <p className="text-gray-300 mt-4 italic">"{currentProfile.bio}"</p>
                </div>
                <div className="flex justify-around items-center pt-4 mt-4">
                     <button onClick={handleBlock} className="w-16 h-16 rounded-full bg-gray-600 text-yellow-400 flex items-center justify-center text-2xl transform transition-transform hover:scale-110">
                        <FaBan />
                    </button>
                    <button onClick={() => handleSwipe(false)} className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center text-4xl transform transition-transform hover:scale-110">
                        <FaTimes />
                    </button>
                    <button onClick={() => handleSwipe(true)} className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center text-4xl transform transition-transform hover:scale-110">
                        <FaCheck />
                    </button>
                </div>
            </div>
        );
    };

    const renderMatchesView = () => (
        <div className="p-4 space-y-3">
            {matches.length > 0 ? (
                matches.map(match => (
                    <div key={match.name} className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-bold">{match.name}</p>
                            <p className="text-xs text-purple-400 font-semibold">{match.type}</p>
                        </div>
                        <p className="text-sm text-gray-400">Quality: {match.quality}%</p>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-400 p-8">No matches yet. Keep swiping!</p>
            )}
        </div>
    );
    
     const renderMatchNotification = () => (
        <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center animate-fade-in p-4" onClick={() => setMatchNotification(null)}>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">It's a Match!</h2>
            <p className="text-lg text-white">You and {matchNotification!.name} are now partners!</p>
            <div className="flex items-center gap-4 my-8">
                <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-5xl">{character.firstName.charAt(0)}</div>
                <FaHeart className="text-pink-500 text-4xl animate-pulse" />
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-5xl">{matchNotification!.name.charAt(0)}</div>
            </div>
            <button onClick={() => setMatchNotification(null)} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg">Continue</button>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-800 text-white relative">
            {matchNotification && renderMatchNotification()}
            <header className="bg-gray-900/70 backdrop-blur-sm p-3 flex items-center flex-shrink-0">
                <button onClick={onBack} className="text-xl mr-4"><FaArrowLeft /></button>
                <h1 className="text-lg font-bold flex items-center gap-2"><FaHeart className="text-red-400"/> HeartBeat</h1>
            </header>

            <div className="flex-shrink-0 border-b border-gray-700">
                <nav className="flex">
                    <button onClick={() => setView('swiping')} className={`flex-1 p-3 text-sm font-bold transition-colors ${view === 'swiping' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}>Profiles</button>
                    <button onClick={() => setView('matches')} className={`flex-1 p-3 text-sm font-bold relative transition-colors ${view === 'matches' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}>
                        Partners {matches.length > 0 && `(${matches.length})`}
                    </button>
                </nav>
            </div>

            <main className="flex-grow overflow-y-auto">
                {view === 'swiping' ? renderSwipingView() : renderMatchesView()}
            </main>
        </div>
    );
};

export default DatingApp;