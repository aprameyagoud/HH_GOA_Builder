// src/components/PreviewShare.jsx
import { useState } from 'react';

function PreviewShare({ blob, previewSvg, format, isGenerating, onRenderCurrentGraphic }) {
  const [shareStep, setShareStep] = useState(''); // '', 'generating', 'preparing', 'opening'
  const [errorMessage, setErrorMessage] = useState('');

  const getFilename = () => {
    switch (format) {
      case 'pfp': return 'HH-Goa-2026-PFP.png';
      case 'builder_id': return 'HH-Goa-2026-Builder-ID.png';
      case 'team_frame': return 'HH-Goa-2026-Team-Frame.png';
      default: return 'HH-Goa-2026-Frame.png';
    }
  };

  const getCaption = () => {
    switch (format) {
      case 'pfp':
        return 'Framed for HH Goa 2026. 🌴 #FrameInGoa';
      case 'builder_id':
        return 'Got my HH Goa 2026 Builder ID. 🌴 #FrameInGoa';
      case 'team_frame':
        return 'Our crew is framed for HH Goa 2026. 🌴 #FrameInGoa';
      default:
        return 'Framed for HH Goa 2026. 🌴 #FrameInGoa';
    }
  };

  // Convert Blob to base64 Data URL
  const blobToBase64 = (b) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(b);
    });
  };

  // Ensure we have the latest rendered Blob
  const getActiveBlob = async () => {
    if (blob && !isGenerating) return blob;
    if (typeof onRenderCurrentGraphic === 'function') {
      return await onRenderCurrentGraphic();
    }
    return blob;
  };

  const handleDownload = async () => {
    setErrorMessage('');
    const targetBlob = await getActiveBlob();
    if (!targetBlob) {
      setErrorMessage("Couldn't generate your frame. Please try again.");
      return;
    }

    const filename = getFilename();
    const url = URL.createObjectURL(targetBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    setErrorMessage('');

    // Step 1: GENERATING...
    setShareStep('generating');
    let targetBlob = null;
    try {
      targetBlob = await getActiveBlob();
      if (!targetBlob) {
        throw new Error('No blob rendered');
      }
    } catch (err) {
      console.error('Render error during share:', err);
      setErrorMessage("Couldn't generate your frame. Please try again.");
      setShareStep('');
      return;
    }

    const caption = getCaption();
    const filename = getFilename();

    // ALWAYS generate a Shareable Link with actual OG image and open X intent
    setShareStep('preparing');

    let shareUrl = '';
    try {
      const base64Data = await blobToBase64(targetBlob);

      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          caption,
          imageBase64: base64Data
        })
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      shareUrl = data.shareUrl || `${window.location.origin}/share/${data.id}`;
    } catch (err) {
      console.error('Share link creation failed:', err);
      setErrorMessage("Couldn't create the share link. Please try again.");
      setShareStep('');
      return;
    }

    // Step 3: OPENING X...
    setShareStep('opening');

    try {
      const xPostText = `${caption}\n\n${shareUrl}`;
      const xIntentUrl = `https://x.com/intent/post?text=${encodeURIComponent(xPostText)}`;

      const newWindow = window.open(xIntentUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        // Pop-up blocker fallback: navigate or inform user
        window.location.href = xIntentUrl;
      }
    } catch (e) {
      console.error('Failed to open X compose:', e);
    }

    // Reset button text after small delay
    setTimeout(() => {
      setShareStep('');
    }, 1500);
  };

  const getShareButtonText = () => {
    switch (shareStep) {
      case 'generating':
        return 'GENERATING...';
      case 'preparing':
        return 'PREPARING SHARE...';
      case 'opening':
        return 'OPENING X...';
      default:
        return 'SHARE TO X 🌴';
    }
  };

  const isBusy = isGenerating || !!shareStep;

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

      {/* Error Message */}
      {errorMessage && (
        <div style={{
          backgroundColor: 'var(--hh-magenta)',
          color: 'var(--hh-white)',
          padding: '0.8rem 1rem',
          fontFamily: 'Victor Mono',
          fontSize: '0.9rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '1.2rem',
          border: '2px solid var(--hh-black)',
          boxShadow: '3px 3px 0px var(--hh-black)'
        }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button 
          type="button"
          onClick={handleDownload} 
          disabled={isBusy || !blob}
          style={{ 
            padding: '1rem', 
            fontSize: '1.1rem', 
            backgroundColor: 'var(--hh-yellow)', 
            color: 'var(--hh-black)',
            opacity: (isBusy || !blob) ? 0.6 : 1,
            cursor: (isBusy || !blob) ? 'not-allowed' : 'pointer'
          }}
        >
          DOWNLOAD PNG
        </button>

        <button 
          type="button"
          onClick={handleShare} 
          className="primary" 
          disabled={isBusy}
          style={{ 
            padding: '1rem', 
            fontSize: '1.1rem',
            opacity: isBusy ? 0.8 : 1,
            cursor: isBusy ? 'wait' : 'pointer',
            transition: 'background-color 0.2s, transform 0.1s'
          }}
        >
          {getShareButtonText()}
        </button>
      </div>
    </div>
  );
}

export default PreviewShare;
