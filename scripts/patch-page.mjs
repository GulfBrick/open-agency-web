import { readFileSync, writeFileSync } from 'fs';

const filepath = 'C:\\Users\\danie\\Documents\\open-agency-web\\src\\app\\page.tsx';
let content = readFileSync(filepath, 'utf8');

// 1. Replace PARTICLES (12 -> 30, use bottom for upward float like local dashboard)
const oldParticles = `const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: \`\${10 + (i * 7.3) % 80}%\`,
  top: \`\${20 + (i * 11.7) % 60}%\`,
  size: i % 3 === 0 ? 3 : 2,
  duration: \`\${3 + (i * 0.7)}s\`,
  delay: \`\${(i * 0.4)}s\`,
  star: i % 4 === 0,
}))`;

const newParticles = `// Cycling bubble messages per agent
const AGENT_BUBBLES = {
  nikita:  ['Running the agency...', 'Reviewing briefing...', 'Checking pipeline...', 'On a call with Harry...', 'Agency is live'],
  nova:    ['Designing assets...', 'Brand refresh...', 'Updating deck...', 'Review in 5...', 'Typography locked'],
  iris:    ['Crafting visuals...', 'UI polished...', 'Icons done...', 'Design system update', 'Pixel-perfect'],
  finn:    ['Cutting footage...', 'Export queued...', 'Colour grading...', 'Motion graphics...', 'Render at 80%'],
  jade:    ['Scheduling posts...', 'Drafting caption...', 'Story uploaded', 'Engagement up...', 'LinkedIn queued'],
  ash:     ['Writing copy...', 'Blog post done', 'Email draft ready', 'SEO optimised...', 'Headlines polished'],
  jordan:  ['Closing deals...', 'Call with prospect', 'Pipeline updated', 'Sending follow-up', 'Warm lead active'],
  river:   ['Sending proposal...', 'Closing call prep', 'Contract sent', 'Following up...', 'Deal in review'],
  quinn:   ['Qualifying leads...', 'CRM updated', 'New lead scored...', 'Outreach sent...', 'Lead qualified'],
  eden:    ['Following up...', 'Sequences live...', 'Reply received', 'Sequence updated', 'Task done'],
  blake:   ['Building deck...', 'Proposal ready...', 'Design updated', 'Pricing confirmed', 'Deck sent'],
  kai:     ['Merging PR #47...', 'Deploy triggered...', 'CI passing', 'Reviewing PR #51', 'Shipped to prod'],
  sage:    ['Designing system...', 'Architecture done', 'Schema reviewed', 'Infra plan locked', 'Scaling strategy'],
  luna:    ['Shipping feature...', 'Component built', 'CSS polished...', 'Mobile responsive', 'Animation smooth'],
  rex:     ['Writing tests...', 'API endpoint live', 'DB migrated', 'Perf optimised...', 'Test coverage 94%'],
  avery:   ['Idle...', 'Standing by...', 'Available...', 'Ready to deploy', 'Waiting for task'],
  atlas:   ['Reviewing code...', 'PR reviewed', 'Bug reported...', 'Test suite green', 'QA done'],
  orion:   ['Reviewing PR...', 'Comments left', 'Approved PR #49', 'Security check...', 'Review complete'],
  marcus:  ['Reconciling accounts...', 'Invoice raised', 'Burn rate checked', 'P&L updated', 'Cash flow green'],
  zara:    ['Reviewing infra...', 'Uptime 99.9%', 'Scaling nodes...', 'Security patched', 'Infra optimised'],
  priya:   ['Drafting campaigns...', 'Campaign live', 'ROI calculated...', 'Ad creative done', 'Funnel optimised'],
}

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: \`\${(i * 3.33) % 100}%\`,
  bottom: \`\${(i * 7.7) % 40}%\`,
  size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2.5 : 2,
  duration: \`\${4 + (i * 0.4) % 6}s\`,
  delay: \`\${(i * 0.27) % 8}s\`,
  star: i % 5 === 0,
  opacity: 0.4 + (i % 4) * 0.15,
}))`;

if (content.includes(oldParticles)) {
  content = content.replace(oldParticles, newParticles);
  console.log('Replaced PARTICLES ok');
} else {
  console.error('PARTICLES old text not found');
  process.exit(1);
}

// 2. Update AgentDesk component to use cycling bubble text
const oldAgentDesk = `function AgentDesk({ agent }: { agent: typeof AGENTS.csuite[0] }) {
  const [hovered, setHovered] = useState(false)
  const isOnline = agent.status === 'online'
  const isCeo = agent.id === 'nikita'
  const stats = AGENT_STATS[agent.id] || { done: 0, active: 0, rank: agent.role }

  return (`;

const newAgentDesk = `function AgentDesk({ agent }: { agent: typeof AGENTS.csuite[0] }) {
  const [hovered, setHovered] = useState(false)
  const [bubbleIdx, setBubbleIdx] = useState(0)
  const isOnline = agent.status === 'online'
  const isCeo = agent.id === 'nikita'
  const stats = AGENT_STATS[agent.id] || { done: 0, active: 0, rank: agent.role }
  const bubbles = AGENT_BUBBLES[agent.id] || [agent.bubble]

  // Cycle bubble text every 4–8s (stagger by agent index in array)
  useEffect(() => {
    const offset = (agent.id.charCodeAt(0) % 5) * 1200
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setBubbleIdx(i => (i + 1) % bubbles.length)
      }, 5000 + offset)
      return () => clearInterval(interval)
    }, offset)
    return () => clearTimeout(timer)
  }, [bubbles.length, agent.id])

  return (`;

if (content.includes(oldAgentDesk)) {
  content = content.replace(oldAgentDesk, newAgentDesk);
  console.log('Replaced AgentDesk ok');
} else {
  console.error('AgentDesk old text not found');
  process.exit(1);
}

// 3. Update the bubble div inside AgentDesk to use bubbleIdx
// Find the bubble div in the return JSX
const oldBubbleDiv = `      <div className="bubble">{agent.bubble}</div>`;
const newBubbleDiv = `      <div className="bubble">{bubbles[bubbleIdx]}</div>`;

if (content.includes(oldBubbleDiv)) {
  content = content.replace(oldBubbleDiv, newBubbleDiv);
  console.log('Replaced bubble div ok');
} else {
  console.error('bubble div old text not found');
  process.exit(1);
}

// 4. Update particle rendering - use bottom instead of top for upward float
const oldParticleRender = `              className={\`particle \${p.star ? 'star' : ''}\`}
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDuration: p.duration,
                animationDelay: p.delay,
              }}`;

const newParticleRender = `              className={\`particle \${p.star ? 'star' : ''}\`}
              style={{
                left: p.left,
                bottom: p.bottom,
                width: p.size,
                height: p.size,
                animationDuration: p.duration,
                animationDelay: p.delay,
                opacity: p.opacity || 0.8,
              }}`;

if (content.includes(oldParticleRender)) {
  content = content.replace(oldParticleRender, newParticleRender);
  console.log('Replaced particle render ok');
} else {
  console.error('particle render old text not found - trying alternative');
}

writeFileSync(filepath, content, 'utf8');
console.log('Done! File written.');
