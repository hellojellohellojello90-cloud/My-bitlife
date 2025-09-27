import React, { useState, useEffect } from 'react';
import { Character } from '../types';
import * as geminiService from '../services/geminiService';
import { FaPhone, FaSpinner } from 'react-icons/fa';

interface CallScreenProps {
    contactName: string;
    character: Character;
    onHangUp: () => void;
}

const CallScreen: React.FC<CallScreenProps> = ({ contactName, character, onHangUp }) => {
    const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'error'>('ringing');
    const [callContent, setCallContent] = useState('');

    useEffect(() => {
        const initiateCall = async () => {
            // Simulate ringing for 2-3 seconds
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 2000));
            
            try {
                const content = await geminiService.generateCallContent(character, contactName);
                setCallContent(content);
                setCallStatus('connected');
            } catch (err) {
                setCallContent("The call could not be connected.");
                setCallStatus('error');
            }
        };

        initiateCall();
    }, [character, contactName]);

    return (
        <div className="absolute inset-0 bg-gray-900 z-20 flex flex-col items-center justify-between p-8 text-white">
            <div /> 
            
            <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-purple-500 rounded-full flex items-center justify-center text-6xl mb-4 animate-pulse">
                    {contactName.charAt(0)}
                </div>
                <h2 className="text-3xl font-bold">{contactName}</h2>
                
                {callStatus === 'ringing' && <p className="text-gray-400 mt-2 flex items-center gap-2"><FaSpinner className="animate-spin" /> Calling...</p>}
                
                {(callStatus === 'connected' || callStatus === 'error') && (
                    <div className="mt-6 p-4 bg-black/20 rounded-lg max-w-xs animate-fade-in">
                        <p className="italic">"{callContent}"</p>
                    </div>
                )}
            </div>

            <button
                onClick={onHangUp}
                className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-3xl transform transition-transform hover:scale-110"
                aria-label="Hang Up"
            >
                <FaPhone className="transform rotate-[135deg]" />
            </button>
        </div>
    );
};

export default CallScreen;
