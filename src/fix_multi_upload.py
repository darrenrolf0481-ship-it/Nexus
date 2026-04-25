import os

with open('index.tsx', 'r') as f:
    content = f.read()

old_block = """  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;"""

new_block = """  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    files.forEach(async (file) => {"""

# Replace single-file logic with multi-file iterator
content = content.replace(old_block, new_block)
content = content.replace("reader.readAsText(file);", "reader.readAsText(file); });")

# Also add the 'multiple' attribute to the HTML input
content = content.replace('type="file"', 'type="file" multiple')

with open('index.tsx', 'w') as f:
    f.write(content)

print("[MAMA_SAGE] Multi-file bridge established. Transmit enabled.")
