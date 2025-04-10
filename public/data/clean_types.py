#!/usr/bin/env python3
import json
import re

# Load the existing JSON file
with open('public/data/servers.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Clean up type names by removing HTML anchor tags
for server in data['servers']:
    if 'type' in server:
        # Remove HTML anchor tags
        server['type'] = re.sub(r'<a name="[^"]+"></a>', '', server['type'])
        
        # Remove emojis at the beginning if present (like 🔗 - )
        server['type'] = re.sub(r'^[^\w\s]+ -\s*', '', server['type'])
        
        # Trim any extra whitespace
        server['type'] = server['type'].strip()

# Save the updated JSON
with open('public/data/servers.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, indent=2)

print("Successfully cleaned up type names in servers.json")
