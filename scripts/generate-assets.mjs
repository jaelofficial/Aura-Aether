import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outputDir = path.join(__dirname, '../public/images/products');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function createPerfumeSVG({ name, number, subtitle, liquidColor, capColor = '#1C1917', labelTint = '#FAF9F6' }) {
  return `<svg width="600" height="700" viewBox="0 0 600 700" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="700" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FCFAF7"/>
        <stop offset="1" stop-color="#F4EFEA"/>
      </linearGradient>
      <radialGradient id="bottleGlow" cx="300" cy="440" r="180" gradientUnits="userSpaceOnUse">
        <stop stop-color="${liquidColor}" stop-opacity="0.35"/>
        <stop offset="1" stop-color="${liquidColor}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="glassGrad" x1="180" y1="260" x2="420" y2="580" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFFFFF" stop-opacity="0.85"/>
        <stop offset="0.2" stop-color="${liquidColor}" stop-opacity="0.45"/>
        <stop offset="0.8" stop-color="${liquidColor}" stop-opacity="0.6"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.5"/>
      </linearGradient>
      <linearGradient id="capGrad" x1="240" y1="130" x2="360" y2="240" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2D2B2A"/>
        <stop offset="0.5" stop-color="${capColor}"/>
        <stop offset="1" stop-color="#141312"/>
      </linearGradient>
      <linearGradient id="goldCollar" x1="270" y1="230" x2="330" y2="250" gradientUnits="userSpaceOnUse">
        <stop stop-color="#E5C583"/>
        <stop offset="0.5" stop-color="#C59B4B"/>
        <stop offset="1" stop-color="#F3E2B8"/>
      </linearGradient>
      <filter id="shadow" x="140" y="580" width="320" height="80" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
        <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur"/>
      </filter>
    </defs>

    <!-- Background card canvas -->
    <rect width="600" height="700" rx="24" fill="url(#bgGrad)"/>
    
    <!-- Floor Shadow -->
    <ellipse cx="300" cy="620" rx="140" ry="22" fill="#201A18" fill-opacity="0.14" filter="url(#shadow)"/>
    <ellipse cx="300" cy="615" rx="90" ry="12" fill="#201A18" fill-opacity="0.22"/>

    <!-- Ambient Liquid Aura Glow -->
    <circle cx="300" cy="440" r="170" fill="url(#bottleGlow)"/>

    <!-- Bottle Neck & Golden Sprayer Collar -->
    <rect x="282" y="240" width="36" height="24" rx="2" fill="url(#goldCollar)"/>
    
    <!-- Cap (Sleek Black Cylindrical Cap matching reference) -->
    <rect x="252" y="140" width="96" height="106" rx="6" fill="url(#capGrad)"/>
    <!-- Cap highlight -->
    <rect x="264" y="142" width="10" height="102" rx="3" fill="#FFFFFF" fill-opacity="0.12"/>

    <!-- Glass Flacon Body -->
    <rect x="180" y="260" width="240" height="340" rx="18" fill="url(#glassGrad)" stroke="#E8E3DD" stroke-width="2"/>

    <!-- Thick Solid Glass Bottom Base -->
    <path d="M182 560C182 560 185 596 200 596H400C415 596 418 560 418 560H182Z" fill="#FFFFFF" fill-opacity="0.45"/>
    <line x1="182" y1="562" x2="418" y2="562" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="3"/>

    <!-- Glass Left Reflection Accent -->
    <rect x="194" y="275" width="14" height="270" rx="7" fill="#FFFFFF" fill-opacity="0.45"/>
    <!-- Glass Right Corner Accent -->
    <rect x="396" y="285" width="8" height="250" rx="4" fill="#FFFFFF" fill-opacity="0.25"/>

    <!-- Perfume Dip Tube -->
    <line x1="300" y1="264" x2="300" y2="565" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="3" stroke-dasharray="12 4"/>

    <!-- Front Label (Textured Fine Paper) -->
    <rect x="215" y="340" width="170" height="180" rx="6" fill="${labelTint}" stroke="#DDD6CE" stroke-width="1.2"/>
    
    <!-- Label Typography matching reference -->
    <text x="300" y="380" font-family="'Times New Roman', serif" font-size="20" font-weight="600" letter-spacing="4" fill="#1C1917" text-anchor="middle">AURA &amp; AETHER</text>
    <text x="300" y="400" font-family="system-ui, sans-serif" font-size="9" font-weight="500" letter-spacing="3" fill="#78716C" text-anchor="middle">PARFUMS D'EXCEPTION</text>
    <line x1="250" y1="416" x2="350" y2="416" stroke="#C59B4B" stroke-width="1"/>
    <text x="300" y="442" font-family="'Times New Roman', serif" font-size="16" font-style="italic" letter-spacing="2" fill="#292524" text-anchor="middle">${name}</text>
    <text x="300" y="464" font-family="system-ui, sans-serif" font-size="8" font-weight="600" letter-spacing="2.5" fill="#57534E" text-anchor="middle">${number} • ${subtitle}</text>
    <text x="300" y="495" font-family="system-ui, sans-serif" font-size="8" font-weight="500" letter-spacing="1.5" fill="#A8A29E" text-anchor="middle">EAU DE PARFUM • 50ML</text>
  </svg>`;
}

function createGiftSetSVG({ name, subtitle, boxColor = '#242120' }) {
  return `<svg width="600" height="700" viewBox="0 0 600 700" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="boxBg" x1="0" y1="0" x2="0" y2="700" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FCFAF7"/>
        <stop offset="1" stop-color="#F1ECE5"/>
      </linearGradient>
      <linearGradient id="goldRibbon" x1="120" y1="200" x2="480" y2="520" gradientUnits="userSpaceOnUse">
        <stop stop-color="#E5C583"/>
        <stop offset="0.5" stop-color="#C59B4B"/>
        <stop offset="1" stop-color="#DFBC77"/>
      </linearGradient>
    </defs>
    <rect width="600" height="700" rx="24" fill="url(#boxBg)"/>
    
    <!-- Floor Shadow -->
    <ellipse cx="300" cy="625" rx="190" ry="25" fill="#201A18" fill-opacity="0.16"/>

    <!-- Luxury Gift Box Base -->
    <rect x="110" y="210" width="380" height="390" rx="14" fill="${boxColor}" stroke="#3E3A37" stroke-width="2"/>
    <rect x="120" y="220" width="360" height="370" rx="10" fill="#1C1A18"/>
    
    <!-- Gold Trim / Embossed border -->
    <rect x="135" y="235" width="330" height="340" rx="6" fill="none" stroke="url(#goldRibbon)" stroke-width="1.5"/>

    <!-- Gold Foil Brand Emblem -->
    <circle cx="300" cy="320" r="38" fill="none" stroke="url(#goldRibbon)" stroke-width="1.5"/>
    <text x="300" y="327" font-family="'Times New Roman', serif" font-size="20" fill="#DFC07D" text-anchor="middle">A&amp;A</text>
    
    <text x="300" y="400" font-family="'Times New Roman', serif" font-size="22" letter-spacing="4" fill="#FDFBF7" text-anchor="middle">AURA &amp; AETHER</text>
    <text x="300" y="425" font-family="system-ui, sans-serif" font-size="10" letter-spacing="3" fill="#D6C7B2" text-anchor="middle">EXCLUSIVE COFFRET</text>
    
    <line x1="220" y1="445" x2="380" y2="445" stroke="url(#goldRibbon)" stroke-width="1"/>

    <text x="300" y="475" font-family="'Times New Roman', serif" font-size="18" font-style="italic" fill="#EADCC8" text-anchor="middle">${name}</text>
    <text x="300" y="500" font-family="system-ui, sans-serif" font-size="9" letter-spacing="2" fill="#A89F91" text-anchor="middle">${subtitle}</text>
    <text x="300" y="540" font-family="system-ui, sans-serif" font-size="9" letter-spacing="1.5" fill="#8C8375" text-anchor="middle">ARTISANAL LUXURY GIFT SET</text>
  </svg>`;
}

function createHeroEditorialSVG() {
  return `<svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heroBg" x1="0" y1="0" x2="1200" y2="800" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FBF7F4"/>
        <stop offset="0.5" stop-color="#F5ECE6"/>
        <stop offset="1" stop-color="#EFE2DC"/>
      </linearGradient>
      <radialGradient id="sunGlow" cx="600" cy="400" r="450" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
        <stop offset="1" stop-color="#F5ECE6" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#heroBg)"/>
    <circle cx="600" cy="400" r="450" fill="url(#sunGlow)"/>

    <!-- Soft Peony Petals / Botanical Elements -->
    <g opacity="0.65">
      <ellipse cx="280" cy="260" rx="90" ry="120" transform="rotate(-25 280 260)" fill="#F9DED7"/>
      <ellipse cx="320" cy="280" rx="80" ry="110" transform="rotate(15 320 280)" fill="#F5C6BA"/>
      <ellipse cx="260" cy="320" rx="75" ry="100" transform="rotate(-40 260 320)" fill="#F2ADA0"/>
      <ellipse cx="300" cy="300" rx="60" ry="70" fill="#E88F80"/>
      
      <!-- Stems -->
      <path d="M300 400 Q280 560 230 650" stroke="#7A8B63" stroke-width="12" stroke-linecap="round"/>
      <path d="M260 520 Q210 500 170 510" stroke="#7A8B63" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="160" cy="510" rx="35" ry="18" transform="rotate(-15 160 510)" fill="#8A9D71"/>

      <!-- Right Soft Petals -->
      <ellipse cx="940" cy="540" rx="100" ry="130" transform="rotate(30 940 540)" fill="#F8DDD6"/>
      <ellipse cx="900" cy="580" rx="85" ry="115" transform="rotate(-15 900 580)" fill="#F4C2B5"/>
      <ellipse cx="930" cy="610" rx="70" ry="90" fill="#E9998B"/>
    </g>

    <!-- Luxury Aura & Aether Perfume Flacon in Hero Center -->
    <g transform="translate(470, 220) scale(0.85)">
      <!-- Cap -->
      <rect x="80" y="20" width="80" height="90" rx="6" fill="#1C1917"/>
      <!-- Gold collar -->
      <rect x="105" y="105" width="30" height="20" rx="2" fill="#C59B4B"/>
      <!-- Bottle -->
      <rect x="20" y="120" width="200" height="300" rx="16" fill="#FFFFFF" fill-opacity="0.8" stroke="#E5DEC9" stroke-width="3"/>
      <!-- Liquid -->
      <rect x="28" y="140" width="184" height="250" rx="10" fill="#EACBB4" fill-opacity="0.45"/>
      <!-- Label -->
      <rect x="45" y="200" width="150" height="150" rx="6" fill="#FFFDFB" stroke="#DDD2C4"/>
      <text x="120" y="240" font-family="'Times New Roman', serif" font-size="15" letter-spacing="3" fill="#1C1917" text-anchor="middle">AURA &amp; AETHER</text>
      <text x="120" y="258" font-family="system-ui, sans-serif" font-size="7" letter-spacing="2" fill="#78716C" text-anchor="middle">PARFUMS</text>
      <text x="120" y="295" font-family="'Times New Roman', serif" font-size="14" font-style="italic" fill="#292524" text-anchor="middle">Signature Éclat</text>
      <text x="120" y="315" font-family="system-ui, sans-serif" font-size="7" letter-spacing="1.5" fill="#78716C" text-anchor="middle">EAU DE PARFUM 100ML</text>
    </g>
  </svg>`;
}

function createSpringPeoniesSVG() {
  return `<svg width="700" height="700" viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="spBg" x1="0" y1="0" x2="700" y2="700" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FAF7F5"/>
        <stop offset="1" stop-color="#F2EAE5"/>
      </linearGradient>
    </defs>
    <rect width="700" height="700" rx="20" fill="url(#spBg)"/>

    <!-- Peony 1 Top Left -->
    <g transform="translate(180, 190)">
      <ellipse cx="0" cy="0" rx="90" ry="110" transform="rotate(-15)" fill="#F8D6D0"/>
      <ellipse cx="-20" cy="-20" rx="75" ry="95" transform="rotate(25)" fill="#F4BDB3"/>
      <ellipse cx="20" cy="15" rx="70" ry="85" transform="rotate(-30)" fill="#F0A699"/>
      <circle cx="0" cy="0" r="50" fill="#E68576"/>
      <circle cx="0" cy="0" r="30" fill="#D96E5E"/>
    </g>

    <!-- Peony 2 Bottom Left -->
    <g transform="translate(150, 440)">
      <ellipse cx="0" cy="0" rx="80" ry="95" transform="rotate(35)" fill="#F8D6D0"/>
      <ellipse cx="15" cy="-15" rx="65" ry="80" transform="rotate(-20)" fill="#F4BDB3"/>
      <ellipse cx="-15" cy="20" rx="60" ry="75" transform="rotate(15)" fill="#F0A699"/>
      <circle cx="0" cy="0" r="42" fill="#E68576"/>
    </g>

    <!-- Fresh Green Foliage -->
    <path d="M120 280 Q70 260 40 310" stroke="#687C53" stroke-width="14" stroke-linecap="round"/>
    <ellipse cx="40" cy="310" rx="35" ry="18" transform="rotate(-25 40 310)" fill="#788D61"/>
    
    <path d="M160 360 Q90 380 60 420" stroke="#687C53" stroke-width="12" stroke-linecap="round"/>
    <ellipse cx="60" cy="420" rx="30" ry="15" transform="rotate(15 60 420)" fill="#788D61"/>

    <!-- Crystal Perfume Bottle Right Center (Matching reference 1) -->
    <g transform="translate(360, 260)">
      <!-- Golden Cap -->
      <rect x="70" y="30" width="45" height="50" rx="4" fill="#C59B4B"/>
      <!-- Glass Flacon -->
      <rect x="20" y="75" width="145" height="250" rx="14" fill="#FFFFFF" fill-opacity="0.82" stroke="#DFD7CB" stroke-width="2"/>
      <rect x="30" y="90" width="125" height="215" rx="8" fill="#FCEBD6" fill-opacity="0.55"/>
      <rect x="42" y="140" width="100" height="110" rx="4" fill="#FFFDFB" stroke="#D8CFC3"/>
      <text x="92" y="175" font-family="'Times New Roman', serif" font-size="11" letter-spacing="2" fill="#1C1917" text-anchor="middle">AURA &amp; AETHER</text>
      <text x="92" y="195" font-family="'Times New Roman', serif" font-size="12" font-style="italic" fill="#292524" text-anchor="middle">Amber Bloom</text>
      <text x="92" y="215" font-family="system-ui, sans-serif" font-size="7" letter-spacing="1" fill="#78716C" text-anchor="middle">50 ML</text>
    </g>

    <!-- Additional Cut Crystal Bottle Below (Matching Reference 1 facet bottle) -->
    <g transform="translate(310, 500) scale(0.65)">
      <polygon points="100,20 160,50 160,110 100,140 40,110 40,50" fill="#FFFFFF" fill-opacity="0.85" stroke="#DFD7CB" stroke-width="3"/>
      <polygon points="100,35 145,60 145,100 100,125 55,100 55,60" fill="#E8D1EC" fill-opacity="0.6"/>
      <rect x="85" y="0" width="30" height="25" rx="3" fill="#D3C1DC"/>
    </g>
  </svg>`;
}

const products = [
  { file: 'meadow.svg', name: 'Meadow', number: 'N° 01', subtitle: 'BREEZY & JOYFUL', liquidColor: '#C4D8B6' },
  { file: 'jardinea.svg', name: 'Jardinea', number: 'N° 02', subtitle: 'STRONGLY FLORAL', liquidColor: '#F5C8BF' },
  { file: 'lavanda.svg', name: 'Lavanda', number: 'N° 03', subtitle: 'CALMING & HERBAL', liquidColor: '#D8CFEA' },
  { file: 'neroli.svg', name: 'Neroli', number: 'N° 04', subtitle: 'DEEP & SWEET', liquidColor: '#F4D4A4' },
  { file: 'velvet-oud.svg', name: 'Velvet Oud', number: 'N° 05', subtitle: 'RICH & SMOKY', liquidColor: '#D3A370' },
  { file: 'amber-bloom.svg', name: 'Amber Bloom', number: 'N° 06', subtitle: 'GOLDEN & SPICED', liquidColor: '#DEAA79' },
  { file: 'midnight-rose.svg', name: 'Midnight Rose', number: 'N° 07', subtitle: 'DARK DAMASK & MUSK', liquidColor: '#C97782' },
  { file: 'vanilla-noir.svg', name: 'Vanilla Noir', number: 'N° 08', subtitle: 'BOURBON & CEDAR', liquidColor: '#B08864' },
];

products.forEach(p => {
  fs.writeFileSync(path.join(outputDir, p.file), createPerfumeSVG(p));
  console.log('Created product SVG: ' + p.file);
});

// Gift sets
const giftSets = [
  { file: 'gift-set-discovery.svg', name: 'The Discovery Quintet', subtitle: '5 x 10ML COFFRET' },
  { file: 'gift-set-royal.svg', name: 'The Royal Oud Duo', subtitle: '2 x 50ML EXTRAIT' },
  { file: 'gift-set-travel.svg', name: 'Celestial Travel Trio', subtitle: '3 x 15ML TRAVEL ATOMIZER' },
];

giftSets.forEach(g => {
  fs.writeFileSync(path.join(outputDir, g.file), createGiftSetSVG(g));
  console.log('Created gift set SVG: ' + g.file);
});

// Top level hero images
fs.writeFileSync(path.join(__dirname, '../public/images/hero-editorial.svg'), createHeroEditorialSVG());
fs.writeFileSync(path.join(__dirname, '../public/images/spring-peonies.svg'), createSpringPeoniesSVG());
console.log('All image assets created successfully.');
