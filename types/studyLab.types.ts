/**
 * Study Lab Advanced Types
 * Enhanced interfaces for intelligent chemistry learning engine
 */

// Reaction Types
export type ReactionType =
    | 'synthesis'           // A + B → AB
    | 'decomposition'       // AB → A + B
    | 'single_replacement'  // A + BC → AC + B
    | 'double_replacement'  // AB + CD → AD + CB
    | 'combustion'          // CxHy + O2 → CO2 + H2O
    | 'redox'               // Electron transfer
    | 'acid_base'           // H+ transfer
    | 'unknown';

// Reaction Prediction Result
export interface ReactionPrediction {
    type: ReactionType;
    confidence: number; // 0-100
    products: string[];
    isPossible: boolean;
    reasoning: string;
    environmentalImpact: EnvironmentalImpact;
    greenAlternative?: GreenAlternative;
}

// Environmental Impact Assessment
export interface EnvironmentalImpact {
    sustainabilityScore: number; // 0-100 (higher is better)
    co2Emissions: number; // kg per mole
    toxicityLevel: 'low' | 'medium' | 'high' | 'severe';
    wasteGeneration: number; // kg per mole
    energyRequired: number; // kJ per mole
    waterUsage: number; // L per mole
    risks: string[];
}

// Green Chemistry Alternative
export interface GreenAlternative {
    reaction: string;
    improvements: string[];
    sustainabilityScore: number;
    comparisonMetrics: {
        co2Reduction: number; // percentage
        toxicityReduction: string;
        wasteReduction: number; // percentage
        energySavings: number; // percentage
    };
}

// Molecular Analysis (Enhanced Lewis)
export interface MolecularAnalysis {
    formula: string;
    lewisStructure: string; // SVG
    geometry: string;
    hybridization: string;
    bondAngles: number[];
    polarity: PolarityData;
    formalCharges: Array<{ atom: string; charge: number }>;
    resonanceStructures?: string[];
    environmentalData: MolecularEnvironmentalData;
}

// Polarity Analysis
export interface PolarityData {
    isPolar: boolean;
    dipoleMoment: number; // Debye
    polarBonds: Array<{ bond: string; electronegativityDiff: number }>;
    partialCharges: Array<{ atom: string; charge: string }>;
}

// Environmental Data for Molecules
export interface MolecularEnvironmentalData {
    toxicityRating: 'non-toxic' | 'low' | 'moderate' | 'high' | 'severe';
    biodegradability: 'readily' | 'moderate' | 'persistent' | 'non-biodegradable';
    bioaccumulation: boolean;
    ozoneDepleting: boolean;
    greenhouse: boolean;
    hazardSymbols: string[];
}

// Adaptive Learning Data
export interface LearningProfile {
    userId: string;
    strengths: string[]; // Topics user excels at
    weaknesses: string[]; // Topics needing improvement
    preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
    completedTopics: string[];
    masteryScores: Record<string, number>; // topic -> score (0-100)
    learningVelocity: number; // concepts per hour
    lastActive: number; // timestamp
}

// Adaptive Exercise
export interface AdaptiveExercise {
    id: string;
    topic: string;
    difficulty: number; // 1-10
    question: string;
    question_ar: string;
    type: 'balance' | 'identify' | 'predict' | 'analyze' | 'synthesis';
    hints: string[];
    solution: string;
    explanation: string;
    xpReward: number;
    targetSkills: string[];
}

// Performance Analytics
export interface PerformanceAnalytics {
    totalAttempts: number;
    successRate: number; // percentage
    averageTime: number; // seconds
    topicBreakdown: Record<string, TopicPerformance>;
    recentTrend: 'improving' | 'stable' | 'declining';
    recommendedTopics: string[];
    estimatedMasteryDate: number; // timestamp
}

// Topic Performance
export interface TopicPerformance {
    attempts: number;
    successes: number;
    averageScore: number;
    lastAttempt: number;
    mastery: number; // 0-100
    timeSpent: number; // seconds
}

// Research Lab Types
export interface ResearchHypothesis {
    id: string;
    question: string;
    variables: {
        independent: string[];
        dependent: string[];
        controlled: string[];
    };
    predictedOutcome: string;
    methodology: string[];
    safetyConsiderations: string[];
}

export interface ResearchData {
    hypothesisId: string;
    observations: Array<{
        time: number;
        variable: string;
        value: number | string;
        notes?: string;
    }>;
    analysis: {
        graphs: Array<{ type: string; data: any }>;
        statistics: Record<string, number>;
        conclusions: string[];
    };
}

// Study Lab Action Types
export type LabActionType =
    | 'balance_equation'
    | 'predict_reaction'
    | 'analyze_molecule'
    | 'compare_green'
    | 'complete_exercise'
    | 'research_experiment';

export interface LabAction {
    type: LabActionType;
    payload: any;
    timestamp: number;
    userId?: string;
}

// Study Mode
export type StudyMode = 'standard' | 'adaptive' | 'research' | 'green';

// Study Session
export interface StudySession {
    id: string;
    userId: string;
    mode: StudyMode;
    startTime: number;
    endTime?: number;
    actions: LabAction[];
    performance: {
        totalActions: number;
        successfulActions: number;
        xpEarned: number;
        topicsStudied: string[];
    };
}
