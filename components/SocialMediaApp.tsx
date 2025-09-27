import React, { useState, useEffect } from 'react';
import { Character, SocialMediaPost, LifeEvent, Relationship } from '../types';
import * as geminiService from '../services/geminiService';
import { FaArrowLeft, FaUserFriends, FaHeart, FaSpinner, FaPlusCircle, FaSync } from 'react-icons/fa';

interface SocialMediaAppProps {
    onBack: () => void;
    character: Character;
    onTriggerEvent: (event: LifeEvent) => void;
    onAddRelationship: (relationship: Relationship) => void;
    onNewFriendRequest: () => void;
    onAcceptFriendRequest: (name: string) => void;
    onDeclineFriendRequest: (name: string) => void;
}

const SocialMediaApp: React.FC<SocialMediaAppProps> = ({ 
    onBack, 
    character, 
    onTriggerEvent, 
    onAddRelationship, 
    onNewFriendRequest, 
    onAcceptFriendRequest, 
    onDeclineFriendRequest 
}) => {
    const [posts, setPosts] = useState<SocialMediaPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [view, setView] = useState<'feed' | 'requests'>('feed');

    const friendRequests = character.relationships.filter(r => r.status === 'requested');

    const fetchFeed = async (isRefresh: boolean) => {
        setIsLoading(true);
        try {
            const feedPosts = await geminiService.generateSocialMediaFeed(character);
            setPosts(feedPosts);

            // High chance to generate a friend request on manual refresh
            if (isRefresh && Math.random() < 0.5) {
                const newFriend = await geminiService.generateNewFriendRequest(character);
                if (newFriend) {
                    onAddRelationship(newFriend);
                    onNewFriendRequest();
                }
            }
        } catch (error) {
            console.error(error);
            setPosts([{ id: 'error', author: 'System', content: 'Could not load feed.', likes: 0 }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed(false);
    }, []);

    const handleMakePost = async () => {
        setIsPosting(true);
        try {
            const postEvent = await geminiService.generateSocialMediaPostEvent(character);
            onTriggerEvent(postEvent);
        } catch (error) {
            console.error("Failed to generate post event:", error);
        } finally {
            setIsPosting(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="flex justify-center items-center h-full">
                    <FaSpinner className="animate-spin text-4xl text-purple-400" />
                </div>
            );
        }

        if (view === 'feed') {
            return posts.map(post => (
                <div key={post.id} className="bg-gray-700 p-4 rounded-lg animate-fade-in">
                    <p className="font-bold text-purple-300">{post.author}</p>
                    <p className="my-2 text-gray-200">{post.content}</p>
                    <div className="flex items-center text-red-400 text-sm gap-1">
                        <FaHeart />
                        <span>{post.likes}</span>
                    </div>
                </div>
            ));
        }

        if (view === 'requests') {
            return (
                <div>
                    {friendRequests.length > 0 ? (
                        friendRequests.map(req => (
                            <div key={req.name} className="flex items-center justify-between p-4 border-b border-gray-700 animate-fade-in">
                                <p className="font-bold">{req.name}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => onAcceptFriendRequest(req.name)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded-lg">Accept</button>
                                    <button onClick={() => onDeclineFriendRequest(req.name)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded-lg">Decline</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 p-8">No new friend requests.</p>
                    )}
                </div>
            );
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-800 text-white">
            <header className="bg-gray-900/70 backdrop-blur-sm p-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center">
                    <button onClick={onBack} className="text-xl mr-4"><FaArrowLeft /></button>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold flex items-center gap-2"><FaUserFriends /> FriendNet</h1>
                        <p className="text-xs text-gray-400">{character.followers.toLocaleString()} followers</p>
                    </div>
                </div>
                <button onClick={() => fetchFeed(true)} disabled={isLoading} className="text-xl disabled:opacity-50 disabled:animate-spin">
                    <FaSync />
                </button>
            </header>
            
            <div className="flex-shrink-0 border-b border-gray-700">
                <nav className="flex">
                    <button onClick={() => setView('feed')} className={`flex-1 p-3 text-sm font-bold transition-colors ${view === 'feed' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}>Feed</button>
                    <button onClick={() => setView('requests')} className={`flex-1 p-3 text-sm font-bold relative transition-colors ${view === 'requests' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}>
                        Requests
                        {friendRequests.length > 0 && <span className="absolute top-2 right-4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{friendRequests.length}</span>}
                    </button>
                </nav>
            </div>


            <main className="flex-grow p-4 overflow-y-auto space-y-4">
                {renderContent()}
            </main>

            <footer className="p-3 bg-gray-900/50">
                <button
                    onClick={handleMakePost}
                    disabled={isPosting}
                    className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-500"
                >
                    {isPosting ? <FaSpinner className="animate-spin" /> : <FaPlusCircle />}
                    Make a Post
                </button>
            </footer>
        </div>
    );
};

export default SocialMediaApp;