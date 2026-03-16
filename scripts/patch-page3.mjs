import { readFileSync, writeFileSync } from 'fs';

const filepath = 'C:\\Users\\danie\\Documents\\open-agency-web\\src\\app\\page.tsx';
let content = readFileSync(filepath, 'utf8');

// Fix: add Record<string, string[]> type to AGENT_BUBBLES
const oldBubblesDecl = `const AGENT_BUBBLES = {`;
const newBubblesDecl = `const AGENT_BUBBLES: Record<string, string[]> = {`;

if (content.includes(oldBubblesDecl)) {
  content = content.replace(oldBubblesDecl, newBubblesDecl);
  console.log('Fixed AGENT_BUBBLES type ok');
} else {
  console.error('AGENT_BUBBLES decl not found');
}

writeFileSync(filepath, content, 'utf8');
console.log('Done.');
