import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, FileText, X, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ContractType } from '@/types';
import { cn } from '@/lib/utils';

const contractTypes: ContractType[] = [
  'Murabaha', 'Ijarah', 'Musharakah', 'Mudarabah',
  'Istisna', 'Tawarruq', 'Sukuk', 'Wakalah',
];

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export default function NewAnalysisPage() {
  const [selectedType, setSelectedType] = useState<ContractType | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && validateFile(f)) setFile(f);
  }, []);

  const validateFile = (f: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    return f.size <= 20 * 1024 * 1024 && (validTypes.includes(f.type) || f.name.endsWith('.txt'));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  const handleSubmit = async () => {
    if (!file || !selectedType) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('contractType', selectedType);
      formData.append('fileName', file.name);
      formData.append('file', file);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Webhook returned status ${response.status}`);
      }

      const result = await response.json();

      // Navigate to the report or processing page with the response
      if (result?.id) {
        navigate(`/report/${result.id}`);
      } else {
        // If no document ID in response, navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">New Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">Analyse a contract for Shariah compliance</p>
        </div>
        <Link to="/reports">
          <Button variant="ghost" className="text-sm text-brand hover:text-brand-dark hover:bg-accent">
            View Reports →
          </Button>
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Contract Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Contract Type</Label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as ContractType)}
          disabled={loading}
          className="w-full h-10 px-3 rounded-md border border-gray-200 bg-surface text-sm text-gray-700 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all disabled:opacity-50"
        >
          <option value="">Select contract type...</option>
          {contractTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Upload Zone */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-200",
            dragOver
              ? "border-brand bg-brand-light scale-[1.01]"
              : "border-gray-300 bg-gray-50 hover:border-brand hover:bg-brand-light",
            loading && "pointer-events-none opacity-50"
          )}
        >
          <Upload className={cn("w-12 h-12 mx-auto mb-4", dragOver ? "text-brand" : "text-gray-400")} strokeWidth={1.5} />
          <p className="text-base font-medium text-gray-700 mb-1">Drop your document here</p>
          <p className="text-sm text-gray-500 mb-4">or click to browse</p>
          <p className="text-xs text-gray-400">Supported formats: PDF, Word, Text — Maximum size: 20MB</p>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-brand bg-brand-light rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-brand" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB · Ready to analyse</p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              disabled={loading}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-surface transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!file || !selectedType || loading}
          className="bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand hover:shadow-lg transition-all hover:-translate-y-0.5 h-11 px-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analysing...
            </>
          ) : (
            <>
              Start Analysis <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Loading overlay message */}
      {loading && (
        <div className="text-center text-sm text-gray-500">
          <p>Your document is being analysed. This may take a few minutes — please don't close this page.</p>
        </div>
      )}
    </div>
  );
}
