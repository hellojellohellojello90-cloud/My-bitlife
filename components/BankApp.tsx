import React from 'react';
import { Character } from '../types';
import { FaArrowLeft, FaUniversity } from 'react-icons/fa';

interface BankAppProps {
    onBack: () => void;
    character: Character;
}

const BankApp: React.FC<BankAppProps> = ({ onBack, character }) => {
    return (
        <div className="h-full flex flex-col bg-gray-800 text-white">
            <header className="bg-gray-900/70 backdrop-blur-sm p-3 flex items-center flex-shrink-0">
                <button onClick={onBack} className="text-xl mr-4"><FaArrowLeft /></button>
                <h1 className="text-lg font-bold flex items-center gap-2"><FaUniversity /> Digital Bank</h1>
            </header>

            <main className="flex-grow p-4 overflow-y-auto">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg mb-6 text-center">
                    <p className="text-sm text-white/80">Current Balance</p>
                    <p className="text-4xl font-bold">${character.money.toLocaleString()}</p>
                </div>

                <h2 className="text-xl font-bold text-purple-300 mb-2">Transaction History</h2>
                <div className="space-y-2">
                    {character.transactionHistory.length > 0 ? (
                        character.transactionHistory.map((tx, index) => (
                            <div key={index} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center animate-fade-in">
                                <div>
                                    <p className="font-semibold">{tx.description}</p>
                                    <p className="text-xs text-gray-400">Year: {tx.year}</p>
                                </div>
                                <p className={`font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.amount >= 0 ? `+$${tx.amount.toLocaleString()}` : `-$${(-tx.amount).toLocaleString()}`}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 p-8">No transaction history yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BankApp;