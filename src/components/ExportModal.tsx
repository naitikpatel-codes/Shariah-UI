import { useState } from 'react';
import { X, Lock, Eye, EyeOff, Download } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onExport: (password: string) => Promise<void>;
    loading: boolean;
}

function getStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: 'Weak', color: '#DC2626' };
    if (score <= 3) return { score, label: 'Fair', color: '#D97706' };
    if (score === 4) return { score, label: 'Good', color: '#1A7A4A' };
    return { score, label: 'Strong', color: '#16A34A' };
}

export function ExportModal({ isOpen, onClose, onExport, loading }: Props) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [error, setError] = useState('');

    const strength = getStrength(password);
    const mismatch = confirm.length > 0 && password !== confirm;

    async function handleSubmit() {
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        await onExport(password);
        // Clear sensitive data
        setPassword('');
        setConfirm('');
    }

    if (!isOpen) return null;

    return (
        // Overlay
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Modal */}
            <div className="bg-white rounded-[14px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Lock size={18} className="text-brand" />
                        <h2 className="font-semibold text-gray-900 text-[15px]">Encrypt &amp; Download Report</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-gray-600">
                        This report will be encrypted with AES-256-GCM. Only viewable in-app with the correct password.
                    </p>

                    {/* Password field */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPwd ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-10 px-3 pr-10 border border-gray-200 rounded-[10px]
                           text-sm focus:outline-none focus:border-brand
                           focus:ring-2 focus:ring-brand/10"
                                placeholder="Enter a strong password"
                            />
                            <button
                                onClick={() => setShowPwd((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>

                        {/* Strength bar */}
                        {password.length > 0 && (
                            <div className="mt-2">
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${(strength.score / 5) * 100}%`,
                                            backgroundColor: strength.color,
                                        }}
                                    />
                                </div>
                                <p className="text-xs mt-1" style={{ color: strength.color }}>
                                    Strength: {strength.label}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConf ? 'text' : 'password'}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className={`w-full h-10 px-3 pr-10 border rounded-[10px] text-sm
                            focus:outline-none focus:ring-2
                            ${mismatch
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                                        : 'border-gray-200 focus:border-brand focus:ring-brand/10'
                                    }`}
                                placeholder="Re-enter password"
                            />
                            <button
                                onClick={() => setShowConf((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {mismatch && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
                    </div>

                    {/* Warning note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-3 text-xs text-amber-800">
                        ⚠ Store this password safely. You cannot decrypt the report without it.
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="h-9 px-5 text-sm text-gray-600 border border-gray-200 rounded-[10px]
                       hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !password || mismatch}
                        className="h-9 px-5 text-sm font-semibold text-white rounded-[10px]
                       bg-brand hover:bg-brand-dark disabled:opacity-50
                       flex items-center gap-2 transition-colors"
                    >
                        <Download size={14} />
                        {loading ? 'Encrypting…' : 'Encrypt & Download'}
                    </button>
                </div>
            </div>
        </div>
    );
}
