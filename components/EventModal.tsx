import React from 'react';
import { LifeEvent, Choice } from '../types';

interface EventModalProps {
    event: LifeEvent;
    onChoice: (choice: Choice) => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onChoice }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gray-900/70 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-lg mx-auto transform transition-all">
                <h2 className="text-xl sm:text-2xl font-bold text-purple-300 mb-4">{event.eventText}</h2>
                <div className="space-y-3 mt-6">
                    {event.choices.map((choice, index) => (
                        <button
                            key={index}
                            onClick={() => onChoice(choice)}
                            className="w-full bg-black/30 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 text-left"
                        >
                            {choice.choiceText}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventModal;