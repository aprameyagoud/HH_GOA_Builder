// src/components/UploadView.jsx
import { useRef } from 'react';

function UploadView({ photoDataUrl, onPhotoSelected, crop, onCropChange, format }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        onPhotoSelected(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    onCropChange({ scale: 1, x: 0, y: 0 });
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <h3 style={{ fontFamily: 'Victor Mono', fontSize: '1rem', color: 'var(--hh-yellow)', margin: 0 }}>
          {format === 'pfp' ? '1. YOUR PFP PHOTO' : format === 'team_frame' ? '1. YOUR CREW PHOTO' : '1. YOUR PHOTO'}
        </h3>
        {photoDataUrl && (
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', backgroundColor: 'var(--hh-yellow)' }}
          >
            CHANGE PHOTO
          </button>
        )}
      </div>

      {!photoDataUrl ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '3px dashed var(--hh-yellow)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌴</div>
          <span style={{ fontFamily: 'Imbue', fontSize: '2.4rem', color: 'var(--hh-yellow)', display: 'block', lineHeight: 1 }}>
            UPLOAD PHOTO
          </span>
          <p style={{ fontFamily: 'Victor Mono', fontSize: '0.85rem', margin: '0.5rem 0', color: 'var(--hh-white)' }}>
            JPG, PNG, WebP, HEIC supported
          </p>
          <div style={{ 
            display: 'inline-block', 
            backgroundColor: 'var(--hh-magenta)', 
            color: 'var(--hh-white)', 
            padding: '0.2rem 0.6rem', 
            fontSize: '0.7rem', 
            fontFamily: 'Victor Mono',
            fontWeight: 700,
            marginTop: '0.5rem'
          }}>
            YOUR PHOTO STAYS ON YOUR DEVICE
          </div>
        </div>
      ) : (
        <div style={{
          border: '2px solid var(--hh-yellow)',
          padding: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
        }}>
          {/* Adjust controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-yellow)', marginBottom: '0.3rem' }}>
                ZOOM: {Math.round((crop.scale || 1) * 100)}%
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.05" 
                value={crop.scale || 1}
                onChange={(e) => onCropChange({ ...crop, scale: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--hh-magenta)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-yellow)', marginBottom: '0.3rem' }}>
                HORIZONTAL PAN
              </label>
              <input 
                type="range" 
                min="-250" 
                max="250" 
                step="2" 
                value={crop.x || 0}
                onChange={(e) => onCropChange({ ...crop, x: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--hh-magenta)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '65%' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-yellow)', marginBottom: '0.3rem' }}>
                VERTICAL PAN
              </label>
              <input 
                type="range" 
                min="-250" 
                max="250" 
                step="2" 
                value={crop.y || 0}
                onChange={(e) => onCropChange({ ...crop, y: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--hh-magenta)' }}
              />
            </div>
            <button 
              type="button" 
              onClick={handleReset}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: 'var(--hh-cream)', color: 'var(--hh-black)' }}
            >
              RESET
            </button>
          </div>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg, image/png, image/webp, image/heic, image/heif" 
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default UploadView;
