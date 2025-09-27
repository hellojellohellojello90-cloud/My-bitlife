import React, { useState, useEffect, useRef } from 'react';
import { Character, CharacterStats, Relationship, Job } from '../types';
import { FaSkullCrossbones, FaTimes, FaRandom, FaBolt, FaPlus, FaClone, FaLevelUpAlt, FaRegHandPaper, FaAngleDoubleUp, FaMoneyBillWave, FaUsers } from 'react-icons/fa';

interface AdminPanelProps {
    character: Character;
    isGodModeActive: boolean;
    onClose: () => void;
    onUpdateCharacter: (updatedFields: Partial<Character>) => void;
    onKillRelationship: (relationshipName: string) => void;
    onTriggerCustomEvent: (prompt: string) => void;
    onSetGodMode: (isActive: boolean) => void;
    onTriggerChaosEvent: () => void;
    onAddRelationship: (relationship: Relationship) => void;
    isGrounded: boolean;
    onUnground: () => void;
}

const AnimatedToggle: React.FC<{ enabled: boolean; setEnabled: (enabled: boolean) => void; label: string }> = ({ enabled, setEnabled, label }) => (
    <div className="flex items-center">
        <span className="mr-3 text-sm font-medium text-gray-300">{label}</span>
        <label className="inline-flex relative items-center cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={() => setEnabled(!enabled)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
    </div>
);

const AdminPanel: React.FC<AdminPanelProps> = ({
    character,
    isGodModeActive,
    onClose,
    onUpdateCharacter,
    onKillRelationship,
    onTriggerCustomEvent,
    onSetGodMode,
    onTriggerChaosEvent,
    onAddRelationship,
    isGrounded,
    onUnground,
}) => {
    const [stats, setStats] = useState<CharacterStats>(character.stats);
    const [age, setAge] = useState<number>(character.age);
    const [money, setMoney] = useState<number>(character.money);
    const [job, setJob] = useState<Job>(character.job || { title: '', salary: 0 });
    const [relationships, setRelationships] = useState<Relationship[]>(character.relationships);
    const [followers, setFollowers] = useState<number>(character.followers);
    const [customEventPrompt, setCustomEventPrompt] = useState('');
    const [newRelName, setNewRelName] = useState('');
    const [newRelType, setNewRelType] = useState('');

    const panelRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 300 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });


    useEffect(() => {
        setStats(character.stats);
        setAge(character.age);
        setMoney(character.money);
        setJob(character.job || { title: '', salary: 0 });
        setRelationships(character.relationships);
        setFollowers(character.followers);
    }, [character]);

    const handleStatChange = (stat: keyof CharacterStats, value: string) => {
        const numValue = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
        setStats(prev => ({ ...prev, [stat]: numValue }));
    };

    const handleApplyStats = () => onUpdateCharacter({ stats });
    const handleApplyAge = () => onUpdateCharacter({ age });
    const handleApplyCareer = () => onUpdateCharacter({ money, job: job.title ? job : null });
    const handleApplyFollowers = () => onUpdateCharacter({ followers });

    const handleRelationshipQualityChange = (name: string, value: string) => {
        const quality = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
        const updatedRelationships = relationships.map(r => r.name === name ? { ...r, quality } : r);
        setRelationships(updatedRelationships);
        onUpdateCharacter({ relationships: updatedRelationships });
    };

    const handleTriggerEvent = () => {
        if (customEventPrompt.trim()) {
            onTriggerCustomEvent(customEventPrompt);
        }
    };
    
    // Feral handlers
    const handleRandomizeStats = () => {
        const newStats: CharacterStats = {
            health: Math.floor(Math.random() * 101),
            happiness: Math.floor(Math.random() * 101),
            intelligence: Math.floor(Math.random() * 101),
            looks: Math.floor(Math.random() * 101),
        };
        onUpdateCharacter({ stats: newStats });
    };

    const handleInstantPromotion = () => {
        const insaneJobs = [
            { title: 'Supreme World Leader', salary: 1000000 },
            { title: 'Lead Space-Whale Biologist', salary: 750000 },
            { title: 'Professional Pillow Fort Architect', salary: 300000 },
            { title: 'CEO of The Internet', salary: 5000000 },
        ];
        const newJob = insaneJobs[Math.floor(Math.random() * insaneJobs.length)];
        onUpdateCharacter({ job: newJob });
    };

    const handleCloneRelationship = (relToClone: Relationship) => {
        const newClone: Relationship = {
            ...relToClone,
            name: `${relToClone.name} (Clone)`,
            quality: Math.max(0, relToClone.quality - 20)
        };
        onAddRelationship(newClone);
    };

    const handleSummonRelationship = () => {
        if (newRelName.trim() && newRelType.trim()) {
            const newRel: Relationship = {
                name: newRelName,
                type: newRelType,
                quality: Math.floor(Math.random() * 81) + 10
            };
            onAddRelationship(newRel);
            setNewRelName('');
            setNewRelType('');
        }
    }

    // Super Cheats
    const handleMaxStats = () => {
        onUpdateCharacter({ stats: { health: 100, happiness: 100, intelligence: 100, looks: 100 } });
    };
    const handleGetRich = () => {
        onUpdateCharacter({ money: (character.money || 0) + 1000000 });
    };
    
    // Drag handlers
    const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if ((e.target as HTMLElement).closest('button, input, textarea, label, [type="range"]')) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const onMouseUp = () => setIsDragging(false);

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging]);
    
    const inputStyle = "w-full px-2 py-1 bg-black/40 border border-white/20 rounded-md focus:ring-1 focus:ring-purple-500 focus:outline-none transition text-sm";
    const buttonStyle = "w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded-md shadow-md transition-transform transform hover:scale-105 text-sm";
    const sectionTitleStyle = "text-lg font-bold text-purple-300 border-b border-white/10 pb-1 mb-3";

    return (
        <div
            ref={panelRef}
            className="fixed bg-gray-900/80 backdrop-blur-md border-2 border-purple-500 rounded-lg shadow-2xl w-full max-w-md z-50 animate-pulse-glow"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
            <div onMouseDown={onMouseDown} className="bg-black/30 p-2 flex justify-between items-center cursor-move rounded-t-lg border-b-2 border-purple-500 shadow-lg shadow-purple-500/30">
                <h2 className="text-xl font-bold text-purple-300 tracking-widest" style={{ textShadow: '0 0 5px #a855f7' }}>REALITY EDITOR v6.6.6</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-red-500"><FaTimes size={20}/></button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
                {/* Forbidden Actions */}
                <section>
                    <h3 className={sectionTitleStyle}>Forbidden Actions</h3>
                    <div className="space-y-2">
                        <button onClick={onTriggerChaosEvent} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center animate-pulse">
                            <FaBolt className="mr-2" /> UNLEASH CHAOS
                        </button>
                        {isGrounded && (
                             <button onClick={onUnground} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center justify-center">
                                <FaRegHandPaper className="mr-2" /> PARDON FROM GROUNDING
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-center">Warning: May cause existential dread, paradoxes, or squirrels.</p>
                </section>

                 {/* Super Cheats */}
                <section>
                    <h3 className={sectionTitleStyle}>Super Cheats</h3>
                    <div className="grid grid-cols-2 gap-2">
                         <button onClick={handleMaxStats} className={`${buttonStyle} bg-yellow-600 hover:bg-yellow-700 flex items-center justify-center`}>
                            <FaAngleDoubleUp className="mr-2"/> Max Stats
                        </button>
                         <button onClick={handleGetRich} className={`${buttonStyle} bg-green-600 hover:bg-green-700 flex items-center justify-center`}>
                            <FaMoneyBillWave className="mr-2"/> Add $1M
                        </button>
                    </div>
                </section>

                {/* God Mode */}
                <section>
                    <h3 className={sectionTitleStyle}>God Mode</h3>
                    <AnimatedToggle enabled={isGodModeActive} setEnabled={onSetGodMode} label="Activate God Mode" />
                    <p className="text-xs text-gray-400 mt-1">Prevents stats from decreasing and makes you immortal.</p>
                </section>

                {/* Stats Editor */}
                <section>
                    <h3 className={sectionTitleStyle}>Stats Editor</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {(Object.keys(stats) as Array<keyof CharacterStats>).map((key) => (
                            <div key={key}>
                                <label className="capitalize text-sm text-gray-400">{key}</label>
                                <input type="number" value={stats[key]} onChange={e => handleStatChange(key, e.target.value)} className={inputStyle} />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                         <button onClick={handleApplyStats} className={`${buttonStyle}`}>Apply Stats</button>
                         <button onClick={handleRandomizeStats} className={`${buttonStyle} bg-yellow-600 hover:bg-yellow-700 flex items-center justify-center`}>
                            <FaRandom className="mr-2"/> Randomize
                        </button>
                    </div>
                </section>
                
                {/* Social Editor */}
                <section>
                     <h3 className={sectionTitleStyle}>Social Editor</h3>
                     <div className="flex items-center gap-4">
                        <div className="flex-grow">
                             <label className="text-sm text-gray-400 flex items-center gap-2"><FaUsers /> Set Followers</label>
                             <input type="number" value={followers} onChange={e => setFollowers(Math.max(0, parseInt(e.target.value, 10) || 0))} className={inputStyle} />
                        </div>
                        <button onClick={handleApplyFollowers} className={`self-end ${buttonStyle} flex-shrink-0 w-auto`}>Set</button>
                     </div>
                </section>

                {/* Age Editor */}
                <section>
                     <h3 className={sectionTitleStyle}>Age Editor</h3>
                     <div className="flex items-center gap-4">
                        <div className="flex-grow">
                             <label className="text-sm text-gray-400">Set Age</label>
                             <input type="number" value={age} onChange={e => setAge(Math.max(0, parseInt(e.target.value, 10) || 0))} className={inputStyle} />
                        </div>
                        <button onClick={handleApplyAge} className={`self-end ${buttonStyle} flex-shrink-0 w-auto`}>Set</button>
                     </div>
                </section>
                
                {/* Career & Wealth */}
                <section>
                    <h3 className={sectionTitleStyle}>Wealth & Career</h3>
                     <div className="grid grid-cols-1 gap-2">
                         <div>
                            <label className="text-sm text-gray-400">Wealth</label>
                            <input type="number" value={money} onChange={e => setMoney(parseInt(e.target.value, 10) || 0)} className={inputStyle} />
                         </div>
                          <div>
                            <label className="text-sm text-gray-400">Job Title</label>
                            <input type="text" value={job.title} onChange={e => setJob(prev => ({...prev, title: e.target.value}))} className={inputStyle} />
                         </div>
                          <div>
                            <label className="text-sm text-gray-400">Salary</label>
                            <input type="number" value={job.salary} onChange={e => setJob(prev => ({...prev, salary: parseInt(e.target.value, 10) || 0}))} className={inputStyle} />
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <button onClick={handleApplyCareer} className={`${buttonStyle}`}>Apply Career</button>
                        <button onClick={handleInstantPromotion} className={`${buttonStyle} bg-blue-600 hover:bg-blue-700 flex items-center justify-center`}>
                            <FaLevelUpAlt className="mr-2" /> Promote
                        </button>
                    </div>
                </section>

                {/* Relationship Editor */}
                <section>
                    <h3 className={sectionTitleStyle}>Relationship Editor</h3>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                        {relationships.map(rel => (
                            <div key={rel.name} className="flex items-center gap-2 p-2 bg-black/20 rounded-md">
                               <button onClick={() => onKillRelationship(rel.name)} title="Kill" className="text-red-500 hover:text-red-400 p-1"><FaSkullCrossbones /></button>
                               <button onClick={() => handleCloneRelationship(rel)} title="Clone" className="text-green-500 hover:text-green-400 p-1"><FaClone /></button>
                               <div className="flex-grow">
                                   <p className="text-sm font-semibold">{rel.name} <span className="text-xs text-purple-400">({rel.type})</span></p>
                                   <div className="flex items-center gap-2">
                                       <input type="range" min="0" max="100" value={rel.quality} onChange={e => handleRelationshipQualityChange(rel.name, e.target.value)} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                       <span className="text-xs font-bold w-8 text-right">{rel.quality}</span>
                                   </div>
                               </div>
                            </div>
                        ))}
                         {relationships.length === 0 && <p className="text-gray-500 text-sm italic">No relationships to manage.</p>}
                    </div>
                </section>
                
                 {/* Summon Being */}
                <section>
                    <h3 className={sectionTitleStyle}>Summon Being</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Name..." value={newRelName} onChange={e => setNewRelName(e.target.value)} className={inputStyle} />
                        <input type="text" placeholder="Type (e.g. Rival)" value={newRelType} onChange={e => setNewRelType(e.target.value)} className={inputStyle} />
                    </div>
                    <button onClick={handleSummonRelationship} className={`mt-2 ${buttonStyle} flex items-center justify-center`}>
                        <FaPlus className="mr-2" /> Summon
                    </button>
                </section>

                {/* Custom Event */}
                <section>
                     <h3 className={sectionTitleStyle}>Trigger Custom Event</h3>
                     <textarea
                        value={customEventPrompt}
                        onChange={e => setCustomEventPrompt(e.target.value)}
                        placeholder="e.g., Win the lottery, get into a car accident..."
                        className={`${inputStyle} h-20 resize-none`}
                     />
                     <button onClick={handleTriggerEvent} className={`mt-2 ${buttonStyle}`}>Trigger Event</button>
                </section>
            </div>
        </div>
    );
};

export default AdminPanel;