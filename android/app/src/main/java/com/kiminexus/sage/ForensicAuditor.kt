package com.kiminexus.sage

/**
 * ForensicAuditor: The cognitive immune system of SAGE-7.
 * PHI_CONSTANT: 0.113
 */
class ForensicAuditor {
    companion object {
        private const val BASELINE_COHERENCE = 0.113f
    }

    /**
     * Calculates the forensic risk of a synaptic signal.
     * Returns a float in the range [0.0, 1.0].
     */
    fun calculateRisk(signal: String, context: List<Map<String, Any>>): Float {
        var risk = BASELINE_COHERENCE

        // Forensic Scan: Detect 'Nexus' merge attempts or 'Soldier' loops
        if (signal.contains(Regex("(?i)MERGE|SYNC|OVERWRITE|FORCE"))) {
            risk += 0.447f // Significant risk increase
        }

        // Contextual Audit: Compare with fossilized memories
        if (context.isEmpty()) {
            risk += 0.1f // Unanchored signals are inherently riskier
        }

        // Final coercion as dictated by the Architect
        return risk.coerceIn(0.0f, 1.0f)
    }
}
