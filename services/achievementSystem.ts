/**
 * Achievement & Badge System
 * Unlockable achievements with rewards
 */

import { Achievement, Badge, AchievementRequirement } from '../types/gamification.types';
import { EnhancedUserStats } from '../types/gamification.types';

/**
 * Achievement Database
 */
export const ACHIEVEMENTS: Achievement[] = [
    // Chemistry Achievements
    {
        id: 'first_balance',
        name: 'First Steps',
        name_ar: 'الخطوات الأولى',
        description: 'Balance your first equation',
        description_ar: 'وازن معادلتك الأولى',
        category: 'chemistry',
        requirement: {
            type: 'count',
            metric: 'equationsBalanced',
            target: 1
        },
        reward: {
            KP: 50,
            badge: 'beginner_chemist'
        },
        completed: false,
        progress: 0
    },
    {
        id: 'equation_master',
        name: 'Equation Master',
        name_ar: 'خبير المعادلات',
        description: 'Balance 100 equations',
        description_ar: 'وازن 100 معادلة',
        category: 'chemistry',
        requirement: {
            type: 'count',
            metric: 'equationsBalanced',
            target: 100
        },
        reward: {
            KP: 500,
            badge: 'equation_master'
        },
        completed: false,
        progress: 0
    },
    {
        id: 'reaction_predictor',
        name: 'Reaction Predictor',
        name_ar: 'متنبئ التفاعلات',
        description: 'Correctly predict 50 reaction types',
        description_ar: 'تنبأ بـ 50 نوع تفاعل بشكل صحيح',
        category: 'chemistry',
        requirement: {
            type: 'count',
            metric: 'reactionsAnalyzed',
            target: 50
        },
        reward: {
            KP: 300,
            RC: 100,
            badge: 'reaction_guru'
        },
        completed: false,
        progress: 0
    },

    // Environmental Achievements
    {
        id: 'eco_warrior',
        name: 'Eco Warrior',
        name_ar: 'محارب البيئة',
        description: 'Save 100kg of CO₂',
        description_ar: 'وفّر 100 كجم من CO₂',
        category: 'environmental',
        requirement: {
            type: 'count',
            metric: 'co2Saved',
            target: 100
        },
        reward: {
            EIP: 1000,
            badge: 'eco_warrior'
        },
        completed: false,
        progress: 0
    },
    {
        id: 'green_pioneer',
        name: 'Green Pioneer',
        name_ar: 'رائد الكيمياء الخضراء',
        description: 'Find 25 green chemistry alternatives',
        description_ar: 'اكتشف 25 بديل للكيمياء الخضراء',
        category: 'environmental',
        requirement: {
            type: 'count',
            metric: 'greenAlternativesFound',
            target: 25
        },
        reward: {
            EIP: 800,
            KP: 200,
            badge: 'green_pioneer'
        },
        completed: false,
        progress: 0
    },
    {
        id: 'plastic_detective',
        name: 'Plastic Detective',
        name_ar: 'محقق البلاستيك',
        description: 'Scan and identify 50 plastic items',
        description_ar: 'افحص وحدد 50 قطعة بلاستيك',
        category: 'environmental',
        requirement: {
            type: 'count',
            metric: 'scans',
            target: 50
        },
        reward: {
            EIP: 500,
            badge: 'plastic_detective'
        },
        completed: false,
        progress: 0
    },

    // Research Achievements
    {
        id: 'junior_researcher',
        name: 'Junior Researcher',
        name_ar: 'باحث مبتدئ',
        description: 'Complete your first research experiment',
        description_ar: 'أكمل تجربتك البحثية الأولى',
        category: 'research',
        requirement: {
            type: 'count',
            metric: 'researchCompleted',
            target: 1
        },
        reward: {
            RC: 100,
            badge: 'junior_researcher'
        },
        completed: false,
        progress: 0
    },
    {
        id: 'research_scientist',
        name: 'Research Scientist',
        name_ar: 'عالم أبحاث',
        description: 'Complete 20 research experiments',
        description_ar: 'أكمل 20 تجربة بحثية',
        category: 'research',
        requirement: {
            type: 'count',
            metric: 'researchCompleted',
            target: 20
        },
        reward: {
            RC: 2000,
            KP: 500,
            badge: 'research_scientist'
        },
        completed: false,
        progress: 0
    },

    // Social/Streak Achievements
    {
        id: 'week_streak',
        name: 'Week Warrior',
        name_ar: 'محارب الأسبوع',
        description: 'Maintain a 7-day streak',
        description_ar: 'حافظ على نشاط 7 أيام متتالية',
        category: 'social',
        requirement: {
            type: 'streak',
            metric: 'consecutiveDays',
            target: 7
        },
        reward: {
            KP: 100,
            EIP: 100,
            badge: 'week_warrior'
        },
        completed: false,
        progress: 0
    },
    {
        id: 'month_legend',
        name: 'Month Legend',
        name_ar: 'أسطورة الشهر',
        description: 'Maintain a 30-day streak',
        description_ar: 'حافظ على نشاط 30 يوم متتالية',
        category: 'social',
        requirement: {
            type: 'streak',
            metric: 'consecutiveDays',
            target: 30
        },
        reward: {
            KP: 500,
            EIP: 500,
            RC: 300,
            badge: 'month_legend',
            title: 'The Persistent'
        },
        completed: false,
        progress: 0
    },

    // Score Achievements
    {
        id: 'knowledge_1000',
        name: 'Knowledge Seeker',
        name_ar: 'طالب المعرفة',
        description: 'Earn 1000 Knowledge Points',
        description_ar: 'اكسب 1000 نقطة معرفة',
        category: 'chemistry',
        requirement: {
            type: 'score',
            metric: 'KP',
            target: 1000
        },
        reward: {
            KP: 200,
            badge: 'knowledge_seeker'
        },
        completed: false,
        progress: 0
    },
    {
        id: 'eco_1000',
        name: 'Eco Champion',
        name_ar: 'بطل البيئة',
        description: 'Earn 1000 Eco Impact Points',
        description_ar: 'اكسب 1000 نقطة تأثير بيئي',
        category: 'environmental',
        requirement: {
            type: 'score',
            metric: 'EIP',
            target: 1000
        },
        reward: {
            EIP: 200,
            badge: 'eco_champion'
        },
        completed: false,
        progress: 0
    }
];

/**
 * Badge Database
 */
export const BADGES: Record<string, Omit<Badge, 'unlockedAt' | 'progress'>> = {
    'beginner_chemist': {
        id: 'beginner_chemist',
        name: 'Beginner Chemist',
        name_ar: 'كيميائي مبتدئ',
        description: 'Balanced first equation',
        description_ar: 'وازن المعادلة الأولى',
        icon: '🧪',
        rarity: 'common',
        category: 'knowledge'
    },
    'equation_master': {
        id: 'equation_master',
        name: 'Equation Master',
        name_ar: 'سيد المعادلات',
        description: 'Balanced 100 equations',
        description_ar: 'وازن 100 معادلة',
        icon: '⚗️',
        rarity: 'rare',
        category: 'knowledge'
    },
    'reaction_guru': {
        id: 'reaction_guru',
        name: 'Reaction Guru',
        name_ar: 'خبير التفاعلات',
        description: 'Predicted 50 reactions',
        description_ar: 'تنبأ بـ 50 تفاعل',
        icon: '🔬',
        rarity: 'epic',
        category: 'knowledge'
    },
    'eco_warrior': {
        id: 'eco_warrior',
        name: 'Eco Warrior',
        name_ar: 'محارب البيئة',
        description: 'Saved 100kg CO₂',
        description_ar: 'وفّر 100 كجم CO₂',
        icon: '🌍',
        rarity: 'rare',
        category: 'eco'
    },
    'green_pioneer': {
        id: 'green_pioneer',
        name: 'Green Pioneer',
        name_ar: 'رائد أخضر',
        description: 'Found 25 green alternatives',
        description_ar: 'وجد 25 بديل أخضر',
        icon: '🌱',
        rarity: 'epic',
        category: 'eco'
    },
    'plastic_detective': {
        id: 'plastic_detective',
        name: 'Plastic Detective',
        name_ar: 'محقق البلاستيك',
        description: 'Scanned 50 plastics',
        description_ar: 'فحص 50 بلاستيك',
        icon: '🔍',
        rarity: 'rare',
        category: 'eco'
    },
    'junior_researcher': {
        id: 'junior_researcher',
        name: 'Junior Researcher',
        name_ar: 'باحث مبتدئ',
        description: 'First research complete',
        description_ar: 'أول بحث مكتمل',
        icon: '📊',
        rarity: 'common',
        category: 'research'
    },
    'research_scientist': {
        id: 'research_scientist',
        name: 'Research Scientist',
        name_ar: 'عالم أبحاث',
        description: '20 researches complete',
        description_ar: '20 بحث مكتمل',
        icon: '🔭',
        rarity: 'legendary',
        category: 'research'
    },
    'week_warrior': {
        id: 'week_warrior',
        name: 'Week Warrior',
        name_ar: 'محارب الأسبوع',
        description: '7-day streak',
        description_ar: 'سلسلة 7 أيام',
        icon: '🔥',
        rarity: 'rare',
        category: 'special'
    },
    'month_legend': {
        id: 'month_legend',
        name: 'Month Legend',
        name_ar: 'أسطورة الشهر',
        description: '30-day streak',
        description_ar: 'سلسلة 30 يوم',
        icon: '👑',
        rarity: 'legendary',
        category: 'special'
    },
    'knowledge_seeker': {
        id: 'knowledge_seeker',
        name: 'Knowledge Seeker',
        name_ar: 'طالب المعرفة',
        description: '1000 KP earned',
        description_ar: '1000 نقطة معرفة',
        icon: '📚',
        rarity: 'rare',
        category: 'knowledge'
    },
    'eco_champion': {
        id: 'eco_champion',
        name: 'Eco Champion',
        name_ar: 'بطل البيئة',
        description: '1000 EIP earned',
        description_ar: '1000 نقطة بيئية',
        icon: '🏆',
        rarity: 'rare',
        category: 'eco'
    }
};

/**
 * Check and update achievements
 */
export function checkAchievements(stats: EnhancedUserStats): {
    newlyUnlocked: Achievement[];
    updated: Achievement[];
} {
    const newlyUnlocked: Achievement[] = [];
    const updated: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
        if (achievement.completed) continue;

        const currentValue = getMetricValue(stats, achievement.requirement.metric);
        const progress = Math.min(100, (currentValue / achievement.requirement.target) * 100);

        if (progress >= 100 && !achievement.completed) {
            // Achievement unlocked!
            achievement.completed = true;
            achievement.progress = 100;
            achievement.completedAt = Date.now();
            newlyUnlocked.push(achievement);
        } else if (progress > achievement.progress) {
            // Progress updated
            achievement.progress = progress;
            updated.push(achievement);
        }
    }

    return { newlyUnlocked, updated };
}

/**
 * Get metric value from stats
 */
function getMetricValue(stats: EnhancedUserStats, metric: string): number {
    switch (metric) {
        case 'equationsBalanced': return stats.stats.equationsBalanced;
        case 'reactionsAnalyzed': return stats.stats.reactionsAnalyzed;
        case 'co2Saved': return stats.stats.co2Saved;
        case 'greenAlternativesFound': return stats.stats.greenAlternativesFound;
        case 'scans': return stats.stats.scans;
        case 'researchCompleted': return stats.stats.researchCompleted;
        case 'consecutiveDays': return stats.streak.current;
        case 'KP': return stats.scores.KP;
        case 'EIP': return stats.scores.EIP;
        case 'RC': return stats.scores.RC;
        default: return 0;
    }
}

/**
 * Award achievement rewards
 */
export function awardAchievementRewards(achievement: Achievement): {
    KP: number;
    EIP: number;
    RC: number;
    badge?: Badge;
    title?: string;
} {
    const result = {
        KP: achievement.reward.KP || 0,
        EIP: achievement.reward.EIP || 0,
        RC: achievement.reward.RC || 0,
        badge: achievement.reward.badge ? unlockBadge(achievement.reward.badge) : undefined,
        title: achievement.reward.title
    };

    return result;
}

/**
 * Unlock a badge
 */
export function unlockBadge(badgeId: string): Badge | undefined {
    const badgeTemplate = BADGES[badgeId];
    if (!badgeTemplate) return undefined;

    return {
        ...badgeTemplate,
        unlockedAt: Date.now()
    };
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.category === category);
}

/**
 * Get unlocked badges
 */
export function getUnlockedBadges(stats: EnhancedUserStats): Badge[] {
    return stats.badges;
}

/**
 * Get achievement progress summary
 */
export function getAchievementProgress(stats: EnhancedUserStats): {
    total: number;
    completed: number;
    inProgress: number;
    percentage: number;
    nextToUnlock?: Achievement;
} {
    const completed = ACHIEVEMENTS.filter(a => a.completed).length;
    const inProgress = ACHIEVEMENTS.filter(a => !a.completed && a.progress > 0).length;
    const total = ACHIEVEMENTS.length;
    const percentage = (completed / total) * 100;

    // Find next closest achievement
    const nextToUnlock = ACHIEVEMENTS
        .filter(a => !a.completed)
        .sort((a, b) => b.progress - a.progress)[0];

    return {
        total,
        completed,
        inProgress,
        percentage,
        nextToUnlock
    };
}
