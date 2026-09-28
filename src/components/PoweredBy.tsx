import React from 'react';
import Image from 'next/image';

interface Partner {
  name: string;
  subtitle: string;
  logo: React.ReactNode;
}

export function PoweredBy() {
  const partners: Partner[] = [
    {
      name: 'Meteora DBC',
      subtitle: 'Dynamic Bonding Curve Fee Routing',
      logo: (
        <div className="flex items-center gap-2 text-slate-800 group-hover:text-black transition-colors">
          <svg
            viewBox="0 0 240 240"
            className="h-6 w-6 fill-current"
          >
            <path d="M185.89 66.8866C189.203 63.5733 194.335 63.7681 196.457 67.2763C198.753 71.0443 200.486 75.1156 201.72 79.3817C202.413 81.8069 201.611 84.6433 199.598 86.6571L134.696 151.559C130.777 155.479 125.904 158.185 120.729 159.29L115.336 160.437C110.182 161.563 105.266 164.271 101.368 168.169L51.5392 217.998C49.417 209.812 48.4857 204.29 55.134 197.641L185.89 66.8866ZM199.945 94.8475C202.111 92.6821 205.446 93.9384 205.23 96.7968C203.887 114.294 195.55 132.723 180.695 147.579C169.369 159.988 137.405 178.958 114.559 191.67C109.881 194.268 106.069 188.725 109.903 184.891L199.924 94.87L199.945 94.8475ZM170.081 40.6425C172.138 38.5853 175.17 38.1527 177.249 39.5819C181.58 42.5271 185.63 46.7932 187.709 51.9472C188.489 53.9394 187.817 56.3868 186.107 58.0975L116.202 128.001C112.283 131.92 107.41 134.628 102.235 135.732L96.8429 136.88C91.6891 138.006 86.7731 140.713 82.8752 144.61L39.759 187.726C37.6368 179.541 38.6547 172.07 45.3029 165.422L70.466 140.258L170.081 40.6425ZM140.455 28.2157C144.353 24.3178 149.94 22.8017 154.531 24.5341C157.412 25.6385 160.184 26.9815 162.804 28.5624C166.269 30.6414 166.442 35.7086 163.194 38.9569L99.2668 102.884C95.607 106.543 90.6257 108.493 85.8615 108.146C80.8592 107.778 75.5971 109.836 71.7209 113.712L36.7043 148.728C34.582 140.543 37.3324 131.339 43.9806 124.69L140.455 28.2157ZM130.215 21.9989C133.29 21.9558 134.481 25.6162 132.142 27.955L98.9445 61.1522L71.2258 88.872L64.1877 95.9091L53.4025 106.694C51.1503 108.946 47.8155 106.91 49.0715 104.052L59.5529 80.2313C60.1376 78.7804 60.7875 77.3076 61.5021 75.8134L61.5666 75.662C67.6084 62.8636 77.3323 49.285 86.4709 40.1464C101.132 25.4858 114.298 22.1505 130.215 21.9989Z" />
          </svg>
          <span className="font-extrabold text-sm sm:text-base tracking-tight font-sans">
            Meteora
          </span>
        </div>
      ),
    },
    {
      name: 'Solana',
      subtitle: 'High-Speed L1 Settlement',
      logo: (
        <div className="flex items-center gap-2 text-slate-800 group-hover:text-black transition-colors">
          <Image
            src="/logos/solana.png"
            alt="Solana"
            width={24}
            height={21}
            className="h-5 w-auto grayscale contrast-125 brightness-75 group-hover:brightness-50 transition-all"
          />
          <span className="font-extrabold text-sm sm:text-base tracking-tight font-sans">
            Solana
          </span>
        </div>
      ),
    },
    {
      name: 'Anchor',
      subtitle: 'Verified On-Chain PDA Security',
      logo: (
        <div className="flex items-center gap-2 text-slate-800 group-hover:text-black transition-colors">
          <Image
            src="/logos/anchor.png"
            alt="Anchor"
            width={22}
            height={22}
            className="h-5 w-5 grayscale contrast-125 brightness-75 group-hover:brightness-50 transition-all"
          />
          <span className="font-extrabold text-sm sm:text-base tracking-tight font-sans">
            Anchor
          </span>
        </div>
      ),
    },
    {
      name: 'Tessera',
      subtitle: 'Tokenized Pre-IPO Equity Yield ($xSTOCK)',
      logo: (
        <div className="flex items-center gap-2 text-slate-800 group-hover:text-black transition-colors">
          <Image
            src="/logos/tessera.png"
            alt="Tessera"
            width={22}
            height={22}
            className="h-5 w-5 grayscale contrast-125 brightness-75 group-hover:brightness-50 transition-all"
          />
          <span className="font-extrabold text-sm sm:text-base tracking-tight font-sans">
            Tessera
          </span>
        </div>
      ),
    },
    {
      name: 'PreStocks',
      subtitle: 'Real-World Asset Pairings',
      logo: (
        <div className="flex items-center text-slate-800 group-hover:text-black transition-colors">
          <svg
            viewBox="0 0 5566 1330"
            className="h-5 sm:h-6 w-auto fill-current"
          >
            <g>
              <g>
                <g>
                  <path d="M744 538l-56 58c-2,2 -4,3 -6,4 -2,1 -4,1 -6,1 -2,0 -4,0 -6,-1 -2,-1 -4,-2 -5,-4l-73 -75c-2,-1 -4,-2 -6,-3 -2,-1 -4,-1 -6,-1 -2,0 -4,0 -6,1 -2,1 -4,2 -5,3l-84 86 -56 58 -78 81 -56 58 -90 92 -58 60 -72 75c-2,2 -6,4 -9,5 -4,0 -7,-1 -11,-2l-33 -20 -14 -8c-2,-1 -4,-3 -6,-6 -1,-2 -2,-5 -2,-8l0 -33c0,-9 3,-16 9,-22l104 -107 81 -84 22 -23 57 -57 78 -81 56 -58 150 -155c2,-1 3,-3 5,-4 2,-1 4,-2 6,-3 2,-1 4,-1 6,-2 2,0 4,-1 6,-1 2,0 4,1 7,1 2,1 4,1 6,2 2,1 4,2 5,3 2,1 4,3 5,4l141 145c2,1 3,3 3,5 1,2 1,4 1,6 0,2 0,3 -1,5 -1,2 -2,4 -3,5zm0 0z" />
                  <path d="M1165 518l0 456c0,4 0,8 -1,12 -2,4 -3,8 -5,12 -2,4 -5,7 -8,10 -3,3 -6,5 -10,8l-537 308c-4,2 -7,4 -12,5 -3,1 -7,1 -10,1l-4 0c-3,0 -7,0 -11,-1 -4,-1 -8,-3 -11,-5l-408 -237c-1,0 -2,-1 -3,-2 -1,-2 -1,-3 -1,-4 -1,-1 0,-3 0,-4 0,-1 1,-3 2,-4l64 -66c3,-2 6,-4 10,-5 3,0 7,1 10,2l342 199c3,1 5,2 8,2 3,0 6,-1 8,-2l456 -262c3,-2 5,-3 6,-6 1,-2 2,-5 2,-8l0 -305c0,-5 2,-8 5,-12l96 -97c1,-2 2,-2 3,-3 2,0 3,0 5,1 1,0 2,1 3,3 1,1 1,2 1,4z" />
                  <path d="M1019 257l-65 67c-3,2 -6,4 -9,4 -4,1 -7,0 -11,-2l-346 -199c-2,-1 -5,-2 -8,-2 -3,0 -5,1 -8,2l-451 262c-3,2 -5,4 -6,6 -1,3 -2,5 -2,8l0 304c0,4 -2,8 -5,11l-95 99c-1,1 -3,2 -4,2 -2,1 -3,0 -4,0 -2,-1 -3,-2 -4,-3 -1,-1 -1,-2 -1,-4l0 -455c0,-4 1,-9 2,-13 1,-4 2,-8 4,-11 3,-4 5,-7 8,-10 3,-3 6,-6 10,-8l532 -309c3,-2 7,-3 11,-4 4,-1 9,-2 13,-2 4,0 8,1 12,2 5,1 8,2 12,4l413 237c1,1 2,2 3,3 1,1 1,3 1,4 0,1 0,3 0,4 -1,1 -1,2 -2,3zm0 0z" />
                  <path d="M1165 338l0 33c0,9 -3,17 -9,23l-104 106 -81 82 -24 25 -57 58 -79 81 -56 58 -152 155c-2,2 -3,3 -5,4 -2,2 -4,3 -6,3 -2,1 -4,2 -6,2 -2,1 -4,1 -6,1 -2,0 -5,0 -7,-1 -2,0 -4,-1 -6,-2 -2,0 -4,-1 -5,-3 -2,-1 -4,-2 -5,-4l-139 -143c-1,-2 -3,-3 -3,-5 -1,-2 -2,-4 -2,-6 0,-2 1,-4 2,-6 0,-2 2,-4 3,-6l56 -57c2,-2 3,-3 5,-4 2,-1 4,-1 7,-1 2,0 4,0 6,1 2,1 4,2 5,4l72 73c1,2 3,3 5,4 2,0 4,1 6,1 2,0 4,-1 6,-1 2,-1 4,-2 6,-4l84 -86 57 -58 78 -81 57 -58 91 -93 59 -59 72 -75c3,-2 6,-4 10,-4 3,-1 7,0 10,2l33 19 14 8c3,1 5,3 6,6 2,2 2,5 2,8zm0 0z" />
                </g>
                <path d="M1512 918c0,28 22,50 51,50 28,0 50,-22 50,-50l0 -140 115 0c127,0 231,-67 231,-197l0 -2c0,-116 -84,-193 -220,-193l-176 0c-29,0 -51,23 -51,51l0 481zm101 -231l0 -208 118 0c76,0 125,35 125,103l0 2c0,60 -48,103 -125,103l-118 0z" />
                <path d="M2051 919c0,28 23,49 50,49 28,0 50,-22 50,-49l0 -129c0,-103 49,-158 120,-170 22,-4 40,-22 40,-48 0,-29 -19,-50 -50,-50 -44,0 -87,42 -110,96l0 -44c0,-28 -22,-51 -50,-51 -28,0 -50,23 -50,51l0 345z" />
                <path d="M2459 716c9,-68 52,-115 113,-115 66,0 104,50 111,115l-224 0zm281 200c8,-7 14,-18 14,-30 0,-24 -18,-41 -40,-41 -11,0 -18,3 -26,9 -28,23 -61,38 -103,38 -64,0 -114,-39 -125,-110l273 0c26,0 47,-20 47,-48 0,-101 -68,-215 -207,-215 -125,0 -213,102 -213,227l0 2c0,134 97,226 224,226 67,0 117,-22 156,-58z" />
                <path d="M3102 972c125,0 212,-64 212,-179l0 -2c0,-100 -66,-142 -183,-173 -100,-25 -125,-38 -125,-76l0 -1c0,-28 26,-51 74,-51 40,0 80,14 122,39 10,6 20,9 32,9 33,0 59,-25 59,-58 0,-25 -14,-43 -28,-51 -52,-33 -113,-51 -183,-51 -118,0 -202,69 -202,174l0 2c0,115 75,147 191,176 97,25 117,42 117,74l0 2c0,33 -32,54 -84,54 -56,0 -104,-20 -147,-52 -9,-6 -20,-12 -37,-12 -33,0 -59,26 -59,59 0,20 10,38 24,48 64,46 141,69 217,69z" />
                <path d="M3557 971c27,0 48,-3 71,-12 18,-7 33,-25 33,-47 0,-29 -24,-52 -52,-52 -3,0 -11,1 -15,1 -28,0 -41,-14 -41,-43l0 -189 56 0c29,0 53,-24 53,-54 0,-29 -24,-53 -53,-53l-56 0 0 -56c0,-34 -28,-62 -62,-62 -35,0 -63,28 -63,62l0 56 -4 0c-30,0 -54,24 -54,53 0,30 24,54 54,54l4 0 0 210c0,102 52,132 129,132z" />
                <path d="M3954 974c138,0 241,-103 241,-230l0 -2c0,-127 -102,-229 -239,-229 -138,0 -240,104 -240,231l0 1c0,127 101,229 238,229zm2 -108c-69,0 -116,-57 -116,-122l0 -2c0,-65 43,-121 114,-121 70,0 117,57 117,123l0 1c0,65 -43,121 -115,121z" />
                <path d="M4494 974c73,0 120,-23 157,-57 11,-10 18,-23 18,-40 0,-29 -23,-53 -53,-53 -15,0 -27,6 -34,11 -24,19 -49,31 -82,31 -69,0 -112,-55 -112,-122l0 -2c0,-65 44,-121 107,-121 33,0 56,11 78,29 8,5 20,12 37,12 31,0 57,-25 57,-56 0,-22 -12,-36 -20,-43 -37,-31 -84,-50 -151,-50 -136,0 -232,104 -232,231l0 1c0,127 97,229 230,229z" />
                <path d="M4756 906c0,35 29,63 63,63 35,0 63,-28 63,-63l0 -72 50 -45 110 151c15,21 30,29 54,29 32,0 59,-23 59,-57 0,-14 -5,-26 -16,-40l-118 -160 99 -85c18,-16 29,-33 29,-54 0,-29 -21,-56 -55,-56 -22,0 -37,10 -55,28l-157 148 0 -274c0,-34 -28,-62 -63,-62 -34,0 -63,28 -63,62l0 487z" />
                <path d="M5397 972c96,0 169,-44 169,-143l0 -1c0,-81 -72,-111 -134,-131 -48,-17 -90,-28 -90,-53l0 -2c0,-17 16,-30 47,-30 26,0 60,10 95,28 9,4 14,5 23,5 28,0 51,-21 51,-49 0,-22 -12,-38 -30,-47 -43,-22 -91,-34 -137,-34 -89,0 -162,50 -162,140l0 2c0,86 70,115 132,133 49,15 92,24 92,51l0 2c0,19 -17,33 -53,33 -35,0 -77,-14 -119,-40 -7,-4 -16,-7 -25,-7 -28,0 -50,22 -50,50 0,20 11,35 24,43 54,35 112,50 167,50z" />
              </g>
            </g>
          </svg>
        </div>
      ),
    },
  ];

  return (
    <section className="py-10 sm:py-12 border-b border-black/[0.06] bg-[#FAF8F5]/60 select-none overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
        
        {/* Subtle Editorial Header with decorative scatter dots */}
        <div className="relative inline-flex items-center justify-center gap-2 sm:gap-3 mx-auto max-w-full">
          {/* Left scatter dots */}
          <svg className="hidden sm:block flex-shrink-0 text-[#7C3AED]" width="28" height="8" viewBox="0 0 28 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="3" cy="4" r="2" fill="currentColor" fillOpacity="0.5"/>
            <circle cx="11" cy="4" r="1.5" fill="currentColor" fillOpacity="0.3"/>
            <circle cx="18" cy="4" r="1" fill="currentColor" fillOpacity="0.2"/>
            <circle cx="24" cy="4" r="0.75" fill="currentColor" fillOpacity="0.12"/>
          </svg>
          <p className="text-xs sm:text-sm font-medium text-[#736E66] tracking-tight text-center leading-relaxed">
            Built on Solana&apos;s most liquid DeFi and tokenized asset infrastructure.
          </p>
          {/* Right scatter dots (mirrored) */}
          <svg className="hidden sm:block flex-shrink-0 text-[#7C3AED] scale-x-[-1]" width="28" height="8" viewBox="0 0 28 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="3" cy="4" r="2" fill="currentColor" fillOpacity="0.5"/>
            <circle cx="11" cy="4" r="1.5" fill="currentColor" fillOpacity="0.3"/>
            <circle cx="18" cy="4" r="1" fill="currentColor" fillOpacity="0.2"/>
            <circle cx="24" cy="4" r="0.75" fill="currentColor" fillOpacity="0.12"/>
          </svg>
        </div>

        {/* Partner Logos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 items-start justify-center">
          {partners.map((partner, idx) => (
            <div
              key={partner.name}
              className={`group flex flex-col items-center justify-center space-y-2 text-center p-2 rounded-xl transition-all hover:bg-white/60 ${
                idx === 4 ? 'col-span-2 sm:col-span-1' : ''
              }`}
            >
              {/* Logo Mark */}
              <div className="h-7 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                {partner.logo}
              </div>

              {/* Subtitle Annotation (like Slite's 'Migrated from Notion') */}
              <span className="text-[11px] font-medium text-[#8C867D] leading-tight max-w-[170px]">
                {partner.subtitle}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
