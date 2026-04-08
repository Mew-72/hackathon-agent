import { X, FileIcon, Image } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';
import './FilePreview.css';

export default function FilePreview({ files, onRemove }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="file-preview-list">
      {files.map((file, i) => {
        const isImage = file.type?.startsWith('image/');
        return (
          <div key={i} className="file-preview-chip animate-fade-in">
            {isImage && file.preview ? (
              <img src={file.preview} alt={file.name} className="file-thumb" />
            ) : (
              <div className="file-icon-box">
                {isImage ? <Image size={14} /> : <FileIcon size={14} />}
              </div>
            )}
            <div className="file-info">
              <span className="file-name truncate">{file.name}</span>
              <span className="file-size">{formatFileSize(file.size)}</span>
            </div>
            {onRemove && (
              <button className="file-remove" onClick={() => onRemove(i)} title="Remove file">
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
