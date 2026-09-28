import React from 'react';

interface Partner {
  name: string;
  subtitle: string;
  href?: string;
  logo: React.ReactNode;
}

export function PoweredBy() {
  const partners: Partner[] = [
    {
      name: 'Meteora DBC',
      subtitle: 'Dynamic Bonding Curve Fee Routing',
      href: 'https://meteora.ag',
      logo: (
        <svg
          viewBox="0 0 120 32"
          className="h-6 sm:h-7 w-auto fill-current text-slate-800 transition-colors group-hover:text-black"
        >
          {/* Meteora Geometric Symbol */}
          <g>
            <path d="M4 24L12 8L18 18L24 8L32 24H25L21 15L16 23L11 15L7 24H4Z" />
            <circle cx="28" cy="8" r="2.5" />
          </g>
          {/* Typography */}
          <text
            x="38"
            y="21"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="14"
            letterSpacing="-0.02em"
          >
            METEORA
          </text>
        </svg>
      ),
    },
    {
      name: 'Solana',
      subtitle: 'High-Speed L1 Settlement',
      href: 'https://solana.com',
      logo: (
        <svg
          viewBox="0 0 110 32"
          className="h-6 sm:h-7 w-auto fill-current text-slate-800 transition-colors group-hover:text-black"
        >
          {/* Solana 3-Bar Vector */}
          <g>
            <path d="M4 7.5h16.2c.7 0 1.3.4 1.7.9l3.1 3.5c.5.6.1 1.6-.7 1.6H8.1c-.7 0-1.3-.4-1.7-.9L3.3 9.1c-.5-.6-.1-1.6.7-1.6z" />
            <path d="M21.9 14.5H5.7c-.7 0-1.3.4-1.7.9l-3.1 3.5c-.5.6-.1 1.6.7 1.6h16.2c.7 0 1.3-.4 1.7-.9l3.1-3.5c.5-.6.1-1.6-.7-1.6z" />
            <path d="M4 21.5h16.2c.7 0 1.3.4 1.7.9l3.1 3.5c.5.6.1 1.6-.7 1.6H8.1c-.7 0-1.3-.4-1.7-.9L3.3 23.1c-.5-.6-.1-1.6.7-1.6z" />
          </g>
          {/* Typography */}
          <text
            x="32"
            y="21"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="14"
            letterSpacing="-0.02em"
          >
            SOLANA
          </text>
        </svg>
      ),
    },
    {
      name: 'Anchor',
      subtitle: 'Verified On-Chain PDA Security',
      href: 'https://www.anchor-lang.com',
      logo: (
        <svg
          viewBox="0 0 110 32"
          className="h-6 sm:h-7 w-auto fill-current text-slate-800 transition-colors group-hover:text-black"
        >
          {/* Anchor Modern Mark */}
          <g>
            <circle cx="14" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M14 11v13M8 17h12M6 21c2 4 14 4 16 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          {/* Typography */}
          <text
            x="32"
            y="21"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="14"
            letterSpacing="-0.02em"
          >
            ANCHOR
          </text>
        </svg>
      ),
    },
    {
      name: 'Tessera',
      subtitle: 'Tokenized Pre-IPO Equity Yield ($xSTOCK)',
      logo: (
        <svg
          viewBox="0 0 115 32"
          className="h-6 sm:h-7 w-auto fill-current text-slate-800 transition-colors group-hover:text-black"
        >
          {/* Tessera Geometric Tessellation */}
          <g>
            <polygon points="14,4 23,10 23,22 14,28 5,22 5,10" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="14" y1="4" x2="14" y2="16" stroke="currentColor" strokeWidth="1.5" />
            <line x1="5" y1="10" x2="14" y2="16" stroke="currentColor" strokeWidth="1.5" />
            <line x1="23" y1="10" x2="14" y2="16" stroke="currentColor" strokeWidth="1.5" />
            <line x1="14" y1="16" x2="14" y2="28" stroke="currentColor" strokeWidth="1.5" />
          </g>
          {/* Typography */}
          <text
            x="32"
            y="21"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="14"
            letterSpacing="-0.02em"
          >
            TESSERA
          </text>
        </svg>
      ),
    },
    {
      name: 'PreStocks',
      subtitle: 'Real-World Asset Pairings',
      logo: (
        <svg
          viewBox="0 0 125 32"
          className="h-6 sm:h-7 w-auto fill-current text-slate-800 transition-colors group-hover:text-black"
        >
          {/* PreStocks Dynamic Line */}
          <g>
            <rect x="4" y="6" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M8 19L12 14L15 17L20 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 11H20V14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* Typography */}
          <text
            x="32"
            y="21"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="14"
            letterSpacing="-0.02em"
          >
            PRESTOCKS
          </text>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-12 border-b border-black/[0.06] bg-[#FAF8F5]/60 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8">
        
        {/* Subtle Editorial Header matching Slite */}
        <p className="text-xs sm:text-sm font-medium text-[#736E66] tracking-tight">
          Built on Solana&apos;s most liquid DeFi and tokenized asset infrastructure.
        </p>

        {/* Partner Logos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 items-start justify-center">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="group flex flex-col items-center justify-center space-y-2 text-center p-2 rounded-xl transition-all hover:bg-white/60"
            >
              {/* Logo Mark */}
              <div className="h-8 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
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
