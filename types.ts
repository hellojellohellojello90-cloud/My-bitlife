// FIX: Removed self-import of `Gender` and `Sexuality` which was causing a conflict with the type declarations in this file.
export type Gender = 'Female' | 'Male' | 'Non-Binary';
export type Sexuality = 'Straight' | 'Gay' | 'Bisexual' | 'Asexual';

export interface CharacterStats {
    health: number;
    happiness: number;
    intelligence: number;
    looks: number;
}

export interface Job {
    title: string;
    salary: number;
}

export interface Relationship {
    name: string;
    type: 'Parent' | 'Friend' | 'Partner' | 'Child' | 'Sibling' | 'Match' | string;
    quality: number; // 0-100
    status?: 'accepted' | 'requested';
    blocked?: boolean;
}

export interface Transaction {
    description: string;
    amount: number; // positive for income, negative for expenses
    year: number;
}

export interface Character {
    firstName: string;
    lastName: string;
    gender: Gender;
    sexuality: Sexuality;
    age: number;
    money: number;
    stats: CharacterStats;
    job: Job | null;
    relationships: Relationship[];
    isAlive: boolean;
    conversations: Conversation[];
    followers: number;
    wallpaperUrl?: string;
    transactionHistory: Transaction[];
}

export interface CharacterCreationData {
    firstName: string;
    lastName: string;
    gender: Gender;
    sexuality: Sexuality;
    hasParents: boolean;
}

export interface Choice {
    choiceText: string;
    outcome: string;
    statEffects: Partial<CharacterStats & { money: number; followers: number; }>;
}

export interface LifeEvent {
    eventText: string;
    choices: Choice[];
}

export interface LogEntry {
    eventText: string;
    choiceText?: string;
    outcomeText?: string;
}

export interface GameSummary {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    deathCause: string;
    achievements: string[];
}

// For Phone feature
export interface Message {
    id: string;
    sender: string; // 'user' or contact's name
    text: string;
    isUser: boolean;
}

export interface Conversation {
    id: string;
    contactName: string;
    messages: Message[];
}

// For Shop feature
export interface ShopItem {
    id: string;
    name: string;
    cost: number;
    effects: Partial<CharacterStats>;
    dealPrice?: number;
}

// For Social Media feature
export interface SocialMediaPost {
    id: string;
    author: string;
    content: string;
    likes: number;
}

// For Dating App feature
export interface DatingProfile {
    name: string;
    age: number;
    bio: string;
}

// For YouTube App feature
export interface YouTubeVideo {
    title: string;
    videoId: string;
}