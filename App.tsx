import React, { useState, useEffect, useCallback } from 'react';
import { Character, CharacterCreationData, LifeEvent, LogEntry, Choice, GameSummary, Relationship, ShopItem, Conversation, Message, DatingProfile } from './types';
import * as geminiService from './services/geminiService';
import * as gameLogic from './services/gameLogic';
import { allShopItems } from './components/ShopApp'; // Import all items

import CharacterCreationScreen from './components/CharacterCreationScreen';
import CharacterSheet from './components/CharacterSheet';
import EventLog from './components/EventLog';
import EventModal from './components/EventModal';
import GameOverScreen from './components/GameOverScreen';
import GameHistory from './components/GameHistory';
import AdminPanel from './components/AdminPanel';
import PasscodeModal from './components/PasscodeModal';
import PhoneModal from './components/PhoneModal';
import { FaCog, FaForward, FaSpinner, FaMobileAlt, FaLock } from 'react-icons/fa';


type GameState = 'creation' | 'playing' | 'gameOver';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('creation');
    const [character, setCharacter] = useState<Character | null>(null);
    const [log, setLog] = useState<LogEntry[]>([]);
    const [currentEvent, setCurrentEvent] = useState<LifeEvent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [gameOverDetails, setGameOverDetails] = useState({ deathCause: '', achievements: [] as string[] });
    const [gameHistory, setGameHistory] = useState<GameSummary[]>(() => {
        const savedHistory = localStorage.getItem('gameHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
    
    // Phone state
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [isGrounded, setIsGrounded] = useState(false);
    const [groundedSecondsLeft, setGroundedSecondsLeft] = useState(0);
    const [dailyDeals, setDailyDeals] = useState<ShopItem[]>([]);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const [hasNewFriendRequests, setHasNewFriendRequests] = useState(false);

    // Admin state
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showPasscodeModal, setShowPasscodeModal] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isGodMode, setIsGodMode] = useState(false);

    useEffect(() => {
        localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
    }, [gameHistory]);
    
    // Grounding Timer Logic
    useEffect(() => {
        if (isGrounded && groundedSecondsLeft > 0) {
            const timer = setInterval(() => {
                setGroundedSecondsLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (isGrounded && groundedSecondsLeft <= 0) {
            setIsGrounded(false);
        }
    }, [isGrounded, groundedSecondsLeft]);

    const handleCharacterCreate = async (data: CharacterCreationData) => {
        setIsLoading(true);
        const newCharacter = await geminiService.generateInitialCharacter(data);
        setCharacter(newCharacter);
        setLog([{ eventText: `${newCharacter.firstName} ${newCharacter.lastName} was born.` }]);
        setDailyDeals(gameLogic.generateDailyDeals(allShopItems, 2)); // Initial deals
        setGameState('playing');
        setIsLoading(false);
        // Trigger first event
        getNewEvent(newCharacter, []);
    };
    
    const getNewEvent = useCallback(async (char: Character, currentLog: LogEntry[]) => {
        if (!char.isAlive || isLoading) return;
        setIsLoading(true);
        const event = await geminiService.generateEvent(char, currentLog);
        setCurrentEvent(event);
        setIsLoading(false);
    }, [isLoading]);

    const handleChoice = (choice: Choice) => {
        if (!character) return;
        
        const newCharacterState = gameLogic.applyChoice(character, choice);
        
        const newLogEntry: LogEntry = {
            eventText: currentEvent!.eventText,
            choiceText: choice.choiceText,
            outcomeText: choice.outcome
        };

        const updatedLog = [...log, newLogEntry];
        setLog(updatedLog);
        setCurrentEvent(null);
        setCharacter(newCharacterState);
    };

    const handleNextYear = () => {
        if (!character) return;
        
        const agedCharacter = gameLogic.ageUp(character, isGodMode);
        
        // Generate new daily deals each year
        setDailyDeals(gameLogic.generateDailyDeals(allShopItems, 2));

        if (!agedCharacter.isAlive) {
            handleGameOver(agedCharacter);
        } else {
            setCharacter(agedCharacter);
            getNewEvent(agedCharacter, log);
        }
    };

    const handleGameOver = async (finalCharacterState: Character) => {
        setIsLoading(true);
        const details = await geminiService.generateGameOverDetails(finalCharacterState, log);
        setGameOverDetails(details);
        setCharacter(finalCharacterState);
        setGameState('gameOver');

        const summary: GameSummary = {
            id: new Date().toISOString(),
            firstName: finalCharacterState.firstName,
            lastName: finalCharacterState.lastName,
            age: finalCharacterState.age,
            ...details
        };
        setGameHistory(prev => [summary, ...prev]);
        setIsLoading(false);
    };

    const handleRestart = () => {
        setCharacter(null);
        setLog([]);
        setCurrentEvent(null);
        setGameOverDetails({ deathCause: '', achievements: [] });
        setIsGodMode(false);
        setGameState('creation');
    };

    const handlePurchase = (item: ShopItem) => {
        if (!character) return;
        const purchaseCost = item.dealPrice ?? item.cost;
        if (character.money < purchaseCost) return;

        const updatedCharacter = gameLogic.applyItemEffects(character, item);
        setCharacter(updatedCharacter);
    };

    const handleGrounding = (contactName: string) => {
        if (!isGrounded && character) {
            const groundingMessage: Message = {
                id: `grounded-${Date.now()}`,
                sender: contactName,
                text: "That's it, you're grounded! I'm taking your phone away.",
                isUser: false,
            };

            const updatedConversations = character.conversations.map(convo => {
                if (convo.contactName === contactName) {
                    return { ...convo, messages: [...convo.messages, groundingMessage] };
                }
                return convo;
            });
            handleUpdateCharacter({ conversations: updatedConversations });

            setIsGrounded(true);
            setGroundedSecondsLeft(50);
            setShowPhoneModal(false);
        }
    };

    const handleUnground = () => {
        setIsGrounded(false);
        setGroundedSecondsLeft(0);
    };

    const handleTriggerEventFromApp = (event: LifeEvent) => {
        setCurrentEvent(event);
        setShowPhoneModal(false); // Close phone to show event modal
    };
    
    const handleRelationshipInteraction = async (relationshipName: string, interactionType: 'spend-time' | 'deep-talk' | 'ask-money' | 'give-gift') => {
        if (!character) return;

        const relationship = character.relationships.find(r => r.name === relationshipName);
        if (!relationship) return;

        if (interactionType === 'give-gift') {
            const giftCost = 50;
            if (character.money < giftCost) {
                // Maybe show a notification later
                console.log("Not enough money for a gift");
                return;
            }
            const updatedCharacter = gameLogic.applyChoice(character, {
                choiceText: `Give a $${giftCost} gift to ${relationship.name}`,
                outcome: `You gave a thoughtful gift to ${relationship.name}. They seemed to really appreciate it!`,
                statEffects: { money: -giftCost }
            });
             const updatedRelationships = updatedCharacter.relationships.map(r => 
                r.name === relationshipName ? { ...r, quality: Math.min(100, r.quality + 15) } : r
            );
            setCharacter({ ...updatedCharacter, relationships: updatedRelationships });
            return;
        }
        
        setIsLoading(true);
        const event = await geminiService.generateInteractionEvent(character, relationship, interactionType);
        setCurrentEvent(event);
        setIsLoading(false);
    };

    // Phone notification handlers
    const handleNewMessageReceived = () => !showPhoneModal && setHasNewMessages(true);
    const handleViewMessages = () => setHasNewMessages(false);
    const handleNewFriendRequest = () => !showPhoneModal && setHasNewFriendRequests(true);
    const handleViewSocialMedia = () => setHasNewFriendRequests(false);
    const handleUpdateConversations = (newConversations: Conversation[]) => {
        handleUpdateCharacter({ conversations: newConversations });
    };
    const handleSetWallpaper = (url: string) => {
        handleUpdateCharacter({ wallpaperUrl: url });
    };

    const handleAcceptFriendRequest = (name: string) => {
        if (!character) return;
        const updatedRelationships = character.relationships.map(r =>
            r.name === name ? { ...r, status: 'accepted' as const } : r
        );
        handleUpdateCharacter({ relationships: updatedRelationships });
    };

    const handleDeclineFriendRequest = (name: string) => {
        if (!character) return;
        const updatedRelationships = character.relationships.filter(r => r.name !== name);
        handleUpdateCharacter({ relationships: updatedRelationships });
    };

    const handleBlockRelationship = (name: string) => {
        if (!character) return;

        const existingRelIndex = character.relationships.findIndex(r => r.name === name);
        let updatedRelationships;

        if (existingRelIndex > -1) {
            // Block an existing relationship
            updatedRelationships = [...character.relationships];
            updatedRelationships[existingRelIndex].blocked = true;
             // You might also want to change their type or quality
            updatedRelationships[existingRelIndex].type = 'Blocked';
            updatedRelationships[existingRelIndex].quality = 0;
        } else {
            // Block a new person (e.g., from dating app) who isn't a relationship yet
            const blockedPerson: Relationship = { name, type: 'Blocked', quality: 0, blocked: true };
            updatedRelationships = [...character.relationships, blockedPerson];
        }
        handleUpdateCharacter({ relationships: updatedRelationships });
    };
    
    const handleNewPartner = async (profile: DatingProfile) => {
        if (!character || character.relationships.some(r => r.name.toLowerCase() === profile.name.toLowerCase())) {
            return;
        }

        const newPartner: Relationship = {
            name: profile.name,
            type: 'Partner',
            quality: 60,
        };
        const updatedRelationships = [...character.relationships, newPartner];

        const firstMessageText = await geminiService.generateDatingMatchMessage(character, profile.name);
        const newConversation: Conversation = {
            id: `convo-${Date.now()}`,
            contactName: profile.name,
            messages: [{
                id: `msg-${Date.now()}`,
                sender: profile.name,
                text: firstMessageText,
                isUser: false,
            }],
        };
        const updatedConversations = [...character.conversations, newConversation];
        
        handleUpdateCharacter({ 
            relationships: updatedRelationships,
            conversations: updatedConversations,
        });
    };
    
    // Admin Panel Logic
    const handleUpdateCharacter = (updatedFields: Partial<Character>) => {
        if (character) {
            setCharacter(prev => ({ ...prev!, ...updatedFields }));
        }
    };
    
    const handleTriggerCustomEvent = (prompt: string) => {
        // A simplified version; a real implementation might use a different Gemini call
        const customEvent: LifeEvent = {
            eventText: prompt,
            choices: [{ choiceText: "Okay", outcome: "You deal with it.", statEffects: {} }]
        };
        setCurrentEvent(customEvent);
        setShowAdminPanel(false);
    }
    
    const handleAdminAccessRequest = () => {
        if (isAdminAuthenticated) {
            setShowAdminPanel(prev => !prev);
        } else {
            setShowPasscodeModal(true);
        }
    };

    const handleToggleAdmin = (e: React.KeyboardEvent) => {
        if(e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            handleAdminAccessRequest();
        }
    };

    const handleTriggerChaosEvent = async () => {
        if (!character) return;
        setIsLoading(true);
        setShowAdminPanel(false); // Close panel to show event
        const chaosEvent = await geminiService.generateChaosEvent(character, log);
        setCurrentEvent(chaosEvent);
        setIsLoading(false);
    };

    const handleAddRelationship = (newRelationship: Relationship) => {
        if (character) {
            // Prevent duplicates by name
            if (character.relationships.some(r => r.name.toLowerCase() === newRelationship.name.toLowerCase())) return;
            
            const updatedRelationships = [...character.relationships, newRelationship];
            handleUpdateCharacter({ relationships: updatedRelationships });
        }
    };
    
    useEffect(() => {
        window.addEventListener('keydown', handleToggleAdmin as any);
        return () => window.removeEventListener('keydown', handleToggleAdmin as any);
    }, [isAdminAuthenticated]);

    const renderContent = () => {
        switch (gameState) {
            case 'creation':
                return (
                    <div className="w-full">
                        <CharacterCreationScreen onStart={handleCharacterCreate} />
                        <GameHistory history={gameHistory} onClearHistory={() => setGameHistory([])} />
                    </div>
                );
            case 'playing':
                return character && (
                    <div className="flex flex-col lg:flex-row gap-8 w-full">
                        <CharacterSheet character={character} onInteract={handleRelationshipInteraction} />
                        <div className="flex-grow flex flex-col">
                            <EventLog log={log} />
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleNextYear}
                                    disabled={isLoading || !!currentEvent}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center w-48 mx-auto"
                                >
                                    {isLoading ? <FaSpinner className="animate-spin" /> : <><FaForward className="mr-2" /> Next Year</>}
                                </button>
                                {isLoading && <p className="text-sm text-gray-400 mt-2">The wheels of fate are turning...</p>}
                            </div>
                        </div>
                    </div>
                );
            case 'gameOver':
                return character && (
                    <div className="w-full">
                        <GameOverScreen character={character} onRestart={handleRestart} {...gameOverDetails} />
                        <GameHistory history={gameHistory} onClearHistory={() => setGameHistory([])} />
                    </div>
                );
        }
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 flex flex-col items-center justify-center font-sans bg-grid">
            <div className="absolute top-4 right-4 z-50">
                <button onClick={handleAdminAccessRequest} className="text-gray-400 hover:text-white transition-colors">
                    <FaCog size={24} />
                </button>
            </div>
            {renderContent()}

            {gameState === 'playing' && (
                <button 
                    onClick={() => setShowPhoneModal(true)}
                    disabled={isGrounded}
                    className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg z-30 transition-transform transform hover:scale-110 disabled:bg-red-800 disabled:cursor-not-allowed disabled:hover:scale-100"
                    aria-label={isGrounded ? `Grounded for ${groundedSecondsLeft}s` : 'Open Phone'}
                >
                    {isGrounded ? <FaLock size={24} /> : <FaMobileAlt size={24} />}
                </button>
            )}

            {gameState === 'playing' && currentEvent && <EventModal event={currentEvent} onChoice={handleChoice} />}
            {gameState === 'playing' && showPhoneModal && character && 
                <PhoneModal 
                    character={character} 
                    onClose={() => setShowPhoneModal(false)} 
                    onPurchase={handlePurchase}
                    onGetGrounded={handleGrounding}
                    isGrounded={isGrounded}
                    groundedSecondsLeft={groundedSecondsLeft}
                    dailyDeals={dailyDeals}
                    onTriggerEvent={handleTriggerEventFromApp}
                    hasNewMessages={hasNewMessages}
                    hasNewFriendRequests={hasNewFriendRequests}
                    onNewMessageReceived={handleNewMessageReceived}
                    onNewFriendRequest={handleNewFriendRequest}
                    onViewMessages={handleViewMessages}
                    onViewSocialMedia={handleViewSocialMedia}
                    onAddRelationship={handleAddRelationship}
                    onAcceptFriendRequest={handleAcceptFriendRequest}
                    onDeclineFriendRequest={handleDeclineFriendRequest}
                    onBlockRelationship={handleBlockRelationship}
                    onUpdateConversations={handleUpdateConversations}
                    onNewPartner={handleNewPartner}
                    onUpdateCharacter={handleUpdateCharacter}
                />
            }
            
            {showPasscodeModal && <PasscodeModal 
                onClose={() => setShowPasscodeModal(false)} 
                onSuccess={() => { setIsAdminAuthenticated(true); setShowPasscodeModal(false); setShowAdminPanel(true);}} 
            />}
             {isAdminAuthenticated && showAdminPanel && character && (
                <AdminPanel 
                    character={character}
                    isGodModeActive={isGodMode}
                    onClose={() => setShowAdminPanel(false)}
                    onUpdateCharacter={handleUpdateCharacter}
                    onKillRelationship={(name) => handleUpdateCharacter({ relationships: character.relationships.filter(r => r.name !== name) })}
                    onTriggerCustomEvent={handleTriggerCustomEvent}
                    onSetGodMode={setIsGodMode}
                    onTriggerChaosEvent={handleTriggerChaosEvent}
                    onAddRelationship={handleAddRelationship}
                    isGrounded={isGrounded}
                    onUnground={handleUnground}
                />
             )}
            <style>{`
            .bg-grid { background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 2rem 2rem; }
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 10px #a855f7, 0 0 20px #a855f7; border-color: #a855f7; }
                50% { box-shadow: 0 0 20px #c084fc, 0 0 30px #c084fc; border-color: #c084fc; }
            }
            .animate-pulse-glow {
                animation: pulse-glow 3s ease-in-out infinite;
            }
            `}</style>
        </main>
    );
};

export default App;