import { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  Globe,
  Plus,
  ArrowLeft,
  HardDrive,
  Wifi,
  Search,
  Zap,
  Shield,
  BarChart3,
  CheckCircle2,
  Trash2,
  History,
  FileText,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { parseYabsText } from './utils/parser';

interface Benchmark {
  id: string;
  server_name: string;
  timestamp: string;
  provider: string;
  location: string;
  distro: string;
  cpu_model: string;
  cpu_cores: string;
  ram_total: string;
  write_speed: string;
  geekbench_single: string;
  geekbench_multi: string;
  raw_data: any;
}

const SAMPLE_YABS = `# ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
#              Yet-Another-Bench-Script              #
#                     v2024-06-09                    #
# ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## #

Basic System Information:
---------------------------------
Uptime     : 10 days, 4 hours, 12 minutes
Processor  : AMD EPYC 7763 64-Core Processor
CPU cores  : 4 @ 2445.404 MHz
AES-NI     : ✔ Enabled
VM-exit    : ✔ Enabled
RAM        : 7.8 GiB
Swap       : 4.0 GiB
Disk       : 156.9 GiB
Distro     : Ubuntu 22.04.4 LTS
Kernel     : 5.15.0-101-generic
VM Type    : KVM
IPv4/IPv6  : ✔ Online / ✖ Offline

fio Disk Speed Tests (Mixed R/W 50/50):
---------------------------------
Block Size | Read      (IOPS) | Write     (IOPS) | Total     (IOPS)
4k         | 1.20 GB   (300.2k) | 1.20 GB   (300.4k) | 2.40 GB   (600.6k)

iperf3 Network Speed Tests (IPv4):
---------------------------------
Provider | Location (Link)           | Send Rate     | Recv Rate     | Ping
-----    | -----                     | -----         | -----         | -----
Clouvider | London, UK (10G)          | 9.41 Gbits/sec | 9.42 Gbits/sec | 15.2 ms
Vultr    | New Jersey, USA (1G)      | 924 Mbits/sec  | 915 Mbits/sec  | 88.5 ms

Geekbench 6 Benchmark Test:
---------------------------------
Test            | Value
                |
Single Core     | 1852
Multi Core      | 6241`;

const App = () => {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [uploadStep, setUploadStep] = useState<'paste' | 'review'>('paste');
  const [showLanding, setShowLanding] = useState(true);
  const [overrides, setOverrides] = useState<Partial<Benchmark>>({});
  const [isCopied, setIsCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('curl -sL yabs.sh | bash');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('benchmark_vault');
    if (saved) {
      setBenchmarks(JSON.parse(saved));
    }
  }, []);

  const saveToLocals = (data: Benchmark[]) => {
    localStorage.setItem('benchmark_vault', JSON.stringify(data));
    setBenchmarks(data);
  };

  const handleProcessInput = () => {
    try {
      let parsed;
      try {
        parsed = JSON.parse(textInput);
      } catch {
        parsed = parseYabsText(textInput);
      }

      setOverrides({
        server_name: parsed.server_name || '',
        provider: parsed.os?.provider || 'Unknown',
        location: parsed.os?.location || 'Unknown',
        distro: parsed.os?.distro || 'Unknown',
        cpu_model: parsed.cpu?.model || 'Unknown',
        cpu_cores: parsed.cpu?.cores || 'Unknown',
        ram_total: parsed.mem?.ram_total || 'Unknown',
        write_speed: parsed.disk?.write_speed || 'Unknown',
        geekbench_single: parsed.geekbench?.single_core || (parsed.os?.provider ? '0' : ''),
        geekbench_multi: parsed.geekbench?.multi_core || (parsed.os?.provider ? '0' : ''),
        raw_data: parsed
      });
      setUploadStep('review');
    } catch (error) {
      alert('Failed to parse data. Please check the input.');
    }
  };

  const handleUpload = () => {
    const newBenchmark: Benchmark = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      server_name: overrides.server_name || 'Unnamed Server',
      provider: overrides.provider || 'Unknown',
      location: overrides.location || 'Unknown',
      distro: overrides.distro || 'Unknown',
      cpu_model: overrides.cpu_model || 'Unknown',
      cpu_cores: overrides.cpu_cores || 'Unknown',
      ram_total: overrides.ram_total || 'Unknown',
      write_speed: overrides.write_speed || 'Unknown',
      geekbench_single: overrides.geekbench_single || '0',
      geekbench_multi: overrides.geekbench_multi || '0',
      raw_data: overrides.raw_data || {}
    };

    const updated = [newBenchmark, ...benchmarks];
    saveToLocals(updated);
    setIsUploading(false);
    setTextInput('');
    setUploadStep('paste');
    setSelectedId(newBenchmark.id);
    setShowLanding(false);
  };

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string; all: boolean }>({
    isOpen: false,
    id: '',
    name: '',
    all: false
  });

  const handleDeleteTrigger = (e: React.MouseEvent, id: string, deleteAllForServer?: string) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      id,
      name: deleteAllForServer || 'this benchmark version',
      all: !!deleteAllForServer
    });
  };

  const confirmDelete = () => {
    const updated = deleteModal.all
      ? benchmarks.filter(b => b.server_name !== deleteModal.name)
      : benchmarks.filter(b => b.id !== deleteModal.id);

    saveToLocals(updated);

    if (deleteModal.all || selectedId === deleteModal.id) {
      setSelectedId(null);
    }
    setDeleteModal({ isOpen: false, id: '', name: '', all: false });
  };

  const benchmarkDetail = benchmarks.find(b => b.id === selectedId);
  const historyList = benchmarks
    .filter(b => b.server_name === benchmarkDetail?.server_name)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <div className="hero-glow" />

      {showLanding && !selectedId && !isUploading && benchmarks.length === 0 ? (
        <div className="animate-fade-in" style={{ padding: '4rem 0' }}>
          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '5rem', position: 'relative' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)',
              padding: '0.6rem 1.2rem',
              borderRadius: '2rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '2rem',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <Activity size={16} /> Monitor, Compare, Optimize
            </div>
            <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(to bottom right, #fff 30%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              The Ultimate Server<br />Performance Vault.
            </h1>
            <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '750px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
              Tired of messy benchmark logs? Simply run YABS on your server, paste the output here, and get a beautiful dashboard of your hardware's true potential.
            </p>

            {/* Quick Start Command */}
            <div
              onClick={copyCommand}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(0,0,0,0.3)',
                padding: '1rem 1.5rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-glass)',
                marginBottom: '3rem',
                fontFamily: 'monospace',
                fontSize: '1rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              className="hover-bright"
            >
              <code style={{ color: 'var(--primary)' }}>curl -sL yabs.sh | bash</code>
              <div style={{ borderLeft: '1px solid var(--border-glass)', height: '20px' }}></div>
              <span style={{ fontSize: '0.75rem', color: isCopied ? '#22c55e' : 'var(--text-muted)' }}>
                {isCopied ? 'Copied!' : 'Click to copy command'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }} onClick={() => setIsUploading(true)}>
                Analyze New Result <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
              </button>
            </div>
          </div>

          {/* Contextual Usage Section */}
          <div className="grid grid-cols-3" style={{ gap: '2rem', marginBottom: '4rem' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', width: '56px', height: '56px', borderRadius: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)' }}>
                <Zap color="white" size={28} />
              </div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Performance Auditing</h3>
              <p className="text-muted" style={{ flex: 1 }}>Perfect for when you first buy a server or after major updates. Know instantly if you're getting the hardware speed you paid for.</p>
            </div>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)', width: '56px', height: '56px', borderRadius: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 16px rgba(34, 197, 94, 0.3)' }}>
                <CheckCircle2 color="white" size={28} />
              </div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Resilient Input</h3>
              <p className="text-muted" style={{ flex: 1 }}>Our parser is battle-hardened. Paste messy logs, partial outputs, or even invalid data; we'll reconstruct the critical metrics for you.</p>
            </div>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', width: '56px', height: '56px', borderRadius: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)' }}>
                <History color="white" size={28} />
              </div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Instance Evolution</h3>
              <p className="text-muted" style={{ flex: 1 }}>Group benchmarks by server name to see how performance changes over time. Detect silent hardware degradation or node oversubscription.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="badge" style={{ padding: '0.8rem 1.5rem', opacity: 0.9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
              <Shield size={16} style={{ verticalAlign: 'middle', marginRight: '0.75rem', color: '#22c55e' }} />
              <b>Data Privacy:</b> Everything is stored securely in your browser's LocalStorage. No accounts, no trackers.
            </div>
          </div>
        </div>
      ) : (
        <>
          <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ cursor: 'pointer' }} onClick={() => { setSelectedId(null); setShowLanding(true); }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Server Benchmark Vault</h1>
              <p className="text-muted">Comprehensive history and performance tracking.</p>
            </div>
            {!isUploading && (
              <button className="btn-primary" onClick={() => { setIsUploading(true); setUploadStep('paste'); }}>
                <Plus size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Add Benchmark
              </button>
            )}
          </header>

          {isUploading && (
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3>{uploadStep === 'paste' ? 'Step 1: Paste YABS Output' : 'Step 2: Review & Override Everything'}</h3>

              {uploadStep === 'paste' ? (
                <>
                  <p className="text-muted" style={{ marginBottom: '1rem' }}>Paste any YABS output. We'll extract as much as possible.</p>
                  <textarea
                    style={{ height: '200px', marginBottom: '1rem', fontFamily: 'monospace' }}
                    placeholder='Paste yabs.sh results...'
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={handleProcessInput}>Extract & Review</button>
                    <button className="btn-primary" style={{ background: 'var(--bg-glass)' }} onClick={() => setTextInput(SAMPLE_YABS)}>Insert Example</button>
                    <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-glass)' }} onClick={() => setIsUploading(false)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3" style={{ gap: '1rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
                    <div className="col-span-full">
                      <label>Server Instance Name (Groups History)</label>
                      <input value={overrides.server_name} onChange={e => setOverrides({ ...overrides, server_name: e.target.value })} />
                    </div>
                    <div>
                      <label>Provider</label>
                      <input value={overrides.provider} onChange={e => setOverrides({ ...overrides, provider: e.target.value })} />
                    </div>
                    <div>
                      <label>Location</label>
                      <input value={overrides.location} onChange={e => setOverrides({ ...overrides, location: e.target.value })} />
                    </div>
                    <div>
                      <label>OS / Distro</label>
                      <input value={overrides.distro} onChange={e => setOverrides({ ...overrides, distro: e.target.value })} />
                    </div>
                    <div>
                      <label>CPU Model</label>
                      <input value={overrides.cpu_model} onChange={e => setOverrides({ ...overrides, cpu_model: e.target.value })} />
                    </div>
                    <div>
                      <label>CPU Cores</label>
                      <input value={overrides.cpu_cores} onChange={e => setOverrides({ ...overrides, cpu_cores: e.target.value })} />
                    </div>
                    <div>
                      <label>RAM Total</label>
                      <input value={overrides.ram_total} onChange={e => setOverrides({ ...overrides, ram_total: e.target.value })} />
                    </div>
                    <div>
                      <label>Disk Write Speed</label>
                      <input value={overrides.write_speed} onChange={e => setOverrides({ ...overrides, write_speed: e.target.value })} />
                    </div>
                    <div>
                      <label>Geekbench Single</label>
                      <input value={overrides.geekbench_single} onChange={e => setOverrides({ ...overrides, geekbench_single: e.target.value })} />
                    </div>
                    <div>
                      <label>Geekbench Multi</label>
                      <input value={overrides.geekbench_multi} onChange={e => setOverrides({ ...overrides, geekbench_multi: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={handleUpload}>Finalize & Save</button>
                    <button className="btn-primary" style={{ background: 'var(--bg-glass)' }} onClick={() => setUploadStep('paste')}>Reset Parser</button>
                  </div>
                </>
              )}
            </div>
          )}

          {!selectedId ? (
            <div className="grid grid-cols-3">
              {benchmarks.length === 0 && (
                <div className="glass-card" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '4rem' }}>
                  <FileText size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                  <h3>No benchmarks saved</h3>
                  <p className="text-muted">Start by adding your first YABS result.</p>
                </div>
              )}
              {Object.values(
                benchmarks.reduce((acc: { [key: string]: Benchmark }, b) => {
                  if (!acc[b.server_name] || new Date(b.timestamp) > new Date(acc[b.server_name].timestamp)) {
                    acc[b.server_name] = b;
                  }
                  return acc;
                }, {})
              )
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((b) => (
                  <div key={b.id} className="glass-card" onClick={() => setSelectedId(b.id)} style={{ cursor: 'pointer', position: 'relative' }}>
                    <button
                      onClick={(e) => handleDeleteTrigger(e, b.id, b.server_name)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}
                      title="Delete server and all history"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem', marginRight: '1rem' }}>
                        <Server color="white" />
                      </div>
                      <div style={{ maxWidth: '70%', overflow: 'hidden' }}>
                        <h3 style={{ fontSize: '1.1rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{b.server_name}</h3>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>{new Date(b.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                        <Globe size={14} className="text-muted" style={{ marginRight: '0.5rem' }} />
                        <span>{b.location} ({b.provider})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                        <Layers size={14} className="text-muted" style={{ marginRight: '0.5rem' }} />
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
                Back to Dashboard
              </button>

              {benchmarkDetail && (
                <div className="grid grid-cols-1">
                  <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                      <div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{benchmarkDetail.server_name}</h2>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <span className="badge">{benchmarkDetail.provider}</span>
                          <span className="badge">{benchmarkDetail.location}</span>
                          <span className="badge">{benchmarkDetail.distro}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p className="text-muted">Entry Timestamp</p>
                          <p style={{ fontWeight: 600 }}>{new Date(benchmarkDetail.timestamp).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteTrigger(e, benchmarkDetail.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: 'none',
                            borderRadius: '0.6rem',
                            padding: '0.6rem',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '0.5rem'
                          }}
                          title="Delete this benchmark"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--primary)', borderRadius: '1rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '50%', marginRight: '1.5rem' }}>
                          <Activity size={32} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>Overall Performance Score</h3>
                          <p style={{ opacity: 0.9 }}>
                            {parseInt(benchmarkDetail.geekbench_single) > 1200 ? '⚡ This is a high-performance machine, great for intensive tasks.' :
                              parseInt(benchmarkDetail.geekbench_single) > 800 ? '✅ Solid all-rounder machine for web apps and databases.' :
                                '📦 Basic performance, suitable for light workloads.'}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>
                          {parseInt(benchmarkDetail.geekbench_single) > 1200 ? 'EXCELLENT' :
                            parseInt(benchmarkDetail.geekbench_single) > 800 ? 'GOOD' : 'FAIR'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4" style={{ gap: '1rem', marginBottom: '2rem' }}>
                      <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <Cpu className="text-muted" size={20} />
                          <span style={{
                            fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 700,
                            background: parseInt(benchmarkDetail.geekbench_single) > 1000 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                            color: parseInt(benchmarkDetail.geekbench_single) > 1000 ? '#22c55e' : '#eab308'
                          }}>
                            {parseInt(benchmarkDetail.geekbench_single) > 1000 ? 'QUICK' : 'STANDARD'}
                          </span>
                        </div>
                        <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Brain Power</h4>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{benchmarkDetail.geekbench_single}</p>
                        <small className="text-muted">Single task speed</small>
                      </div>
                      <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <HardDrive className="text-muted" size={20} />
                          <span style={{
                            fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 700,
                            background: benchmarkDetail.write_speed.includes('GB/s') || parseFloat(benchmarkDetail.write_speed) > 500 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                            color: benchmarkDetail.write_speed.includes('GB/s') || parseFloat(benchmarkDetail.write_speed) > 500 ? '#22c55e' : '#eab308'
                          }}>
                            {benchmarkDetail.write_speed.includes('GB/s') ? 'FAST' : 'NORMAL'}
                          </span>
                        </div>
                        <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Storage Speed</h4>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{benchmarkDetail.write_speed}</p>
                        <small className="text-muted">How fast files load</small>
                      </div>
                      <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <Wifi className="text-muted" size={20} />
                        </div>
                        <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Memory Space</h4>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{benchmarkDetail.ram_total}</p>
                        <small className="text-muted">Multitasking room</small>
                      </div>
                      <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <Layers className="text-muted" size={20} />
                        </div>
                        <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Machine Type</h4>
                        <p style={{ fontSize: '1.1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{benchmarkDetail.cpu_model}</p>
                        <small className="text-muted">{benchmarkDetail.cpu_cores} Engine Cores</small>
                      </div>
                    </div>

                    {historyList.length > 1 && (
                      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: '1rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                          <History size={18} style={{ marginRight: '0.5rem' }} />
                          <h3 style={{ fontSize: '1rem' }}>Historical Benchmarks for this Instance</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                          {historyList.map((h) => (
                            <div key={h.id} style={{ position: 'relative', flexShrink: 0, border: '1px solid var(--border-glass)', borderRadius: '0.75rem', overflow: 'hidden', background: h.id === benchmarkDetail.id ? 'var(--primary)' : 'var(--bg-glass)', transition: 'all 0.2s ease' }}>
                              <button
                                className="badge"
                                style={{ cursor: 'pointer', padding: '0.6rem 3rem 0.6rem 1.2rem', background: 'transparent', border: 'none', color: h.id === benchmarkDetail.id ? 'white' : 'var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '150px', textAlign: 'left' }}
                                onClick={() => setSelectedId(h.id)}
                              >
                                <span style={{ fontWeight: 700 }}>{new Date(h.timestamp).toLocaleDateString()}</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{new Date(h.timestamp).toLocaleTimeString()}</span>
                              </button>
                              <button onClick={(e) => handleDeleteTrigger(e, h.id)} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '0.4rem', padding: '0.4rem', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete this version">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '3rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                        <div>
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ marginBottom: '0.25rem' }}>Internet Connection Speed</h3>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Download/Upload performance across global nodes.</p>
                          </div>
                          <div style={{ height: '350px', width: '100%', padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={(benchmarkDetail.raw_data.network || []).map((n: any) => ({
                                  ...n,
                                  speed: Math.max(1, parseFloat(n.speed) || 0),
                                  sendSpeed: Math.max(1, parseFloat(n.sendSpeed) || 0)
                                }))}
                                margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
                                <XAxis dataKey="location" stroke="var(--text-muted)" interval={0} tick={({ x, y, payload }) => (
                                  <g transform={`translate(${x},${y})`}>
                                    <text x={0} y={0} dy={16} textAnchor="end" fill="var(--text-muted)" transform="rotate(-45)" style={{ fontSize: '0.65rem' }}>{payload.value}</text>
                                  </g>
                                )} />
                                <YAxis type="number" scale="log" domain={[1, 'auto']} stroke="var(--text-muted)" tickFormatter={(value) => value.toLocaleString()} style={{ fontSize: '0.75rem' }} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '0.75rem' }} formatter={(value: any, name?: string) => [`${parseFloat(value).toLocaleString()} Mbps`, (name || '').includes('Download') ? 'Download' : 'Upload']} />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Bar name="Download" dataKey="speed" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                <Bar name="Upload" dataKey="sendSpeed" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div>
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ marginBottom: '0.25rem' }}>Disk IO Performance</h3>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Throughput across different block sizes (4k to 1m).</p>
                          </div>
                          <div style={{ height: '350px', width: '100%', padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={(benchmarkDetail.raw_data.disk?.results || []).map((d: any) => ({
                                  ...d,
                                  mbps: d.speed.includes('GB/s') ? parseFloat(d.speed) * 1024 : parseFloat(d.speed)
                                }))}
                                margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
                                <XAxis dataKey="block" stroke="var(--text-muted)" style={{ fontSize: '0.75rem' }} />
                                <YAxis stroke="var(--text-muted)" tickFormatter={(value) => `${value} MB/s`} style={{ fontSize: '0.75rem' }} />
                                <Tooltip
                                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '0.75rem' }}
                                  formatter={(_: any, __?: string, props?: any) => [`${props?.payload?.speed || '0'}`, 'Throughput']}
                                />
                                <Bar name="Speed" dataKey="mbps" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {deleteModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>
          <div className="glass-card" style={{ maxWidth: '450px', width: '90%', padding: '2rem', animation: 'scaleUp 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '64px', height: '64px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Trash2 size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Confirm Deletion</h2>
              <p className="text-muted" style={{ lineHeight: '1.5' }}>
                {deleteModal.all ? `This will permanently delete "${deleteModal.name}" and all associated historical benchmarks. This action cannot be undone.` : `Are you sure you want to delete this specific benchmark? This action cannot be undone.`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" style={{ flex: 1, background: 'var(--bg-glass)', color: 'var(--text-main)' }} onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, background: '#ef4444' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
