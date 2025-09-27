import React, { useState, useRef, useEffect } from 'react';
import { Character, Relationship } from '../types';
import { FaHeart, FaSmile, FaBrain, FaStar, FaBriefcase, FaUserFriends, FaDollarSign, FaUsers, FaEllipsisH, FaComment, FaHandHoldingHeart, FaHandHoldingUsd, FaGift } from 'react-icons/fa';

interface CharacterSheetProps {
    character: Character;
    onInteract: (relationshipName: string, interactionType: 'spend-time' | 'deep-talk' | 'ask-money' | 'give-gift') => void;
}

const StatBar: React.FC<{ value: number; label: string; icon: React.ReactNode; color: 'red' | 'yellow' | 'blue' | 'pink' | 'purple' }> = ({ value, label, icon, color }) => {
    const colorClasses = {
        red: { text: 'text-red-400', bg: 'bg-red-500' },
        yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500' },
        blue: { text: 'text-blue-400', bg: 'bg-blue-500' },
        pink: { text: 'text-pink-400', bg: 'bg-pink-500' },
        purple: { text: 'text-purple-400', bg: 'bg-purple-500' },
    };
    const classes = colorClasses[color];

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                    {label !== "Quality" && <span className={`${classes.text} mr-2`}>{icon}</span>}
                    <span className="text-sm font-medium text-gray-300">{label}</span>
                </div>
                <span className="text-sm font-bold text-white">{value}%</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2.5">
                <div className={`${classes.bg} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );
};

const RelationshipInteractionMenu: React.FC<{
    character: Character;
    relationship: Relationship;
    onInteract: CharacterSheetProps['onInteract'];
    onClose: () => void;
}> = ({ character, relationship, onInteract, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);
    
    const isParent = relationship.type === 'Parent';
    const canAskForMoney = isParent && character.age < 18;
    const canAffordGift = character.money >= 50;

    return (
        <div ref={menuRef} className="absolute right-0 top-10 mt-1 w-48 bg-gray-800 border border-purple-500 rounded-md shadow-lg z-20 animate-fade-in">
            <button onClick={() => { onInteract(relationship.name, 'spend-time'); onClose(); }} className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-purple-600"><FaHandHoldingHeart className="mr-2"/> Spend Time</button>
            <button onClick={() => { onInteract(relationship.name, 'deep-talk'); onClose(); }} className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-purple-600"><FaComment className="mr-2"/> Deep Conversation</button>
            <button onClick={() => { onInteract(relationship.name, 'give-gift'); onClose(); }} disabled={!canAffordGift} className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-purple-600 disabled:text-gray-500 disabled:cursor-not-allowed"><FaGift className="mr-2"/> Give Gift ($50)</button>
            {isParent && <button onClick={() => { onInteract(relationship.name, 'ask-money'); onClose(); }} disabled={!canAskForMoney} className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-purple-600 disabled:text-gray-500 disabled:cursor-not-allowed"><FaHandHoldingUsd className="mr-2"/> Ask for Money</button>}
        </div>
    );
};


const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, onInteract }) => {
    const [activeInteraction, setActiveInteraction] = useState<string | null>(null);

    if (!character) return null;

    const { firstName, lastName, age, stats, money, job, relationships, followers } = character;

    return (
        <div className="w-full lg:w-80 bg-black/30 backdrop-blur-sm rounded-lg p-4 shadow-2xl flex-shrink-0 space-y-5">
            <div className="text-center border-b border-white/10 pb-3">
                <h2 className="text-2xl font-bold text-white">{`${firstName} ${lastName}`}</h2>
                <p className="text-md text-gray-400">Age: {age}</p>
            </div>

            <div className="space-y-3">
                <StatBar value={stats.health} label="Health" icon={<FaHeart />} color="red" />
                <StatBar value={stats.happiness} label="Happiness" icon={<FaSmile />} color="yellow" />
                <StatBar value={stats.intelligence} label="Intelligence" icon={<FaBrain />} color="blue" />
                <StatBar value={stats.looks} label="Looks" icon={<FaStar />} color="pink" />
            </div>

            <div className="pt-2">
                <div className="flex items-center text-lg text-green-400">
                    <FaDollarSign className="mr-2" />
                    <span className="font-bold">Wealth:</span>
                    <span className="ml-2">${money.toLocaleString()}</span>
                </div>
                 <div className="flex items-center text-lg text-purple-400 mt-2">
                    <FaBriefcase className="mr-2" />
                    <span className="font-bold">Career:</span>
                     <span className="ml-2">{job?.title || 'Unemployed'}</span>
                </div>
                 <div className="flex items-center text-lg text-blue-400 mt-2">
                    <FaUsers className="mr-2" />
                    <span className="font-bold">Followers:</span>
                     <span className="ml-2">{followers.toLocaleString()}</span>
                </div>
            </div>

             <div className="pt-2">
                <h3 className="text-lg font-bold text-purple-300 flex items-center mb-2"><FaUserFriends className="mr-2" /> Relationships</h3>
                 <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {relationships.length > 0 ? relationships.map(rel => (
                        <div key={rel.name} className="bg-black/20 p-2 rounded-md">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-semibold">{rel.name} <span className="text-xs text-gray-400">({rel.type})</span></p>
                                <div className="relative">
                                    <button onClick={() => setActiveInteraction(activeInteraction === rel.name ? null : rel.name)} className="text-gray-400 hover:text-white">
                                        <FaEllipsisH />
                                    </button>
                                     {activeInteraction === rel.name && <RelationshipInteractionMenu character={character} relationship={rel} onInteract={onInteract} onClose={() => setActiveInteraction(null)} />}
                                </div>
                            </div>
                             <StatBar value={rel.quality} label="Quality" icon={<></>} color="purple" />
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500 italic">No significant relationships.</p>
                    )}
                 </div>
            </div>

        </div>
    );
};

export default CharacterSheet;