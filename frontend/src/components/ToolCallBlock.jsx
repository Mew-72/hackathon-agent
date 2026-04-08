import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Mail,
  CheckSquare,
  FileText,
  HardDrive,
  Search,
  Terminal,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import './ToolCallBlock.css';

const TOOL_ICONS = {
  calendar: Calendar,
  mail: Mail,
  'check-square': CheckSquare,
  'file-text': FileText,
  'hard-drive': HardDrive,
  search: Search,
  terminal: Terminal,
};

function getIconForTool(toolName) {
  const name = (toolName || '').toLowerCase();
  if (name.includes('calendar')) return 'calendar';
  if (name.includes('gmail') || name.includes('mail') || name.includes('email')) return 'mail';
  if (name.includes('task')) return 'check-square';
  if (name.includes('doc')) return 'file-text';
  if (name.includes('drive')) return 'hard-drive';
  if (name.includes('search') || name.includes('google_search')) return 'search';
  return 'terminal';
}

export default function ToolCallBlock({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const { name, args, status, result } = toolCall;

  const iconKey = getIconForTool(name);
  const Icon = TOOL_ICONS[iconKey] || Terminal;

  const statusConfig = {
    running: { icon: Loader2, label: 'Running', className: 'status-running' },
    complete: { icon: CheckCircle2, label: 'Done', className: 'status-complete' },
    error: { icon: XCircle, label: 'Error', className: 'status-error' },
  };

  const st = statusConfig[status] || statusConfig.running;
  const StatusIcon = st.icon;

  return (
    <div className={`tool-call-block ${st.className} animate-fade-in`}>
      <button
        className="tool-call-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="tool-call-left">
          <div className="tool-call-icon">
            <Icon size={14} />
          </div>
          <span className="tool-call-name">{name}</span>
        </div>
        <div className="tool-call-right">
          <div className={`tool-call-status ${st.className}`}>
            <StatusIcon size={12} className={status === 'running' ? 'spin-icon' : ''} />
            <span>{st.label}</span>
          </div>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="tool-call-details">
          {args && Object.keys(args).length > 0 && (
            <div className="tool-call-section">
              <div className="tool-call-section-label">Arguments</div>
              <pre className="tool-call-json">
                {JSON.stringify(args, null, 2)}
              </pre>
            </div>
          )}
          {result && (
            <div className="tool-call-section">
              <div className="tool-call-section-label">Result</div>
              <pre className="tool-call-json">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
