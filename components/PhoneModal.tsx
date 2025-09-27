import React, { useState, useEffect } from 'react';
import MessagesApp from './MessagesApp';
import ShopApp from './ShopApp';
import SocialMediaApp from './SocialMediaApp';
import DatingApp from './DatingApp';
import SettingsApp from './SettingsApp';
import BrowserApp from './BrowserApp';
import YouTubeApp from './YouTubeApp';
import BankApp from './BankApp';
import CameraApp from './CameraApp';
import GameApp from './GameApp';
import { Character, ShopItem, LifeEvent, Relationship, Conversation, DatingProfile } from '../types';
import { FaCommentDots, FaShoppingBag, FaLock, FaWifi, FaSignal, FaBatteryFull, FaUserFriends, FaHeart, FaCog, FaGlobe, FaYoutube, FaUniversity, FaCamera, FaGamepad } from 'react-icons/fa';

interface PhoneModalProps {
    onClose: () => void;
    character: Character;
    onPurchase: (item: ShopItem) => void;
    onGetGrounded: (contactName: string) => void;
    isGrounded: boolean;
    groundedSecondsLeft: number;
    dailyDeals: ShopItem[];
    onTriggerEvent: (event: LifeEvent) => void;
    hasNewMessages: boolean;
    hasNewFriendRequests: boolean;
    onNewMessageReceived: () => void;
    onNewFriendRequest: () => void;
    onViewMessages: () => void;
    onViewSocialMedia: () => void;
    onAddRelationship: (relationship: Relationship) => void;
    onAcceptFriendRequest: (name: string) => void;
    onDeclineFriendRequest: (name: string) => void;
    onBlockRelationship: (name: string) => void;
    onUpdateConversations: (conversations: Conversation[]) => void;
    onNewPartner: (profile: DatingProfile) => void;
    onUpdateCharacter: (updatedFields: Partial<Character>) => void;
}

type PhoneApp = 'home' | 'messages' | 'shop' | 'social' | 'dating' | 'settings' | 'browser' | 'youtube' | 'bank' | 'camera' | 'game';

// Create a context to avoid prop drilling character to AppIcon
const AppContext = React.createContext<{ character: Character }>({} as any);

const AppIcon: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, disabled?: boolean, notification?: boolean, unlockAge?: number }> = ({ icon, label, onClick, disabled = false, notification = false, unlockAge }) => {
    const { character } = React.useContext(AppContext);
    const isLocked = unlockAge ? character.age < unlockAge : false;
    const isDisabled = disabled || isLocked;

    return (
        <div className="relative flex flex-col items-center gap-1 group">
             <button onClick={onClick} disabled={isDisabled} className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl transition-transform transform group-hover:scale-110 ${isDisabled ? 'bg-gray-600/50 cursor-not-allowed' : 'bg-black/30'}`}>
                {icon}
            </button>
            <span className="text-xs text-white/90">{label}</span>
            {notification && !isDisabled && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800"></span>}
             {isLocked && <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 z-20 w-max">Unlocks at age {unlockAge}</div>}
        </div>
    );
};

const PhoneModal: React.FC<PhoneModalProps> = (props) => {
    const { 
        onClose, character, onPurchase, onGetGrounded, isGrounded, groundedSecondsLeft, dailyDeals, onTriggerEvent,
        hasNewMessages, hasNewFriendRequests, onNewMessageReceived, onNewFriendRequest, onViewMessages, onViewSocialMedia,
        onAddRelationship, onAcceptFriendRequest, onDeclineFriendRequest, onBlockRelationship, onUpdateConversations,
        onNewPartner, onUpdateCharacter
    } = props;

    const [currentApp, setCurrentApp] = useState<PhoneApp>('home');
    const [currentTime, setCurrentTime] = useState('');

    // Effect for live London time clock
    useEffect(() => {
        const updateClock = () => {
            const londonTime = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Europe/London',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(new Date());
            setCurrentTime(londonTime);
        };
        
        updateClock(); // Initial update
        const timerId = setInterval(updateClock, 1000); // Update every second

        return () => clearInterval(timerId); // Cleanup on unmount
    }, []);

    const renderGroundedScreen = () => (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-20">
            <FaLock className="text-red-500 text-6xl mb-4" />
            <h2 className="text-3xl font-bold text-white">GROUNDED</h2>
            <p className="text-gray-400">No phone for you!</p>
            <p className="text-2xl font-mono mt-4">{groundedSecondsLeft}s</p>
        </div>
    );

    const renderApp = () => {
        switch (currentApp) {
            case 'messages':
                return <MessagesApp 
                    character={character} 
                    onBack={() => setCurrentApp('home')} 
                    onGetGrounded={onGetGrounded} 
                    onNewMessageReceived={onNewMessageReceived} 
                    onUpdateConversations={onUpdateConversations}
                />;
            case 'shop':
                return <ShopApp character={character} onBack={() => setCurrentApp('home')} onPurchase={onPurchase} dailyDeals={dailyDeals} />;
            case 'social':
                return <SocialMediaApp 
                    character={character} 
                    onBack={() => setCurrentApp('home')} 
                    onTriggerEvent={onTriggerEvent}
                    onAddRelationship={onAddRelationship}
                    onNewFriendRequest={onNewFriendRequest}
                    onAcceptFriendRequest={onAcceptFriendRequest}
                    onDeclineFriendRequest={onDeclineFriendRequest}
                />;
            case 'dating':
                return <DatingApp
                    character={character}
                    onBack={() => setCurrentApp('home')}
                    onBlockRelationship={onBlockRelationship}
                    onNewPartner={onNewPartner}
                />;
            case 'settings':
                return <SettingsApp onBack={() => setCurrentApp('home')} onUpdateCharacter={onUpdateCharacter} character={character} />;
            case 'browser':
                return <BrowserApp onBack={() => setCurrentApp('home')} />;
            case 'youtube':
                return <YouTubeApp onBack={() => setCurrentApp('home')} character={character} />;
            case 'bank':
                return <BankApp onBack={() => setCurrentApp('home')} character={character} />;
            case 'camera':
                return <CameraApp onBack={() => setCurrentApp('home')} onTriggerEvent={onTriggerEvent} />;
            case 'game':
                return <GameApp onBack={() => setCurrentApp('home')} onTriggerEvent={onTriggerEvent} />;
            case 'home':
            default:
                const homeScreenStyle = character.wallpaperUrl
                    ? { backgroundImage: `url(${character.wallpaperUrl})` }
                    : { backgroundImage: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' };

                return (
                    <div className="h-full flex flex-col justify-between p-4 bg-cover bg-center" style={homeScreenStyle}>
                        <div>{/* Spacer for status bar */}</div>
                        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                            <AppIcon icon={<FaCommentDots />} label="Messages" onClick={() => { onViewMessages(); setCurrentApp('messages'); }} notification={hasNewMessages} />
                            <AppIcon icon={<FaShoppingBag />} label="Shop" onClick={() => setCurrentApp('shop')} />
                            <AppIcon icon={<FaUserFriends />} label="FriendNet" onClick={() => { onViewSocialMedia(); setCurrentApp('social'); }} unlockAge={13} notification={hasNewFriendRequests}/>
                            <AppIcon icon={<FaHeart />} label="HeartBeat" onClick={() => setCurrentApp('dating')} unlockAge={18} />
                            <AppIcon icon={<FaGlobe />} label="Browser" onClick={() => setCurrentApp('browser')} />
                            <AppIcon icon={<FaYoutube className="text-red-500" />} label="YouTube" onClick={() => setCurrentApp('youtube')} />
                            <AppIcon icon={<FaUniversity />} label="Bank" onClick={() => setCurrentApp('bank')} />
                            <AppIcon icon={<FaCamera />} label="Camera" onClick={() => setCurrentApp('camera')} />
                            <AppIcon icon={<FaGamepad />} label="Games" onClick={() => setCurrentApp('game')} />
                            <AppIcon icon={<FaCog />} label="Settings" onClick={() => setCurrentApp('settings')} />
                        </div>
                        <div>{/* Spacer for home bar */}</div>
                    </div>
                );
        }
    };
    
    return (
        <AppContext.Provider value={{ character }}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4" onClick={onClose}>
                <div 
                    className="relative bg-gray-900 rounded-[40px] shadow-2xl w-full max-w-sm h-[85vh] max-h-[700px] border-[12px] border-black overflow-hidden animate-fade-in flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-black/30 backdrop-blur-sm px-4 flex justify-between items-center z-10 text-xs">
                        <span className="font-bold">{currentTime}</span>
                        <div className="absolute left-1/2 -translate-x-1/2 bg-black w-24 h-5 rounded-b-lg"></div>
                        <div className="flex items-center gap-1.5">
                            <FaSignal />
                            <FaWifi />
                            <FaBatteryFull />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow pt-8 relative">
                        {isGrounded && renderGroundedScreen()}
                        {renderApp()}
                    </div>
                    
                    {/* Home Bar */}
                    <div className="h-8 flex-shrink-0 flex justify-center items-center">
                        <button onClick={() => setCurrentApp('home')} className="w-32 h-1.5 bg-white/50 rounded-full hover:bg-white"></button>
                    </div>
                </div>
            </div>
        </AppContext.Provider>
    );
};

export default PhoneModal;