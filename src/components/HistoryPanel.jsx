import React from 'react';

export default function HistoryPanel({ history }) {
  return (
    <section className="panel">
      <h2>
        History & Provenance <span className="badge">Traceable</span>
      </h2>
      <div className="provenance-list">
        {history.map((entry) => (
          <div key={entry.id} className="provenance-item">
            <div className="asset-meta">
              <strong>{entry.label}</strong>
              <span className="status-pill">{entry.timestamp}</span>
            </div>
            <div className="subtle">{entry.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
