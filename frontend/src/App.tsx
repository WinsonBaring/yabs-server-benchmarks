import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  Database,
  Globe,
  Plus,
  ArrowLeft,
  Activity,
  HardDrive,
  Wifi
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface BenchmarkShort {
  id: number;
  server_name: string;
  timestamp: string;
  provider: string;
  location: string;
  cpu_model: string;
}

interface BenchmarkFull extends BenchmarkShort {
  raw_data: any;
}

const App = () => {
  const [benchmarks, setBenchmarks] = useState<BenchmarkShort[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [benchmarkDetail, setBenchmarkDetail] = useState<BenchmarkFull | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const fetchBenchmarks = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/benchmarks');
      const data = await res.json();
      setBenchmarks(data);
    } catch (err) {
      console.error('Failed to fetch benchmarks', err);
    }
  };

  const fetchDetail = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3001/api/benchmarks/${id}`);
      const data = await res.json();
      setBenchmarkDetail(data);
    } catch (err) {
      console.error('Failed to fetch detail', err);
    }
  };

  const handleUpload = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch('http://localhost:3001/api/benchmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        setJsonInput('');
        setIsUploading(false);
        fetchBenchmarks();
      }
    } catch (err) {
      alert('Invalid JSON or server error');
    }
  };

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchDetail(selectedId);
    } else {
      setBenchmarkDetail(null);
    }
  }, [selectedId]);

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Server Benchmark Vault</h1>
          <p className="text-muted">Centralized repository for your YABS results.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsUploading(true)}>
          <Plus size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Add Benchmark
        </button>
      </header>

      {isUploading && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3>Upload YABS JSON Result</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>Paste the full JSON output from yabs.sh -j</p>
          <textarea
            style={{
              width: '100%',
              height: '200px',
              background: 'var(--bg-glass)',
              color: 'white',
              border: '1px solid var(--border-glass)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}
            placeholder='{ "server_name": "My Server", ... }'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={handleUpload}>Save Result</button>
            <button className="btn-primary" style={{ background: 'var(--bg-glass)' }} onClick={() => setIsUploading(false)}>Cancel</button>
          </div>
        </div>
      )}

      {!selectedId ? (
        <div className="grid grid-cols-3">
          {benchmarks.map((b) => (
            <div key={b.id} className="glass-card" onClick={() => setSelectedId(b.id)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem', marginRight: '1rem' }}>
                  <Server color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{b.server_name}</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>{new Date(b.timestamp).toLocaleDateString()}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                  <Globe size={14} className="text-muted" style={{ marginRight: '0.5rem' }} />
                  <span>{b.location} ({b.provider})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                  <Cpu size={14} className="text-muted" style={{ marginRight: '0.5rem' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.cpu_model}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button
            className="btn-primary"
            style={{ background: 'transparent', padding: '0.5rem 0', marginBottom: '2rem' }}
            onClick={() => setSelectedId(null)}
          >
            <ArrowLeft size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Back to List
          </button>

          {benchmarkDetail && (
            <div className="grid grid-cols-1">
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{benchmarkDetail.server_name}</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span className="badge">{benchmarkDetail.provider}</span>
                      <span className="badge">{benchmarkDetail.location}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="text-muted">ID: #{benchmarkDetail.id}</p>
                    <p className="text-muted">{new Date(benchmarkDetail.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
                  <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '1rem' }}>
                    <Cpu className="text-muted" style={{ marginBottom: '0.5rem' }} />
                    <h4 className="text-muted">CPU Performance</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{benchmarkDetail.raw_data.geekbench?.single_core || 'N/A'}</p>
                    <small className="text-muted">Geekbench Single Core</small>
                  </div>
                  <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '1rem' }}>
                    <HardDrive className="text-muted" style={{ marginBottom: '0.5rem' }} />
                    <h4 className="text-muted">Disk Write</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{benchmarkDetail.raw_data.disk?.write_speed || 'N/A'}</p>
                    <small className="text-muted">Sequential Write</small>
                  </div>
                  <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '1rem' }}>
                    <Wifi className="text-muted" style={{ marginBottom: '0.5rem' }} />
                    <h4 className="text-muted">Network Avg</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>1.2 Gbps</p>
                    <small className="text-muted">Downlink Speed</small>
                  </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <h3>Network Speed across Locations</h3>
                  <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={benchmarkDetail.raw_data.network || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
                        <XAxis dataKey="location" stroke="var(--text-muted)" />
                        <YAxis stroke="var(--text-muted)" />
                        <Tooltip
                          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}
                          itemStyle={{ color: 'var(--text-main)' }}
                        />
                        <Bar dataKey="speed">
                          {(benchmarkDetail.raw_data.network || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--accent-purple)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
