import { GoogleGenAI, Type } from "@google/genai";
import { Character, CharacterCreationData, LifeEvent, LogEntry, Conversation, SocialMediaPost, Relationship, DatingProfile, Message, YouTubeVideo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

const eventSchema = {
    type: Type.OBJECT,
    properties: {
        eventText: {
            type: Type.STRING,
            description: "A description of a life event for the character. Should be a few sentences long."
        },
        choices: {
            type: Type.ARRAY,
            description: "Two to four choices the user can make in response to the event.",
            items: {
                type: Type.OBJECT,
                properties: {
                    choiceText: {
                        type: Type.STRING,
                        description: "The text for the choice presented to the user."
                    },
                    outcome: {
                        type: Type.STRING,
                        description: "A description of what happens when this choice is selected."
                    },
                    statEffects: {
                        type: Type.OBJECT,
                        description: "The effects on the character's stats. Values should be between -20 and 20.",
                        properties: {
                            health: { type: Type.INTEGER, description: "Change in health stat." },
                            happiness: { type: Type.INTEGER, description: "Change in happiness stat." },
                            intelligence: { type: Type.INTEGER, description: "Change in intelligence stat." },
                            looks: { type: Type.INTEGER, description: "Change in looks stat." },
                            money: { type: Type.INTEGER, description: "Change in money. Can be positive or negative." },
                            followers: { type: Type.INTEGER, description: "Change in social media followers." },
                        }
                    }
                },
                required: ['choiceText', 'outcome', 'statEffects']
            }
        }
    },
    required: ['eventText', 'choices']
};


function buildBasePrompt(character: Character, log: LogEntry[]): string {
    const characterInfo = `
        Current Character State:
        - Name: ${character.firstName} ${character.lastName}
        - Age: ${character.age}
        - Gender: ${character.gender}
        - Stats: Health(${character.stats.health}), Happiness(${character.stats.happiness}), Intelligence(${character.stats.intelligence}), Looks(${character.stats.looks})
        - Money: $${character.money}
        - Job: ${character.job?.title || 'Unemployed'}
        - Relationships: ${character.relationships.map(r => `${r.name} (${r.type}, ${r.quality}% quality)`).join(', ') || 'None'}
        - Social Media Followers: ${character.followers}
    `;

    const recentHistory = log.slice(-5).map(l => `- ${l.eventText} (Chose: ${l.choiceText || 'N/A'})`).join('\n');

    return `
        You are a life simulation game engine. Based on the character's current state and recent history, generate a new, realistic life event.
        ${characterInfo}

        Recent Life History:
        ${recentHistory}
    `;
}


export const generateEvent = async (character: Character, log: LogEntry[]): Promise<LifeEvent> => {
    const prompt = `
      ${buildBasePrompt(character, log)}
      
      Generate a new life event appropriate for a ${character.age}-year-old.
      The event should be interesting and present meaningful choices.
      Avoid overly dramatic or repetitive events unless warranted by the character's stats (e.g., low health).
      If the character is a child, the events should be age-appropriate (school, friends, family).
      If the character is an adult, events could relate to career, relationships, health, or finances.
      If the character is elderly, events could relate to health, retirement, family, and reflection.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: eventSchema,
                temperature: 1,
            },
        });

        const jsonText = response.text.trim();
        const eventData = JSON.parse(jsonText);

        // Basic validation
        if (!eventData.eventText || !eventData.choices || eventData.choices.length === 0) {
            throw new Error("Invalid event structure received from AI.");
        }

        return eventData as LifeEvent;

    } catch (error) {
        console.error("Error generating event:", error);
        // Fallback event
        return {
            eventText: "You spend a quiet day reflecting on your life, wondering what comes next.",
            choices: [
                { choiceText: "Okay", outcome: "You feel a sense of calm.", statEffects: { happiness: 5 } },
            ],
        };
    }
};

export const generateInteractionEvent = async (character: Character, relationship: Relationship, interactionType: 'spend-time' | 'deep-talk' | 'ask-money'): Promise<LifeEvent> => {
    let prompt = `You are a life simulation game engine. The character, ${character.firstName} (${character.age} years old), is interacting with ${relationship.name} (${relationship.type}, ${relationship.quality}% quality).`;

    if (interactionType === 'ask-money') {
        prompt += `\n\n${character.firstName} is asking ${relationship.name} for money. Generate an event where the parent either agrees (giving a small, age-appropriate amount of money) or refuses (perhaps with a lecture). The choices should reflect these two outcomes. The parent's decision could be influenced by their relationship quality.`;
    } else if (interactionType === 'deep-talk') {
        prompt += `\n\n${character.firstName} is having a deep, heart-to-heart conversation with ${relationship.name}. Generate an event about this conversation. It could be about secrets, future plans, or past regrets. The choices should have a significant impact on the relationship quality and the character's happiness.`;
    } else { // spend-time
        prompt += `\n\n${character.firstName} is spending quality time with ${relationship.name}. Generate a simple, positive event about an activity they do together (e.g., watching a movie, going for a walk, playing a game). The choices should be simple and result in a small boost to happiness and relationship quality.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: eventSchema,
                temperature: 0.9,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as LifeEvent;
    } catch (error) {
         console.error("Error generating interaction event:", error);
        return {
            eventText: `You tried to interact with ${relationship.name}, but it was a bit awkward.`,
            choices: [{ choiceText: "Oh well.", outcome: "Maybe next time.", statEffects: { happiness: -2 } }],
        };
    }
};

export const generateCameraEvent = async (): Promise<LifeEvent> => {
    const prompt = "The character takes a photo with their phone. Generate a very short, simple event about what they photographed and a small, corresponding stat change. Examples: A great selfie (+looks), a beautiful sunset (+happiness), an interesting bug (+intelligence). Keep it to one choice.";
    try {
         const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: eventSchema,
                temperature: 1,
            },
        });
        const jsonText = response.text.trim();
        const event = JSON.parse(jsonText);
        // Ensure only one choice for simplicity
        event.choices = event.choices.slice(0, 1);
        return event as LifeEvent;
    } catch (error) {
        return {
            eventText: "You took a blurry photo of your thumb.",
            choices: [{ choiceText: "Delete it.", outcome: "Good idea.", statEffects: { happiness: -1 } }]
        };
    }
};

export const generateGameEvent = async (): Promise<LifeEvent> => {
    const prompt = "The character plays a game on their phone. Generate a very short, simple event about their gaming session. Examples: They beat a high score (+happiness), they lost a frustrating level (-happiness), they solved a clever puzzle (+intelligence). Keep it to one choice.";
    try {
         const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: eventSchema,
                temperature: 1,
            },
        });
        const jsonText = response.text.trim();
        const event = JSON.parse(jsonText);
        event.choices = event.choices.slice(0, 1);
        return event as LifeEvent;
    } catch (error) {
        return {
            eventText: "You played a generic match-3 game for a few minutes.",
            choices: [{ choiceText: "Okay.", outcome: "You feel neither satisfied nor disappointed.", statEffects: {} }]
        };
    }
};


export const generateChaosEvent = async (character: Character, log: LogEntry[]): Promise<LifeEvent> => {
    const prompt = `
      ${buildBasePrompt(character, log)}
      
      Generate a completely chaotic, surreal, and unexpected life event for the character. It can be paranormal, sci-fi, or just utterly bizarre. Don't hold back. The event should be wild and unpredictable.
      Examples: "You wake up to find your cat is now the mayor," "A mysterious portal opens in your living room," "You suddenly develop the ability to talk to squirrels, and they have demands."
      
      The choices should be equally strange and have significant, weird consequences. The stat effects should be dramatic.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: eventSchema,
                temperature: 1,
            },
        });

        const jsonText = response.text.trim();
        const eventData = JSON.parse(jsonText);

        if (!eventData.eventText || !eventData.choices || eventData.choices.length === 0) {
            throw new Error("Invalid chaos event structure received from AI.");
        }

        return eventData as LifeEvent;

    } catch (error) {
        console.error("Error generating chaos event:", error);
        return {
            eventText: "You stare into the void, and the void, being socially awkward, stares back at its shoes.",
            choices: [
                { choiceText: "Wave politely.", outcome: "The void blushes and vanishes in a puff of existential dread. You feel slightly more confident.", statEffects: { happiness: 10, intelligence: -5 } },
                 { choiceText: "Challenge it to a staring contest.", outcome: "You lose, but you learn something profound about the nature of reality. Or you just got a headache.", statEffects: { intelligence: 15, health: -5 } },
            ],
        };
    }
};

export const generateInitialCharacter = async (creationData: CharacterCreationData): Promise<Character> => {
    // For simplicity, we'll randomize stats locally and just use AI for flavor later if needed.
    // This reduces initial load time and API calls.
    const stats = {
        health: 70 + Math.floor(Math.random() * 21), // 70-90
        happiness: 50 + Math.floor(Math.random() * 31), // 50-80
        intelligence: 40 + Math.floor(Math.random() * 41), // 40-80
        looks: 40 + Math.floor(Math.random() * 41), // 40-80
    };

    const relationships: Relationship[] = creationData.hasParents ? [
        { name: `Father`, type: 'Parent', quality: 60 + Math.floor(Math.random() * 21), status: 'accepted' },
        { name: `Mother`, type: 'Parent', quality: 60 + Math.floor(Math.random() * 21), status: 'accepted' },
    ] : [];

    const initialConversations: Conversation[] = creationData.hasParents ? [
        { id: '1', contactName: 'Mother', messages: [{ id: '1-1', sender: 'Mother', text: 'Hi sweetie! Thinking of you!', isUser: false }] },
        { id: '2', contactName: 'Father', messages: [{ id: '2-1', sender: 'Father', text: "Don't forget to do your chores.", isUser: false }] },
    ] : [];

    return {
        ...creationData,
        age: 0,
        money: 0,
        stats,
        job: null,
        relationships,
        isAlive: true,
        conversations: initialConversations,
        followers: 0,
        wallpaperUrl: '',
        transactionHistory: [],
    };
};

const gameOverSchema = {
    type: Type.OBJECT,
    properties: {
        deathCause: { type: Type.STRING, description: "A brief, narrative cause of death based on the character's final state." },
        achievements: {
            type: Type.ARRAY,
            description: "A list of 3-5 interesting or funny 'achievements' from the character's life.",
            items: { type: Type.STRING }
        }
    },
    required: ['deathCause', 'achievements']
}

export const generateGameOverDetails = async (character: Character, log: LogEntry[]): Promise<{ deathCause: string; achievements: string[] }> => {
    const prompt = `
        A character in a life simulation game has just died. Here is their final state and a summary of their life.
        ${buildBasePrompt(character, log)}

        Based on this information, generate a fitting, creative, and slightly narrative cause of death.
        Also, generate a list of 3-5 summary "achievements" that encapsulate their life. They can be serious or humorous.
        For example: "Became CEO," "Survived a bear attack," "Ate 500 pizzas," "Master of Naps."
    `;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: gameOverSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating game over details:", error);
        return {
            deathCause: "Died of mysterious causes.",
            achievements: ["Lived a life."]
        };
    }
};


const messageResponseSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: { type: Type.STRING, description: "A short, realistic text message response from the contact." },
        userWasRude: { type: Type.BOOLEAN, description: "Set to true if the user's last message was rude, disrespectful, or sassy, especially towards a parent figure." },
    },
    required: ['responseText', 'userWasRude'],
};

export const generatePhoneMessageResponse = async (character: Character, conversation: Conversation): Promise<{ responseText: string; userWasRude: boolean }> => {
    const lastUserMessage = conversation.messages[conversation.messages.length - 1].text;
    
    const prompt = `
        You are simulating a person named ${conversation.contactName} in a text message conversation with a ${character.age}-year-old.
        The character's happiness is ${character.stats.happiness}/100.
        
        Conversation History (most recent messages):
        ${conversation.messages.slice(-5).map(m => `${m.sender === 'user' ? 'Them' : conversation.contactName}: ${m.text}`).join('\n')}

        The user just sent this message: "${lastUserMessage}"

        First, analyze the user's message. Is it rude, disrespectful, or sassy? This is especially important if the contact is a parent.
        Then, generate a short, realistic text message response from ${conversation.contactName}'s perspective. The response should be in character.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: messageResponseSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch(error) {
        console.error("Error generating message response:", error);
        return { responseText: "brb", userWasRude: false };
    }
};

export const generateCallContent = async (character: Character, contactName: string): Promise<string> => {
    const prompt = `
        You are simulating a character in a life simulation game.
        The main character, ${character.firstName} (${character.age} years old), is calling a contact named ${contactName}.
        Generate a short, realistic piece of dialogue from ${contactName}'s perspective. It could be them answering the phone, or their voicemail message.
        Keep it to 1-2 sentences. The tone should be casual.

        Examples:
        - "Hey, what's up?"
        - "Hi, you've reached ${contactName}. Leave a message and I'll get back to you. Beep."
        - "Can't talk right now, in a meeting. Text me."
        - "Hello?"
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 1,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating call content:", error);
        return "The call couldn't be connected.";
    }
};

export const generateDatingMatchMessage = async (character: Character, matchName: string): Promise<string> => {
    const prompt = `
        You are simulating a person named ${matchName} in a life simulation game.
        You just matched with ${character.firstName} on a dating app.
        Generate a short, enthusiastic, and friendly first text message to send to ${character.firstName}.

        Examples:
        - "Hey! I was hoping we'd match. What's up?"
        - "OMG we matched! So excited to talk to you 😊"
        - "Finally! So, what's your story?"
        - "Hey there, match! 😉"
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 1,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating dating match message:", error);
        return "Hey! We matched!";
    }
};

const socialMediaFeedSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "A unique ID for the post." },
            author: { type: Type.STRING, description: "The name of the person posting. Can be a friend, family member, or a generic online persona." },
            content: { type: Type.STRING, description: "The text content of the social media post. Should be short and realistic." },
            likes: { type: Type.INTEGER, description: "A random number of likes for the post." },
        },
        required: ["id", "author", "content", "likes"]
    }
};

export const generateSocialMediaFeed = async (character: Character): Promise<SocialMediaPost[]> => {
    const prompt = `
        You are generating a social media feed for a ${character.age}-year-old named ${character.firstName} in a life simulation game.
        Generate 5-7 realistic, short social media posts. The posts should be from the perspective of friends, family, or generic online accounts that a person of this age would see.
        Keep the content appropriate for the character's age. If they are a teenager, posts could be about school, hobbies, or memes. If they are an adult, it could be about work, family, or news.
        
        The character's accepted friends are: ${character.relationships.filter(r => r.status === 'accepted' && r.type !== 'Parent').map(r => r.name).join(', ') || 'None'}. You can use these names.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: socialMediaFeedSchema,
            },
        });
        const jsonText = response.text.trim();
        const posts = JSON.parse(jsonText);
        // Add unique IDs if the model fails to
        return posts.map((p: any, i: number) => ({...p, id: p.id || `${Date.now()}-${i}`}));
    } catch (error) {
        console.error("Error generating social media feed:", error);
        return [{ id: '1', author: 'Dev', content: 'Could not load feed. Try again later!', likes: 0 }];
    }
};

export const generateSocialMediaPostEvent = async (character: Character): Promise<LifeEvent> => {
     const prompt = `
        The character, ${character.firstName} (${character.age} years old), has decided to make a post on social media. They have ${character.followers} followers.
        Generate a life event based on this. The event text should be about them deciding what to post.
        The choices should reflect different types of posts (e.g., a humblebrag, a complaint, a funny meme, a life update).
        The outcomes should describe the online reaction and have corresponding stat effects. A controversial post might lower happiness but increase something else, while a positive post might improve relationships or follower count. A viral post could dramatically increase followers.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: eventSchema,
                temperature: 0.9,
            },
        });

        const jsonText = response.text.trim();
        const eventData = JSON.parse(jsonText);
        if (!eventData.eventText || !eventData.choices || eventData.choices.length === 0) {
            throw new Error("Invalid social media event structure received from AI.");
        }
        return eventData as LifeEvent;
    } catch (error) {
        console.error("Error generating social media post event:", error);
        return {
            eventText: "You stare at the blank 'What's on your mind?' box, but can't think of anything to say.",
            choices: [
                { choiceText: "Close the app.", outcome: "You decide to live in the moment instead.", statEffects: { happiness: 2, intelligence: -1 } },
            ],
        };
    }
};

export const generateNewFriendRequest = async (character: Character): Promise<Relationship | null> => {
    const existingNames = character.relationships.map(r => r.name);
    const prompt = `
        You are a life simulation game engine. A character, ${character.firstName} (${character.age} years old), is looking for new friends on social media.
        Generate a single new potential friend for them. The friend should be age-appropriate.
        Do not use any of these existing names: ${existingNames.join(', ')}.
        Provide a realistic full name for this new person.
    `;
    const nameSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The full name of the new potential friend." }
        },
        required: ['name']
    };
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: nameSchema,
            },
        });
        const jsonText = response.text.trim();
        const { name } = JSON.parse(jsonText);
        
        if (!name || existingNames.includes(name)) return null;

        return {
            name,
            type: 'Friend',
            quality: Math.floor(Math.random() * 21) + 30, // Initial quality is 30-50
            status: 'requested'
        };
    } catch (error) {
        console.error("Error generating friend request:", error);
        // Fallback
        const fallbackName = `Alex Doe ${Date.now() % 1000}`;
        if (existingNames.includes(fallbackName)) return null;
        return {
            name: fallbackName,
            type: 'Friend',
            quality: 40,
            status: 'requested'
        };
    }
};

const datingProfilesSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The person's full name." },
            age: { type: Type.INTEGER, description: "The person's age." },
            bio: { type: Type.STRING, description: "A short, interesting dating app bio for this person. 1-2 sentences." }
        },
        required: ['name', 'age', 'bio']
    }
};

export const generateDatingProfiles = async (character: Character, count: number): Promise<DatingProfile[]> => {
    const excludedNames = character.relationships.map(r => r.name);
    const minAge = Math.max(18, character.age - 5);
    const maxAge = character.age + 5;

    const prompt = `
        You are generating dating app profiles for a life simulation game.
        The user is ${character.age} years old.
        Generate ${count} unique dating profiles. The people should have ages between ${minAge} and ${maxAge}.
        Their bios should be short, creative, and sound like real dating app bios (can be funny, serious, or simple).
        Do not use any of the following names: ${excludedNames.join(', ')}.
    `;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: datingProfilesSchema,
                temperature: 1
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DatingProfile[];
    } catch (error) {
        console.error("Error generating dating profiles:", error);
        return []; // Return empty array on error
    }
};

export const generateWallpapers = async (): Promise<string[]> => {
    const prompt = "Generate 4 beautiful, abstract, minimalist phone wallpapers. Use gradients, geometric shapes, and serene color palettes.";
    
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 4,
              outputMimeType: 'image/png',
              aspectRatio: '9:16',
            },
        });

        return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
    } catch (error) {
        console.error("Error generating wallpapers:", error);
        return [];
    }
};

const youtubeFeedSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the YouTube video." },
            videoId: { type: Type.STRING, description: "The unique 11-character YouTube video ID." }
        },
        required: ['title', 'videoId']
    }
};

export const generateYouTubeFeed = async (character: Character): Promise<YouTubeVideo[]> => {
    const prompt = `
        You are generating a YouTube feed for a ${character.age}-year-old.
        Generate a list of 8 recent, popular, and safe-for-work YouTube videos that would be interesting to them.
        For each video, provide its real title and its 11-character YouTube video ID.
    `;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: youtubeFeedSchema,
                temperature: 0.8
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as YouTubeVideo[];
    } catch (error) {
        console.error("Error generating YouTube feed:", error);
        return [
            { title: "Cute Cat Compilation", videoId: "V_hpD_v_v4-w" },
            { title: "How It's Actually Made - Pencils", videoId: "r_hI4I5zQ6U" },
            { title: "World's Largest Jello Pool- Can you swim in it?", videoId: "b2-51b_z4Qc" },
            { title: "20 Cooking Tips with Gordon Ramsay", videoId: "g_S3vR2dEvM" },
        ];
    }
};

const searchResultsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the search result link." },
            url: { type: Type.STRING, description: "A plausible but fake URL for the search result." },
            snippet: { type: Type.STRING, description: "A short, descriptive snippet for the search result." }
        },
        required: ['title', 'url', 'snippet']
    }
};

export const generateSimulatedSearchResults = async (query: string): Promise<{title: string, url: string, snippet: string}[]> => {
    const prompt = `
        You are a search engine simulator. A user has searched for: "${query}".
        Generate a list of 5-7 fake, but realistic-looking search results for this query.
        Each result should have a title, a fake URL, and a short snippet.
        The results should be relevant to the search query.
    `;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: searchResultsSchema,
                temperature: 0.5
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating search results:", error);
        return [{
            title: "Error: Could not perform search",
            url: "error.com",
            snippet: "The search engine seems to be down. Please try again later."
        }];
    }
};