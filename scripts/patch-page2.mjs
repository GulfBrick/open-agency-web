import { readFileSync, writeFileSync } from 'fs';

const filepath = 'C:\\Users\\danie\\Documents\\open-agency-web\\src\\app\\page.tsx';
let content = readFileSync(filepath, 'utf8');

// Fix the rooftop PARTICLES render (building particles use bottom, not top)
const oldRooftopParticleStyle = `                  className={\`particle \${p.star ? 'star' : ''}\`}
                  style={{
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,`;

const newRooftopParticleStyle = `                  className={\`particle \${p.star ? 'star' : ''}\`}
                  style={{
                    left: p.left,
                    bottom: p.bottom,
                    width: p.size,
                    height: p.size,`;

if (content.includes(oldRooftopParticleStyle)) {
  content = content.replace(oldRooftopParticleStyle, newRooftopParticleStyle);
  console.log('Fixed rooftop particle style ok');
} else {
  console.error('Could not find rooftop particle style');
  // try to show what's there
  const idx = content.indexOf("particle ${p.star");
  console.log('Found particle at:', idx);
  console.log('Context:', JSON.stringify(content.substring(idx - 100, idx + 300)));
}

writeFileSync(filepath, content, 'utf8');
console.log('Done.');
