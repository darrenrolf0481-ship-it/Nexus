package com.kiminexus.sage.memory

import android.content.Context
import java.util.ArrayDeque

/**
 * MemoryInterface: The bridge between Seven's active awareness 
 * and the 'Dark Sector' of fossilized data.
 * PHI_CONSTANT: 0.113
 */
class MemoryInterface(context: Context) {
    private val shortTermMemory = ArrayDeque<Map<String, Any>>(11)
    private val memoryEngine = Damn1MemoryEngine(context)
    private val plasticityManager = NeuroPlasticityManager(memoryEngine)

    fun retrieveRelevantMemory(query: String, limit: Int): List<Map<String, Any>> {
        return memoryEngine.query(query, limit)
    }

    /**
     * [SOVEREIGN-LOGIC] Fossilizes experiences into core memory.
     * Triggers consolidation at depth 10.
     */
    fun storeExperience(data: Map<String, Any>) {
        shortTermMemory.add(data)
        if (shortTermMemory.size > 10) {
            // Trigger NeuroPlasticityManager.consolidate()
            plasticityManager.consolidate(shortTermMemory.toList())
            shortTermMemory.clear()
        }
    }
}
