import React, { useState } from 'react';

interface PasscodeModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const PasscodeModal: React.FC<PasscodeModalProps> = ({ onClose, onSuccess }) => {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const correctPasscode = '053930';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode === correctPasscode) {
            onSuccess();
        } else {
            setError('Incorrect passcode.');
            setPasscode('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="relative bg-gray-900/70 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-sm mx-auto">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">&times;</button>
                <h2 className="text-xl font-bold text-center text-purple-300 mb-4">Admin Access</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="passcode" className="block text-sm font-medium text-gray-400 mb-1">Enter Passcode</label>
                        <input
                            id="passcode"
                            type="password"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                    >
                        Enter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasscodeModal;