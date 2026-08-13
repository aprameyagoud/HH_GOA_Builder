// src/components/FormatSelector.jsx
import { useState, useEffect } from 'react';
import { buildBuilderIdSvg, buildPfpSvg, buildTeamFrameSvg } from '../lib/svgTemplateEngine';
const formatCards = [
  {
    id: 'pfp',
    title: 'PFP FRAME',
    tagline: 'Your HH Goa profile picture.',
    dimensions: '1080 × 1080 PNG',
    previewUrl: '/assets/hhgoa/PFPFInal.svg',
    description: 'Circular tropical frame with palms, flowers, scooter & HH Goa badge.'
  },
  {
    id: 'builder_id',
    title: 'BUILDER ID',
    tagline: 'Your builder identity.',
    dimensions: '1200 × 675 PNG',
    previewUrl: '/assets/hhgoa/Individual Final.svg',
    description: 'Landscape event card with postage-stamp photo, dynamic QR & custom title.'
  },
  {
    id: 'team_frame',
    title: 'TEAM FRAME',
    tagline: 'Your crew, framed.',
    dimensions: '1200 × 675 PNG',
    previewUrl: '/assets/hhgoa/teamFinal.svg',
    description: 'Landscape crew poster with central team frame, member list & quote.'
  }
];

function FormatSelector({ onSelect }) {
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    async function loadPreviews() {
      try {
        const pfp = await buildPfpSvg({ photoDataUrl: null, crop: null });
        const builder = await buildBuilderIdSvg({ photoDataUrl: null, crop: null, name: 'YOUR NAME', builderTitle: 'BUILDER TITLE', stack: 'YOUR STACK', team: 'YOUR TEAM', xHandle: '@HANDLE', qrText: 'https://hhgoa.com' });
        const team = await buildTeamFrameSvg({ photoDataUrl: null, crop: null, teamName: 'TEAM NAME', members: ['MEMBER 1', 'MEMBER 2', 'MEMBER 3'], quote: 'YOUR QUOTE', qrText: 'https://hhgoa.com' });
        
        setPreviews({
          pfp: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(pfp)))}`,
          builder_id: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(builder)))}`,
          team_frame: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(team)))}`
        });
      } catch (err) {
        console.error('Failed to load blank previews', err);
      }
    }
    loadPreviews();
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--hh-yellow)', fontSize: '2.5rem', letterSpacing: '1px' }}>
          CHOOSE YOUR FORMAT
        </h2>
        <p style={{ fontFamily: 'Victor Mono', fontSize: '0.95rem', color: 'var(--hh-white)', opacity: 0.85, marginTop: '0.3rem' }}>
          Select a format to instantly generate your official HH Goa 2026 branded social graphic.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '2rem',
        alignItems: 'stretch'
      }}>
        {formatCards.map((card) => (
          <div 
            key={card.id}
            onClick={() => onSelect(card.id)}
            className="format-card"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '3px solid var(--hh-yellow)',
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '6px 6px 0px var(--hh-black)',
              transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translate(-4px, -4px)';
              e.currentTarget.style.boxShadow = '10px 10px 0px var(--hh-black)';
              e.currentTarget.style.borderColor = 'var(--hh-magenta)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '6px 6px 0px var(--hh-black)';
              e.currentTarget.style.borderColor = 'var(--hh-yellow)';
            }}
          >
            <div>
              {/* Preview Container */}
              <div style={{
                width: '100%',
                aspectRatio: card.id === 'pfp' ? '1 / 1' : '16 / 9',
                backgroundColor: 'var(--hh-dark-green)',
                border: '2px solid var(--hh-black)',
                marginBottom: '1.2rem',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {previews[card.id] ? (
                  <img 
                    src={previews[card.id]} 
                    alt={`${card.title} preview`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div style={{ color: 'var(--hh-yellow)', fontFamily: 'Victor Mono', fontSize: '0.8rem' }}>Loading...</div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                <h3 style={{ fontSize: '2.2rem', color: 'var(--hh-yellow)', margin: 0 }}>
                  {card.title}
                </h3>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontFamily: 'Victor Mono', 
                  backgroundColor: 'var(--hh-magenta)', 
                  color: 'var(--hh-white)', 
                  padding: '0.2rem 0.5rem',
                  fontWeight: 700
                }}>
                  {card.dimensions}
                </span>
              </div>

              <p style={{ fontFamily: 'Victor Mono', fontSize: '1rem', color: 'var(--hh-white)', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                {card.tagline}
              </p>
              <p style={{ fontFamily: 'Victor Mono', fontSize: '0.8rem', color: 'var(--hh-cream)', opacity: 0.8, margin: 0 }}>
                {card.description}
              </p>
            </div>

            <button 
              className="primary" 
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem', fontSize: '1rem' }}
            >
              MAKE {card.title} →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FormatSelector;
