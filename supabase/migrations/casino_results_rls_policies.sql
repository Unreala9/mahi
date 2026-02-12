-- Add RLS policies for casino_results table to allow authenticated users to read and write

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated insert casino_results" ON public.casino_results;
DROP POLICY IF EXISTS "Allow authenticated select casino_results" ON public.casino_results;

-- Allow authenticated users to insert casino results (for caching)
CREATE POLICY "Allow authenticated insert casino_results" 
ON public.casino_results 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to select casino results (for reading cache)
CREATE POLICY "Allow authenticated select casino_results"
ON public.casino_results 
FOR SELECT 
TO authenticated
USING (true);

-- Comment
COMMENT ON POLICY "Allow authenticated insert casino_results" ON public.casino_results IS 'Allows authenticated users to cache casino results';
COMMENT ON POLICY "Allow authenticated select casino_results" ON public.casino_results IS 'Allows authenticated users to read cached casino results';
