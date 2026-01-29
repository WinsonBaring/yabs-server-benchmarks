import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Home,
  Sun,
  Moon,
  Book,
  ShieldCheck
} from 'lucide-react';
import type { Benchmark } from './types';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { BenchmarkDetail } from './components/BenchmarkDetail';
import { UploadWizard } from './components/UploadWizard';
import { DocsOverlay } from './components/DocsOverlay';
// @ts-ignore
import DOCS_CONTENT from '../../DOCS.md?raw';

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
  const [showLanding, setShowLanding] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string; all: boolean }>({
    isOpen: false, id: '', name: '', all: false
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('vault_theme') as 'light' | 'dark') || 'dark';
  });
  const [showDocs, setShowDocs] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('benchmark_vault');
    if (saved) {
      const parsed = JSON.parse(saved);
      setBenchmarks(parsed);
      if (parsed.length > 0) setShowLanding(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vault_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (showDocs) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [showDocs]);

  const saveToLocals = (data: Benchmark[]) => {
    localStorage.setItem('benchmark_vault', JSON.stringify(data));
    setBenchmarks(data);
  };

  const copyCommand = () => {
    navigator.clipboard.writeText('curl -sL yabs.sh | bash');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleUpload = (newBenchmark: Benchmark) => {
    const updated = [newBenchmark, ...benchmarks];
    saveToLocals(updated);
    setIsUploading(false);
    setSelectedId(newBenchmark.id);
    setShowLanding(false);
  };

  const handleDeleteTrigger = (e: React.MouseEvent, id: string, name?: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id, name: String(name || 'Benchmark'), all: !!name });
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
    <>
      {/* Fixated Top Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            onClick={() => {
              if (showDocs) {
                setShowDocs(false);
              } else {
                setSelectedId(null);
                setShowLanding(true);
              }
            }}
          >
            <div style={{ background: 'var(--primary)', padding: '0.4rem', borderRadius: '0.6rem', display: 'flex' }}>
              <ShieldCheck size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', marginBottom: '0', color: 'var(--text-main)', fontWeight: 800, lineHeight: 1 }}>Server Vault</h1>
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>Fleet Manager</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {(!showLanding || selectedId) && (
              <button
                className="btn-primary"
                style={{
                  background: 'var(--bg-glass)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-glass)',
                  boxShadow: 'none',
                  padding: '0.6rem 1rem'
                }}
                onClick={() => {
                  if (showDocs) {
                    setShowDocs(false);
                  } else {
                    setShowLanding(true);
                    setSelectedId(null);
                    setIsUploading(false);
                  }
                }}
              >
                <Home size={18} style={{ marginRight: '0.5rem' }} />
                Dashboard
              </button>
            )}

            <button
              onClick={() => setShowDocs(!showDocs)}
              style={{
                background: showDocs ? 'var(--primary)' : 'var(--bg-glass)',
                border: showDocs ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                padding: '0.6rem 1rem',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                color: showDocs ? 'white' : 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}
              className="hover-bright"
            >
              <Book size={18} />
              Docs
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                padding: '0.6rem',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                color: 'var(--text-main)',
                display: 'flex',
              }}
              className="hover-bright"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {!isUploading && (
              <button
                className="btn-primary"
                onClick={() => setIsUploading(true)}
                style={{ padding: '0.6rem 1.2rem' }}
              >
                <Plus size={18} style={{ marginRight: '0.5rem' }} />
                Add Server
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Docs Overlay */}
      {showDocs && (
        <DocsOverlay
          markdown={DOCS_CONTENT}
          onClose={() => setShowDocs(false)}
        />
      )}

      <div className="container" style={{ paddingBottom: '5rem' }}>
        <div className="hero-glow" />

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <div className="glass-card animate-fade-in" style={{ width: '400px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Trash2 size={32} color="#ef4444" />
              </div>
              <h2 style={{ marginBottom: '1rem' }}>Delete {deleteModal.all ? 'Server History' : 'Server Data'}?</h2>
              <p className="text-muted" style={{ marginBottom: '2rem' }}>
                {deleteModal.all
                  ? `This will permanently remove everything for "${deleteModal.name}".`
                  : `Are you sure you want to delete this test result?`}
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" style={{ background: '#ef4444', color: 'white', flex: 1 }} onClick={confirmDelete}>Delete</button>
                <button className="btn-primary" style={{ background: 'var(--bg-glass)', flex: 1 }} onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Header removed and replaced by Navbar above */}

        {showLanding && !selectedId && !isUploading ? (
          <LandingPage
            onStart={() => setShowLanding(false)}
            copyCommand={copyCommand}
            isCopied={isCopied}
          />
        ) : isUploading ? (
          <UploadWizard
            onUpload={handleUpload}
            onCancel={() => { setIsUploading(false); if (benchmarks.length === 0) setShowLanding(true); }}
            sampleYabs={SAMPLE_YABS}
          />
        ) : !selectedId ? (
          <Dashboard
            benchmarks={benchmarks}
            setSelectedId={setSelectedId}
            handleDeleteTrigger={handleDeleteTrigger}
          />
        ) : benchmarkDetail ? (
          <BenchmarkDetail
            benchmark={benchmarkDetail}
            history={historyList}
            onBack={() => setSelectedId(null)}
            onSelectVersion={setSelectedId}
            onDelete={(id) => setDeleteModal({ isOpen: true, id, name: String(benchmarkDetail.server_name), all: false })}
          />
        ) : null}

        {/* Floating Add Button for Dashboard */}
        {!selectedId && !isUploading && benchmarks.length > 0 && (
          <button
            className="btn-primary"
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              padding: '1rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 30px var(--primary-glow)',
              zIndex: 100
            }}
            onClick={() => setIsUploading(true)}
          >
            <Plus size={24} />
          </button>
        )}
      </div>
    </>
  );
};

export default App;
