import React from 'react';

export default function InspectorPanel({ asset, shot, onApplyVersion, onLock }) {
  if (!asset || !shot) return null;

  return (
    <section className="panel">
      <h2>
        Inspector <span className="badge">Selections</span>
      </h2>
      <div className="section-title">Selected shot</div>
      <div className="asset-meta">
        <strong>{shot.title}</strong>
        <span className="tag">{shot.block}</span>
        <span className="tag">{shot.assetRefs.length} assets</span>
      </div>
      <div className="section-title">Selected asset</div>
      <div className="asset-meta">
        <strong>{asset.name}</strong>
        <span className="tag">{asset.type}</span>
        <span className="status-pill">Locked: {asset.lockedVersion}</span>
      </div>
      <div className="subtle">{asset.style}</div>
      <div className="section-title">Apply version to shot</div>
      <div className="asset-meta">
        {asset.versions.map((version) => (
          <button key={version.version} className="outline" onClick={() => onApplyVersion(version.version)}>
            Use {version.version}
          </button>
        ))}
      </div>
      <div className="asset-actions">
        <button onClick={() => onLock(asset.lockedVersion)}>Re-lock {asset.lockedVersion}</button>
        <button className="secondary" onClick={() => onApplyVersion(asset.lockedVersion)}>Apply locked</button>
      </div>
      <div className="section-title">Shot asset refs</div>
      <ul className="list">
        {shot.assetRefs.map((ref) => (
          <li key={`${shot.id}-${ref.slot}`}>
            {ref.slot}: <strong>{ref.assetId}@{ref.version}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
