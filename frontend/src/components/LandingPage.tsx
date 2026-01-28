import {
    Activity,
    ArrowRight,
    Zap,
    CheckCircle2,
    History,
    Shield,
    Globe
} from 'lucide-react';

interface LandingPageProps {
    onStart: () => void;
    copyCommand: () => void;
    isCopied: boolean;
}

export const LandingPage = ({ onStart, copyCommand, isCopied }: LandingPageProps) => {
    return (
        <div className="animate-fade-in" style={{ padding: '4rem 0' }}>
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
                    <Activity size={16} /> Track, Compare, Improve
                </div>
                <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(to bottom right, #fff 30%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Your Server History,<br />Simplified & Beautiful.
                </h1>
                <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '750px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
                    Stop digging through messy logs. Just copy and paste your server's test result here, and we'll turn it into a beautiful dashboard automatically.
                </p>

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
                    <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }} onClick={onStart}>
                        Add Your First Server <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3" style={{ gap: '2rem', marginBottom: '4rem' }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderTop: '2px solid var(--primary)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', width: '56px', height: '56px', borderRadius: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)' }}>
                        <Zap color="white" size={28} />
                    </div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Simplified Fleet</h3>
                    <p className="text-muted" style={{ flex: 1 }}>One clean view for all your servers. No complicated tabs—just a list of your hardware and their current health status.</p>
                </div>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderTop: '2px solid #22c55e' }}>
                    <div style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)', width: '56px', height: '56px', borderRadius: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 16px rgba(34, 197, 94, 0.3)' }}>
                        <Activity color="white" size={28} />
                    </div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Pro I/O Metrics</h3>
                    <p className="text-muted" style={{ flex: 1 }}>Deep-dive into disk performance. We break down speeds into 4k, 64k, and 1m block sizes so you can spot database bottlenecks instantly.</p>
                </div>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderTop: '2px solid #f59e0b' }}>
                    <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', width: '56px', height: '56px', borderRadius: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)' }}>
                        <Globe color="white" size={28} />
                    </div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Global Simulation</h3>
                    <p className="text-muted" style={{ flex: 1 }}>Choose from dozens of global locations to see exactly how snappy your server feels to real users in different cities.</p>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <div className="badge" style={{ padding: '0.8rem 1.5rem', opacity: 0.9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
                    <Shield size={16} style={{ verticalAlign: 'middle', marginRight: '0.75rem', color: '#22c55e' }} />
                    <b>Private & Safe:</b> Everything is saved only on your computer. No accounts or passwords needed.
                </div>
            </div>
        </div>
    );
};
