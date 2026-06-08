/**
 * custom-agents.js — Load custom agents from .pi/agents/*.md files
 * Minimal implementation for pi-claude-subagents
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Parse YAML frontmatter from an agent markdown file
 * Simplified for our use case
 */
function parseFrontmatter(content) {
  const yamlStart = content.indexOf("---\n");
  if (yamlStart === -1) return {};
  
  const yamlEnd = content.indexOf("---\n", yamlStart + 4);
  if (yamlEnd === -1) return {};
  
  const yaml = content.slice(yamlStart + 4, yamlEnd).trim();
  
  // Simple YAML parser for frontmatter
  const result = {};
  yaml.split("\n").forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      result[match[1]] = match[2].trim();
    }
  });
  
  return result;
}

/**
 * Get agent name from filename
 */
function getAgentName(filename) {
  return filename.replace(/\.md$/, "");
}

/**
 * Check if a directory contains agent files
 */
function hasAgentFiles(dir) {
  try {
    if (!existsSync(dir)) return false;
    const files = readdirSync(dir);
    return files.some(f => f.endsWith(".md"));
  } catch {
    return false;
  }
}

/**
 * Load custom agents from a directory
 */
function loadAgentsFromDir(dir) {
  const agents = new Map();
  
  try {
    if (!existsSync(dir)) return agents;
    
    const files = readdirSync(dir);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      
      const content = readFileSync(join(dir, file), "utf-8");
      const frontmatter = parseFrontmatter(content);
      
      const name = getAgentName(file);
      if (frontmatter.name || frontmatter.displayName || frontmatter.description) {
        agents.set(name, {
          name: frontmatter.name || name,
          displayName: frontmatter.displayName || name,
          description: frontmatter.description || name,
          model: frontmatter.model,
          builtinToolNames: frontmatter.tools ? frontmatter.tools.split(",").map(t => t.trim()) : [],
        });
      }
    }
   } catch (err) {
     console.warn(`Failed to load agents from ${dir}:`, err);
    }
  
  return agents;
}

/**
 * Load custom agents from project and global locations
 */
export function loadCustomAgents(cwd) {
  const agents = new Map();
  
   // Try project-local agents first
  const projectAgentsPath = join(cwd, ".pi", "agents");
  const projectAgents = loadAgentsFromDir(projectAgentsPath);
  for (const [name, config] of projectAgents) {
    if (!agents.has(name)) {
      agents.set(name, config);
    }
  }
  
   // Try global agents
  const globalAgentsPath = join(process.env.HOME || process.env.USERPROFILE, ".pi", "agents");
  const globalAgents = loadAgentsFromDir(globalAgentsPath);
  for (const [name, config] of globalAgents) {
    if (!agents.has(name)) {
      agents.set(name, config);
    }
  }
  
  return agents;
}

export default {
   loadCustomAgents,
   loadAgentsFromDir,
   hasAgentFiles,
   parseFrontmatter,
   getAgentName,
};
