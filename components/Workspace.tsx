
import React, { useState, useCallback } from 'react';
import { FileText, Loader2, Download, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import Dropzone from './Dropzone';
import FileList from './FileList';
import { ProcessedFile, AppStatus, ProcessingError } from '../types';
import { generateMergedPdf } from '../services/processor';

const Workspace: React.FC = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [processingErrors, setProcessingErrors] = useState<ProcessingError[]>([]);
  
  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const processedFiles: ProcessedFile[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      originalName: file.name,
      file: file,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...processedFiles]);
    setStatus(AppStatus.IDLE);
    setError(null);
    setProcessingErrors([]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleProcess = async () => {
    if (files.length === 0) return;

    setStatus(AppStatus.PROCESSING);
    setError(null);
    setProcessingErrors([]);

    try {
      const rawFiles = files.map(f => f.file);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await generateMergedPdf(rawFiles);
      
      if (result.failures.length > 0) {
        setProcessingErrors(result.failures);
      }

      if (result.successCount > 0) {
        setStatus(AppStatus.COMPLETED);
      } else {
        setStatus(AppStatus.ERROR);
        setError("Todos los archivos fallaron. Por favor revise los errores detallados.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error crítico al procesar los archivos.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus(AppStatus.IDLE);
    setError(null);
    setProcessingErrors([]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Dropzone Area */}
        {status !== AppStatus.COMPLETED && (
          <Dropzone 
            onFilesAdded={handleFilesAdded} 
            disabled={status === AppStatus.PROCESSING}
          />
        )}

        {/* Processing State */}
        {status === AppStatus.PROCESSING && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-lg font-medium text-slate-700">
              Generando PDF combinado...
            </p>
          </div>
        )}

        {/* Error Message Section */}
        {(error || processingErrors.length > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            {error && (
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            {processingErrors.length > 0 && (
              <div className="space-y-2 pl-8">
                <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">
                  Archivos con errores ({processingErrors.length}):
                </p>
                <ul className="list-disc list-outside text-sm text-red-700 space-y-1 ml-4">
                  {processingErrors.map((err, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{err.fileName}:</span> {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* File List */}
        {status !== AppStatus.PROCESSING && (
          <FileList 
            files={files} 
            onRemove={handleRemoveFile} 
            status={status} 
          />
        )}

        {/* Success / Actions Area */}
        {status === AppStatus.COMPLETED && (
          <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-800">Proceso Finalizado</h3>
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Download className="w-4 h-4" />
                <span>PDF descargado en tu dispositivo</span>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleReset}
                className="text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"
              >
                Procesar nuevos archivos
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons (Idle State) */}
        {status === AppStatus.IDLE && (
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
            {files.length > 0 && (
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Limpiar todo
              </button>
            )}
            <button
              onClick={handleProcess}
              disabled={files.length === 0}
              className={`
                w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-blue-100 flex items-center justify-center space-x-2 transition-all
                ${files.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 hover:-translate-y-0.5'
                }
              `}
            >
              <FileText className="w-4 h-4" />
              <span>Generar PDF</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;
