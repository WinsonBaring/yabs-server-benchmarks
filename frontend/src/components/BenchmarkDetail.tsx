import { useState } from 'react';
import {
    ChevronRight,
    Trash2,
    Activity,
    Cpu,
    HardDrive,
    Globe,
    Gauge,
    LayoutDashboard,
    Zap,
    History
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import type { Benchmark } from '../types';
import { SimulationLab } from './SimulationLab';

interface BenchmarkDetailProps {
    benchmark: Benchmark;
    history: Benchmark[];
    onBack: () => void;
    onSelectVersion: (id: string) => void;
    onDelete: (id: string) => void;
}

export const BenchmarkDetail = ({ benchmark, history, onBack, onSelectVersion, onDelete }: BenchmarkDetailProps) => {
    const [activeSection, setActiveSection] = useState<'overview' | 'metrics' | 'simulation'>('overview');

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { id: 'metrics', label: 'Speed Tests', icon: <Activity size={18} /> },
        { id: 'simulation', label: 'Test Playground', icon: <Gauge size={18} /> }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
            {/* Sidebar Nav */}
            <aside>
                <div style={{ position: 'sticky', top: '2rem' }}>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as any)}
                                className="hover-bright"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    background: activeSection === item.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border-glass)',
                                    color: activeSection === item.id ? 'white' : 'var(--text-muted)',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                    fontWeight: 600
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Switch Date</p>
                        <select
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '0.85rem' }}
                            value={benchmark.id}
                            onChange={(e) => onSelectVersion(e.target.value)}
                        >
                            {history.map(h => (
                                <option key={h.id} value={h.id} style={{ background: '#1e293b' }}>
                                    {new Date(h.timestamp).toLocaleDateString()} at {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main>
                <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
                    <span className="text-muted hover-bright" style={{ cursor: 'pointer' }} onClick={onBack}>Dashboard</span>
                    <ChevronRight size={14} className="text-muted" />
                    <span className="text-muted">{benchmark.server_name}</span>
                    <ChevronRight size={14} className="text-muted" />
                    <span style={{ fontWeight: 600 }}>{new Date(benchmark.timestamp).toLocaleDateString()}</span>
                </nav>

                {activeSection === 'overview' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{benchmark.server_name}</h2>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <span className="badge">{benchmark.provider}</span>
                                        <span className="badge">{benchmark.location}</span>
                                        <span className="badge">{benchmark.distro}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDelete(benchmark.id)}
                                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '0.6rem', padding: '0.6rem', color: '#ef4444' }}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div style={{ background: 'var(--primary)', padding: '1.5rem', borderRadius: '1rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '50%', marginRight: '1.5rem' }}>
                                        <Activity size={32} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Server Power Score</h3>
                                        <p style={{ opacity: 0.9 }}>Value based on how fast the CPU is.</p>
                                    </div>
                                </div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>
                                    {parseInt(benchmark.geekbench_single) > 1200 ? 'EXCELLENT' : parseInt(benchmark.geekbench_single) > 800 ? 'GOOD' : 'FAIR'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2">
                            <div className="glass-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <Cpu color="var(--primary)" />
                                    <h3>Brain (CPU)</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <p className="text-muted">Model Name</p>
                                        <p style={{ fontWeight: 600 }}>{benchmark.cpu_model}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted">Core Count</p>
                                        <p style={{ fontWeight: 600 }}>{benchmark.cpu_cores}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <Zap color="#eab308" />
                                    <h3>Power Test (GB6)</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>Single Core</p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{benchmark.geekbench_single}</p>
                                    </div>
                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>Multi Core</p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{benchmark.geekbench_multi}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'metrics' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Save Speed Part - Detailed Breakdown */}
                        <div className="glass-card">
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <HardDrive size={20} className="text-primary" /> Disk Performance (I/O)
                            </h3>
                            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                How fast your server handles small tasks (4k) vs. big files (1m). Higher bars mean faster saving.
                            </p>

                            <div style={{ height: '350px', marginBottom: '2rem' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart
                                        data={benchmark.raw_data?.disk?.results?.map((r: any) => ({
                                            name: r.block,
                                            speed: r.speed.includes('GB/s') ? parseFloat(r.speed) * 1024 : parseFloat(r.speed),
                                            label: r.speed,
                                            iops: r.iops
                                        })) || []}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--text-muted)" />
                                        <YAxis stroke="var(--text-muted)" label={{ value: 'MB/s', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }} />
                                        <Tooltip
                                            contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '0.75rem' }}
                                            formatter={(value: any, name: any, props: any) => [`${props.payload.label}`, 'Speed']}
                                        />
                                        <Bar dataKey="speed" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)' }}>
                                            <th style={{ padding: '1rem' }}>Task Type (Block)</th>
                                            <th style={{ padding: '1rem' }}>Speed</th>
                                            <th style={{ padding: '1rem' }}>Operations/sec (IOPS)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {benchmark.raw_data?.disk?.results?.map((r: any, idx: number) => (
                                            <tr key={idx} style={{ borderBottom: idx < benchmark.raw_data.disk.results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                                <td style={{ padding: '1rem', fontWeight: 600 }}>{r.block === '4k' ? 'Small Apps (4k)' : r.block === '64k' ? 'Large Apps (64k)' : r.block === '512k' ? 'Bulk Move (512k)' : 'Sequential (1m)'}</td>
                                                <td style={{ padding: '1rem' }}>{r.speed}</td>
                                                <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 700 }}>{r.iops}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Network Part */}
                        <div className="glass-card">
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Globe size={20} style={{ color: 'var(--accent-purple)' }} /> Internet Connection Matrix
                            </h3>
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-glass)' }}>
                                            <th style={{ padding: '1rem' }}>Location</th>
                                            <th style={{ padding: '1rem' }}>Upload</th>
                                            <th style={{ padding: '1rem' }}>Download</th>
                                            <th style={{ padding: '1rem' }}>Delay (Ping)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {benchmark.raw_data?.network?.map((n: any, idx: number) => (
                                            <tr key={idx} style={{ borderBottom: idx < benchmark.raw_data.network.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                                <td style={{ padding: '1rem' }}>{n.location}</td>
                                                <td style={{ padding: '1rem' }}>{n.speed}</td>
                                                <td style={{ padding: '1rem' }}>{n.recv}</td>
                                                <td style={{ padding: '1rem' }}>{n.ping}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'simulation' && (
                    <div className="animate-fade-in">
                        <SimulationLab benchmark={benchmark} />
                    </div>
                )}
            </main>
        </div>
    );
};
