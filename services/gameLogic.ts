import { Character, Choice, CharacterStats, ShopItem, Transaction } from "../types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

const addTransaction = (character: Character, description: string, amount: number): Character => {
    const newTransaction: Transaction = {
        description,
        amount,
        year: character.age
    };
    return {
        ...character,
        money: character.money + amount,
        transactionHistory: [newTransaction, ...character.transactionHistory].slice(0, 50) // Keep last 50 transactions
    };
};

export const applyChoice = (character: Character, choice: Choice): Character => {
    let newCharacter = { ...character };
    const newStats: CharacterStats = { ...newCharacter.stats };
    let newFollowers = newCharacter.followers;

    if (choice.statEffects) {
        // Handle money separately to add a transaction
        if (choice.statEffects.money) {
            const moneyChange = choice.statEffects.money;
            const description = moneyChange > 0 ? "Received money" : "Lost money";
            newCharacter = addTransaction(newCharacter, description, moneyChange);
        }
        
        for (const key in choice.statEffects) {
            if (key === 'money') continue; // Already handled

            if (key === 'followers') {
                newFollowers = Math.max(0, newFollowers + (choice.statEffects.followers || 0));
            } else if (key in newStats) {
                const statKey = key as keyof CharacterStats;
                const currentVal = newStats[statKey];
                const change = (choice.statEffects as any)[statKey] || 0;
                newStats[statKey] = clamp(currentVal + change, 0, 100);
            }
        }
    }

    return {
        ...newCharacter,
        stats: newStats,
        followers: newFollowers,
    };
};

export const applyItemEffects = (character: Character, item: ShopItem): Character => {
    const purchaseCost = item.dealPrice ?? item.cost;
    if (character.money < purchaseCost) return character;
    
    let newCharacter = addTransaction(character, `Purchased ${item.name}`, -purchaseCost);
    const newStats = { ...newCharacter.stats };

    for (const key in item.effects) {
        if (key in newStats) {
            const statKey = key as keyof CharacterStats;
            const currentVal = newStats[statKey];
            const change = (item.effects as any)[statKey] || 0;
            newStats[statKey] = clamp(currentVal + change, 0, 100);
        }
    }

    return {
        ...newCharacter,
        stats: newStats,
    };
};


export const ageUp = (character: Character, isGodMode: boolean): Character => {
    let newCharacter = { ...character };
    newCharacter.age += 1;
    
    // Yearly salary
    if (newCharacter.job && newCharacter.job.salary > 0) {
        newCharacter = addTransaction(newCharacter, `Salary: ${newCharacter.job.title}`, newCharacter.job.salary);
    }

    // In God Mode, stats don't decay and you can't die from old age/low health.
    if (isGodMode) {
        return newCharacter;
    }

    // Natural stat decay over time, accelerates with age
    const decayFactor = Math.floor(newCharacter.age / 20); // more decay after 20, 40, 60...
    newCharacter.stats.health = clamp(newCharacter.stats.health - (1 + decayFactor), 0, 100);
    newCharacter.stats.happiness = clamp(newCharacter.stats.happiness - 1, 0, 100);
    newCharacter.stats.looks = clamp(newCharacter.stats.looks - (1 + decayFactor), 0, 100);

    // Check for death
    const deathChanceFromAge = Math.max(0, (newCharacter.age - 60) / 40); // Starts at 60, approaches 100% by 100
    const randomChance = Math.random();

    if (newCharacter.stats.health <= 0 || (newCharacter.age > 60 && randomChance < deathChanceFromAge)) {
        newCharacter.isAlive = false;
    }

    return newCharacter;
};

export const generateDailyDeals = (allItems: ShopItem[], count: number): ShopItem[] => {
    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, count);

    return selectedItems.map(item => ({
        ...item,
        dealPrice: Math.ceil(item.cost * (0.5 + Math.random() * 0.25)), // 50-75% of original price
    }));
};