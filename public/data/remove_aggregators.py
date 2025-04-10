#!/usr/bin/env python3
import json

# Load the existing JSON file
with open('public/data/servers.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Replace "Aggregators" with "API Gateway" for all servers
for server in data['servers']:
    if server.get('type') == 'Aggregators':
        server['type'] = 'API Gateway'

# Save the updated JSON
with open('public/data/servers.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, indent=2)

print("Successfully replaced 'Aggregators' with 'API Gateway' in servers.json")
