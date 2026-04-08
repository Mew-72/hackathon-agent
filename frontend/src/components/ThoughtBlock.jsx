import { useState } from 'react';
import { Brain, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import './ThoughtBlock.css';

export default function ThoughtBlock({ thoughts }) {
  const [expanded, setExpanded] = useState(false);

  if (!thoughts || thoughts.length === 0) return null;

  return (
    <div className="thought-block animate-fade-in">
      <button
        className="thought-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="thought-toggle-left">
          <div className="thought-icon">
            <Sparkles size={14} />
          </div>
          <span className="thought-label">
            Thinking{thoughts.length > 1 ? ` (${thoughts.length} steps)` : ''}
          </span>
        </div>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {expanded && (
        <div className="thought-content">
          {thoughts.map((thought, i) => (
            <div key={i} className="thought-step">
              <div className="thought-step-marker">{i + 1}</div>
              <p className="thought-text">{thought}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
