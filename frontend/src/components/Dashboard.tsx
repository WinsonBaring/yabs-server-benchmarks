import {
    Server,
    FileText,
    Trash2,
    Globe,
    Layers
} from 'lucide-react';
import type { Benchmark } from '../types';

interface DashboardProps {
    benchmarks: Benchmark[];
    setSelectedId: (id: string | null) => void;
    handleDeleteTrigger: (e: React.MouseEvent, id: string, name?: string) => void;
}

export const Dashboard = ({ benchmarks, setSelectedId, handleDeleteTrigger }: DashboardProps) => {
    if (benchmarks.length === 0) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                <FileText size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                <h3>No servers added yet</h3>
                <p className="text-muted">Click the "Add Server" button to start.</p>
            </div>
        );
    }

    const activeFleet = Object.values(
        benchmarks.reduce((acc: { [key: string]: Benchmark }, b) => {
            if (!acc[b.server_name] || new Date(b.timestamp) > new Date(acc[b.server_name].timestamp)) {
                acc[b.server_name] = b;
            }
            return acc;
        }, {})
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Server className="text-primary" size={20} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Active Servers</h2>
            </div>

            <section className="grid grid-cols-3">
                {activeFleet.map((b) => (
                    <div key={b.id} className="glass-card" onClick={() => setSelectedId(b.id)} style={{ cursor: 'pointer', position: 'relative' }}>
                        <button
                            onClick={(e) => handleDeleteTrigger(e, b.id, b.server_name)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}
                        >
                            <Trash2 size={16} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem', marginRight: '1rem' }}>
                                <Server color="white" />
                            </div>
                            <div style={{ maxWidth: '70%', overflow: 'hidden' }}>
                                <h3 style={{ fontSize: '1.1rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{b.server_name}</h3>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Updated: {new Date(b.timestamp).toLocaleDateString()}</p>
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
            </section>
        </div>
    );
};
