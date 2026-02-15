/**
 * Gamification System Types
 * Multi-dimensional scoring and achievement system
 */

// Score Types
export type ScoreType = 'KP' | 'EIP' | 'RC';

// KP: Knowledge Points (chemistry understanding)
// EIP: Eco Impact Points (environmental actions)
// RC: Research Credits (scientific inquiry)

export interface MultiScore {
    KP: number;  // Knowledge Points
    EIP: number; // Eco Impact Points
    RC: number;  // Research Credits
    total: number; // Weighted sum
}

// Enhanced User Stats
export interface EnhancedUserStats {
    userId: string;
    username: string;

    // Multi-dimensional scores
    scores: MultiScore;

    // Levels (one per score type)
    levels: {
        knowledge: number;
        eco: number;
        research: number;
        overall: number;
    };

    // XP for next level
    nextLevelXP: {
        knowledge: number;
        eco: number;
        research: number;
    };

    // Achievements
    badges: Badge[];
    achievements: Achievement[];

    // Activity tracking
    stats: {
        scans: number;
        equationsBalanced: number;
        reactionsAnalyzed: number;
        greenAlternativesFound: number;
        researchCompleted: number;
        co2Saved: number;
        consecutiveDays: number;
        totalStudyTime: number; // seconds
    };

    // Current streak
    streak: {
        current: number;
        longest: number;
        lastActiveDate: string; // ISO date
    };

    // Rank
    rank: UserRank;

    // Challenge progress
    activeChallenges: Challenge[];
    completedChallenges: string[];

    // Security
    scoreHash?: string; // Prevent manipulation
    lastUpdated: number;
}

// User Ranks
export interface UserRank {
    tier: number; // 1-10
    title: string;
    title_ar: string;
    icon: string;
    minTotal: number; // Total score required
    perks: string[];
}

// Badge System
export interface Badge {
    id: string;
    name: string;
    name_ar: string;
    description: string;
    description_ar: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    category: 'knowledge' | 'eco' | 'research' | 'special';
    unlockedAt: number;
    progress?: number; // For progressive badges (0-100)
}

// Achievement System
export interface Achievement {
    id: string;
    name: string;
    name_ar: string;
    description: string;
    description_ar: string;
    category: 'chemistry' | 'environmental' | 'research' | 'social';
    requirement: AchievementRequirement;
    reward: AchievementReward;
    completed: boolean;
    progress: number; // 0-100
    completedAt?: number;
}

// Achievement Requirements
export interface AchievementRequirement {
    type: 'count' | 'score' | 'streak' | 'special';
    metric: string; // 'equationsBalanced', 'co2Saved', etc.
    target: number;
    timeframe?: number; // Optional: complete within X days
}

// Achievement Rewards
export interface AchievementReward {
    KP?: number;
    EIP?: number;
    RC?: number;
    badge?: string; // Badge ID
    title?: string; // Special title
}

// Challenge System
export interface Challenge {
    id: string;
    type: 'daily' | 'weekly' | 'special';
    name: string;
    name_ar: string;
    description: string;
    description_ar: string;

    // Requirements
    tasks: ChallengeTask[];

    // Rewards
    reward: {
        KP: number;
        EIP: number;
        RC: number;
        badge?: string;
    };

    // Timing
    startDate: number;
    endDate: number;

    // Progress
    progress: number; // 0-100
    completed: boolean;

    // Difficulty & Tags
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    tags: string[];
}

// Challenge Task
export interface ChallengeTask {
    id: string;
    description: string;
    description_ar: string;
    type: LabActionType;
    target: number;
    current: number;
    completed: boolean;
}

// Leaderboard Entry
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    avatar?: string;

    scores: MultiScore;
    level: number;

    badges: number; // Badge count
    achievements: number;

    change: number; // Rank change from previous period
    isCurrentUser?: boolean;
}

// Leaderboard
export interface Leaderboard {
    type: 'global' | 'weekly' | 'friends';
    period: string; // 'all-time', 'week-2024-07', etc.
    entries: LeaderboardEntry[];
    currentUserRank?: number;
    totalUsers: number;
    lastUpdated: number;
}

// Score Action (for logging)
export interface ScoreAction {
    id: string;
    userId: string;
    type: ScoreType;
    amount: number;
    source: LabActionType | 'challenge' | 'achievement';
    timestamp: number;
    verified: boolean; // Server-side verification
    hash?: string;
}

// Reward Calculation
export interface RewardCalculation {
    baseReward: MultiScore;
    multipliers: {
        streak: number;
        difficulty: number;
        speed: number;
        accuracy: number;
    };
    finalReward: MultiScore;
    bonusReason?: string;
}

// Anti-Cheat Validation
export interface ValidationResult {
    valid: boolean;
    reason?: string;
    suspiciousActivity?: boolean;
    correctedScore?: MultiScore;
}

// Score Security
export interface ScoreHash {
    userId: string;
    scores: MultiScore;
    timestamp: number;
    hash: string; // HMAC-SHA256
    nonce: string;
}

// Gamification Config
export interface GamificationConfig {
    // Score weights for total calculation
    scoreWeights: {
        KP: number;
        EIP: number;
        RC: number;
    };

    // Level progression
    levelFormula: (level: number) => number; // XP needed for next level

    // Multipliers
    streakMultiplier: (days: number) => number;
    difficultyMultiplier: Record<string, number>;

    // Limits
    maxDailyKP: number;
    maxDailyEIP: number;
    maxDailyRC: number;

    // Challenge generation
    challengeFrequency: number; // days
    challengeDifficulty: Record<number, string>; // level -> difficulty
}

// Import from studyLab.types.ts
import { LabActionType } from './studyLab.types';

export type { LabActionType };
