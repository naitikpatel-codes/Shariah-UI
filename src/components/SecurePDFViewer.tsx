import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ZoomIn, ZoomOut, X, RotateCcw } from 'lucide-react';
import { WatermarkOverlay } from './WatermarkOverlay';

// Configure PDF.js worker - use local worker file to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Props {
    blobUrl: string;
    userEmail: string;
    onClose: () => void;
}

const ZOOM_STEP = 0.15;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;

export function SecurePDFViewer({ blobUrl, userEmail, onClose }: Props) {
    const [numPages, setNumPages] = useState<number>(0);
    const [zoom, setZoom] = useState<number>(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const zoomIn = () => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP));
    const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP));
    const zoomReset = () => setZoom(1);

    // ── Block keyboard shortcuts ──────────────────────────────────
    useEffect(() => {
        function block(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
        window.addEventListener('keydown', block, { capture: true });
        return () => window.removeEventListener('keydown', block, { capture: true });
    }, []);

    // ── Override window.print() ───────────────────────────────────
    useEffect(() => {
        const original = window.print;
        window.print = () => console.warn('[Fortiv] Print disabled.');
        return () => { window.print = original; };
    }, []);

    // ── Context menu & drag blocking ──────────────────────────────
    const blockCtx = useCallback((e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
    const blockDrag = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);

    // ── Tab visibility blur ───────────────────────────────────────
    useEffect(() => {
        const handler = () => {
            if (document.visibilityState === 'hidden') containerRef.current?.classList.add('viewer-hidden');
            else containerRef.current?.classList.remove('viewer-hidden');
        };
        document.addEventListener('visibilitychange', handler);
        return () => document.removeEventListener('visibilitychange', handler);
    }, []);

    const pageWidth = Math.round(700 * zoom);
    const zoomPct = Math.round(zoom * 100);

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0a0f1a] flex flex-col" style={{ top: 0, left: 0, width: '100vw', height: '100vh' }}>

            {/* ── Top navbar ── */}
            <div className="flex items-center justify-between px-5 py-2.5"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>

                {/* Left: branding with logo */}
                <div className="flex items-center gap-2.5">
                    <img src="/fortiv-logo.jpg" alt="Fortiv" className="h-8 w-auto rounded" />
                    <div>
                        <p className="text-white text-sm font-semibold leading-tight">Fortiv Solutions</p>
                        <p className="text-slate-400 text-[10px]">Encrypted Report Viewer</p>
                    </div>
                </div>

                {/* Center: zoom controls */}
                <div className="flex items-center gap-1 bg-white/10 rounded-lg px-1.5 py-1">
                    <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM}
                        className="p-1.5 rounded hover:bg-white/10 text-white disabled:opacity-30 transition">
                        <ZoomOut size={15} />
                    </button>
                    <button onClick={zoomReset}
                        className="px-2.5 py-1 text-xs font-medium text-white hover:bg-white/10 rounded transition min-w-[48px]">
                        {zoomPct}%
                    </button>
                    <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM}
                        className="p-1.5 rounded hover:bg-white/10 text-white disabled:opacity-30 transition">
                        <ZoomIn size={15} />
                    </button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <button onClick={zoomReset}
                        className="p-1.5 rounded hover:bg-white/10 text-white transition" title="Reset zoom">
                        <RotateCcw size={13} />
                    </button>
                </div>

                {/* Right: status + close */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                        🔒 Read-only · No download · No print
                    </span>
                    <button onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* ── Scrollable PDF area — all pages vertical ── */}
            <div
                ref={containerRef}
                className="secure-viewer-container flex-1 overflow-auto"
                onContextMenu={blockCtx}
                onDragStart={blockDrag}
                onDrag={blockDrag}
            >
                {/* Watermark */}
                <WatermarkOverlay email={userEmail} />

                <div className="flex flex-col items-center gap-6 py-6 relative">
                    <Document
                        file={blobUrl}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    >
                        {/* Render ALL pages vertically */}
                        {Array.from({ length: numPages }, (_, i) => (
                            <div key={i} className="shadow-lg overflow-hidden">
                                <Page
                                    pageNumber={i + 1}
                                    width={pageWidth}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </div>
                        ))}
                    </Document>
                </div>

                {/* Shield overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none" />
            </div>

            {/* ── Bottom bar — page count ── */}
            <div className="flex items-center justify-center py-2"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                <span className="text-xs text-slate-400">
                    {numPages} {numPages === 1 ? 'page' : 'pages'} · Scroll to navigate
                </span>
            </div>
        </div>,
        document.body
    );
}
