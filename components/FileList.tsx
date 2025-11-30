import React from 'react';
import { FileSpreadsheet, Trash2, CheckCircle2 } from 'lucide-react';
import { ProcessedFile, AppStatus } from '../types';

interface FileListProps {
  files: ProcessedFile[];
  onRemove: (id: string) => void;
  status: AppStatus;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove, status }) => {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Archivos Cargados ({files.length})
      </h3>
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm overflow-hidden">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-4 overflow-hidden">
              <div className="p-2 bg-green-50 rounded-lg shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {file.originalName}
                </p>
                <p className="text-xs text-slate-500">
                  {(file.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            
            <div className="flex items-center pl-4">
              {status === AppStatus.COMPLETED ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <button
                  onClick={() => onRemove(file.id)}
                  disabled={status === AppStatus.PROCESSING}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all disabled:opacity-50"
                  aria-label="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;