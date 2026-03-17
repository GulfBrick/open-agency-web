import { NextResponse } from 'next/server'

const AGENCY_URL = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const API_KEY = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

// All 27 agents — fallback list if backend is offline
const FALLBACK_AGENTS = [
  { id: 'nikita',  name: 'Nikita',  role: 'CEO',               department: 'Leadership', tiers: ['starter','growth','enterprise'] },
  { id: 'rex',     name: 'Rex',     role: 'Sales Director',     department: 'Sales',      tiers: ['enterprise'] },
  { id: 'lena',    name: 'Lena',    role: 'Lead Generation',    department: 'Sales',      tiers: ['enterprise'] },
  { id: 'cleo',    name: 'Cleo',    role: 'Outreach',           department: 'Sales',      tiers: ['enterprise'] },
  { id: 'sam',     name: 'Sam',     role: 'CRM Management',     department: 'Sales',      tiers: ['enterprise'] },
  { id: 'priya',   name: 'Priya',   role: 'Marketing Director', department: 'Marketing',  tiers: ['growth','enterprise'] },
  { id: 'mia',     name: 'Mia',     role: 'Social Media',       department: 'Marketing',  tiers: ['growth','enterprise'] },
  { id: 'theo',    name: 'Theo',    role: 'SEO',                department: 'Marketing',  tiers: ['growth','enterprise'] },
  { id: 'luna',    name: 'Luna',    role: 'Paid Ads',           department: 'Marketing',  tiers: ['growth','enterprise'] },
  { id: 'kai',     name: 'Kai',     role: 'Dev Lead',           department: 'Development',tiers: ['growth','enterprise'] },
  { id: 'rio',     name: 'Rio',     role: 'Frontend Dev',       department: 'Development',tiers: ['growth','enterprise'] },
  { id: 'nova',    name: 'Nova',    role: 'Backend Dev',        department: 'Development',tiers: ['growth','enterprise'] },
  { id: 'byte',    name: 'Byte',    role: 'QA',                 department: 'Development',tiers: ['growth','enterprise'] },
  { id: 'marcus',  name: 'Marcus',  role: 'Finance Director',   department: 'Finance',    tiers: ['growth','enterprise'] },
  { id: 'iris',    name: 'Iris',    role: 'Bookkeeping',        department: 'Finance',    tiers: ['enterprise'] },
  { id: 'felix',   name: 'Felix',   role: 'Forecasting',        department: 'Finance',    tiers: ['enterprise'] },
  { id: 'zara',    name: 'Zara',    role: 'Creative Director',  department: 'Creative',   tiers: ['growth','enterprise'] },
  { id: 'eli',     name: 'Eli',     role: 'Copywriter',         department: 'Creative',   tiers: ['growth','enterprise'] },
  { id: 'nora',    name: 'Nora',    role: 'Graphic Design',     department: 'Creative',   tiers: ['growth','enterprise'] },
  { id: 'otto',    name: 'Otto',    role: 'Operations Manager', department: 'Operations', tiers: ['enterprise'] },
  { id: 'vera',    name: 'Vera',    role: 'Admin',              department: 'Operations', tiers: ['enterprise'] },
  { id: 'lex',     name: 'Lex',     role: 'Legal Director',     department: 'Legal',      tiers: ['enterprise'] },
  { id: 'cora',    name: 'Cora',    role: 'Compliance',         department: 'Legal',      tiers: ['enterprise'] },
  { id: 'jules',   name: 'Jules',   role: 'Documentation',      department: 'Legal',      tiers: ['enterprise'] },
  { id: 'harper',  name: 'Harper',  role: 'HR Director',        department: 'HR',         tiers: ['enterprise'] },
  { id: 'drew',    name: 'Drew',    role: 'Talent',             department: 'HR',         tiers: ['enterprise'] },
  { id: 'sage',    name: 'Sage',    role: 'People Ops',         department: 'HR',         tiers: ['enterprise'] },
]

// GET /api/agents — list all 27 agents
export async function GET() {
  try {
    const res = await fetch(`${AGENCY_URL}/api/agents`, {
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      signal: AbortSignal.timeout(8000),
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch {
    // fall through to static fallback
  }

  return NextResponse.json(FALLBACK_AGENTS)
}
