/**
 * Pre-rendered SVG Sample Images for immediate testing without uploading
 */

export const SAMPLE_IMAGES = [
  {
    id: "nature-peaks",
    title: "Mountain Mist & Moon",
    category: "Landscape",
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1400" width="1000" height="1400">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0b132b"/>
            <stop offset="50%" stop-color="#1c2541"/>
            <stop offset="100%" stop-color="#3a506b"/>
          </linearGradient>
          <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#e0e1dd"/>
          </linearGradient>
          <linearGradient id="mount1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4a5568"/>
            <stop offset="100%" stop-color="#1a202c"/>
          </linearGradient>
          <linearGradient id="mount2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2d3748"/>
            <stop offset="100%" stop-color="#0d1117"/>
          </linearGradient>
        </defs>
        <rect width="1000" height="1400" fill="url(#skyGrad)"/>
        
        <!-- Stars -->
        <g fill="#ffffff" opacity="0.8">
          <circle cx="150" cy="120" r="2.5"/><circle cx="280" cy="80" r="1.5"/><circle cx="420" cy="190" r="2"/>
          <circle cx="620" cy="110" r="3"/><circle cx="780" cy="160" r="1.5"/><circle cx="890" cy="90" r="2.5"/>
          <circle cx="200" cy="300" r="1.8"/><circle cx="340" cy="380" r="2.2"/><circle cx="530" cy="280" r="1.5"/>
          <circle cx="720" cy="320" r="2.8"/><circle cx="850" cy="270" r="2"/>
        </g>

        <!-- Giant Moon -->
        <circle cx="500" cy="450" r="220" fill="url(#moonGrad)" opacity="0.95"/>
        <circle cx="430" cy="400" r="30" fill="#cbd5e1" opacity="0.4"/>
        <circle cx="570" cy="490" r="45" fill="#cbd5e1" opacity="0.35"/>
        <circle cx="490" cy="550" r="25" fill="#cbd5e1" opacity="0.3"/>

        <!-- Distant Mountains -->
        <polygon points="0,850 250,550 550,900 800,600 1000,850 1000,1400 0,1400" fill="url(#mount1)" opacity="0.85"/>
        
        <!-- Mid-ground Mountains with sharp ridges -->
        <polygon points="0,980 180,720 380,950 680,680 920,950 1000,900 1000,1400 0,1400" fill="url(#mount2)"/>
        
        <!-- Pine Trees in Foreground -->
        <g fill="#05080f">
          <polygon points="50,1100 20,1350 80,1350"/>
          <polygon points="120,1050 80,1350 160,1350"/>
          <polygon points="200,1150 170,1350 230,1350"/>
          <polygon points="780,1080 740,1380 820,1380"/>
          <polygon points="880,1020 830,1380 930,1380"/>
          <polygon points="950,1120 920,1380 980,1380"/>
        </g>
        
        <!-- Mist layer -->
        <rect y="1200" width="1000" height="200" fill="#ffffff" opacity="0.12"/>
      </svg>
    `
  },
  {
    id: "cozy-reading",
    title: "Cozy Library & Coffee",
    category: "Illustration",
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1400" width="1000" height="1400">
        <rect width="1000" height="1400" fill="#f4ece1"/>
        
        <!-- Bookshelves background -->
        <rect x="100" y="100" width="800" height="1200" rx="16" fill="#4a3728"/>
        <rect x="120" y="120" width="760" height="1160" rx="10" fill="#2b1e16"/>
        
        <!-- Shelf Dividers -->
        <rect x="120" y="380" width="760" height="24" fill="#6b4f3a"/>
        <rect x="120" y="680" width="760" height="24" fill="#6b4f3a"/>
        <rect x="120" y="980" width="760" height="24" fill="#6b4f3a"/>
        
        <!-- Books on Shelf 1 -->
        <g>
          <rect x="150" y="180" width="45" height="200" fill="#c0392b" rx="4"/>
          <rect x="200" y="220" width="55" height="160" fill="#2980b9" rx="4"/>
          <rect x="260" y="160" width="60" height="220" fill="#27ae60" rx="4"/>
          <rect x="325" y="200" width="40" height="180" fill="#f39c12" rx="4"/>
          <rect x="370" y="190" width="50" height="190" fill="#8e44ad" rx="4"/>
          <rect x="425" y="240" width="70" height="140" fill="#d35400" rx="4"/>
          <rect x="520" y="170" width="55" height="210" fill="#16a085" rx="4"/>
          <rect x="580" y="210" width="45" height="170" fill="#e74c3c" rx="4"/>
          <rect x="630" y="180" width="65" height="200" fill="#34495e" rx="4"/>
          <rect x="700" y="230" width="50" height="150" fill="#9b59b6" rx="4"/>
          <rect x="755" y="160" width="55" height="220" fill="#f1c40f" rx="4"/>
        </g>
        
        <!-- Stacked books on Shelf 2 -->
        <g>
          <rect x="180" y="610" width="220" height="40" fill="#e67e22" rx="4"/>
          <rect x="195" y="565" width="190" height="45" fill="#1abc9c" rx="4"/>
          <rect x="210" y="525" width="160" height="40" fill="#95a5a6" rx="4"/>
          
          <!-- Potted Plant on shelf -->
          <ellipse cx="650" cy="660" rx="45" ry="18" fill="#7f8c8d"/>
          <path d="M605,660 Q650,600 695,660 Z" fill="#b03a2e"/>
          <path d="M650,600 Q620,530 580,550 Q610,580 645,595" fill="#27ae60"/>
          <path d="M650,600 Q680,510 720,530 Q680,570 655,595" fill="#2ecc71"/>
          <path d="M650,600 Q650,500 660,490 Q665,550 652,595" fill="#1e8449"/>
        </g>
        
        <!-- Coffee Mug on Shelf 3 -->
        <g>
          <rect x="300" y="870" width="140" height="110" rx="16" fill="#ecf0f1"/>
          <path d="M440,890 C470,890 470,950 440,950" stroke="#ecf0f1" stroke-width="14" fill="none"/>
          <path d="M340,840 Q330,800 345,770" stroke="#bdc3c7" stroke-width="4" fill="none" opacity="0.6"/>
          <path d="M370,840 Q385,800 370,760" stroke="#bdc3c7" stroke-width="4" fill="none" opacity="0.6"/>
          <text x="370" y="935" font-size="28" text-anchor="middle" fill="#34495e">☕</text>
        </g>
        
        <!-- Quote banner at bottom -->
        <rect x="180" y="1050" width="640" height="150" rx="12" fill="#fdfbf7" stroke="#d4af37" stroke-width="3"/>
        <text x="500" y="1110" font-size="26" font-weight="bold" font-family="serif" text-anchor="middle" fill="#2c3e50">
          “So many books, so little time.”
        </text>
        <text x="500" y="1155" font-size="20" font-style="italic" font-family="serif" text-anchor="middle" fill="#7f8c8d">
          ― Frank Zappa
        </text>
      </svg>
    `
  },
  {
    id: "cyber-skyline",
    title: "Cyberpunk Tokyo Skyline",
    category: "Architecture",
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1400" width="1000" height="1400">
        <defs>
          <linearGradient id="cyberSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#050510"/>
            <stop offset="60%" stop-color="#180b2c"/>
            <stop offset="100%" stop-color="#3d144c"/>
          </linearGradient>
          <linearGradient id="neonSun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ff007f"/>
            <stop offset="100%" stop-color="#ffaa00"/>
          </linearGradient>
        </defs>
        <rect width="1000" height="1400" fill="url(#cyberSky)"/>
        
        <!-- Retrowave Sun with Venetian Blind cuts -->
        <g>
          <circle cx="500" cy="580" r="200" fill="url(#neonSun)"/>
          <rect x="250" y="570" width="500" height="8" fill="#180b2c"/>
          <rect x="250" y="600" width="500" height="14" fill="#180b2c"/>
          <rect x="250" y="635" width="500" height="22" fill="#180b2c"/>
          <rect x="250" y="680" width="500" height="32" fill="#180b2c"/>
          <rect x="250" y="730" width="500" height="45" fill="#180b2c"/>
        </g>
        
        <!-- Tower Spire -->
        <polygon points="495,200 505,200 515,650 485,650" fill="#090614"/>
        <circle cx="500" cy="190" r="8" fill="#00ffff"/>
        
        <!-- Background Buildings Silhouette -->
        <rect x="60" y="650" width="140" height="750" fill="#0d091a"/>
        <rect x="230" y="580" width="180" height="820" fill="#0b0816"/>
        <rect x="580" y="600" width="160" height="800" fill="#0a0715"/>
        <rect x="780" y="670" width="170" height="730" fill="#0d091a"/>
        
        <!-- Foreground High-density Skyscrapers -->
        <rect x="120" y="740" width="180" height="660" fill="#05030a"/>
        <rect x="340" y="700" width="220" height="700" fill="#030206"/>
        <rect x="620" y="760" width="190" height="640" fill="#040208"/>
        
        <!-- Window Grids & Neon signs -->
        <g fill="#00ffff" opacity="0.75">
          <rect x="360" y="730" width="12" height="18"/><rect x="390" y="730" width="12" height="18"/><rect x="420" y="730" width="12" height="18"/>
          <rect x="360" y="780" width="12" height="18"/><rect x="390" y="780" width="12" height="18"/><rect x="420" y="780" width="12" height="18"/>
          <rect x="360" y="830" width="12" height="18"/><rect x="390" y="830" width="12" height="18"/><rect x="420" y="830" width="12" height="18"/>
          <rect x="360" y="880" width="12" height="18"/><rect x="390" y="880" width="12" height="18"/><rect x="420" y="880" width="12" height="18"/>
          <rect x="150" y="770" width="10" height="14"/><rect x="180" y="770" width="10" height="14"/>
          <rect x="150" y="820" width="10" height="14"/><rect x="180" y="820" width="10" height="14"/>
        </g>
        <g fill="#ff007f" opacity="0.85">
          <rect x="470" y="750" width="40" height="120" rx="4"/>
          <text x="490" y="820" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">電</text>
        </g>
      </svg>
    `
  },
  {
    id: "vintage-botanical",
    title: "Vintage Botanical Ferns",
    category: "Nature",
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1400" width="1000" height="1400">
        <rect width="1000" height="1400" fill="#fdfaf3"/>
        
        <!-- Ornate Double Border -->
        <rect x="40" y="40" width="920" height="1320" fill="none" stroke="#2c3e50" stroke-width="4"/>
        <rect x="56" y="56" width="888" height="1288" fill="none" stroke="#2c3e50" stroke-width="1.5"/>
        
        <!-- Corner Flourishes -->
        <circle cx="56" cy="56" r="10" fill="#2c3e50"/>
        <circle cx="944" cy="56" r="10" fill="#2c3e50"/>
        <circle cx="56" cy="1344" r="10" fill="#2c3e50"/>
        <circle cx="944" cy="1344" r="10" fill="#2c3e50"/>
        
        <!-- Main Stem & Fern Leaves -->
        <g stroke="#1a3a2a" stroke-width="6" fill="#2d5a3f" stroke-linejoin="round">
          <path d="M500,1150 Q520,700 480,250" fill="none"/>
          
          <!-- Left fronds -->
          <path d="M495,1000 Q360,940 280,980 Q370,1030 495,1030 Z"/>
          <path d="M495,860 Q340,790 240,830 Q350,890 495,890 Z"/>
          <path d="M490,720 Q330,640 220,680 Q340,740 490,750 Z"/>
          <path d="M485,580 Q340,490 250,520 Q350,580 485,600 Z"/>
          <path d="M480,440 Q370,360 290,380 Q370,440 480,460 Z"/>
          <path d="M480,310 Q400,240 340,250 Q390,310 480,330 Z"/>
          
          <!-- Right fronds -->
          <path d="M505,950 Q640,890 730,930 Q630,980 505,980 Z"/>
          <path d="M502,810 Q660,740 760,780 Q650,840 502,840 Z"/>
          <path d="M498,670 Q670,590 780,630 Q660,690 498,700 Z"/>
          <path d="M493,530 Q660,440 750,470 Q650,530 493,550 Z"/>
          <path d="M488,390 Q630,310 710,330 Q630,390 488,410 Z"/>
          <path d="M483,270 Q600,200 660,210 Q610,270 483,290 Z"/>
        </g>
        
        <!-- Plate Typography -->
        <text x="500" y="1220" font-family="serif" font-size="34" font-weight="bold" letter-spacing="4" text-anchor="middle" fill="#1a3a2a">
          POLYPODIUM VULGARE
        </text>
        <text x="500" y="1260" font-family="serif" font-size="20" font-style="italic" letter-spacing="2" text-anchor="middle" fill="#556b2f">
          Common Polypody Fern • Tab. XLVIII
        </text>
      </svg>
    `
  },
  {
    id: "tolkien-quote",
    title: "Classic Calligraphy & Quote",
    category: "Typography",
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1400" width="1000" height="1400">
        <rect width="1000" height="1400" fill="#18181b"/>
        
        <rect x="70" y="70" width="860" height="1260" fill="none" stroke="#e4e4e7" stroke-width="2"/>
        <rect x="85" y="85" width="830" height="1230" fill="none" stroke="#71717a" stroke-width="1" stroke-dasharray="8,8"/>
        
        <!-- Compass Emblem Top -->
        <g stroke="#e4e4e7" stroke-width="2" fill="none" transform="translate(500, 320)">
          <circle cx="0" cy="0" r="90"/>
          <circle cx="0" cy="0" r="75" stroke-dasharray="4,4"/>
          <polygon points="0,-120 18,-30 0,-15 -18,-30" fill="#e4e4e7"/>
          <polygon points="0,120 18,30 0,15 -18,30" fill="#71717a"/>
          <polygon points="120,0 30,18 15,0 30,-18" fill="#a1a1aa"/>
          <polygon points="-120,0 -30,18 -15,0 -30,-18" fill="#a1a1aa"/>
          <circle cx="0" cy="0" r="10" fill="#ffffff"/>
        </g>
        
        <!-- Quote Text -->
        <text x="500" y="620" font-family="serif" font-size="42" font-style="italic" text-anchor="middle" fill="#a1a1aa">
          Not all those
        </text>
        <text x="500" y="700" font-family="serif" font-size="64" font-weight="900" letter-spacing="6" text-anchor="middle" fill="#ffffff">
          WHO WANDER
        </text>
        <text x="500" y="780" font-family="serif" font-size="52" font-weight="bold" letter-spacing="4" text-anchor="middle" fill="#f43f5e">
          ARE LOST
        </text>
        
        <path d="M300,840 L700,840" stroke="#71717a" stroke-width="2"/>
        <circle cx="500" cy="840" r="6" fill="#f43f5e"/>
        
        <text x="500" y="920" font-family="serif" font-size="28" font-style="italic" text-anchor="middle" fill="#d4d4d8">
          “The old that is strong does not wither,”
        </text>
        <text x="500" y="970" font-family="serif" font-size="28" font-style="italic" text-anchor="middle" fill="#d4d4d8">
          “Deep roots are not reached by the frost.”
        </text>
        
        <text x="500" y="1120" font-family="sans-serif" font-size="22" font-weight="bold" letter-spacing="5" text-anchor="middle" fill="#71717a">
          J.R.R. TOLKIEN
        </text>
      </svg>
    `
  }
];

/**
 * Helper to convert SVG text to image data URL
 */
export function getSampleDataUrl(sample) {
  const svgText = sample.getSvg();
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  return URL.createObjectURL(blob);
}
