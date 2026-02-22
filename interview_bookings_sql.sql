-- Interview Bookings Table
-- Run this SQL in Supabase SQL Editor

-- Create interview_bookings table
CREATE TABLE IF NOT EXISTS interview_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    visa_type TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE interview_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for interview_bookings

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" 
    ON interview_bookings 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings" 
    ON interview_bookings 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending bookings
CREATE POLICY "Users can update own pending bookings" 
    ON interview_bookings 
    FOR UPDATE 
    USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own pending bookings
CREATE POLICY "Users can delete own pending bookings" 
    ON interview_bookings 
    FOR DELETE 
    USING (auth.uid() = user_id AND status = 'pending');

-- Allow authenticated users to view all bookings (for admin dashboard)
CREATE POLICY "Authenticated users can view all bookings" 
    ON interview_bookings 
    FOR SELECT 
    TO authenticated
    USING (true);

-- Allow authenticated users to update any booking (for admin status updates)
CREATE POLICY "Authenticated users can update any booking" 
    ON interview_bookings 
    FOR UPDATE 
    TO authenticated
    USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_interview_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_interview_bookings_timestamp ON interview_bookings;

CREATE TRIGGER update_interview_bookings_timestamp
    BEFORE UPDATE ON interview_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_interview_bookings_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_interview_bookings_user_id ON interview_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_bookings_status ON interview_bookings(status);
CREATE INDEX IF NOT EXISTS idx_interview_bookings_preferred_date ON interview_bookings(preferred_date);

-- Grant permissions
GRANT ALL ON interview_bookings TO authenticated;

COMMENT ON TABLE interview_bookings IS 'Stores visa interview booking requests from applicants';
