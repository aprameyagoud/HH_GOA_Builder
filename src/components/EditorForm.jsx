// src/components/EditorForm.jsx
import { generateBuilderTitle } from '../lib/titleGenerator';

function EditorForm({ format, formData, onChange }) {
  const handleChange = (field, value) => {
    onChange(prev => {
      const next = { ...prev, [field]: value };
      // If stack changed and user hasn't manually locked title, auto-suggest title
      if (field === 'stack' && !prev.customTitleEdited) {
        next.builderTitle = generateBuilderTitle(value);
      }
      return next;
    });
  };

  const handleTitleChange = (val) => {
    onChange(prev => ({
      ...prev,
      builderTitle: val,
      customTitleEdited: true
    }));
  };

  const handleMemberChange = (index, value) => {
    const newMembers = [...(formData.members || ['', '', ''])];
    newMembers[index] = value;
    onChange(prev => ({ ...prev, members: newMembers }));
  };

  if (format === 'pfp') {
    return null;
  }

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: 'Victor Mono', fontSize: '1rem', color: 'var(--hh-yellow)', marginBottom: '1rem' }}>
        2. CUSTOMIZE DETAILS
      </h3>
      
      {format === 'builder_id' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-yellow)', marginBottom: '0.2rem' }}>
              NAME *
            </label>
            <input 
              className="input-field"
              placeholder="e.g. APRAMEYA" 
              value={formData.name || ''} 
              onChange={(e) => handleChange('name', e.target.value)} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-yellow)', marginBottom: '0.2rem' }}>
              STACK / ROLE *
            </label>
            <input 
              className="input-field"
              placeholder="e.g. REACT · FIGMA · NODE" 
              value={formData.stack || ''} 
              onChange={(e) => handleChange('stack', e.target.value)} 
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label style={{ fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-yellow)', marginBottom: '0.2rem' }}>
                BUILDER TITLE
              </label>
              <span style={{ fontSize: '0.7rem', color: 'var(--hh-magenta)', fontFamily: 'Victor Mono' }}>
                (AUTO-GENERATED & EDITABLE)
              </span>
            </div>
            <input 
              className="input-field"
              placeholder="e.g. THE VISUAL BUILDER" 
              value={formData.builderTitle || ''} 
              onChange={(e) => handleTitleChange(e.target.value)} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-yellow)', marginBottom: '0.2rem' }}>
                TEAM (OPTIONAL)
              </label>
              <input 
                className="input-field"
                placeholder="e.g. NULL SENTINELS" 
                value={formData.teamName || ''} 
                onChange={(e) => handleChange('teamName', e.target.value)} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-yellow)', marginBottom: '0.2rem' }}>
                X HANDLE (OPTIONAL)
              </label>
              <input 
                className="input-field"
                placeholder="e.g. @your_handle" 
                value={formData.xHandle || ''} 
                onChange={(e) => handleChange('xHandle', e.target.value)} 
              />
            </div>
          </div>
        </div>
      )}

      {format === 'team_frame' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-yellow)', marginBottom: '0.2rem' }}>
              TEAM NAME *
            </label>
            <input 
              className="input-field"
              placeholder="e.g. NULL SENTINELS" 
              value={formData.teamName || ''} 
              onChange={(e) => handleChange('teamName', e.target.value)} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-yellow)', marginBottom: '0.4rem' }}>
              MEMBERS (1–3 PEOPLE)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[0, 1, 2].map((idx) => (
                <input 
                  key={idx}
                  className="input-field"
                  placeholder={`Member ${idx + 1}`} 
                  value={(formData.members && formData.members[idx]) || ''} 
                  onChange={(e) => handleMemberChange(idx, e.target.value)} 
                  style={{ marginBottom: 0 }}
                />
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'Victor Mono', color: 'var(--hh-yellow)', marginBottom: '0.2rem' }}>
              QUOTE / ONE-LINER (OPTIONAL)
            </label>
            <input 
              className="input-field"
              placeholder='e.g. "Some edgy tagline goes here."' 
              value={formData.quote || ''} 
              onChange={(e) => handleChange('quote', e.target.value)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorForm;
