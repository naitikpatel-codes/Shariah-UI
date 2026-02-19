import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bbnnhugwfnowkayhsixd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibm5odWd3Zm5vd2theWhzaXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NjA0MjAsImV4cCI6MjA4NjUzNjQyMH0.5inVgip_mkRtEyfjAvysJZELMqDm1aduaU0BPi4ETfw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listDocuments() {
    console.log('Fetching recent documents...');

    // Fetch ALL documents to see if any exist, ignoring RLS for a moment by using service role if we had it (we don't here, but let's see what anon sees)
    // Actually, anon client will respect RLS. If we see nothing, it means RLS is hiding them or they don't exist.

    const { data, error } = await supabase
        .from('input_documents')
        .select('id, document_name, uploaded_by, timestamp');

    if (error) {
        console.error('Error fetching documents:', error.message);
        return;
    }

    console.log(`Found ${data.length} documents visible to anon client:`);
    console.table(data);
}

listDocuments();
