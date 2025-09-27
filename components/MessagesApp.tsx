import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, Character } from '../types';
import * as geminiService from '../services/geminiService';
import { FaArrowLeft, FaPhone } from 'react-icons/fa';
import CallScreen from './CallScreen';


interface MessagesAppProps {
    onBack: () => void;
    onGetGrounded: (contactName: string) => void;
    character: Character;
    onNewMessageReceived: () => void;
    onUpdateConversations: (conversations: Conversation[]) => void;
}

const MessagesApp: React.FC<MessagesAppProps> = ({ onBack, onGetGrounded, character, onNewMessageReceived, onUpdateConversations }) => {
    const { conversations } = character;
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [isCalling, setIsCalling] = useState(false);

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId || !activeConversation || isReplying) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: newMessage,
            isUser: true,
        };
        
        const conversationWithUserMessage = {
            ...activeConversation,
            messages: [...activeConversation.messages, userMessage],
        };

        const conversationsWithUserMessage = conversations.map(c =>
            c.id === activeConversationId ? conversationWithUserMessage : c
        );

        onUpdateConversations(conversationsWithUserMessage);
        setNewMessage('');
        setIsReplying(true);

        try {
            const aiResponse = await geminiService.generatePhoneMessageResponse(character, conversationWithUserMessage);
            onNewMessageReceived();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: activeConversation.contactName,
                text: aiResponse.responseText,
                isUser: false,
            };
            
            const finalConversations = conversationsWithUserMessage.map(c => {
                 if (c.id === activeConversationId) {
                    return { ...c, messages: [...c.messages, aiMessage] };
                }
                return c;
            });
            onUpdateConversations(finalConversations);

            const contactRelationship = character.relationships.find(r => r.name === activeConversation.contactName);
            const isParent = contactRelationship?.type === 'Parent';

            if (aiResponse.userWasRude && isParent && character.age < 18) {
                onGetGrounded(activeConversation.contactName);
            }

        } catch (error) {
            console.error("Failed to get AI response:", error);
        } finally {
            setIsReplying(false);
        }
    };
    
    // Filter conversations to only show relationships that exist
    const availableConversations = conversations.filter(convo => 
        character.relationships.some(rel => rel.name === convo.contactName)
    );

    return (
        <div className="h-full flex flex-col bg-gray-800 relative">
            <header className="bg-gray-900/70 backdrop-blur-sm p-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center">
                    <button onClick={activeConversationId ? () => setActiveConversationId(null) : onBack} className="text-xl mr-4"><FaArrowLeft /></button>
                    <h1 className="text-lg font-bold">{activeConversation?.contactName || 'Messages'}</h1>
                </div>
                {activeConversation && (
                    <button onClick={() => setIsCalling(true)} className="text-xl text-green-400 hover:text-green-300">
                        <FaPhone />
                    </button>
                )}
            </header>

            <div className="flex-grow flex overflow-hidden">
                {/* Message View or Conversation List */}
                <main className="w-full flex flex-col transition-transform duration-300">
                    {!activeConversationId ? (
                        <aside className="w-full overflow-y-auto">
                            {availableConversations.map(convo => (
                                <div
                                    key={convo.id}
                                    onClick={() => setActiveConversationId(convo.id)}
                                    className={`p-4 cursor-pointer hover:bg-gray-700 border-b border-gray-700`}
                                >
                                    <p className="font-semibold">{convo.contactName}</p>
                                    <p className="text-sm text-gray-400 truncate">{convo.messages[convo.messages.length - 1].text}</p>
                                </div>
                            ))}
                        </aside>
                    ) : (
                        <>
                            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                {activeConversation.messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                        <p className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.isUser ? 'bg-purple-600 rounded-br-lg' : 'bg-gray-600 rounded-bl-lg'}`}>
                                            {msg.text}
                                        </p>
                                    </div>
                                ))}
                                {isReplying && (
                                     <div className="flex justify-start">
                                        <div className="bg-gray-600 rounded-lg px-4 py-2 flex items-center space-x-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0s]"></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-3 bg-gray-900/50">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Text Message"
                                    className="w-full bg-gray-700 rounded-full py-2 px-4 focus:outline-none disabled:opacity-50"
                                    disabled={isReplying}
                                />
                            </form>
                        </>
                    )}
                </main>
            </div>
            {isCalling && activeConversation && (
                <CallScreen 
                    contactName={activeConversation.contactName}
                    character={character}
                    onHangUp={() => setIsCalling(false)}
                />
            )}
        </div>
    );
};

export default MessagesApp;