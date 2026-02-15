/**
 * Score Engine - Multi-Dimensional Gamification System
 * KP (Knowledge Points) + EIP (Eco Impact Points) + RC (Research Credits)
 */

import {
    MultiScore,
    ScoreType,
    RewardCalculation,
    ScoreAction,
    ValidationResult,
    ScoreHash,
    GamificationConfig
} from '../types/gamification.types';
import { LabActionType } from '../types/studyLab.types';
import CryptoJS from 'crypto-js';

// Secret key for score hashing (should be in environment variable in production)
const SCORE_SECRET = 'eco-chemist-score-secret-2026';

/**
 * Gamification Configuration
 */
export const GAME_CONFIG: GamificationConfig = {
    scoreWeights: {
        KP: 1.0,    // Knowledge is fundamental
        EIP: 1.5,   // Environmental action is highly valued
        RC: 1.2     // Research is important
    },

    levelFormula: (level: number) => Math.floor(100 * Math.pow(1.6, level - 1)),

    streakMultiplier: (days: number) => {
        if (days < 3) return 1.0;
        if (days < 7) return 1.1;
        if (days < 14) return 1.25;
        if (days < 30) return 1.5;
        return 2.0; // 30+ day streak!
    },

    difficultyMultiplier: {
        'easy': 1.0,
        'medium': 1.3,
        'hard': 1.6,
        'expert': 2.0
    },

    maxDailyKP: 1000,
    maxDailyEIP: 800,
    maxDailyRC: 500,

    challengeFrequency: 7, // Weekly challenges
    challengeDifficulty: {
        1: 'easy',
        5: 'medium',
        10: 'hard',
        15: 'expert'
    }
};

/**
 * Base rewards for different actions
 */
const BASE_REWARDS: Record<LabActionType, Partial<MultiScore>> = {
    'balance_equation': {
        KP: 40,
        EIP: 0,
        RC: 0
    },
    'predict_reaction': {
        KP: 60,
        EIP: 0,
        RC: 20
    },
    'analyze_molecule': {
        KP: 50,
        EIP: 0,
        RC: 15
    },
    'compare_green': {
        KP: 30,
        EIP: 80,
        RC: 25
    },
    'complete_exercise': {
        KP: 70,
        EIP: 0,
        RC: 10
    },
    'research_experiment': {
        KP: 40,
        EIP: 20,
        RC: 100
    }
};

/**
 * Calculate reward for an action with multipliers
 */
export function calculateReward(
    actionType: LabActionType,
    context: {
        streak?: number;
        difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
        speed?: number; // completion time in seconds
        accuracy?: number; // 0-100
    } = {}
): RewardCalculation {
    const baseReward = BASE_REWARDS[actionType] || { KP: 10, EIP: 0, RC: 0 };

    // Initialize multipliers
    const multipliers = {
        streak: context.streak ? GAME_CONFIG.streakMultiplier(context.streak) : 1.0,
        difficulty: context.difficulty ? GAME_CONFIG.difficultyMultiplier[context.difficulty] : 1.0,
        speed: 1.0,
        accuracy: 1.0
    };

    // Speed multiplier (faster = better, but reasonable time)
    if (context.speed) {
        if (context.speed < 30) multipliers.speed = 1.3; // Very fast
        else if (context.speed < 60) multipliers.speed = 1.2;
        else if (context.speed < 120) multipliers.speed = 1.1;
        else if (context.speed > 300) multipliers.speed = 0.9; // Too slow
    }

    // Accuracy multiplier
    if (context.accuracy !== undefined) {
        multipliers.accuracy = context.accuracy / 100; // 0-1
    }

    // Calculate final multiplier
    const totalMultiplier =
        multipliers.streak *
        multipliers.difficulty *
        multipliers.speed *
        multipliers.accuracy;

    // Apply multiplier to get final reward
    const finalReward: MultiScore = {
        KP: Math.round((baseReward.KP || 0) * totalMultiplier),
        EIP: Math.round((baseReward.EIP || 0) * totalMultiplier),
        RC: Math.round((baseReward.RC || 0) * totalMultiplier),
        total: 0 // Will be calculated
    };

    // Calculate weighted total
    finalReward.total = Math.round(
        finalReward.KP * GAME_CONFIG.scoreWeights.KP +
        finalReward.EIP * GAME_CONFIG.scoreWeights.EIP +
        finalReward.RC * GAME_CONFIG.scoreWeights.RC
    );

    // Bonus reason
    let bonusReason: string | undefined;
    if (multipliers.streak > 1.2) {
        bonusReason = `${context.streak}-day streak bonus!`;
    } else if (multipliers.difficulty >= 1.6) {
        bonusReason = 'Expert difficulty bonus!';
    } else if (multipliers.speed >= 1.2) {
        bonusReason = 'Speed bonus!';
    }

    return {
        baseReward: {
            KP: baseReward.KP || 0,
            EIP: baseReward.EIP || 0,
            RC: baseReward.RC || 0,
            total: 0
        },
        multipliers,
        finalReward,
        bonusReason
    };
}

/**
 * Add scores together
 */
export function addScores(a: MultiScore, b: MultiScore): MultiScore {
    return {
        KP: a.KP + b.KP,
        EIP: a.EIP + b.EIP,
        RC: a.RC + b.RC,
        total: a.total + b.total
    };
}

/**
 * Generate secure hash for score validation
 */
export function generateScoreHash(
    userId: string,
    scores: MultiScore,
    nonce: string = Date.now().toString()
): ScoreHash {
    const data = `${userId}|${scores.KP}|${scores.EIP}|${scores.RC}|${scores.total}|${nonce}`;
    const hash = CryptoJS.HmacSHA256(data, SCORE_SECRET).toString();

    return {
        userId,
        scores,
        timestamp: Date.now(),
        hash,
        nonce
    };
}

/**
 * Validate score hash (anti-cheat)
 */
export function validateScoreHash(scoreHash: ScoreHash): ValidationResult {
    const data = `${scoreHash.userId}|${scoreHash.scores.KP}|${scoreHash.scores.EIP}|${scoreHash.scores.RC}|${scoreHash.scores.total}|${scoreHash.nonce}`;
    const expectedHash = CryptoJS.HmacSHA256(data, SCORE_SECRET).toString();

    if (expectedHash !== scoreHash.hash) {
        return {
            valid: false,
            reason: 'Score hash mismatch - possible tampering detected',
            suspiciousActivity: true
        };
    }

    // Check if timestamp is reasonable (not from future, not too old)
    const now = Date.now();
    const timeDiff = Math.abs(now - scoreHash.timestamp);

    if (timeDiff > 86400000) { // 24 hours
        return {
            valid: false,
            reason: 'Score timestamp too old or from future',
            suspiciousActivity: true
        };
    }

    return {
        valid: true
    };
}

/**
 * Validate score action (prevent impossible scores)
 */
export function validateScoreAction(action: ScoreAction): ValidationResult {
    // Check if score amount is reasonable for action type
    const maxScores: Record<ScoreType, number> = {
        KP: 200,  // Max 200 KP per action
        EIP: 150, // Max 150 EIP per action
        RC: 250   // Max 250 RC per action
    };

    if (action.amount > maxScores[action.type]) {
        return {
            valid: false,
            reason: `Score amount (${action.amount}) exceeds maximum for ${action.type}`,
            suspiciousActivity: true,
            correctedScore: {
                KP: action.type === 'KP' ? maxScores.KP : 0,
                EIP: action.type === 'EIP' ? maxScores.EIP : 0,
                RC: action.type === 'RC' ? maxScores.RC : 0,
                total: maxScores[action.type]
            }
        };
    }

    // Check timestamp
    const now = Date.now();
    if (action.timestamp > now + 60000) { // Future timestamp (allow 1 min clock skew)
        return {
            valid: false,
            reason: 'Score action timestamp is in the future',
            suspiciousActivity: true
        };
    }

    return {
        valid: true
    };
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number, scoreType: ScoreType = 'KP'): {
    level: number;
    currentXP: number;
    nextLevelXP: number;
    progress: number; // 0-100
} {
    let level = 1;
    let xpNeeded = 0;
    let totalXP = 0;

    while (totalXP <= xp) {
        xpNeeded = GAME_CONFIG.levelFormula(level);
        if (totalXP + xpNeeded > xp) {
            break;
        }
        totalXP += xpNeeded;
        level++;
    }

    const currentXP = xp - totalXP;
    const nextLevelXP = GAME_CONFIG.levelFormula(level);
    const progress = Math.round((currentXP / nextLevelXP) * 100);

    return {
        level,
        currentXP,
        nextLevelXP,
        progress
    };
}

/**
 * Get rank based on total score
 */
export function getRank(totalScore: number): {
    tier: number;
    title: string;
    title_ar: string;
    icon: string;
    perks: string[];
} {
    const ranks = [
        {
            tier: 1,
            minTotal: 0,
            title: 'Lab Assistant',
            title_ar: 'مساعد مخبري',
            icon: '🧪',
            perks: ['Basic lab access']
        },
        {
            tier: 2,
            minTotal: 500,
            title: 'Junior Chemist',
            title_ar: 'كيميائي مبتدئ',
            icon: '⚗️',
            perks: ['Equation balancer', 'Basic scanner']
        },
        {
            tier: 3,
            minTotal: 1500,
            title: 'Chemist',
            title_ar: 'كيميائي',
            icon: '🔬',
            perks: ['Reaction predictor', 'Lewis structures']
        },
        {
            tier: 4,
            minTotal: 3500,
            title: 'Senior Chemist',
            title_ar: 'كيميائي أول',
            icon: '🧬',
            perks: ['Green chemistry', 'Molecular analysis']
        },
        {
            tier: 5,
            minTotal: 7000,
            title: 'Environmental Chemist',
            title_ar: 'كيميائي بيئي',
            icon: '🌱',
            perks: ['Full green lab', 'Sustainability reports']
        },
        {
            tier: 6,
            minTotal: 12000,
            title: 'Research Chemist',
            title_ar: 'كيميائي باحث',
            icon: '📊',
            perks: ['Research lab', 'Data analysis', 'PDF export']
        },
        {
            tier: 7,
            minTotal: 20000,
            title: 'Lead Scientist',
            title_ar: 'عالم رئيسي',
            icon: '🔭',
            perks: ['Advanced AI', 'Custom experiments']
        },
        {
            tier: 8,
            minTotal: 35000,
            title: 'Professor',
            title_ar: 'أستاذ',
            icon: '🎓',
            perks: ['Teaching mode', 'Challenge creation']
        },
        {
            tier: 9,
            minTotal: 60000,
            title: 'Nobel Candidate',
            title_ar: 'مرشح نوبل',
            icon: '🏆',
            perks: ['All features', 'Early access', 'Exclusive badges']
        },
        {
            tier: 10,
            minTotal: 100000,
            title: 'Eco-Champion',
            title_ar: 'بطل البيئة',
            icon: '👑',
            perks: ['Hall of Fame', 'Custom title', 'Lifetime access']
        }
    ];

    // Find appropriate rank
    let currentRank = ranks[0];
    for (const rank of ranks) {
        if (totalScore >= rank.minTotal) {
            currentRank = rank;
        } else {
            break;
        }
    }

    return {
        tier: currentRank.tier,
        title: currentRank.title,
        title_ar: currentRank.title_ar,
        icon: currentRank.icon,
        perks: currentRank.perks
    };
}

/**
 * Check daily limits (anti-farming)
 */
export function checkDailyLimit(
    todayScores: MultiScore,
    newScore: Partial<MultiScore>
): {
    allowed: boolean;
    exceeded?: ScoreType[];
    remaining?: Partial<MultiScore>;
} {
    const exceeded: ScoreType[] = [];
    const remaining: Partial<MultiScore> = {};

    if ((todayScores.KP + (newScore.KP || 0)) > GAME_CONFIG.maxDailyKP) {
        exceeded.push('KP');
        remaining.KP = Math.max(0, GAME_CONFIG.maxDailyKP - todayScores.KP);
    }

    if ((todayScores.EIP + (newScore.EIP || 0)) > GAME_CONFIG.maxDailyEIP) {
        exceeded.push('EIP');
        remaining.EIP = Math.max(0, GAME_CONFIG.maxDailyEIP - todayScores.EIP);
    }

    if ((todayScores.RC + (newScore.RC || 0)) > GAME_CONFIG.maxDailyRC) {
        exceeded.push('RC');
        remaining.RC = Math.max(0, GAME_CONFIG.maxDailyRC - todayScores.RC);
    }

    return {
        allowed: exceeded.length === 0,
        exceeded: exceeded.length > 0 ? exceeded : undefined,
        remaining: exceeded.length > 0 ? remaining : undefined
    };
}
