import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = (Array.from(e.dataTransfer.files) as File[]).filter(
        file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      );
      if (droppedFiles.length > 0) {
        onFilesAdded(droppedFiles);
      }
    }
  }, [onFilesAdded, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = (Array.from(e.target.files) as File[]).filter(
        file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      );
      if (selectedFiles.length > 0) {
        onFilesAdded(selectedFiles);
      }
    }
  }, [onFilesAdded]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center cursor-pointer
        ${isDragging 
          ? 'border-blue-500 bg-blue-50 scale-[1.01]' 
          : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      <input
        type="file"
        multiple
        accept=".xlsx, .xls"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
          <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
        </div>
        <div>
          <p className="text-lg font-medium text-slate-700">
            {isDragging ? 'Suelta los archivos aquí' : 'Arrastra tus archivos Excel aquí'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            o haz clic para seleccionar (soporta múltiples archivos)
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Solo archivos .xlsx o .xls</span>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;