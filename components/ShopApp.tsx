import React from 'react';
import { Character, ShopItem } from '../types';
import { FaArrowLeft, FaShoppingCart, FaTags } from 'react-icons/fa';

interface ShopAppProps {
    onBack: () => void;
    onPurchase: (item: ShopItem) => void;
    character: Character;
    dailyDeals: ShopItem[];
}

export const allShopItems: ShopItem[] = [
    { id: 'kitkat', name: 'KitKat Bar', cost: 2, effects: { happiness: 5 } },
    { id: 'energydrink', name: 'Energy Drink', cost: 4, effects: { health: -2, happiness: 8 } },
    { id: 'book', name: 'Book', cost: 15, effects: { intelligence: 5 } },
    { id: 'lottoticket', name: 'Lotto Ticket', cost: 5, effects: { happiness: 2 } }, // The actual win would be an event
    { id: 'gympass', name: 'Gym Day Pass', cost: 20, effects: { health: 5, looks: 3 } },
];

const ShopApp: React.FC<ShopAppProps> = ({ onBack, onPurchase, character, dailyDeals }) => {

    const handlePurchase = (item: ShopItem) => {
        const finalItem = { ...item, cost: item.dealPrice ?? item.cost };
        onPurchase(finalItem);
    };

    return (
        <div className="h-full flex flex-col bg-gray-800 text-white">
            <header className="bg-gray-900/70 backdrop-blur-sm p-3 flex items-center flex-shrink-0">
                <button onClick={onBack} className="text-xl mr-4"><FaArrowLeft /></button>
                <h1 className="text-lg font-bold flex items-center gap-2"><FaShoppingCart /> Corner Shop</h1>
            </header>

            <div className="flex-grow p-4 overflow-y-auto">
                <div className="text-right mb-4 text-green-400 font-bold text-lg">
                    Balance: ${character.money.toLocaleString()}
                </div>

                {/* Daily Deals Section */}
                {dailyDeals.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2 mb-2"><FaTags /> Daily Deals</h2>
                        <div className="space-y-3">
                            {dailyDeals.map(item => {
                                const canAfford = character.money >= item.dealPrice!;
                                return (
                                    <div key={item.id + '-deal'} className="bg-purple-900/50 border border-purple-500 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold">{item.name}</h3>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-sm text-green-400 font-bold">${item.dealPrice}</p>
                                                <p className="text-xs text-gray-400 line-through">${item.cost}</p>
                                            </div>
                                            <p className="text-xs text-gray-300">Effect: +{Object.values(item.effects)[0]} {Object.keys(item.effects)[0]}</p>
                                        </div>
                                        <button 
                                            onClick={() => handlePurchase(item)}
                                            disabled={!canAfford}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 disabled:text-white disabled:cursor-not-allowed transition-colors"
                                        >
                                            Buy
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
                
                <h2 className="text-xl font-bold text-purple-300 mb-2">All Items</h2>
                <div className="space-y-3">
                    {allShopItems.map(item => {
                        // Don't show item in regular list if it's a daily deal
                        if (dailyDeals.some(deal => deal.id === item.id)) return null;

                        const canAfford = character.money >= item.cost;
                        return (
                            <div key={item.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold">{item.name}</h3>
                                    <p className="text-sm text-green-400">${item.cost}</p>
                                    <p className="text-xs text-gray-400">Effect: +{Object.values(item.effects)[0]} {Object.keys(item.effects)[0]}</p>
                                </div>
                                <button 
                                    onClick={() => handlePurchase(item)}
                                    disabled={!canAfford}
                                    className="bg-purple-600 hover:bg-purple-700 font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                                >
                                    Buy
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ShopApp;
