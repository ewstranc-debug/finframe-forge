-- Create storage bucket for financial documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('financial-documents', 'financial-documents', true);

-- Create policy for public uploads
CREATE POLICY "Allow public uploads to financial-documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'financial-documents');

-- Create policy for public reads
CREATE POLICY "Allow public reads from financial-documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'financial-documents');

-- Create policy for public deletes
CREATE POLICY "Allow public deletes from financial-documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'financial-documents');

-- Create policy for public updates
CREATE POLICY "Allow public updates in financial-documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'financial-documents');