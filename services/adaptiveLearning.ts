/**
 * Adaptive Learning Engine
 * Tracks performance, identifies weaknesses, generates personalized exercises
 */

import {
    LearningProfile,
    AdaptiveExercise,
    PerformanceAnalytics,
    TopicPerformance
} from '../types/studyLab.types';

// Chemistry Topics Taxonomy
export const CHEMISTRY_TOPICS = {
    'balancing': {
        name_en: 'Equation Balancing',
        name_ar: 'موازنة المعادلات',
        prerequisites: [],
        difficulty: 1
    },
    'stoichiometry': {
        name_en: 'Stoichiometry',
        name_ar: 'الحسابات الكيميائية',
        prerequisites: ['balancing'],
        difficulty: 2
    },
    'reaction_types': {
        name_en: 'Reaction Types',
        name_ar: 'أنواع التفاعلات',
        prerequisites: ['balancing'],
        difficulty: 2
    },
    'redox': {
        name_en: 'Oxidation-Reduction',
        name_ar: 'الأكسدة والاختزال',
        prerequisites: ['balancing', 'reaction_types'],
        difficulty: 3
    },
    'acids_bases': {
        name_en: 'Acids and Bases',
        name_ar: 'الأحماض والقواعد',
        prerequisites: ['balancing'],
        difficulty: 2
    },
    'molecular_geometry': {
        name_en: 'Molecular Geometry',
        name_ar: 'الهندسة الجزيئية',
        prerequisites: [],
        difficulty: 3
    },
    'lewis_structures': {
        name_en: 'Lewis Structures',
        name_ar: 'تراكيب لويس',
        prerequisites: [],
        difficulty: 2
    },
    'green_chemistry': {
        name_en: 'Green Chemistry',
        name_ar: 'الكيمياء الخضراء',
        prerequisites: ['reaction_types'],
        difficulty: 3
    },
    'thermodynamics': {
        name_en: 'Thermodynamics',
        name_ar: 'الديناميكا الحرارية',
        prerequisites: ['stoichiometry'],
        difficulty: 4
    },
    'kinetics': {
        name_en: 'Chemical Kinetics',
        name_ar: 'الحركية الكيميائية',
        prerequisites: ['stoichiometry'],
        difficulty: 4
    }
};

/**
 * Initialize learning profile for new user
 */
export function createLearningProfile(userId: string): LearningProfile {
    return {
        userId,
        strengths: [],
        weaknesses: [],
        preferredDifficulty: 'beginner',
        completedTopics: [],
        masteryScores: {},
        learningVelocity: 0,
        lastActive: Date.now()
    };
}

/**
 * Update learning profile based on performance
 */
export function updateLearningProfile(
    profile: LearningProfile,
    topic: string,
    success: boolean,
    timeSpent: number
): LearningProfile {
    const updated = { ...profile };

    // Update mastery score
    const currentMastery = updated.masteryScores[topic] || 0;
    const delta = success ? 10 : -5;
    updated.masteryScores[topic] = Math.max(0, Math.min(100, currentMastery + delta));

    // Mark as completed if mastery >= 80
    if (updated.masteryScores[topic] >= 80 && !updated.completedTopics.includes(topic)) {
        updated.completedTopics.push(topic);
    }

    // Identify strengths (mastery >= 70)
    updated.strengths = Object.entries(updated.masteryScores)
        .filter(([_, score]) => score >= 70)
        .map(([topic]) => topic);

    // Identify weaknesses (mastery < 50)
    updated.weaknesses = Object.entries(updated.masteryScores)
        .filter(([_, score]) => score < 50)
        .map(([topic]) => topic);

    // Update learning velocity (concepts per hour)
    const hoursSpent = timeSpent / 3600;
    if (hoursSpent > 0) {
        updated.learningVelocity = updated.completedTopics.length / hoursSpent;
    }

    // Adjust difficulty preference
    if (updated.strengths.length > updated.weaknesses.length) {
        if (updated.preferredDifficulty === 'beginner') {
            updated.preferredDifficulty = 'intermediate';
        } else if (updated.preferredDifficulty === 'intermediate') {
            updated.preferredDifficulty = 'advanced';
        }
    }

    updated.lastActive = Date.now();

    return updated;
}

/**
 * Generate adaptive exercise based on learning profile
 */
export function generateAdaptiveExercise(
    profile: LearningProfile,
    lang: 'en' | 'ar'
): AdaptiveExercise {
    // Choose topic: prioritize weaknesses, then new topics
    let targetTopic: string;

    if (profile.weaknesses.length > 0) {
        // Focus on weakness
        targetTopic = profile.weaknesses[Math.floor(Math.random() * profile.weaknesses.length)];
    } else {
        // Choose new topic with met prerequisites
        const availableTopics = Object.entries(CHEMISTRY_TOPICS)
            .filter(([topic, data]) => {
                return !profile.completedTopics.includes(topic) &&
                    data.prerequisites.every(prereq => profile.completedTopics.includes(prereq));
            })
            .map(([topic]) => topic);

        if (availableTopics.length > 0) {
            targetTopic = availableTopics[0];
        } else {
            // Random topic for practice
            targetTopic = Object.keys(CHEMISTRY_TOPICS)[
                Math.floor(Math.random() * Object.keys(CHEMISTRY_TOPICS).length)
            ];
        }
    }

    // Determine difficulty (1-10)
    const topicDifficulty = CHEMISTRY_TOPICS[targetTopic as keyof typeof CHEMISTRY_TOPICS]?.difficulty || 2;
    const mastery = profile.masteryScores[targetTopic] || 0;

    let difficulty = topicDifficulty;
    if (mastery < 30) difficulty = Math.max(1, topicDifficulty - 1);
    else if (mastery > 70) difficulty = Math.min(10, topicDifficulty + 1);

    // Generate exercise based on topic
    const exercise = generateExerciseForTopic(targetTopic, difficulty, lang);

    return exercise;
}

/**
 * Generate exercise for specific topic
 */
function generateExerciseForTopic(
    topic: string,
    difficulty: number,
    lang: 'en' | 'ar'
): AdaptiveExercise {
    const exercises: Record<string, () => AdaptiveExercise> = {
        'balancing': () => ({
            id: `ex_${Date.now()}_${Math.random()}`,
            topic: 'balancing',
            difficulty,
            question: lang === 'ar'
                ? `وازن المعادلة التالية: ${getRandomUnbalancedEquation()}`
                : `Balance the following equation: ${getRandomUnbalancedEquation()}`,
            question_ar: `وازن المعادلة التالية: ${getRandomUnbalancedEquation()}`,
            type: 'balance',
            hints: lang === 'ar'
                ? ['ابدأ بالعنصر الأكثر تعقيداً', 'تأكد من تساوي عدد الذرات']
                : ['Start with the most complex element', 'Ensure equal atom count'],
            solution: 'Use matrix method or trial-and-error',
            explanation: lang === 'ar'
                ? 'الموازنة تضمن حفظ المادة'
                : 'Balancing ensures conservation of matter',
            xpReward: 40 + (difficulty * 5),
            targetSkills: ['balancing', 'stoichiometry']
        }),

        'reaction_types': () => ({
            id: `ex_${Date.now()}_${Math.random()}`,
            topic: 'reaction_types',
            difficulty,
            question: lang === 'ar'
                ? `حدد نوع التفاعل: ${getRandomReaction()}`
                : `Identify the reaction type: ${getRandomReaction()}`,
            question_ar: `حدد نوع التفاعل: ${getRandomReaction()}`,
            type: 'identify',
            hints: lang === 'ar'
                ? ['انظر إلى عدد المتفاعلات والنواتج', 'تحقق من وجود O₂']
                : ['Look at number of reactants/products', 'Check for O₂ presence'],
            solution: 'Synthesis/Decomposition/Combustion/etc',
            explanation: lang === 'ar'
                ? 'كل نوع له نمط محدد'
                : 'Each type has a specific pattern',
            xpReward: 50 + (difficulty * 5),
            targetSkills: ['reaction_types', 'pattern_recognition']
        }),

        'lewis_structures': () => ({
            id: `ex_${Date.now()}_${Math.random()}`,
            topic: 'lewis_structures',
            difficulty,
            question: lang === 'ar'
                ? `ارسم تركيب لويس لـ: ${getRandomMolecule()}`
                : `Draw Lewis structure for: ${getRandomMolecule()}`,
            question_ar: `ارسم تركيب لويس لـ: ${getRandomMolecule()}`,
            type: 'analyze',
            hints: lang === 'ar'
                ? ['احسب إجمالي إلكترونات التكافؤ', 'ضع الذرة الأقل سالبية في المركز']
                : ['Count total valence electrons', 'Place least electronegative atom in center'],
            solution: 'Use valence electron count and octet rule',
            explanation: lang === 'ar'
                ? 'تركيب لويس يوضح الإلكترونات والروابط'
                : 'Lewis structure shows electrons and bonds',
            xpReward: 60 + (difficulty * 5),
            targetSkills: ['lewis_structures', 'molecular_geometry']
        }),

        'green_chemistry': () => ({
            id: `ex_${Date.now()}_${Math.random()}`,
            topic: 'green_chemistry',
            difficulty,
            question: lang === 'ar'
                ? `اقترح بديلاً أخضر للتفاعل: ${getRandomReaction()}`
                : `Suggest a green alternative for: ${getRandomReaction()}`,
            question_ar: `اقترح بديلاً أخضر للتفاعل: ${getRandomReaction()}`,
            type: 'synthesis',
            hints: lang === 'ar'
                ? ['فكر في مبادئ الكيمياء الخضراء الـ12', 'قلل النفايات والطاقة']
                : ['Think of 12 green chemistry principles', 'Reduce waste and energy'],
            solution: 'Apply green chemistry principles',
            explanation: lang === 'ar'
                ? 'الكيمياء الخضراء تحمي البيئة'
                : 'Green chemistry protects the environment',
            xpReward: 70 + (difficulty * 5),
            targetSkills: ['green_chemistry', 'environmental_awareness']
        })
    };

    const generator = exercises[topic] || exercises['balancing'];
    return generator();
}

/**
 * Helper: Get random unbalanced equation
 */
function getRandomUnbalancedEquation(): string {
    const equations = [
        'H2 + O2 -> H2O',
        'Fe + O2 -> Fe2O3',
        'C3H8 + O2 -> CO2 + H2O',
        'Al + HCl -> AlCl3 + H2',
        'NH3 + O2 -> NO + H2O',
        'Ca + N2 -> Ca3N2'
    ];
    return equations[Math.floor(Math.random() * equations.length)];
}

/**
 * Helper: Get random reaction
 */
function getRandomReaction(): string {
    const reactions = [
        '2H2 + O2 → 2H2O',
        'CaCO3 → CaO + CO2',
        'CH4 + 2O2 → CO2 + 2H2O',
        'Zn + 2HCl → ZnCl2 + H2',
        'NaCl + AgNO3 → NaNO3 + AgCl'
    ];
    return reactions[Math.floor(Math.random() * reactions.length)];
}

/**
 * Helper: Get random molecule
 */
function getRandomMolecule(): string {
    const molecules = ['H2O', 'CO2', 'NH3', 'CH4', 'O2', 'N2', 'HCl', 'H2O2'];
    return molecules[Math.floor(Math.random() * molecules.length)];
}

/**
 * Calculate performance analytics
 */
export function calculatePerformanceAnalytics(
    profile: LearningProfile,
    recentActions: Array<{ topic: string; success: boolean; timeSpent: number }>
): PerformanceAnalytics {
    const topicBreakdown: Record<string, TopicPerformance> = {};

    // Build topic performance data
    for (const topic of Object.keys(CHEMISTRY_TOPICS)) {
        const actions = recentActions.filter(a => a.topic === topic);

        if (actions.length > 0) {
            const successes = actions.filter(a => a.success).length;
            const avgScore = (successes / actions.length) * 100;
            const totalTime = actions.reduce((sum, a) => sum + a.timeSpent, 0);

            topicBreakdown[topic] = {
                attempts: actions.length,
                successes,
                averageScore: avgScore,
                lastAttempt: Date.now(),
                mastery: profile.masteryScores[topic] || 0,
                timeSpent: totalTime
            };
        }
    }

    // Calculate overall metrics
    const totalAttempts = recentActions.length;
    const totalSuccesses = recentActions.filter(a => a.success).length;
    const successRate = totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 0;
    const averageTime = totalAttempts > 0
        ? recentActions.reduce((sum, a) => sum + a.timeSpent, 0) / totalAttempts
        : 0;

    // Determine trend
    let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentActions.length >= 10) {
        const recentHalf = recentActions.slice(-5);
        const olderHalf = recentActions.slice(-10, -5);

        const recentSuccess = recentHalf.filter(a => a.success).length / 5;
        const olderSuccess = olderHalf.filter(a => a.success).length / 5;

        if (recentSuccess > olderSuccess + 0.2) recentTrend = 'improving';
        else if (recentSuccess < olderSuccess - 0.2) recentTrend = 'declining';
    }

    // Recommend topics
    const recommendedTopics = profile.weaknesses.slice(0, 3);

    // Estimate mastery date (simplified)
    const avgMastery = Object.values(profile.masteryScores).reduce((a, b) => a + b, 0) /
        Math.max(1, Object.keys(profile.masteryScores).length);
    const pointsToMaster = 80 - avgMastery;
    const daysToMaster = profile.learningVelocity > 0
        ? pointsToMaster / (profile.learningVelocity * 10)
        : 30;

    return {
        totalAttempts,
        successRate,
        averageTime,
        topicBreakdown,
        recentTrend,
        recommendedTopics,
        estimatedMasteryDate: Date.now() + (daysToMaster * 86400000)
    };
}

/**
 * Get next recommended topic
 */
export function getNextRecommendedTopic(profile: LearningProfile): string {
    // Priority: weaknesses > incomplete prerequisites > new topics

    if (profile.weaknesses.length > 0) {
        return profile.weaknesses[0];
    }

    // Find topics with met prerequisites
    const available = Object.entries(CHEMISTRY_TOPICS)
        .filter(([topic, data]) => {
            return !profile.completedTopics.includes(topic) &&
                data.prerequisites.every(p => profile.completedTopics.includes(p));
        })
        .sort((a, b) => a[1].difficulty - b[1].difficulty);

    if (available.length > 0) {
        return available[0][0];
    }

    return 'balancing'; // Default
}
