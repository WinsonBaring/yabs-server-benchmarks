import { useState, useRef, useEffect } from 'react';
import {
    Gauge,
    Wifi,
    Download,
    HardDrive,
    MousePointer2,
    FileSearch,
    Globe
} from 'lucide-react';
import type { Benchmark, SimResult } from '../types';

interface SimulationLabProps {
    benchmark: Benchmark;
}

export const SimulationLab = ({ benchmark }: SimulationLabProps) => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [simProgress, setSimProgress] = useState(0);
    const [simResult, setSimResult] = useState<SimResult | null>(null);
    const [showGlossary, setShowGlossary] = useState(true);
    const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);
    const [fileSize, setFileSize] = useState<number>(100);
    const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        };
    }, []);

    const networkNodes = benchmark.raw_data?.network || [];

    const targetNode = networkNodes[selectedNodeIndex];
    const pingNum = parseFloat(targetNode?.ping || '0');
    const speedNum = parseFloat(targetNode?.recv || targetNode?.speed || '0');

    const getStatusColor = (val: number, type: 'ping' | 'speed') => {
        if (type === 'ping') {
            if (val < 100) return '#22c55e'; // Green
            if (val < 200) return '#eab308'; // Yellow
            return '#ef4444'; // Red
        } else {
            if (val > 500) return '#22c55e'; // Green
            if (val > 100) return '#eab308'; // Yellow
            return '#ef4444'; // Red
        }
    };

    const pingColor = getStatusColor(pingNum, 'ping');
    const speedColor = getStatusColor(speedNum, 'speed');
    // For Save, combine them or use a general health metric
    const generalColor = (pingNum < 150 && speedNum > 100) ? '#22c55e' : (pingNum > 250 || speedNum < 50) ? '#ef4444' : '#eab308';

    const runSimulation = (type: 'latency' | 'download' | 'io') => {
        // Stop any existing simulation
        if (simIntervalRef.current) {
            clearInterval(simIntervalRef.current);
            simIntervalRef.current = null;
        }

        setIsSimulating(true);
        setSimProgress(0);
        setSimResult(null);

        let duration = 2000;
        const targetNode = networkNodes[selectedNodeIndex];

        if (type === 'latency') {
            const ping = parseFloat(targetNode?.ping) || 100;
            duration = Math.max(800, ping * 8);
        } else if (type === 'download') {
            const mbps = parseFloat(targetNode?.speed) || 100;
            // Use custom file size for duration calculation
            duration = Math.max(1000, (fileSize * 8 / mbps) * 1000);
        } else if (type === 'io') {
            const speed = parseFloat(benchmark.write_speed) || 100;
            duration = Math.max(1000, (1000 / speed) * 3000);
        }

        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const progress = Math.min(99, (elapsed / duration) * 100);
            setSimProgress(progress);

            if (elapsed >= duration) {
                if (simIntervalRef.current) clearInterval(simIntervalRef.current);
                simIntervalRef.current = null;
                setSimProgress(100);
                setTimeout(() => {
                    setIsSimulating(false);
                    const ratingData = type === 'latency' ? {
                        time: `${parseFloat(targetNode?.ping)}ms`,
                        rating: parseFloat(targetNode?.ping) < 50 ? 'Super Fast' : parseFloat(targetNode?.ping) < 150 ? 'Good' : 'Slow',
                        desc: parseFloat(targetNode?.ping) < 50 ? 'Instant reaction. People using your site from here will find it very snappy.' : parseFloat(targetNode?.ping) < 150 ? 'Small delay. People will notice it but it is still okay.' : 'Noticeable lag. Using an app from here might feel frustrating.'
                    } : type === 'download' ? {
                        time: targetNode?.recv || '0 Mbps',
                        rating: parseFloat(targetNode?.recv) > 500 ? 'Ultra Fast' : 'Normal',
                        desc: 'Sending a big file would take ' + (duration / 1000).toFixed(1) + ' seconds at this speed.'
                    } : {
                        time: benchmark.write_speed || 'N/A',
                        rating: 'Solid',
                        desc: 'Saving information to the database will happen almost instantly.'
                    };
                    setSimResult(ratingData);
                }, 300);
            }
        }, 50);

        simIntervalRef.current = interval;
    };

    return (
        <section className="glass-card" style={{ borderLeft: '4px solid var(--primary)', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.05), transparent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Gauge className="text-primary" size={24} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.8rem' }}>Simulation Playground</h3>
                    </div>
                    <p className="text-muted">See how this server feels to a real person using your website or app.</p>
                </div>
                <button
                    onClick={() => setShowGlossary(!showGlossary)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'right', textDecoration: 'underline' }}
                >
                    {showGlossary ? 'Hide Info' : 'What are these?'}
                </button>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Globe size={16} /> Where is the user visiting from?
                </label>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.15)',
                    borderRadius: '1.25rem',
                    border: '1px solid var(--border-glass)',
                    scrollbarWidth: 'thin'
                }}>
                    {networkNodes.map((node: any, idx: number) => {
                        const cleanLocation = node.location.split('(')[0].trim();
                        const latency = node.ping || '0ms';
                        const download = node.recv || node.speed || '0';
                        const pingNum = parseFloat(latency);
                        const speedNum = parseFloat(download);

                        // Heatmap logic: Calculate a "Performance Score" 0-100
                        // Ping: best is low (e.g. 10ms), worst is high (e.g. 300ms)
                        // Speed: best is high (e.g. 1000MBs), worst is low (e.g. 10MBs)
                        const pingScore = Math.max(0, Math.min(100, (1 - (pingNum / 300)) * 100));
                        const speedScore = Math.max(0, Math.min(100, (speedNum / 1000) * 100));
                        const totalScore = (pingScore * 0.6) + (speedScore * 0.4); // Weight ping more for "snappiness"

                        // Map totalScore to Red/Yellow/Green gradient
                        const getPerformanceColor = (score: number) => {
                            if (score > 80) return '#22c55e'; // Green
                            if (score > 50) return '#eab308'; // Yellow
                            return '#ef4444'; // Red
                        };

                        const perfColor = getPerformanceColor(totalScore);
                        const isSelected = selectedNodeIndex === idx;

                        return (
                            <div
                                key={idx}
                                onClick={() => setSelectedNodeIndex(idx)}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '1rem',
                                    background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                                    border: isSelected ? `2px solid ${perfColor}` : '1px solid var(--border-glass)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    opacity: isSelected ? 1 : 0.8,
                                    width: '100%'
                                }}
                                className="hover-bright"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: '180px' }}>{cleanLocation}</span>
                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: pingNum < 100 ? '#22c55e' : pingNum < 200 ? '#eab308' : '#ef4444' }}>
                                            <Wifi size={14} /> {latency}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: speedNum > 500 ? '#22c55e' : speedNum > 100 ? '#eab308' : '#ef4444' }}>
                                            <Download size={14} /> {download}
                                        </span>
                                    </div>
                                </div>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: perfColor,
                                    boxShadow: `0 0 10px ${perfColor}`
                                }} />
                            </div>
                        );
                    })}
                    {networkNodes.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
                            No locations found in benchmark data.
                        </div>
                    )}
                </div>
            </div>

            {showGlossary && (
                <div className="animate-fade-in" style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', border: '1px solid var(--border-glass)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Wifi size={14} /> Delay (Ping)</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>How long it takes for a click to reach the server and come back.</p>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Download size={14} /> Download Speed</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>How fast images and files are sent from the server to the user.</p>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><HardDrive size={14} /> Saving Speed</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>How fast the server can save new data to its own storage.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
                {/* Website Clicks - Latency Dependent */}
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: `1px solid ${pingColor}33`,
                    borderTop: `3px solid ${pingColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: pingColor }}>
                            <MousePointer2 size={18} /> Website Clicks
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Simulate button click delay.</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => runSimulation('latency')}
                        style={{
                            width: '100%',
                            marginTop: 'auto',
                            background: pingColor,
                            boxShadow: `0 4px 12px ${pingColor}44`
                        }}
                    >
                        Test Snappiness
                    </button>
                </div>

                {/* File Loading - Speed Dependent */}
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: `1px solid ${speedColor}33`,
                    borderTop: `3px solid ${speedColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: speedColor }}>
                            <Download size={18} /> File Loading
                        </h4>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>File size (MB):</label>
                            <input
                                type="number"
                                value={fileSize}
                                onChange={(e) => setFileSize(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', padding: '0.4rem', borderRadius: '0.4rem', fontSize: '0.8rem' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Simulate loading a {fileSize}MB file.</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => runSimulation('download')}
                        style={{
                            width: '100%',
                            marginTop: 'auto',
                            background: speedColor,
                            boxShadow: `0 4px 12px ${speedColor}44`
                        }}
                    >
                        Test Download
                    </button>
                </div>

                {/* Save to Database - General Connection Health */}
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: `1px solid ${generalColor}33`,
                    borderTop: `3px solid ${generalColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: generalColor }}>
                            <FileSearch size={18} /> Save to Database
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Simulate saving heavy data.</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => runSimulation('io')}
                        style={{
                            width: '100%',
                            marginTop: 'auto',
                            background: generalColor,
                            boxShadow: `0 4px 12px ${generalColor}44`
                        }}
                    >
                        Test Save Speed
                    </button>
                </div>
            </div>

            {(isSimulating || simResult) && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    {isSimulating ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Testing...</span>
                                <span>{Math.round(simProgress)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${simProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.1s linear' }} />
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center', minWidth: '120px' }}>
                                <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>Result</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{simResult?.time}</div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.7rem', fontWeight: 700,
                                        background: simResult?.rating === 'Super Fast' || simResult?.rating?.includes('Fast') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                        color: simResult?.rating === 'Super Fast' || simResult?.rating?.includes('Fast') ? '#22c55e' : '#eab308'
                                    }}>
                                        {simResult?.rating}
                                    </span>
                                    <span style={{ fontWeight: 600 }}>{simResult?.desc.split('.')[0]}.</span>
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{simResult?.desc.split('.').slice(1).join('.')}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
