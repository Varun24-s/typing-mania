export const sampleText = [
    "Success is not defined by how high you climb but by how many people you bring with you. In the journey of life, empathy, compassion, and kindness often matter more than ambition or skill. Never forget the value of a helping hand and a listening ear in hard times.",
    
    "The stars gleamed above the quiet village, where the hum of crickets echoed in the still air. Children slept peacefully while elders sat reminiscing under the banyan tree. Memories lived in every brick, every breeze, and every corner of the sleepy town where time moved with grace.",
    
    "Technology shapes our world, but humanity must guide its path. As artificial intelligence grows, so too must our responsibility. The ethics of innovation are just as vital as its progress. Without thoughtful reflection, advancement can outpace wisdom, leading us into uncharted consequences.",
    
    "Morning light spilled across the mountain range, casting golden hues upon the snow. The silence of dawn was broken only by the distant call of an eagle. For those who watched, it was a reminder that beauty often exists in stillness and patience, not in noise and speed.",
    
    "Reading strengthens the mind just as exercise strengthens the body. With every book we read, we absorb ideas, challenge our thinking, and grow our capacity for empathy. In a world filled with distractions, the simple act of reading is both radical and rewarding.",
    
    "The rain tapped gently on the windowpane, creating a soft rhythm that echoed through the room. Outside, trees danced in the wind, leaves fluttering like wings. Inside, peace settled like a blanket, wrapping the soul in a cocoon of calm and quiet reflection.",
    
    "Time is the most precious currency we own. Unlike money, it cannot be earned back once spent. How we invest our time defines the quality of our lives. Spend it wisely — with loved ones, in pursuit of purpose, or in the service of something greater than yourself.",
    
    "In the heart of every challenge lies a seed of opportunity. It is often in moments of adversity that we discover our strength, resilience, and capacity to overcome. Growth is not found in comfort but in the struggle to rise when we fall.",
    
    "The sea stretched endlessly, meeting the sky at a perfect horizon. Waves whispered ancient stories as they crashed against the rocks. The wind carried the scent of salt and freedom, reminding sailors and poets alike that nature holds a language we’ve yet to fully understand.",
    
    "Learning is not a destination but a lifelong journey. Whether through formal education, personal experience, or quiet observation, every moment offers a lesson. The wisest people are not those who know everything but those who remain curious and open to learning more.",
    
    "Silence isn’t the absence of sound; it’s the presence of awareness. In still moments, we often hear the deepest truths of our hearts. Cultivating silence in a noisy world helps us reconnect with clarity, intention, and the things that truly matter.",
    
    "Courage is not the absence of fear, but the decision to act in spite of it. Every brave soul has felt doubt and uncertainty. What defines them is their willingness to move forward anyway, with trembling hands and hopeful hearts.",
    
    "The garden bloomed in radiant colors, a living canvas painted by time and care. Bees buzzed from flower to flower, performing their timeless dance. It was a reminder that growth takes patience, beauty requires nurturing, and even the smallest acts contribute to the greater whole.",
    
    "Music bridges what words cannot. A single melody can carry memories, soothe pain, or ignite joy. From ancient chants to modern beats, music is the heartbeat of cultures, the language of emotion, and a universal thread connecting humanity across time and space.",
    
    "Failure is not the end but a vital chapter in the story of success. Mistakes teach us what books cannot. Every misstep refines our understanding, and every setback builds resilience. Those who succeed are often those who failed the most and kept going anyway.",
    
    "Each day offers a blank page on which we write the story of our lives. We may not control every plot twist, but we hold the pen. With intention, courage, and kindness, we can create a narrative worth remembering and sharing.",
    
    "Nature does not rush, yet everything is accomplished. Seasons change, rivers flow, and mountains rise without haste. There’s wisdom in the way the earth moves — slow, steady, purposeful. In a world addicted to speed, slowing down is often a radical act of balance.",
    
    "A true friend is not just someone who celebrates your success, but one who walks beside you during the storms. Friendship thrives on trust, vulnerability, and shared memories. It’s not built in a moment but nurtured over time with care and consistency.",
    
    "The child gazed at the sky, eyes wide with wonder, chasing clouds with dreams. In the heart of every young soul lies infinite imagination — a place where the impossible feels possible and reality has yet to limit hope. Protect that spark at all costs.",
    
    "Kindness is a quiet superpower. It rarely makes headlines, but it changes lives. A kind word, a patient ear, or a simple gesture can ripple outward, touching hearts in ways we never fully see. In uncertain times, kindness is the strongest currency of all.",
    
    "Injustice anywhere is a threat to justice everywhere. Society thrives not only on laws but on moral courage — the willingness to stand for what is right, even when it’s hard. Progress begins when ordinary people refuse to accept silence in the face of wrong.",
    
    "Creativity is not reserved for artists. Every problem solved, meal cooked, or idea shared is an act of creation. The world needs your imagination — not perfect, not polished, but real. Dare to create, to make a mark, however small it may seem.",
    
    "In a digital world, attention is the new currency. We must guard it wisely. Constant scrolling dilutes our focus, weakens memory, and drains intention. Reclaim your mind by choosing what deserves your eyes, your ears, and your presence in the moment.",
    
    "Forgiveness is not about forgetting, but about freeing yourself from the weight of resentment. It’s a gift you give your own heart. When you release anger, you make space for healing. And in that space, love can bloom again.",
    
    "Discipline is the bridge between goals and achievement. Talent may start the race, but consistency wins it. Small, repeated actions build the habits that shape our destiny. Success is often quiet, unglamorous work done again and again without applause.",
    
    "The mind, like a garden, grows what you plant. Plant worry, and you harvest fear. Plant gratitude, and you reap joy. Choose your thoughts with care, for they shape your reality more than circumstances ever will.",
    
    "No one sees the hours behind the masterpiece. The late nights, the revisions, the doubts — they stay hidden while the result gets praise. But remember: greatness grows in the shadows of effort, not just in the spotlight of applause.",
    
    "A journey of a thousand miles begins with a single, courageous step. Don’t wait for perfect timing. Take action — messy, uncertain, real. Progress rewards movement, not planning. Begin now, and learn the rest on the way.",
    
    "Love is not found. It is built — brick by brick, word by word, day by day. Real love is imperfect, vulnerable, and deeply human. It grows when nurtured with trust, communication, and mutual care.",
    
    "The past is a place to learn from, not live in. Every mistake offers a lesson, but it’s the future that holds promise. Look back to gain wisdom, but walk forward with purpose and hope."
  ];
  
export function generateText() {
    const randomIndex = Math.floor(Math.random()*sampleText.length)
    return sampleText[randomIndex];
}