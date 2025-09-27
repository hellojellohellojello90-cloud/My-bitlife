import React, { useState } from 'react';
import { CharacterCreationData, Gender, Sexuality } from '../types';

interface CharacterCreationScreenProps {
    onStart: (data: CharacterCreationData) => void;
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


const CharacterCreationScreen: React.FC<CharacterCreationScreenProps> = ({ onStart }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState<Gender>('Female');
    const [sexuality, setSexuality] = useState<Sexuality>('Straight');
    const [hasParents, setHasParents] = useState(true);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) {
            setError('First and last name are required.');
            return;
        }
        setError('');
        onStart({ firstName, lastName, gender, sexuality, hasParents });
    };

    const inputStyle = "w-full px-4 py-2 bg-black/30 border border-white/20 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition";
    const labelStyle = "block mb-1 text-sm font-medium text-gray-400";

    return (
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 shadow-2xl animate-fade-in w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Create Your Character</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="firstName" className={labelStyle}>First Name</label>
                        <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputStyle} />
                    </div>
                     <div>
                        <label htmlFor="lastName" className={labelStyle}>Last Name</label>
                        <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={inputStyle} />
                    </div>
                </div>
                <div>
                    <label htmlFor="gender" className={labelStyle}>Gender</label>
                    <select id="gender" value={gender} onChange={e => setGender(e.target.value as Gender)} className={inputStyle}>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Non-Binary</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="sexuality" className={labelStyle}>Sexuality</label>
                    <select id="sexuality" value={sexuality} onChange={e => setSexuality(e.target.value as Sexuality)} className={inputStyle}>
                        <option>Straight</option>
                        <option>Gay</option>
                        <option>Bisexual</option>
                        <option>Asexual</option>
                    </select>
                </div>
                <div className="pt-2 flex justify-center">
                   <AnimatedToggle enabled={hasParents} setEnabled={setHasParents} label="Start with Parents?" />
                </div>
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <div className="pt-4">
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
                        Begin Life
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CharacterCreationScreen;
