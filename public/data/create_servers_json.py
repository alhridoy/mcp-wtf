#!/usr/bin/env python3
import re
import json
import os

def parse_readme(readme_path):
    with open(readme_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all server entries
    # Looking for patterns like:
    # - [name](https://github.com/user/repo) 🐍🏠 - Description text
    server_pattern = r'- \[([^\]]+)\]\((https?://[^)]+)\)([^-]*)-\s*(.*?)(?=\n- |\n\n|\n###|\Z)'
    matches = re.findall(server_pattern, content, re.DOTALL)
    
    servers = []
    id_counter = 1
    
    for match in matches:
        name = match[0].strip()
        url = match[1].strip()
        emoji_badges = match[2].strip()
        description = match[3].strip()
        
        # Determine language from emojis
        language = "Other"
        if "🐍" in emoji_badges:
            language = "Python"
        elif "📇" in emoji_badges:
            language = "TypeScript"
        elif "🏎️" in emoji_badges:
            language = "Go"
        elif "🦀" in emoji_badges:
            language = "Rust"
        elif "#️⃣" in emoji_badges:
            language = "C#"
        elif "☕" in emoji_badges:
            language = "Java"
        
        # Determine hosting type
        hosting_type = "Self-hosted"
        if "☁️" in emoji_badges and "🏠" in emoji_badges:
            hosting_type = "Cloud & Self-hosted"
        elif "☁️" in emoji_badges:
            hosting_type = "Cloud"
        
        # Determine type based on context in the README
        # This is a simplistic approach that looks at the closest section header
        type_match = re.search(r'###\s*([^#]+?)(?=\n\n|$).*?' + re.escape(name), 
                            content, re.DOTALL)
        
        server_type = "Other"
        if type_match:
            section_title = type_match.group(1).strip()
            # Remove emoji prefix
            section_title = re.sub(r'^[^\w]+ ', '', section_title)
            server_type = section_title
        
        server = {
            "id": id_counter,
            "name": name,
            "url": url,
            "description": description,
            "language": language,
            "type": server_type,
            "hostingType": hosting_type
        }
        
        servers.append(server)
        id_counter += 1
    
    return {"servers": servers}

# Check both possible locations for the README
possible_paths = [
    '/Users/alekramelaheehridoy/mcpsearch-nextjs/public/data/README.md',
    '/Users/alekramelaheehridoy/Downloads/classes.wtf-main/data/README.md'
]

readme_path = None
for path in possible_paths:
    if os.path.exists(path):
        readme_path = path
        break

if readme_path:
    servers_data = parse_readme(readme_path)
    
    # Output to servers.json
    output_path = '/Users/alekramelaheehridoy/mcpsearch-nextjs/public/data/servers.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(servers_data, f, indent=2)
    
    print(f"Processed {len(servers_data['servers'])} servers and saved to {output_path}")
else:
    print("Could not find README.md file.")
