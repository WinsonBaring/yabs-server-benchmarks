import React from 'react';
import { X, Book } from 'lucide-react';

interface DocsOverlayProps {
    onClose: () => void;
    markdown: string;
}

/**
 * A minimalistic markdown-to-JSX renderer that replicates a VitePress look.
 * Handles headers, bold text, code blocks, and bullet points.
 */
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');

    const slugify = (text: string) => {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove non-word chars (like emojis)
            .trim()
            .replace(/\s+/g, '-'); // Replace spaces with hyphens
    };

    return (
        <div className="markdown-body">
            {lines.map((line, index) => {
                // Headers
                if (line.startsWith('# ')) {
                    const text = line.replace('# ', '');
                    return <h1 key={index} id={slugify(text)}>{text}</h1>;
                }
                if (line.startsWith('## ')) {
                    const text = line.replace('## ', '');
                    return <h2 key={index} id={slugify(text)}>{text}</h2>;
                }
                if (line.startsWith('### ')) {
                    const text = line.replace('### ', '');
                    return <h3 key={index} id={slugify(text)}>{text}</h3>;
                }

                // Horizontal Rule
                if (line.trim() === '---') return <hr key={index} style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: '2rem 0' }} />;

                // Code blocks (very basic toggle)
                if (line.startsWith('```')) return null; // Simple skip for now

                // Bullet points
                if (line.startsWith('- ')) {
                    return (
                        <li key={index} style={{ marginLeft: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            {line.replace('- ', '').split('**').map((part, i) => i % 2 === 1 ? <b key={i} style={{ color: 'var(--text-main)' }}>{part}</b> : part)}
                        </li>
                    );
                }

                // Bold text replacement
                const parts = line.split('**');
                if (parts.length > 1) {
                    return (
                        <p key={index}>
                            {parts.map((part, i) => (
                                i % 2 === 1 ? <b key={i} style={{ color: 'var(--text-main)' }}>{part}</b> : part
                            ))}
                        </p>
                    );
                }

                // Empty lines
                if (line.trim() === '') return <br key={index} />;

                // Default paragraph
                return <p key={index}>{line}</p>;
            })}
        </div>
    );
};

export const DocsOverlay: React.FC<DocsOverlayProps> = ({ onClose, markdown }) => {
    return (
        <div className="docs-overlay">
            <button className="docs-close" onClick={onClose} title="Close Documentation">
                <X size={24} />
            </button>

            <div className="docs-container animate-fade-in">
                <div style={{ display: 'flex', gap: '3rem' }}>
                    {/* Main Content */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
                            width: '60px',
                            height: '60px',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem',
                            boxShadow: '0 10px 30px var(--primary-glow)'
                        }}>
                            <Book size={30} color="white" />
                        </div>

                        <MarkdownRenderer content={markdown} />

                        <footer style={{ marginTop: '5rem', padding: '2rem 0', borderTop: '1px solid var(--border-glass)', textAlign: 'center' }}>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Server Vault Documentation — Version 1.0.0
                            </p>
                        </footer>
                    </div>

                    {/* Minimalist Sidebar (On-this-page style) */}
                    <aside style={{ width: '250px', position: 'sticky', top: '0', height: 'fit-content', paddingLeft: '2rem', borderLeft: '1px solid var(--border-glass)' }} className="hide-mobile">
                        <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                            Quick Navigation
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button onClick={() => document.getElementById('why-i-built-this')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link-manual">🛡️ Why I Built This</button>
                            <button onClick={() => document.getElementById('the-workflow-how-to-use-this')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link-manual">🚀 The Workflow</button>
                            <button onClick={() => document.getElementById('making-sense-of-weird-metrics')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link-manual">🧠 The Metrics</button>
                            <button onClick={() => document.getElementById('the-simulation-lab-why-a-heatmap')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link-manual">🌍 Simulation Lab</button>
                            <button onClick={() => document.getElementById('a-note-on-your-data')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link-manual">🔒 Data Privacy</button>
                        </div>
                    </aside>
                </div>
            </div>

            <style>{`
        .nav-link-manual {
          background: none;
          border: none;
          color: var(--text-muted);
          text-align: left;
          font-size: 0.9rem;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
        }
        .nav-link-manual:hover {
          color: var(--primary);
        }
        @media (max-width: 1024px) {
          .hide-mobile { display: none; }
        }
      `}</style>
        </div>
    );
};
