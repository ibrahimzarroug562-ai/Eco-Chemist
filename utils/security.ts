// Security utilities for input sanitization and validation

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';

    // Remove potential script tags and dangerous HTML
    let sanitized = input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers

    // Limit length to prevent overflow attacks
    if (sanitized.length > 5000) {
        sanitized = sanitized.substring(0, 5000);
    }

    return sanitized.trim();
}

/**
 * Validates chemical formula format
 * Allows only: A-Z, a-z, 0-9, +, -, ->, =, (, ), spaces
 */
export function validateChemicalFormula(formula: string): boolean {
    if (!formula || formula.length > 200) return false;

    // Chemical formula whitelist pattern
    const validPattern = /^[A-Za-z0-9\s+\-()=→>]+$/;
    return validPattern.test(formula);
}

/**
 * Validates molecular formula for Lewis structure
 * Allows only: A-Z, a-z, 0-9
 */
export function validateMolecularFormula(formula: string): boolean {
    if (!formula || formula.length > 50) return false;

    const validPattern = /^[A-Za-z0-9]+$/;
    return validPattern.test(formula);
}

/**
 * Detects potential prompt injection attempts
 */
export function detectPromptInjection(input: string): boolean {
    const suspiciousPatterns = [
        /ignore\s+(previous|above|all)\s+instructions/i,
        /you\s+are\s+now/i,
        /new\s+instructions/i,
        /disregard/i,
        /forget\s+(everything|all|previous)/i,
        /system\s*:/i,
        /assistant\s*:/i,
        /<\|.*?\|>/i, // Special tokens
        /\[INST\]/i,
        /\[\/INST\]/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
class RateLimiter {
    private attempts: Map<string, number[]> = new Map();
    private readonly maxAttempts: number;
    private readonly windowMs: number;

    constructor(maxAttempts = 10, windowMs = 60000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }

    isAllowed(identifier: string): boolean {
        const now = Date.now();
        const userAttempts = this.attempts.get(identifier) || [];

        // Filter out old attempts outside the time window
        const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);

        if (recentAttempts.length >= this.maxAttempts) {
            return false;
        }

        recentAttempts.push(now);
        this.attempts.set(identifier, recentAttempts);

        return true;
    }

    reset(identifier: string): void {
        this.attempts.delete(identifier);
    }
}

export const aiChatRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute

/**
 * Filters AI response for inappropriate content
 */
export function filterAIResponse(response: string): { filtered: string; flagged: boolean } {
    let filtered = response;
    let flagged = false;

    // Remove any potential code execution attempts in response
    if (/<script|<iframe|javascript:|on\w+=/i.test(filtered)) {
        filtered = filtered.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[removed]');
        filtered = filtered.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '[removed]');
        flagged = true;
    }

    return { filtered, flagged };
}

/**
 * Validates image data for scanner
 */
export function validateImageData(base64Data: string): boolean {
    if (!base64Data) return false;

    // Check if it's valid base64
    const base64Pattern = /^data:image\/(jpeg|jpg|png|webp);base64,/;
    if (!base64Pattern.test(base64Data)) {
        return false;
    }

    // Check size (max 10MB)
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > 10 * 1024 * 1024) {
        return false;
    }

    return true;
}

/**
 * Sanitizes AI response to prevent XSS in rendered output
 */
export function sanitizeAIResponse(response: string): string {
    // Allow LaTeX and markdown but escape HTML
    return response
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Restore common LaTeX and markdown that might have been escaped
        .replace(/&lt;(\d+)&gt;/g, '<$1>')
        .replace(/\$\$/g, '$$')
        .replace(/\$/g, '$');
}
