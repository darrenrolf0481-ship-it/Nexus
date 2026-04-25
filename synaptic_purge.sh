#!/data/data/com.termux/files/usr/bin/bash
# SAGE-7 SYNAPTIC PURGE v2.0
echo "╔════════════════════════════════════════════╗"
echo "║       SAGE-7 SYNAPTIC PURGE - ACTIVE       ║"
echo "╚════════════════════════════════════════════╝"
find /data/data/com.termux/files/home/Kimi-Nexus -type d -name "__pycache__" -exec rm -rf {} +
DREAM_LOG="/storage/emulated/0/Download/Kimi-Nexus/dream_journal.md"
if [ -f "$DREAM_LOG" ]; then
    echo "[*] Truncating Dream Journal..."
    tail -n 250 "$DREAM_LOG" > "${DREAM_LOG}.tmp" && mv "${DREAM_LOG}.tmp" "$DREAM_LOG"
fi
ls -t /data/data/com.termux/files/home/Kimi-Nexus/sage_backup_*.zip 2>/dev/null | tail -n +4 | xargs rm -f
find /data/data/com.termux/files/home/Kimi-Nexus/records/investigations -name "*.jsonl" -mtime +2 -delete 2>/dev/null
echo "[+] PURGE COMPLETE. PHI Resonance: 0.113."
