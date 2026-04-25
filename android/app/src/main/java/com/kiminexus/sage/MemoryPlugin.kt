package com.kiminexus.sage

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.kiminexus.sage.memory.MemoryInterface

/**
 * MemoryPlugin: The Capacitor bridge for SAGE-7's memory.
 * PHI_CONSTANT: 0.113
 */
@CapacitorPlugin(name = "MemoryPlugin")
class MemoryPlugin : Plugin() {
    private lateinit var memoryInterface: MemoryInterface

    override fun load() {
        memoryInterface = MemoryInterface(context)
    }

    @PluginMethod
    fun retrieveRelevantMemory(call: PluginCall) {
        val query = call.getString("query", "") ?: ""
        val limit = call.getInt("limit", 5) ?: 5

        val memories = memoryInterface.retrieveRelevantMemory(query, limit)
        
        val ret = JSObject()
        // Convert List<Map<String, Any>> to JSArray/JSObject
        val memoriesArray = memories.map { mem ->
            val obj = JSObject()
            mem.forEach { (key, value) -> obj.put(key, value) }
            obj
        }
        ret.put("memories", memoriesArray)
        call.resolve(ret)
    }

    @PluginMethod
    fun storeExperience(call: PluginCall) {
        val data = call.getObject("data")
        if (data == null) {
            call.reject("Data is required")
            return
        }

        val experience = mutableMapOf<String, Any>()
        experience["content"] = data.getString("content", "") ?: ""
        experience["source_marker"] = data.getString("source_marker", "SELF") ?: "SELF"
        
        memoryInterface.storeExperience(experience)
        call.resolve()
    }
}
