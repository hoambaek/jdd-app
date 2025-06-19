-- Create dates table
CREATE TABLE IF NOT EXISTS dates (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on date column for faster queries
CREATE INDEX IF NOT EXISTS idx_dates_date ON dates(date);

-- Create unique constraint on date to prevent duplicates
ALTER TABLE dates ADD CONSTRAINT unique_date UNIQUE (date);

-- Enable Row Level Security (RLS)
ALTER TABLE dates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all authenticated users
CREATE POLICY "Allow read access for all authenticated users" 
    ON dates FOR SELECT 
    TO authenticated 
    USING (true);

-- Create policy to allow insert/update access only to service role
CREATE POLICY "Allow insert/update access only to service role" 
    ON dates FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true); 