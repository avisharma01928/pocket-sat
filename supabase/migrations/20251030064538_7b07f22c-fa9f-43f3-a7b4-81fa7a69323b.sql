-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NOT NULL DEFAULT now(),
  settings jsonb DEFAULT '{"soundEnabled": true, "confettiEnabled": true}'::jsonb,
  placement_taken boolean DEFAULT false,
  placement_score int DEFAULT 0,
  placed_level int DEFAULT 1
);

-- Create math_progress table
CREATE TABLE public.math_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp int NOT NULL DEFAULT 0,
  day_streak int NOT NULL DEFAULT 0,
  best_streak int NOT NULL DEFAULT 0,
  daily_progress int NOT NULL DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  UNIQUE(user_id)
);

-- Create questions table
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL DEFAULT 'math',
  topic text NOT NULL,
  difficulty int NOT NULL CHECK (difficulty IN (1, 2, 3)),
  prompt text NOT NULL,
  options jsonb NOT NULL,
  correct_index int NOT NULL,
  explanation text NOT NULL,
  tags text[] DEFAULT '{}',
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create sessions table
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  question_ids uuid[] NOT NULL DEFAULT '{}',
  responses jsonb NOT NULL DEFAULT '[]'::jsonb,
  earned_xp int NOT NULL DEFAULT 0,
  difficulty_mix jsonb DEFAULT '{}'::jsonb,
  accuracy float DEFAULT 0,
  device_meta jsonb DEFAULT '{}'::jsonb
);

-- Create achievements table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  required_value int NOT NULL,
  condition_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_achievements junction table
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create topic_stats table
CREATE TABLE public.topic_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic text NOT NULL,
  answered int NOT NULL DEFAULT 0,
  correct int NOT NULL DEFAULT 0,
  UNIQUE(user_id, topic)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Math progress policies
CREATE POLICY "Users can view own progress"
  ON public.math_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.math_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.math_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Questions policies (public read)
CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

-- Sessions policies
CREATE POLICY "Users can view own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Topic stats policies
CREATE POLICY "Users can view own stats"
  ON public.topic_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON public.topic_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.topic_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  INSERT INTO public.math_progress (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert seed achievements
INSERT INTO public.achievements (title, description, icon, required_value, condition_type) VALUES
  ('First Steps', 'Complete your first practice session', '🎯', 1, 'sessions_completed'),
  ('Week Warrior', 'Maintain a 7-day streak', '🔥', 7, 'day_streak'),
  ('Level 10', 'Reach level 10', '⭐', 10, 'level_reached'),
  ('Century Club', 'Answer 100 questions correctly', '💯', 100, 'correct_answers'),
  ('Perfect Ten', 'Get 10 questions correct in a row', '✨', 10, 'perfect_streak'),
  ('Math Master', 'Reach level 20', '🏆', 20, 'level_reached'),
  ('Unstoppable', 'Maintain a 30-day streak', '⚡', 30, 'day_streak');

-- Insert seed questions (Math - Algebra)
INSERT INTO public.questions (subject, topic, difficulty, prompt, options, correct_index, explanation, tags) VALUES
  ('math', 'Algebra', 1, 'What is 2x + 3 = 11? Solve for x.', '["x = 3", "x = 4", "x = 5", "x = 6"]', 1, 'Subtract 3 from both sides: 2x = 8, then divide by 2: x = 4', ARRAY['linear_equations', 'basic_algebra']),
  ('math', 'Algebra', 2, 'If 3(x - 2) = 15, what is x?', '["x = 5", "x = 7", "x = 9", "x = 11"]', 1, 'Distribute: 3x - 6 = 15, add 6: 3x = 21, divide by 3: x = 7', ARRAY['linear_equations', 'distributive_property']),
  ('math', 'Algebra', 3, 'Solve for x: 2x² - 8x + 6 = 0', '["x = 1 or x = 3", "x = 2 or x = 4", "x = -1 or x = -3", "x = 0 or x = 2"]', 0, 'Factor: 2(x² - 4x + 3) = 2(x - 1)(x - 3) = 0, so x = 1 or x = 3', ARRAY['quadratic_equations', 'factoring']),
  ('math', 'Geometry', 1, 'What is the area of a rectangle with length 5 and width 3?', '["8", "12", "15", "18"]', 2, 'Area = length × width = 5 × 3 = 15', ARRAY['area', 'rectangles']),
  ('math', 'Geometry', 2, 'A circle has a radius of 4. What is its circumference? (Use π ≈ 3.14)', '["12.56", "25.12", "50.24", "100.48"]', 1, 'Circumference = 2πr = 2 × 3.14 × 4 = 25.12', ARRAY['circles', 'circumference']),
  ('math', 'Arithmetic', 1, 'What is 15% of 200?', '["20", "25", "30", "35"]', 2, '15% = 0.15, so 0.15 × 200 = 30', ARRAY['percentages', 'basic_arithmetic']);
