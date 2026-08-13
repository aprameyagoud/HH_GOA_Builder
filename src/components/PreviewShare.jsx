// src/components/PreviewShare.jsx
import { useState } from 'react';

function PreviewShare({ blob, previewSvg, format, isGenerating }) {
  const [shareStatus, setShareStatus] = useState('');

  const getFilename = () => {
    switch (format) {
      case 'pfp': return 'HH-Goa-2026-PFP.png';
      case 'builder_id': return 'HH-Goa-2026-Builder-ID.png';
      case 'team_frame': return 'HH-Goa-2026-Team-Frame.png';
      default: return 'HH-Goa-2026-Graphic.png';
    }
  };

  const getCaption = () => {
    switch (format) {
      case 'pfp': return 'Just framed my Goa build. 🌴 #FrameInGoa';
      case 'builder_id': return 'Got my HH Goa 2026 Builder ID. #FrameInGoa';
      case 'team_frame': return 'Our crew is framed for HH Goa 2026. 🌴 #FrameInGoa';
      default: return 'Framed for HH Goa 2026. 🌴 #FrameInGoa';
    }
  };

  const handleDownload = () => {
    if (!blob) return;
    const filename = getFilename();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const caption = getCaption();
    const filename = getFilename();

    // Check Web Share API with file support
    if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'image/png' })] })) {
      try {
        const file = new File([blob], filename, { type: 'image/png' });
        await navigator.share({
          title: 'HH Goa 2026',
          text: caption,
          files: [file]
        });
        setShareStatus('Shared successfully!');
        setTimeout(() => setShareStatus(''), 3000);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed, using fallback', err);
        } else {
          return;
        }
      }
    }

    // Fallback: Copy caption to clipboard and open Twitter intent
    try {
      await navigator.clipboard.writeText(caption);
      setShareStatus('Caption copied to clipboard! Opening X...');
    } catch (e) {
      setShareStatus('Opening X compose...');
    }

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
    window.open(twitterUrl, '_blank');
    setTimeout(() => setShareStatus(''), 4000);
  };

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      border: '3px solid var(--hh-yellow)',
      boxShadow: '6px 6px 0px var(--hh-black)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'Victor Mono', fontSize: '1.1rem', color: 'var(--hh-yellow)', margin: 0 }}>
          3. GENERATED OUTPUT
        </h3>
        <span style={{ fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-magenta)', fontWeight: 700 }}>
          LIVE CLIENT-SIDE RENDER
        </span>
      </div>

      {/* SVG / Canvas Preview */}
      <div style={{
        width: '100%',
        aspectRatio: format === 'pfp' ? '1 / 1' : '16 / 9',
        backgroundColor: 'var(--hh-dark-green)',
        border: '3px solid var(--hh-black)',
        marginBottom: '1.5rem',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '4px 4px 0px var(--hh-black)'
      }}>
        {previewSvg ? (
          <div 
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: previewSvg }}
          />
        ) : (
          <div style={{ color: 'var(--hh-yellow)', fontFamily: 'Victor Mono', fontSize: '0.9rem' }}>
            {isGenerating ? 'Rendering graphic...' : 'Click Generate to preview'}
          </div>
        )}
      </div>

      {shareStatus && (
        <div style={{
          backgroundColor: 'var(--hh-magenta)',
          color: 'var(--hh-white)',
          padding: '0.6rem 1rem',
          fontFamily: 'Victor Mono',
          fontSize: '0.85rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          {shareStatus}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button 
          type="button"
          onClick={handleDownload} 
          disabled={!blob || isGenerating}
          style={{ 
            padding: '1rem', 
            fontSize: '1.1rem', 
            backgroundColor: 'var(--hh-yellow)', 
            color: 'var(--hh-black)',
            opacity: (!blob || isGenerating) ? 0.6 : 1
          }}
        >
          DOWNLOAD PNG
        </button>

        <button 
          type="button"
          onClick={handleShare} 
          className="primary" 
          disabled={!blob || isGenerating}
          style={{ 
            padding: '1rem', 
            fontSize: '1.1rem',
            opacity: (!blob || isGenerating) ? 0.6 : 1
          }}
        >
          SHARE TO X 🌴
        </button>
      </div>
    </div>
  );
}

export default PreviewShare;
