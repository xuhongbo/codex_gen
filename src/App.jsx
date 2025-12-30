import React, { useMemo, useState } from 'react';
import AssetBrowser from './components/AssetBrowser.jsx';
import ShotBoard from './components/ShotBoard.jsx';
import InspectorPanel from './components/InspectorPanel.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';

const seededAssets = [
  {
    id: 'char-robot',
    type: 'character',
    name: 'Mentor Robot',
    style: 'Clean cel shading',
    lockedVersion: 'v1',
    variants: ['front', '3/4', 'profile'],
    versions: [
      {
        version: 'v1',
        status: 'locked',
        notes: 'Character sheet with 5 expressions',
        seed: 42,
        prompt: 'Robot teacher with friendly demeanor, teal accents',
        constraints: ['character_sheet_id=char-robot', 'style_guide_id=sg-001']
      },
      {
        version: 'v2',
        status: 'draft',
        notes: 'Added hand poses for lab demo',
        seed: 431,
        prompt: 'Robot teacher doing lab gestures',
        constraints: ['mask=hands', 'seed=431']
      }
    ]
  },
  {
    id: 'bg-lab',
    type: 'background',
    name: 'STEM Lab',
    style: 'Soft gradient with crisp lines',
    lockedVersion: 'v1',
    variants: ['wide', 'medium', 'close'],
    versions: [
      {
        version: 'v1',
        status: 'locked',
        notes: 'Primary background used across lesson',
        seed: 77,
        prompt: 'Colorful STEM lab with posters and soft lighting',
        constraints: ['style_guide_id=sg-001']
      },
      {
        version: 'v2',
        status: 'draft',
        notes: 'Extended canvas for camera move',
        seed: 139,
        prompt: 'Extended lab with left expansion',
        constraints: ['extend_background']
      }
    ]
  },
  {
    id: 'prop-sample',
    type: 'prop',
    name: 'Microscope Prop',
    style: 'Outlined, soft shadow',
    lockedVersion: 'v1',
    variants: ['desktop', 'floating'],
    versions: [
      {
        version: 'v1',
        status: 'locked',
        notes: 'Default prop for biology shots',
        seed: 321,
        prompt: 'Modern microscope in teal accent',
        constraints: ['style_guide_id=sg-001']
      }
    ]
  }
];

const seededShots = [
  {
    id: 'shot-1',
    title: 'Introduction',
    block: 'Title page',
    assetRefs: [
      { slot: 'Character', assetId: 'char-robot', version: 'v1' },
      { slot: 'Background', assetId: 'bg-lab', version: 'v1' }
    ],
    notes: 'Greeting and topic intro'
  },
  {
    id: 'shot-2',
    title: 'Concept: Cells',
    block: 'Concept explain',
    assetRefs: [
      { slot: 'Character', assetId: 'char-robot', version: 'v1' },
      { slot: 'Background', assetId: 'bg-lab', version: 'v1' },
      { slot: 'Prop', assetId: 'prop-sample', version: 'v1' }
    ],
    notes: 'Microscope call-out with motion keyframe'
  },
  {
    id: 'shot-3',
    title: 'Quiz',
    block: 'Interaction',
    assetRefs: [
      { slot: 'Character', assetId: 'char-robot', version: 'v1' },
      { slot: 'Background', assetId: 'bg-lab', version: 'v2' }
    ],
    notes: 'Multiple-choice overlay with DOM layer'
  }
];

const initialHistory = [
  {
    id: 'h1',
    label: 'Asset pack locked',
    detail: 'Character + background locked to v1; assets referenced by shot list',
    timestamp: '10:30'
  },
  {
    id: 'h2',
    label: 'Shot 2 prop added',
    detail: 'Referenced prop-sample@v1 in Prop slot',
    timestamp: '10:32'
  },
  {
    id: 'h3',
    label: 'Background extended',
    detail: 'bg-lab v2 created with extend_background constraint',
    timestamp: '10:35'
  }
];

export default function App() {
  const [assets, setAssets] = useState(seededAssets);
  const [shots, setShots] = useState(seededShots);
  const [history, setHistory] = useState(initialHistory);
  const [selectedShotId, setSelectedShotId] = useState('shot-1');
  const [selectedAssetId, setSelectedAssetId] = useState('char-robot');

  const selectedAsset = useMemo(() => assets.find((asset) => asset.id === selectedAssetId), [assets, selectedAssetId]);
  const selectedShot = useMemo(() => shots.find((shot) => shot.id === selectedShotId), [shots, selectedShotId]);

  const recordHistory = (label, detail) => {
    const entry = {
      id: `h${history.length + 1}`,
      label,
      detail,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHistory((prev) => [entry, ...prev]);
  };

  const lockAssetVersion = (assetId, version) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              lockedVersion: version,
              versions: asset.versions.map((v) => ({ ...v, status: v.version === version ? 'locked' : v.status }))
            }
          : asset
      )
    );
    recordHistory('Asset locked', `${assetId} locked to ${version} for downstream references`);
  };

  const createNewVersion = (assetId, baseNotes) => {
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id !== assetId) return asset;
        const nextIndex = asset.versions.length + 1;
        const newVersion = {
          version: `v${nextIndex}`,
          status: 'draft',
          notes: baseNotes,
          seed: Math.floor(Math.random() * 999),
          prompt: `${asset.name} refinement (${nextIndex})`,
          constraints: ['mask=region', 'seed=random']
        };
        return { ...asset, versions: [...asset.versions, newVersion] };
      })
    );
    recordHistory('New version', `${assetId} drafted a new version for refinement`);
  };

  const applyVersionToShots = (assetId, version, scope = 'all') => {
    setShots((prev) =>
      prev.map((shot, index) => {
        const shouldUpdate = scope === 'all' || (scope === 'current' && shot.id === selectedShotId) || (scope === 'next' && index >= prev.findIndex((s) => s.id === selectedShotId));
        if (!shouldUpdate) return shot;
        const updatedRefs = shot.assetRefs.map((ref) =>
          ref.assetId === assetId ? { ...ref, version } : ref
        );
        return { ...shot, assetRefs: updatedRefs };
      })
    );
    recordHistory('Asset applied', `${assetId}@${version} applied to ${scope} shots`);
  };

  const replaceAsset = (fromId, toId, version) => {
    setShots((prev) =>
      prev.map((shot) => {
        const updatedRefs = shot.assetRefs.map((ref) =>
          ref.assetId === fromId ? { ...ref, assetId: toId, version } : ref
        );
        return { ...shot, assetRefs: updatedRefs };
      })
    );
    recordHistory('Asset replaced', `${fromId} replaced by ${toId}@${version} across timeline`);
  };

  const addProvenance = (assetId, message) => {
    recordHistory('Provenance note', `${assetId}: ${message}`);
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <div className="badge">Asset-first, traceable, non-destructive</div>
          <h1>Course Builder</h1>
          <p className="subtle">Assets are locked first. Shots only store asset_id@version for full reproducibility.</p>
        </div>
        <div className="asset-actions">
          <button onClick={() => recordHistory('Snapshot', 'Project snapshot captured for quick rollback')}>Save Snapshot</button>
          <button className="outline" onClick={() => recordHistory('Render requested', 'Render job enqueued for latest timeline')}>Request Render</button>
        </div>
      </header>

      <AssetBrowser
        assets={assets}
        selectedAssetId={selectedAssetId}
        onSelect={setSelectedAssetId}
        onLock={lockAssetVersion}
        onCreateVersion={createNewVersion}
        onApplyVersion={applyVersionToShots}
        onReplaceAsset={replaceAsset}
      />

      <ShotBoard
        shots={shots}
        selectedShotId={selectedShotId}
        onSelectShot={setSelectedShotId}
        onAddProvenance={addProvenance}
      />

      <InspectorPanel
        asset={selectedAsset}
        shot={selectedShot}
        onApplyVersion={(version) => applyVersionToShots(selectedAssetId, version, 'current')}
        onLock={(version) => lockAssetVersion(selectedAssetId, version)}
      />

      <HistoryPanel history={history} />
    </div>
  );
}
