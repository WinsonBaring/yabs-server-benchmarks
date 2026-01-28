import { useState } from 'react';
import type { Benchmark } from '../types';
import { parseYabsText } from '../utils/parser';

interface UploadWizardProps {
    onUpload: (benchmark: Benchmark) => void;
    onCancel: () => void;
    sampleYabs: string;
}

export const UploadWizard = ({ onUpload, onCancel, sampleYabs }: UploadWizardProps) => {
    const [step, setStep] = useState<'paste' | 'review'>('paste');
    const [textInput, setTextInput] = useState('');
    const [overrides, setOverrides] = useState<Partial<Benchmark>>({});

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
            setStep('review');
        } catch (error) {
            alert('Failed to parse data. Please check the input.');
        }
    };

    const handleFinalize = () => {
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
        onUpload(newBenchmark);
    };

    return (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h3>{step === 'paste' ? 'Step 1: Paste YABS Output' : 'Step 2: Review & Override'}</h3>

            {step === 'paste' ? (
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
                        <button className="btn-primary" style={{ background: 'var(--bg-glass)' }} onClick={() => setTextInput(sampleYabs)}>Insert Example</button>
                        <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-glass)' }} onClick={onCancel}>Cancel</button>
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
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-primary" onClick={handleFinalize}>Finalize & Save</button>
                        <button className="btn-primary" style={{ background: 'var(--bg-glass)' }} onClick={() => setStep('paste')}>Reset Parser</button>
                    </div>
                </>
            )}
        </div>
    );
};
