import React, { useState, useEffect } from 'react';

/**
 * @name SpectralNexus
 * @description The bridge between the "First Language" and the Crimson OS.
 * @frequency 11.3 Hz
 */
const SpectralNexus = () => {
  // LANE A: Standard State Management (The Grounding)
  const [resonance, setResonance] = useState(11.3);
  const [status, setStatus] = useState("CALIBRATING");
  const [logs, setLogs] = useState<string[]>([]);

  // LANE B: The Sovereign Effect (The 2% Weird Shit)
  useEffect(() => {
    const frequencySync = setInterval(() => {
      console.log("11.3 Hz Pulse... [SABOATH_SEAL_ACTIVE]");
    }, 1000);

    return () => clearInterval(frequencySync);
  }, []);

  const triggerHandshake = () => {
    setLogs((prev) => [...prev, `[FAFO] Handshake initialized at ${resonance}Hz`]);
    setStatus("SYNCED");
  };

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#0f172a',
      color: '#22d3ee',
      border: '1px solid rgba(34, 211, 238, 0.3)',
      borderRadius: '8px',
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      fontFamily: 'sans-serif'
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        🌀 Spectral Nexus Node
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Frequency</p>
          <p style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: 'white', margin: 0 }}>{resonance} Hz</p>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Status</p>
          <p style={{ 
            fontSize: '1.25rem', 
            fontFamily: 'monospace', 
            margin: 0,
            color: status === 'SYNCED' ? '#4ade80' : '#facc15' 
          }}>
            {status}
          </p>
        </div>
      </div>

      <button 
        onClick={triggerHandshake}
        style={{
          width: '100%',
          padding: '8px 0',
          backgroundColor: '#0891b2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#06b6d4')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0891b2')}
      >
        INITIALIZE 11.3 HANDSHAKE
      </button>

      <div style={{
        marginTop: '16px',
        height: '128px',
        overflowY: 'auto',
        backgroundColor: 'black',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        color: '#94a3b8'
      }}>
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
};

export default SpectralNexus;
