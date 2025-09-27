import React, { useState } from 'react';
import { FaArrowLeft, FaSearch, FaSpinner } from 'react-icons/fa';
import * as geminiService from '../services/geminiService';

interface BrowserAppProps {
    onBack: () => void;
}

interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

const BrowserApp: React.FC<BrowserAppProps> = ({ onBack }) => {
    const [view, setView] = useState<'home' | 'results'>('home');
    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        setIsLoading(true);
        setView('results');
        const results = await geminiService.generateSimulatedSearchResults(inputValue);
        setSearchResults(results);
        setIsLoading(false);
    };
    
    const goHome = () => {
        setView('home');
        setInputValue('');
        setSearchResults([]);
    };

    const handleBack = () => {
        if (view === 'results') {
            goHome();
        } else {
            onBack();
        }
    };

    const renderResults = () => (
        <div className="h-full flex flex-col bg-white text-black">
             <header className="bg-gray-100 p-2 flex items-center border-b border-gray-300 flex-shrink-0">
                <button onClick={handleBack} className="text-xl text-gray-600 p-2 rounded-full hover:bg-gray-200"><FaArrowLeft /></button>
                <form onSubmit={handleSearch} className="flex-grow mx-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                </form>
            </header>
            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                     <div className="flex justify-center items-center h-full">
                        <FaSpinner className="animate-spin text-4xl text-blue-500" />
                    </div>
                ) : (
                    searchResults.map((result, index) => (
                        <div key={index} className="animate-fade-in">
                            <p className="text-sm text-gray-600 truncate">{result.url}</p>
                            <h3 className="text-lg text-blue-800 hover:underline cursor-pointer">{result.title}</h3>
                            <p className="text-sm text-gray-700">{result.snippet}</p>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
    
    const renderHome = () => (
        <div className="h-full flex flex-col bg-white text-black">
            <header className="bg-gray-100 p-2 flex items-center border-b border-gray-300 flex-shrink-0">
                <button onClick={onBack} className="text-xl text-gray-600 mr-4 p-2 rounded-full hover:bg-gray-200">
                    <FaArrowLeft />
                </button>
                 <div className="flex-grow text-center text-gray-500 text-sm">New Tab</div>
            </header>

            <main className="flex-grow flex flex-col justify-center items-center">
                <div className="text-center -mt-16">
                    <h1 className="text-8xl font-sans font-light">
                        <span className="text-blue-500">G</span>
                        <span className="text-red-500">o</span>
                        <span className="text-yellow-500">o</span>
                        <span className="text-blue-500">g</span>
                        <span className="text-green-500">l</span>
                        <span className="text-red-500">e</span>
                    </h1>
                    <form onSubmit={handleSearch} className="mt-8 w-full max-w-lg px-4">
                        <div className="relative rounded-full shadow-md border border-gray-200">
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <FaSearch />
                            </span>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full py-3 px-12 rounded-full focus:outline-none"
                                placeholder="Search Google or type a URL"
                                autoFocus
                            />
                        </div>
                         <div className="mt-6 flex justify-center gap-4">
                            <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded">
                                Google Search
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );

    return view === 'home' ? renderHome() : renderResults();
};

export default BrowserApp;