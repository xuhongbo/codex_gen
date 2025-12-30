import React from 'react';

export default function ShotBoard({ shots, selectedShotId, onSelectShot, onAddProvenance }) {
  return (
    <section className="panel">
      <h2>
        Shot List <span className="badge">All references are asset_id@version</span>
      </h2>
      <ul className="list">
        {shots.map((shot, index) => (
          <li key={shot.id} className={selectedShotId === shot.id ? 'highlight' : ''} onClick={() => onSelectShot(shot.id)}>
            <div className="asset-meta">
              <strong>{shot.title}</strong>
              <span className="tag">{shot.block}</span>
              <span className="tag">#{index + 1}</span>
            </div>
            <div className="subtle">{shot.notes}</div>
            <div className="section-title">Asset references</div>
            <div className="asset-meta">
              {shot.assetRefs.map((ref) => (
                <span key={`${shot.id}-${ref.slot}`} className="status-pill">
                  {ref.slot}: {ref.assetId}@{ref.version}
                </span>
              ))}
            </div>
            <div className="asset-actions">
              <button className="outline" onClick={(e) => { e.stopPropagation(); onAddProvenance('shot-' + shot.id, 'Marked frame for regenerate-this-frame'); }}>
                Flag frame regen
              </button>
              <button className="secondary" onClick={(e) => { e.stopPropagation(); onAddProvenance('shot-' + shot.id, 'DOM layer edited, CSS diff recorded'); }}>
                Log DOM edit
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="section-title">Timeline</div>
      <div className="timeline">
        {shots.map((shot) => (
          <div key={shot.id} className="clip">
            <div className="asset-meta">
              <span className="version-pill">{shot.id}</span>
              <span className="status-pill">{shot.assetRefs.length} refs</span>
            </div>
            <div className="subtle">{shot.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
