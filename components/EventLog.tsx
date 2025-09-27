import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';

interface EventLogProps {
    log: LogEntry[];
}

const EventLog: React.FC<EventLogProps> = ({ log }) => {
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [log]);

    return (
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4" style={{maxHeight: '60vh'}}>
            <h3 className="text-xl font-bold text-purple-300 border-b border-white/10 pb-2 mb-4 sticky top-0 bg-black/30 backdrop-blur-sm z-10">Life Story</h3>
            {log.map((entry, index) => (
                <div key={index} className="p-3 bg-black/20 rounded-lg shadow-md animate-fade-in">
                    <p className="text-gray-300">{entry.eventText}</p>
                    {entry.choiceText && (
                        <p className="text-sm text-purple-400 mt-2 pt-2 pl-3 border-l-2 border-purple-500">
                            You chose: {entry.choiceText}
                        </p>
                    )}
                </div>
            ))}
            <div ref={logEndRef} />
        </div>
    );
};

export default EventLog;