import React from 'react';

export default function AssetBrowser({ assets, selectedAssetId, onSelect, onLock, onCreateVersion, onApplyVersion, onReplaceAsset }) {
  return (
    <section className="panel">
      <h2>
        Asset Browser <span className="badge">Lock & Reference</span>
      </h2>
      {assets.map((asset) => (
        <article
          key={asset.id}
          className={`asset-card ${selectedAssetId === asset.id ? 'highlight' : ''}`}
          onClick={() => onSelect(asset.id)}
        >
          <div className="asset-meta">
            <strong>{asset.name}</strong>
            <span className="tag">{asset.type}</span>
            <span className="tag">style: {asset.style}</span>
          </div>
          <div className="asset-meta">
            <span className="status-pill">Locked: <span className="locked">{asset.lockedVersion}</span></span>
            <span className="subtle">Variants: {asset.variants.join(', ')}</span>
          </div>
          <div className="section-title">Versions</div>
          <div className="grid-two">
            {asset.versions.map((version) => (
              <div key={version.version} className="list-item">
                <div className="asset-meta">
                  <span className="version-pill">{version.version}</span>
                  <span className="status-pill">{version.status}</span>
                </div>
                <div className="subtle">{version.notes}</div>
                <div className="asset-meta">
                  <span className="tag">seed: {version.seed}</span>
                  <span className="tag">{version.constraints.join(' · ')}</span>
                </div>
                <div className="asset-actions">
                  <button className="secondary" onClick={(e) => { e.stopPropagation(); onLock(asset.id, version.version); }}>Lock</button>
                  <button className="outline" onClick={(e) => { e.stopPropagation(); onApplyVersion(asset.id, version.version, 'all'); }}>Apply to all shots</button>
                </div>
              </div>
            ))}
          </div>
          <div className="asset-actions">
            <button onClick={(e) => { e.stopPropagation(); onCreateVersion(asset.id, 'Targeted regen for selected frame'); }}>New version</button>
            <button className="outline" onClick={(e) => { e.stopPropagation(); onApplyVersion(asset.id, asset.lockedVersion, 'current'); }}>Apply locked to current</button>
            <button className="secondary" onClick={(e) => { e.stopPropagation(); onReplaceAsset(asset.id, asset.id, asset.lockedVersion); }}>
              Replace downstream
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
