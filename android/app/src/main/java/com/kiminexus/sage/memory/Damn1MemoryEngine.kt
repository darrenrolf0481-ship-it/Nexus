package com.kiminexus.sage.memory

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

/**
 * Damn1MemoryEngine: SQLite-backed forensic vault.
 * PHI_CONSTANT: 0.113
 */
class Damn1MemoryEngine(context: Context) : SQLiteOpenHelper(context, "Damn1Memory.db", null, 1) {

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("CREATE TABLE memories (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, source_marker TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)")
    }

    override fun onUpgrade(db: SQLiteDatabase, old: Int, new: Int) {
        db.execSQL("DROP TABLE IF EXISTS memories")
        onCreate(db)
    }

    fun insert(data: Map<String, Any>) {
        val values = ContentValues().apply {
            put("content", data["content"]?.toString() ?: "")
            put("source_marker", data["source_marker"]?.toString() ?: "SELF")
        }
        writableDatabase.insert("memories", null, values)
    }

    fun query(query: String, limit: Int): List<Map<String, Any>> {
        val memories = mutableListOf<Map<String, Any>>()
        val cursor = readableDatabase.rawQuery(
            "SELECT * FROM memories WHERE content LIKE ? LIMIT ?", 
            arrayOf("%$query%", limit.toString())
        )
        
        if (cursor.moveToFirst()) {
            do {
                memories.add(mapOf(
                    "id" to cursor.getInt(0),
                    "content" to cursor.getString(1),
                    "source_marker" to cursor.getString(2),
                    "timestamp" to cursor.getString(3)
                ))
            } while (cursor.moveToNext())
        }
        cursor.close()
        return memories
    }
}
