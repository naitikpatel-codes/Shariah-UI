import { useState, useCallback, useEffect } from 'react';
import { Lock, Upload, FileText, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { decryptPDF } from '@/services/encryption.service';
import { SecurePDFViewer } from '@/components/SecurePDFViewer';
import { toast } from 'sonner';

export default function OpenEncryptedPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.enc')) setFile(f);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.name.endsWith('.enc')) setFile(f);
  };

  const handleDecrypt = async () => {
    if (!file || !password) return;

    setDecrypting(true);
    setError('');

    try {
      // Decrypt the file
      const pdfArrayBuffer = await decryptPDF(file, password);

      // Create blob and URL for viewing
      const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setShowModal(false);
      toast.success('Report decrypted successfully!');
    } catch (err) {
      console.error('Decryption failed:', err);
      setError('Decryption failed. Please check your password and try again.');
      toast.error('Decryption failed. Incorrect password or corrupted file.');
    } finally {
      setDecrypting(false);
    }
  };

  const handleReset = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setFile(null);
    setPassword('');
    setError('');
  }, [pdfUrl]);

  // Cleanup blob URL on component unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Open Encrypted Report</h1>
        <p className="text-sm text-gray-500 mt-1">Decrypt and view a .enc report file securely in-app</p>
      </div>

      {!pdfUrl ? (
        <>
          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('enc-file-input')?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-200",
                dragOver
                  ? "border-brand bg-brand-light scale-[1.01]"
                  : "border-gray-300 bg-gray-50 hover:border-brand hover:bg-brand-light"
              )}
            >
              <Lock className={cn("w-12 h-12 mx-auto mb-4", dragOver ? "text-brand" : "text-gray-400")} strokeWidth={1.5} />
              <p className="text-base font-medium text-gray-700 mb-1">Drop your .enc file here</p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <p className="text-xs text-gray-400">Only .enc files are accepted</p>
              <input
                id="enc-file-input"
                type="file"
                accept=".enc"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-brand bg-brand-light rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-8 h-8 text-brand" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB · Encrypted report</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-surface transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={() => setShowModal(true)} className="mt-4 bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand">
                Proceed to Decrypt
              </Button>
            </div>
          )}

          <div className="flex items-start gap-2 text-xs text-gray-500 bg-info-bg rounded-lg p-3">
            <Lock className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
            <p>The file is decrypted entirely in your browser. Nothing is sent to our servers.</p>
          </div>
        </>
      ) : (
        <SecurePDFViewer
          blobUrl={pdfUrl}
          userEmail="user@fortiv.com"
          onClose={handleReset}
        />
      )}

      {/* Password Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-foreground/40 backdrop-blur-[3px]">
          <div className="bg-surface rounded-xl shadow-modal w-[420px] max-w-[calc(100vw-32px)] overflow-hidden animate-fade-up">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand" />
                <h2 className="font-display font-semibold text-gray-900">Decrypt & View</h2>
              </div>
              <button onClick={() => { setShowModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Enter the password to decrypt and view this report.</p>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !decrypting && password && handleDecrypt()}
                    placeholder="Enter report password"
                    className="h-10 pr-10 border-gray-200 focus:border-brand focus:ring-brand/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowModal(false); setError(''); }} className="border-gray-300 text-gray-600">
                Cancel
              </Button>
              <Button
                disabled={!password || decrypting}
                onClick={handleDecrypt}
                className="bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand disabled:opacity-50"
              >
                <Lock className="w-4 h-4 mr-1.5" />
                {decrypting ? 'Decrypting...' : 'Decrypt & View'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
