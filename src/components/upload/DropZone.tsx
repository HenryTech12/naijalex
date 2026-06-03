import { useCallback } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface DropZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string) => {
  if (type === 'application/pdf') return '📄';
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('word')) return '📝';
  return '📎';
};

export const DropZone: React.FC<DropZoneProps> = ({ file, onFileSelect, onFileClear }) => {
  const onDrop = useCallback(<T extends File>(
    accepted: T[],
    rejected: FileRejection[],
    _event?: DropEvent
  ) => {
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      if (err.code === 'file-too-large') {
        toast.error('File is too large. Maximum size is 10MB.');
      } else if (err.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload a PDF, image, or Word document.');
      } else {
        toast.error('Could not upload file. Please try again.');
      }
      return;
    }
    if (accepted.length > 0) {
      onFileSelect(accepted[0] as File);
    }
  },
  [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  if (file) {
    return (
      <div className="border-2 border-primary/30 bg-primary-50 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
            {getFileIcon(file.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-brand-textPrimary truncate">{file.name}</p>
            <p className="text-sm text-brand-textSecondary mt-0.5">{formatBytes(file.size)}</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <button
              onClick={onFileClear}
              className="w-8 h-8 rounded-full bg-white hover:bg-red-50 border border-brand-border hover:border-red-200 flex items-center justify-center transition-colors group"
              aria-label="Remove file"
            >
              <X className="w-4 h-4 text-brand-textSecondary group-hover:text-danger" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
        isDragActive
          ? 'border-primary bg-primary-50 scale-[1.01]'
          : 'border-brand-border bg-white hover:border-primary/50 hover:bg-primary-50/30'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div
          className={clsx(
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
            isDragActive ? 'bg-primary text-white' : 'bg-primary-50 text-primary'
          )}
        >
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <p className="text-lg font-semibold text-brand-textPrimary">
            {isDragActive ? 'Drop your contract here' : 'Drop your contract here or click to browse'}
          </p>
          <p className="text-sm text-brand-textSecondary mt-1">
            PDF, JPG, PNG, WEBP, or DOCX &mdash; Max 10MB
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {['PDF', 'Image', 'Word Doc', 'Scanned'].map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 px-3 py-1 bg-brand-bg border border-brand-border rounded-full text-xs font-medium text-brand-textSecondary"
            >
              <FileText className="w-3 h-3" />
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
