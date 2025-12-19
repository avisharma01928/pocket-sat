-- Rename math_progress to subject_progress and add subject field
ALTER TABLE public.math_progress RENAME TO subject_progress;

-- Add subject column with default 'math'
ALTER TABLE public.subject_progress 
ADD COLUMN subject text NOT NULL DEFAULT 'math';

-- Drop existing unique constraint if any and add new composite unique constraint
ALTER TABLE public.subject_progress 
ADD CONSTRAINT subject_progress_user_subject_unique UNIQUE (user_id, subject);

-- Update RLS policies to use new table name
DROP POLICY IF EXISTS "Users can view own progress" ON public.subject_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.subject_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.subject_progress;

CREATE POLICY "Users can view own progress" 
ON public.subject_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" 
ON public.subject_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
ON public.subject_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Update the handle_new_user function to create both math and english progress
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Create math progress
  INSERT INTO public.subject_progress (user_id, subject)
  VALUES (NEW.id, 'math');
  
  -- Create english progress
  INSERT INTO public.subject_progress (user_id, subject)
  VALUES (NEW.id, 'english');
  
  RETURN NEW;
END;
$$;