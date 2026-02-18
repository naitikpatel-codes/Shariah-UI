import { useState } from 'react';
import { toast } from 'sonner';
import { generateReportPDF } from '@/services/pdfExport.service';
import { encryptPDF } from '@/services/encryption.service';
import { InputDocument, ClauseAnalysis } from '@/types/pdf.types';

export function useReportExport(document: InputDocument, clauses: ClauseAnalysis[]) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    function openModal() {
        setModalOpen(true);
    }
    function closeModal() {
        setModalOpen(false);
    }

    async function handleExport(password: string) {
        setLoading(true);
        try {
            // Step 1: Generate PDF → ArrayBuffer (never downloaded raw)
            const pdfBuffer = await generateReportPDF(
                document,
                clauses,
                'Compliance Analyst', // TODO: Get from auth store when available
                'analyst@fortiv.com' // TODO: Get from auth store when available
            );

            // Step 2: Encrypt → .enc Blob
            const encBlob = await encryptPDF(pdfBuffer, password);

            // Step 3: Trigger .enc download
            const url = URL.createObjectURL(encBlob);
            const link = window.document.createElement('a');
            link.href = url;
            link.download = `${document.document_name.replace('.pdf', '')}_report.enc`;
            link.click();

            // Step 4: Revoke URL and clear memory
            URL.revokeObjectURL(url);

            toast.success('Encrypted report downloaded successfully.');
            setModalOpen(false);
        } catch (err) {
            console.error('Export failed:', err);
            toast.error('Export failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return { isModalOpen, loading, openModal, closeModal, handleExport };
}
