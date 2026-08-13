import { useState, useEffect, useCallback } from 'react';
import './index.css';
import FormatSelector from './components/FormatSelector';
import UploadView from './components/UploadView';
import EditorForm from './components/EditorForm';
import PreviewShare from './components/PreviewShare';
import { 
  buildBuilderIdSvg, 
  buildPfpSvg, 
  buildTeamFrameSvg, 
  svgToCanvasBlob 
} from './lib/svgTemplateEngine';
import goaLogo from './assets/goa.svg';

function App() {
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [crop, setCrop] = useState({ scale: 1, x: 0, y: 0 });
  const [formData, setFormData] = useState({
    name: '',
    builderTitle: '',
    stack: '',
    teamName: '',
    xHandle: '',
    members: ['', '', ''],
    quote: ''
  });

  const [previewSvg, setPreviewSvg] = useState('');
  const [generatedBlob, setGeneratedBlob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Set default sample photos when format is selected if no user photo
  const handleSelectFormat = async (formatId) => {
    setSelectedFormat(formatId);
    setCrop({ scale: 1, x: 0, y: 0 });

    if (!photoDataUrl) {
      setPhotoDataUrl(null); // Keep it empty initially
    }
  };

  const renderCurrentGraphic = useCallback(async () => {
    if (!selectedFormat) return;
    setIsGenerating(true);

    try {
      let svg = '';
      let width = 1200;
      let height = 675;

      if (selectedFormat === 'builder_id') {
        width = 1200;
        height = 675;
        svg = await buildBuilderIdSvg({
          photoDataUrl,
          crop,
          name: formData.name,
          builderTitle: formData.builderTitle,
          stack: formData.stack,
          team: formData.teamName,
          xHandle: formData.xHandle,
          qrText: formData.xHandle ? `https://x.com/${formData.xHandle.replace('@', '')}` : 'https://hhgoa.com'
        });
      } else if (selectedFormat === 'pfp') {
        width = 1080;
        height = 1080;
        svg = await buildPfpSvg({
          photoDataUrl,
          crop
        });
      } else if (selectedFormat === 'team_frame') {
        width = 1200;
        height = 675;
        svg = await buildTeamFrameSvg({
          photoDataUrl,
          crop,
          teamName: formData.teamName,
          members: formData.members,
          quote: formData.quote,
          qrText: 'https://hhgoa.com'
        });
      }

      setPreviewSvg(svg);
      const blob = await svgToCanvasBlob(svg, width, height);
      setGeneratedBlob(blob);
    } catch (err) {
      console.error('Render error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedFormat, photoDataUrl, crop, formData]);

  // Trigger render whenever customization changes
  useEffect(() => {
    if (selectedFormat) {
      const timer = setTimeout(() => {
        renderCurrentGraphic();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedFormat, photoDataUrl, crop, formData, renderCurrentGraphic]);

  const handleReset = () => {
    setSelectedFormat(null);
    setPreviewSvg('');
    setGeneratedBlob(null);
  };

  return (
    <div
      className="app-container"
      style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 24px 4rem" }}
    >
      {/* Top Event Branding Header */}
      <header style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.8rem",
            backgroundColor: "var(--hh-black)",
            padding: "0.3rem 1rem",
            border: "2px solid var(--hh-yellow)",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              color: "var(--hh-yellow)",
              fontSize: "0.8rem",
              fontWeight: 700,
              fontFamily: "Victor Mono",
            }}
          >
            GOA, INDIA · 28–31 OCT 2026
          </span>
          <span style={{ color: "var(--hh-magenta)", fontWeight: 900 }}>·</span>
          <span
            style={{
              color: "var(--hh-white)",
              fontSize: "0.8rem",
              fontFamily: "Victor Mono",
            }}
          >
            2:47 PM STUDIO
          </span>
        </div>

        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "1250px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "250px",
          }}
        >
          {/* Main heading */}
          <h1
            className="hero-title"
            style={{
              fontFamily: "Imbue, serif",
              fontWeight: 900,
              fontSize: "clamp(5rem, 12vw, 11rem)",
              color: "var(--hh-yellow)",
              lineHeight: 0.85,
              margin: 0,
              letterSpacing: "1px",
              whiteSpace: "nowrap",
              position: "relative",
              zIndex: 1,

              textShadow: `
                4px 4px 0 #004121,
                7px 7px 0 rgba(0, 65, 33, 0.7)
              `,
            }}
          >
            FRAME YOUR GOA.
          </h1>

          {/* Floating Goa logo */}
          <img
            className="goa-logo"
            src={goaLogo}
            alt="Goa"
            style={{
              position: "absolute",

              /* horizontally centered */
              left: "50%",

              /* vertically centered on the actual heading */
              top: "48%",

              width: "clamp(75px, 9vw, 135px)",
              height: "auto",

              transform: "translate(-50%, -50%) rotate(-3deg)",

              zIndex: 2,
              pointerEvents: "none",

              /* floating animation */
              animation: "goaFloat 3s ease-in-out infinite",
            }}
          />

          {/* Floating animation */}
          <style>
            {`
      @keyframes goaFloat {
        0%, 100% {
          transform: translate(-50%, -50%) rotate(-3deg);
        }

        50% {
          transform: translate(-50%, calc(-50% - 10px)) rotate(2deg);
        }
      }
    `}
          </style>
        </div>

        <p
          style={{
            fontFamily: "Victor Mono",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            maxWidth: "680px",
            margin: "0 auto 1rem auto",
            color: "var(--hh-white)",
            fontWeight: 500,
          }}
        >
          Turn your photo into an official HH Goa 2026 PFP, Builder ID or Team
          Frame.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.2rem",
            fontSize: "0.8rem",
            fontFamily: "Victor Mono",
            color: "var(--hh-cream)",
            opacity: 0.9,
          }}
        >
          <span>✦ No account</span>
          <span>✦ Instant generation</span>
          <span>✦ #FrameInGoa</span>
        </div>
      </header>

      {/* Main Experience View */}
      {!selectedFormat ? (
        <FormatSelector onSelect={handleSelectFormat} />
      ) : (
        <div style={{ maxWidth: '850px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {/* Generator Workspace Card */}
          <div className="card" style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.45)', 
            borderColor: 'var(--hh-yellow)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Format / Editor Header Bar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              width: '100%',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
              boxSizing: 'border-box'
            }}>
              <button 
                type="button"
                onClick={handleReset} 
                style={{ 
                  padding: '0.6rem 1.2rem', 
                  fontSize: '0.85rem',
                  margin: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  flexShrink: 0
                }}
              >
                ← CHANGE FORMAT
              </button>
              <div style={{
                backgroundColor: 'var(--hh-magenta)',
                color: 'var(--hh-white)',
                padding: '0.5rem 1rem',
                fontFamily: 'Victor Mono',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: '2px solid var(--hh-black)',
                boxShadow: '4px 4px 0px var(--hh-black)',
                letterSpacing: '0.5px',
                flexShrink: 0
              }}>
                {selectedFormat === 'pfp' ? 'PFP FRAME (1080×1080)' : selectedFormat === 'builder_id' ? 'BUILDER ID (1200×675)' : 'TEAM FRAME (1200×675)'}
              </div>
            </div>

            <h2 style={{ fontSize: '2.5rem', color: 'var(--hh-yellow)', marginBottom: '1.5rem', borderBottom: '2px solid var(--hh-yellow)', paddingBottom: '0.5rem' }}>
              {selectedFormat === 'pfp' ? 'PFP FRAME' : selectedFormat === 'builder_id' ? 'BUILDER ID' : 'TEAM FRAME'}
            </h2>

            {/* Photo Upload & Pan/Zoom Controls */}
            <UploadView
              photoDataUrl={photoDataUrl}
              onPhotoSelected={setPhotoDataUrl}
              crop={crop}
              onCropChange={setCrop}
              format={selectedFormat}
            />

            {/* Form Fields */}
            <EditorForm
              format={selectedFormat}
              formData={formData}
              onChange={setFormData}
            />

            {/* Live Output & Action Area */}
            <PreviewShare
              blob={generatedBlob}
              previewSvg={previewSvg}
              format={selectedFormat}
              isGenerating={isGenerating}
              onRenderCurrentGraphic={renderCurrentGraphic}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: "4rem",
          textAlign: "center",
          borderTop: "2px solid rgba(254, 225, 1, 0.3)",
          paddingTop: "2rem",
          fontFamily: "Victor Mono",
          fontSize: "0.8rem",
          color: "var(--hh-cream)",
          opacity: 0.8,
        }}
      >
        <p>HACKER HOUSE GOA · 28–31 OCT 2026 · 2:47 PM STUDIO</p>
        <p style={{ marginTop: "0.3rem", color: "var(--hh-yellow)" }}>
          LESS NOISE. MORE SIGNAL. #FrameInGoa
        </p>
      </footer>
    </div>
  );
}

export default App;
