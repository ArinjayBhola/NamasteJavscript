import React, { useState, useEffect } from 'react';

const getParts = (id) => {
  const match = id.match(/S(\d+) Ep (\d+)/);
  return match ? { season: parseInt(match[1]), ep: parseInt(match[2]) } : { season: 0, ep: 0 };
};

const EpisodeIcon = ({ id }) => {
  const { season } = getParts(id);
  return (
    <span className={`ep-icon season-${season}`}>S{season}</span>
  );
};

const App = () => {
  const [episodes, setEpisodes] = useState([]);
  const [current, setCurrent] = useState(null);
  const [tab, setTab] = useState('notes');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/data/episodes.json')
      .then(res => res.json())
      .then(data => {
        setEpisodes(data);
        if (data.length > 0) setCurrent(data[0]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!current) return;
    const tabs = [];
    if (current.notes) tabs.push('notes');
    if (current.code) tabs.push('code');
    if (current.diagrams?.length) tabs.push('diagrams');
    setTab(tabs[0] || 'notes');
  }, [current]);

  const selectEpisode = (ep) => {
    setCurrent(ep);
    setSidebarOpen(false); // close sidebar on mobile after selecting
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading Namaste JavaScript...</p>
      </div>
    );
  }

  const { season } = current ? getParts(current.id) : {};
  const seasonLabel = season === 1 ? 'Season 1 — Core Concepts' : 'Season 2 — Advanced Topics';

  const byseason = episodes.reduce((acc, ep) => {
    const s = getParts(ep.id).season;
    if (!acc[s]) acc[s] = [];
    acc[s].push(ep);
    return acc;
  }, {});

  return (
    <div className="app">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🙏</span>
            <div style={{ flex: 1 }}>
              <p className="logo-sub">Namaste</p>
              <p className="logo-title">JavaScript</p>
            </div>
            {/* Close button on mobile */}
            <button className="close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">✕</button>
          </div>
          <input
            className="search-box"
            type="text"
            placeholder="Search episodes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="ep-list">
          {Object.entries(byseason).map(([s, eps]) => {
            const visible = eps.filter(ep => ep.id.toLowerCase().includes(searchQuery.toLowerCase()));
            if (!visible.length) return null;
            return (
              <div key={s} className="season-group">
                <p className="season-label">Season {s}</p>
                {visible.map(ep => (
                  <button
                    key={ep.id}
                    className={`ep-btn ${current?.id === ep.id ? 'active' : ''}`}
                    onClick={() => selectEpisode(ep)}
                  >
                    <EpisodeIcon id={ep.id} />
                    <span className="ep-name">{ep.id}</span>
                    <div className="ep-badges">
                      {ep.notes && <span className="badge badge-notes">N</span>}
                      {ep.code && <span className="badge badge-code">JS</span>}
                      {ep.diagrams?.length > 0 && <span className="badge badge-diagram">D</span>}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {current && (
          <>
            <div className="main-header">
              <div className="header-top">
                {/* Hamburger menu (mobile only) */}
                <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                  <span></span><span></span><span></span>
                </button>
                <div>
                  <p className="breadcrumb">{seasonLabel}</p>
                  <h1 className="ep-title">{current.title}</h1>
                </div>
              </div>
              <div className="tabs">
                {current.notes && <button className={`tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>📓 Notes</button>}
                {current.diagrams?.length > 0 && <button className={`tab ${tab === 'diagrams' ? 'active' : ''}`} onClick={() => setTab('diagrams')}>🗺 Diagrams</button>}
                {current.code && <button className={`tab ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>}
              </div>
            </div>

            <div className="content">
              {tab === 'notes' && current.notes && (
                <div className="notes-card">
                  <pre className="notes-text">{current.notes}</pre>
                </div>
              )}

              {tab === 'diagrams' && current.diagrams?.length > 0 && (
                <div className="diagrams-grid">
                  {current.diagrams.map((d, i) => (
                    <div key={i} className="diagram-card">
                      <p className="diagram-name">{d.name}</p>
                      <img src={d.dataUrl} alt={d.name} />
                    </div>
                  ))}
                </div>
              )}

              {tab === 'code' && current.code && (
                <div className="code-card">
                  <pre className="code-block"><code>{current.code}</code></pre>
                </div>
              )}

              {!current.notes && !current.code && !current.diagrams?.length && (
                <div className="empty-state">
                  <p className="empty-icon">📂</p>
                  <p>No notes or diagrams available for this episode yet.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
