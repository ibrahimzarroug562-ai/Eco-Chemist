/**
 * Green Chemistry Service
 * 12 Principles of Green Chemistry Implementation
 */

import { GreenAlternative, EnvironmentalImpact } from '../types/studyLab.types';

// 12 Principles of Green Chemistry
export const GREEN_PRINCIPLES = [
    {
        id: 1,
        name_en: 'Prevent waste',
        name_ar: 'منع النفايات',
        description_en: 'Design chemical syntheses to prevent waste',
        description_ar: 'تصميم التفاعلات لمنع ال نفايات من البداية'
    },
    {
        id: 2,
        name_en: 'Atom economy',
        name_ar: 'اقتصاد الذرّة',
        description_en: 'Design syntheses so that maximum amount of reactants becomes products',
        description_ar: 'تصميم التفاعلات بحيث تدخل أكبر كمية من المواد المتفاعلة في المنتجات'
    },
    {
        id: 3,
        name_en: 'Less hazardous synthesis',
        name_ar: 'تفاعلات أقل خطورة',
        description_en: 'Use and generate substances with little or no toxicity',
        description_ar: 'استخدام وإنتاج مواد قليلة أو عديمة السمية'
    },
    {
        id: 4,
        name_en: 'Design safer chemicals',
        name_ar: 'تصميم مواد أكثر أماناً',
        description_en: 'Design chemical products to be fully effective yet have minimal toxicity',
        description_ar: 'تصميم منتجات كيميائية فعالة وذات سمية منخفضة'
    },
    {
        id: 5,
        name_en: 'Safer solvents',
        name_ar: 'مذيبات أكثر أماناً',
        description_en: 'Avoid using solvents, separation agents, or auxiliary substances',
        description_ar: 'تجنب استخدام المذيبات أو استخدام مذيبات آمنة'
    },
    {
        id: 6,
        name_en: 'Energy efficiency',
        name_ar: 'كفاءة الطاقة',
        description_en: 'Run reactions at ambient temperature and pressure',
        description_ar: 'إجراء التفاعلات في درجة حرارة وضغط عاديين'
    },
    {
        id: 7,
        name_en: 'Renewable feedstocks',
        name_ar: 'مواد خام متجددة',
        description_en: 'Use raw materials from renewable sources',
        description_ar: 'استخدام مواد خام من مصادر متجددة'
    },
    {
        id: 8,
        name_en: 'Reduce derivatives',
        name_ar: 'تقليل المشتقات',
        description_en: 'Avoid unnecessary derivatization',
        description_ar: 'تجنب الخطوات الإضافية غير الضرورية'
    },
    {
        id: 9,
        name_en: 'Catalysis',
        name_ar: 'الحفز',
        description_en: 'Use catalytic reagents instead of stoichiometric',
        description_ar: 'استخدام محفزات بدلاً من كميات كبيرة من المواد'
    },
    {
        id: 10,
        name_en: 'Design for degradation',
        name_ar: 'التصميم للتحلل',
        description_en: 'Design products to break down into harmless substances',
        description_ar: 'تصميم منتجات قابلة للتحلل إلى مواد غير ضارة'
    },
    {
        id: 11,
        name_en: 'Real-time analysis',
        name_ar: 'التحليل الآني',
        description_en: 'Monitor reactions in real-time to prevent hazardous intermediates',
        description_ar: 'مراقبة التفاعلات لحظياً لمنع تكون مواد وسطية خطرة'
    },
    {
        id: 12,
        name_en: 'Accident prevention',
        name_ar: 'منع الحوادث',
        description_en: 'Choose substances to minimize accident potential',
        description_ar: 'اختيار مواد تقلل من احتمالية الحوادث'
    }
];

/**
 * Calculate green chemistry score for a reaction
 */
export function calculateGreenScore(impact: EnvironmentalImpact): {
    overall: number;
    breakdown: Record<string, number>;
    recommendations: string[];
} {
    const scores: Record<string, number> = {};
    const recommendations: string[] = [];

    // Principle 1: Waste Prevention (based on waste generation)
    scores.wastePrevent ion = impact.wasteGeneration < 5 ? 100 :
        impact.wasteGeneration < 15 ? 70 :
            impact.wasteGeneration < 30 ? 40 : 20;

    if (scores.wastePrevention < 70) {
        recommendations.push('Optimize reaction to produce less waste');
    }

    // Principle 3: Less Hazardous (based on toxicity)
    scores.lessHazardous = impact.toxicityLevel === 'low' ? 100 :
        impact.toxicityLevel === 'medium' ? 60 :
            impact.toxicityLevel === 'high' ? 30 : 10;

    if (scores.lessHazardous < 70) {
        recommendations.push('Replace toxic reagents with safer alternatives');
    }

    // Principle 6: Energy Efficiency (based on energy required)
    scores.energyEfficiency = impact.energyRequired < 200 ? 100 :
        impact.energyRequired < 500 ? 70 :
            impact.energyRequired < 1000 ? 40 : 20;

    if (scores.energyEfficiency < 70) {
        recommendations.push('Use catalysis to lower energy requirements');
    }

    // Water usage efficiency
    scores.waterEfficiency = impact.waterUsage < 2 ? 100 :
        impact.waterUsage < 10 ? 70 :
            impact.waterUsage < 20 ? 40 : 20;

    if (scores.waterEfficiency < 70) {
        recommendations.push('Minimize water usage or use recycled water');
    }

    // CO2 emissions
    scores.carbonNeutral = impact.co2Emissions === 0 ? 100 :
        impact.co2Emissions < 50 ? 70 :
            impact.co2Emissions < 200 ? 40 : 20;

    if (scores.carbonNeutral < 70) {
        recommendations.push('Reduce CO₂ emissions through process optimization');
    }

    // Calculate overall score (weighted average)
    const overall = Math.round(
        (scores.wastePrevention + scores.lessHazardous + scores.energyEfficiency +
            scores.waterEfficiency + scores.carbonNeutral) / 5
    );

    return {
        overall,
        breakdown: scores,
        recommendations
    };
}

/**
 * Compare standard vs green reaction
 */
export interface GreenComparison {
    standard: {
        name: string;
        impact: EnvironmentalImpact;
        greenScore: number;
    };
    green: {
        name: string;
        impact: EnvironmentalImpact;
        greenScore: number;
    };
    improvements: {
        co2Reduction: number;
        wasteReduction: number;
        toxicityImprovement: string;
        energySavings: number;
        costSavings?: number;
    };
    principlesApplied: number[]; // IDs of green principles
}

/**
 * Get green chemistry alternatives database
 */
export const GREEN_ALTERNATIVES_DB: Record<string, GreenComparison> = {
    'aspirin_synthesis': {
        standard: {
            name: 'Traditional Aspirin Synthesis',
            impact: {
                sustainabilityScore: 45,
                co2Emissions: 120,
                toxicityLevel: 'medium',
                wasteGeneration: 85,
                energyRequired: 680,
                waterUsage: 15,
                risks: ['Acetic anhydride is corrosive', 'Requires sulfuric acid catalyst']
            },
            greenScore: 45
        },
        green: {
            name: 'Green Aspirin Synthesis',
            impact: {
                sustainabilityScore: 85,
                co2Emissions: 25,
                toxicityLevel: 'low',
                wasteGeneration: 15,
                energyRequired: 180,
                waterUsage: 3,
                risks: ['Minimal - uses safer catalysts']
            },
            greenScore: 85
        },
        improvements: {
            co2Reduction: 79,
            wasteReduction: 82,
            toxicityImprovement: 'significant',
            energySavings: 74,
            costSavings: 40
        },
        principlesApplied: [1, 2, 3, 5, 6, 9]
    },
    'esterification': {
        standard: {
            name: 'Acid-Catalyzed Esterification',
            impact: {
                sustainabilityScore: 50,
                co2Emissions: 80,
                toxicityLevel: 'medium',
                wasteGeneration: 60,
                energyRequired: 550,
                waterUsage: 12,
                risks: ['Concentrated H₂SO₄ required', 'High temperature needed']
            },
            greenScore: 50
        },
        green: {
            name: 'Enzymatic Esterification',
            impact: {
                sustainabilityScore: 88,
                co2Emissions: 15,
                toxicityLevel: 'low',
                wasteGeneration: 10,
                energyRequired: 95,
                waterUsage: 2,
                risks: ['Minimal - room temperature, no harsh chemicals']
            },
            greenScore: 88
        },
        improvements: {
            co2Reduction: 81,
            wasteReduction: 83,
            toxicityImprovement: 'major',
            energySavings: 83
        },
        principlesApplied: [1, 3, 5, 6, 9, 10]
    }
};

/**
 * Generate green chemistry report
 */
export function generateGreenReport(
    reactionName: string,
    impact: EnvironmentalImpact,
    lang: 'en' | 'ar'
): string {
    const greenScore = calculateGreenScore(impact);

    const report = lang === 'ar' ? `
# تقرير الكيمياء الخضراء

## التفاعل: ${reactionName}

### التقييم الشامل: ${greenScore.overall}/100

${greenScore.overall >= 80 ? '✅ ممتاز - يتبع مبادئ الكيمياء الخضراء' :
            greenScore.overall >= 60 ? '⚠️ جيد - يمكن تحسينه' :
                greenScore.overall >= 40 ? '⚠️ مقبول - يحتاج تحسينات كبيرة' :
                    '❌ ضعيف - يحتاج إعادة تصميم شاملة'}

### التفاصيل:
- منع النفايات: ${greenScore.breakdown.wastePrevention}/100
- تقليل الخطورة: ${greenScore.breakdown.lessHazardous}/100
- كفاءة الطاقة: ${greenScore.breakdown.energyEfficiency}/100
- كفاءة المياه: ${greenScore.breakdown.waterEfficiency}/100
- الحياد الكربوني: ${greenScore.breakdown.carbonNeutral}/100

### التوصيات:
${greenScore.recommendations.map(r => `• ${r}`).join('\n')}

### الأثر البيئي:
- انبعاثات CO₂: ${impact.co2Emissions} كجم
- النفايات: ${impact.wasteGeneration} كجم
- السمية: ${impact.toxicityLevel}
- الطاقة المطلوبة: ${impact.energyRequired} kJ
  ` : `
# Green Chemistry Report

## Reaction: ${reactionName}

### Overall Score: ${greenScore.overall}/100

${greenScore.overall >= 80 ? '✅ Excellent - Follows green chemistry principles' :
        greenScore.overall >= 60 ? '⚠️ Good - Can be improved' :
            greenScore.overall >= 40 ? '⚠️ Fair - Needs significant improvements' :
                '❌ Poor - Requires major redesign'}

### Details:
- Waste Prevention: ${greenScore.breakdown.wastePrevention}/100
- Less Hazardous: ${greenScore.breakdown.lessHazardous}/100
- Energy Efficiency: ${greenScore.breakdown.energyEfficiency}/100
- Water Efficiency: ${greenScore.breakdown.waterEfficiency}/100
- Carbon Neutral: ${greenScore.breakdown.carbonNeutral}/100

### Recommendations:
${greenScore.recommendations.map(r => `• ${r}`).join('\n')}

### Environmental Impact:
- CO₂ Emissions: ${impact.co2Emissions} kg
- Waste: ${impact.wasteGeneration} kg
- Toxicity: ${impact.toxicityLevel}
- Energy Required: ${impact.energyRequired} kJ
  `;

    return report;
}
