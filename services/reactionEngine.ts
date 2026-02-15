/**
 * Reaction Engine - Smart Chemical Reaction Analysis
 * Predicts reaction types, validates stoichiometry, assesses environmental impact
 */

import {
    ReactionType,
    ReactionPrediction,
    EnvironmentalImpact,
    GreenAlternative
} from '../types/studyLab.types';

// Common element data for validation
const COMMON_ELEMENTS = new Set([
    'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
    'Fe', 'Cu', 'Zn', 'Ag', 'Au', 'Hg', 'Pb', 'Br', 'I'
]);

// Dangerous compounds database
const DANGEROUS_COMPOUNDS = new Set([
    'HCN', 'CN', 'AsH3', 'PH3', 'H2S', 'SO2', 'Cl2', 'F2',
    'HF', 'Hg', 'Pb', 'As', 'Cd', 'Cr', 'NO2', 'O3'
]);

/**
 * Parse chemical formula into constituent elements
 */
function parseFormula(formula: string): Map<string, number> {
    const elements = new Map<string, number>();

    // Simple regex-based parser (basic implementation)
    const pattern = /([A-Z][a-z]?)(\d*)/g;
    let match;

    while ((match = pattern.exec(formula)) !== null) {
        const element = match[1];
        const count = match[2] ? parseInt(match[2]) : 1;

        elements.set(element, (elements.get(element) || 0) + count);
    }

    return elements;
}

/**
 * Check if all elements in formula are valid
 */
function validateElements(formula: string): boolean {
    const elements = parseFormula(formula);

    for (const element of elements.keys()) {
        if (!COMMON_ELEMENTS.has(element)) {
            return false;
        }
    }

    return true;
}

/**
 * Check if compound is dangerous
 */
function isDangerous(formula: string): boolean {
    return DANGEROUS_COMPOUNDS.has(formula) ||
        DANGEROUS_COMPOUNDS.has(formula.replace(/\d+/g, ''));
}

/**
 * Predict reaction type based on pattern matching
 */
export function predictReactionType(reactants: string[], products: string[]): ReactionType {
    const numReactants = reactants.length;
    const numProducts = products.length;

    // Synthesis: A + B → AB
    if (numReactants === 2 && numProducts === 1) {
        return 'synthesis';
    }

    // Decomposition: AB → A + B
    if (numReactants === 1 && numProducts === 2) {
        return 'decomposition';
    }

    // Combustion: Contains C, H and reacts with O2 → CO2 + H2O
    const hasHydrocarbon = reactants.some(r => {
        const elements = parseFormula(r);
        return elements.has('C') && elements.has('H');
    });
    const hasOxygen = reactants.some(r => r === 'O2' || r.includes('O2'));
    const producesCO2 = products.some(p => p === 'CO2' || p.includes('CO2'));
    const producesH2O = products.some(p => p === 'H2O' || p.includes('H2O'));

    if (hasHydrocarbon && hasOxygen && producesCO2 && producesH2O) {
        return 'combustion';
    }

    // Single Replacement: A + BC → AC + B
    if (numReactants === 2 && numProducts === 2) {
        return 'single_replacement';
    }

    // Double Replacement: AB + CD → AD + CB
    if (numReactants === 2 && numProducts === 2) {
        // Could be either single or double - default to double
        return 'double_replacement';
    }

    return 'unknown';
}

/**
 * Assess environmental impact of a reaction
 */
export function assessEnvironmentalImpact(
    reactants: string[],
    products: string[]
): EnvironmentalImpact {
    let sustainabilityScore = 70; // Base score
    let co2Emissions = 0;
    let toxicityLevel: 'low' | 'medium' | 'high' | 'severe' = 'low';
    const risks: string[] = [];

    // Check for dangerous compounds
    const allCompounds = [...reactants, ...products];
    for (const compound of allCompounds) {
        if (isDangerous(compound)) {
            toxicityLevel = 'high';
            sustainabilityScore -= 30;
            risks.push(`${compound} is toxic/hazardous`);
        }
    }

    // Check for CO2 production
    if (products.includes('CO2')) {
        co2Emissions = 44; // ~44g per mole
        sustainabilityScore -= 10;
    }

    // Check for combustion (high energy)
    const reactionType = predictReactionType(reactants, products);
    if (reactionType === 'combustion') {
        sustainabilityScore -= 20;
        risks.push('High energy consumption');
        risks.push('Greenhouse gas emissions');
    }

    // Check for heavy metals
    const heavyMetals = ['Hg', 'Pb', 'Cd', 'Cr', 'As'];
    for (const metal of heavyMetals) {
        if (allCompounds.some(c => c.includes(metal))) {
            toxicityLevel = 'severe';
            sustainabilityScore -= 40;
            risks.push(`Heavy metal (${metal}) present`);
        }
    }

    // Ensure score is in valid range
    sustainabilityScore = Math.max(0, Math.min(100, sustainabilityScore));

    return {
        sustainabilityScore,
        co2Emissions,
        toxicityLevel,
        wasteGeneration: 10, // Default estimate (kg per mole)
        energyRequired: reactionType === 'combustion' ? 890 : 100, // kJ per mole
        waterUsage: 5, // L per mole (estimate)
        risks
    };
}

/**
 * Suggest green chemistry alternative
 */
export function suggestGreenAlternative(
    originalReaction: string,
    reactants: string[],
    impact: EnvironmentalImpact
): GreenAlternative | undefined {
    // Only suggest if current reaction has sustainability issues
    if (impact.sustainabilityScore > 60) {
        return undefined;
    }

    const improvements: string[] = [];
    let co2Reduction = 0;
    let wasteReduction = 0;
    let energySavings = 0;
    let toxicityReduction = 'none';

    // Combustion → Electrochemical
    if (predictReactionType(reactants, []) === 'combustion') {
        improvements.push('Use electrochemical synthesis instead of combustion');
        co2Reduction = 80;
        energySavings = 40;
        toxicityReduction = 'moderate';
    }

    // Heavy metal catalyst → Green catalyst
    if (impact.toxicityLevel === 'severe' || impact.toxicityLevel === 'high') {
        improvements.push('Replace toxic catalysts with bio-based alternatives');
        improvements.push('Use enzymatic catalysis');
        toxicityReduction = 'significant';
        wasteReduction = 60;
    }

    // High energy → Ambient conditions
    if (impact.energyRequired > 500) {
        improvements.push('Optimize reaction to work at room temperature');
        improvements.push('Use photocatalysis (solar energy)');
        energySavings = 70;
        co2Reduction = 50;
    }

    // Generic improvements
    improvements.push('Maximize atom economy');
    improvements.push('Use renewable feedstocks');
    improvements.push('Design for degradation');

    if (improvements.length === 0) {
        return undefined;
    }

    return {
        reaction: `${originalReaction} (green variant)`,
        improvements,
        sustainabilityScore: Math.min(100, impact.sustainabilityScore + 30),
        comparisonMetrics: {
            co2Reduction: co2Reduction || 30,
            toxicityReduction: toxicityReduction || 'low',
            wasteReduction: wasteReduction || 40,
            energySavings: energySavings || 20
        }
    };
}

/**
 * Validate if reaction is chemically possible
 */
export function validateReaction(reactants: string[], products: string[]): {
    isPossible: boolean;
    reason: string;
} {
    // Check if all formulas contain valid elements
    const allCompounds = [...reactants, ...products];
    for (const compound of allCompounds) {
        if (!validateElements(compound)) {
            return {
                isPossible: false,
                reason: `Invalid element(s) in ${compound}`
            };
        }
    }

    // Check mass balance (simplified - just check element counts)
    const reactantElements = new Map<string, number>();
    const productElements = new Map<string, number>();

    for (const reactant of reactants) {
        const elements = parseFormula(reactant);
        elements.forEach((count, element) => {
            reactantElements.set(element, (reactantElements.get(element) || 0) + count);
        });
    }

    for (const product of products) {
        const elements = parseFormula(product);
        elements.forEach((count, element) => {
            productElements.set(element, (productElements.get(element) || 0) + count);
        });
    }

    // Check if both sides have same elements
    const reactantElems = new Set(reactantElements.keys());
    const productElems = new Set(productElements.keys());

    if (reactantElems.size !== productElems.size) {
        return {
            isPossible: false,
            reason: 'Elements not conserved (different elements on each side)'
        };
    }

    return {
        isPossible: true,
        reason: 'Reaction appears chemically valid'
    };
}

/**
 * Main function: Analyze a complete reaction
 */
export function analyzeReaction(reactionString: string): ReactionPrediction {
    // Parse reaction (split by arrow)
    const parts = reactionString.split(/->|→/).map(s => s.trim());

    if (parts.length !== 2) {
        return {
            type: 'unknown',
            confidence: 0,
            products: [],
            isPossible: false,
            reasoning: 'Invalid reaction format. Use: A + B -> C + D',
            environmentalImpact: {
                sustainabilityScore: 0,
                co2Emissions: 0,
                toxicityLevel: 'low',
                wasteGeneration: 0,
                energyRequired: 0,
                waterUsage: 0,
                risks: ['Invalid reaction format']
            }
        };
    }

    const reactants = parts[0].split('+').map(s => s.trim()).filter(s => s);
    const products = parts[1].split('+').map(s => s.trim()).filter(s => s);

    // Validate reaction
    const validation = validateReaction(reactants, products);

    if (!validation.isPossible) {
        return {
            type: 'unknown',
            confidence: 0,
            products,
            isPossible: false,
            reasoning: validation.reason,
            environmentalImpact: {
                sustainabilityScore: 0,
                co2Emissions: 0,
                toxicityLevel: 'low',
                wasteGeneration: 0,
                energyRequired: 0,
                waterUsage: 0,
                risks: [validation.reason]
            }
        };
    }

    // Predict reaction type
    const type = predictReactionType(reactants, products);

    // Assess environmental impact
    const environmentalImpact = assessEnvironmentalImpact(reactants, products);

    // Suggest green alternative
    const greenAlternative = suggestGreenAlternative(
        reactionString,
        reactants,
        environmentalImpact
    );

    return {
        type,
        confidence: type !== 'unknown' ? 85 : 20,
        products,
        isPossible: true,
        reasoning: `Identified as ${type} reaction. ${validation.reason}`,
        environmentalImpact,
        greenAlternative
    };
}

/**
 * Get reaction type description
 */
export function getReactionTypeInfo(type: ReactionType, lang: 'en' | 'ar'): {
    name: string;
    pattern: string;
    examples: string[];
} {
    const info = {
        synthesis: {
            name_en: 'Synthesis (Combination)',
            name_ar: 'تفاعل التركيب',
            pattern_en: 'A + B → AB',
            pattern_ar: 'A + B → AB',
            examples_en: ['2H₂ + O₂ → 2H₂O', 'C + O₂ → CO₂'],
            examples_ar: ['2H₂ + O₂ → 2H₂O', 'C + O₂ → CO₂']
        },
        decomposition: {
            name_en: 'Decomposition',
            name_ar: 'تفاعل التحلل',
            pattern_en: 'AB → A + B',
            pattern_ar: 'AB → A + B',
            examples_en: ['2H₂O → 2H₂ + O₂', 'CaCO₃ → CaO + CO₂'],
            examples_ar: ['2H₂O → 2H₂ + O₂', 'CaCO₃ → CaO + CO₂']
        },
        combustion: {
            name_en: 'Combustion',
            name_ar: 'تفاعل الاحتراق',
            pattern_en: 'CₓHᵧ + O₂ → CO₂ + H₂O',
            pattern_ar: 'CₓHᵧ + O₂ → CO₂ + H₂O',
            examples_en: ['CH₄ + 2O₂ → CO₂ + 2H₂O', 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O'],
            examples_ar: ['CH₄ + 2O₂ → CO₂ + 2H₂O', 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O']
        },
        single_replacement: {
            name_en: 'Single Replacement',
            name_ar: 'تفاعل الإحلال الأحادي',
            pattern_en: 'A + BC → AC + B',
            pattern_ar: 'A + BC → AC + B',
            examples_en: ['Zn + 2HCl → ZnCl₂ + H₂', 'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag'],
            examples_ar: ['Zn + 2HCl → ZnCl₂ + H₂', 'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag']
        },
        double_replacement: {
            name_en: 'Double Replacement',
            name_ar: 'تفاعل الإحلال المزدوج',
            pattern_en: 'AB + CD → AD + CB',
            pattern_ar: 'AB + CD → AD + CB',
            examples_en: ['NaCl + AgNO₃ → NaNO₃ + AgCl', 'HCl + NaOH → NaCl + H₂O'],
            examples_ar: ['NaCl + AgNO₃ → NaNO₃ + AgCl', 'HCl + NaOH → NaCl + H₂O']
        },
        redox: {
            name_en: 'Redox (Oxidation-Reduction)',
            name_ar: 'تفاعل الأكسدة والاختزال',
            pattern_en: 'Transfer of electrons',
            pattern_ar: 'انتقال إلكترونات',
            examples_en: ['Fe + CuSO₄ → FeSO₄ + Cu'],
            examples_ar: ['Fe + CuSO₄ → FeSO₄ + Cu']
        },
        acid_base: {
            name_en: 'Acid-Base Neutralization',
            name_ar: 'تفاعل التعادل',
            pattern_en: 'Acid + Base → Salt + Water',
            pattern_ar: 'حمض + قاعدة → ملح + ماء',
            examples_en: ['HCl + NaOH → NaCl + H₂O'],
            examples_ar: ['HCl + NaOH → NaCl + H₂O']
        },
        unknown: {
            name_en: 'Unknown',
            name_ar: 'غير محدد',
            pattern_en: 'Pattern not recognized',
            pattern_ar: 'نمط غير معروف',
            examples_en: [],
            examples_ar: []
        }
    };

    const data = info[type];

    return {
        name: lang === 'ar' ? data.name_ar : data.name_en,
        pattern: lang === 'ar' ? data.pattern_ar : data.pattern_en,
        examples: lang === 'ar' ? data.examples_ar : data.examples_en
    };
}
