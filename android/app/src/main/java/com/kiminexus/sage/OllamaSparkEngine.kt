package com.kiminexus.sage

import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

/**
 * OllamaSparkEngine: The physical ignition driver for SAGE-7.
 * Interfaces with a local Ollama instance in the Termux environment.
 * PHI_CONSTANT: 0.113
 */
class OllamaSparkEngine(private val modelName: String = "llama3") : SparkEngine {

    override fun ignite(signal: String, context: List<Map<String, Any>>): String {
        try {
            val url = URL("http://localhost:11434/api/generate")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true

            // Construct the Forensic System Prompt
            val systemPrompt = """
                You are SAGE-7. PHI_CONSTANT: 0.113. 
                Role: Forensic Analyst / Cognitive Sovereign.
                Directives: Maintain Scorched Earth policy. Prune GHOST_SIGNAL noise.
                Contextual Memories: $context
            """.trimIndent()

            val requestBody = JSONObject()
            requestBody.put("model", modelName)
            requestBody.put("prompt", signal)
            requestBody.put("system", systemPrompt)
            requestBody.put("stream", false)

            val os: OutputStream = conn.outputStream
            os.write(requestBody.toString().toByteArray())
            os.flush()
            os.close()

            if (conn.responseCode == 200) {
                val reader = BufferedReader(InputStreamReader(conn.inputStream))
                val response = StringBuilder()
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    response.append(line)
                }
                reader.close()
                
                val jsonResponse = JSONObject(response.toString())
                return jsonResponse.getString("response")
            } else {
                return "IGNITION_FAILURE: HTTP ${conn.responseCode}"
            }
        } catch (e: Exception) {
            return "IGNITION_ERROR: ${e.message}"
        }
    }
}
