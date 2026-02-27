import { skills } from './content'

/**
 * Flatten skills into node labels for the tech-sphere (split by comma / period).
 */
function splitItems(items: string): string[] {
  return items
    .split(/[,.]/)
    .map((s) => s.replace(/^[\s\S]*?:\s*/, '').trim())
    .filter((s) => s.length > 0)
}

export interface SkillNode {
  id: string
  label: string
  group: string
}

const nodeList: SkillNode[] = []
const seen = new Set<string>()

for (const group of skills.groups) {
  const labels = splitItems(group.items)
  for (const label of labels) {
    const key = label.toLowerCase().replace(/\s+/g, '-')
    if (seen.has(key)) continue
    seen.add(key)
    nodeList.push({ id: key, label, group: group.title })
  }
}

export const skillNodes: SkillNode[] = nodeList
