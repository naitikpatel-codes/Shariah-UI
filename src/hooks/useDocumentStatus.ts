import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDocumentStatus(documentId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!documentId) return;

        const channel = supabase
            .channel(`document-status-${documentId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'input_documents',
                    filter: `id=eq.${documentId}`,
                },
                (payload) => {
                    // Instantly update cached document data
                    queryClient.setQueryData(
                        ['document', documentId],
                        payload.new
                    );

                    // If analysis completed, also refresh clause list
                    if ((payload.new as any).analysis_status === 'completed') {
                        queryClient.invalidateQueries({ queryKey: ['clauses', documentId] });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [documentId, queryClient]);
}
