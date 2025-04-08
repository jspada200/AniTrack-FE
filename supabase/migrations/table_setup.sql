-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables and functions if they exist
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_profile_update() CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    user_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create posts table
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    added_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create function to handle new user creation with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_meta JSONB;
BEGIN
    -- Build user metadata with fallbacks
    user_meta := jsonb_build_object(
        'name', COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            SPLIT_PART(NEW.email, '@', 1)
        ),
        'full_name', COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            SPLIT_PART(NEW.email, '@', 1)
        ),
        'avatar_url', COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            'https://api.dicebear.com/7.x/initials/svg?seed=' || SPLIT_PART(NEW.email, '@', 1)
        ),
        'provider_id', COALESCE(
            NEW.raw_app_meta_data->>'provider_id',
            'email'
        ),
        'email_verified', COALESCE(
            (NEW.raw_app_meta_data->>'email_verified')::boolean,
            false
        )
    );

    -- Insert into profiles
    INSERT INTO public.profiles (id, email, user_metadata)
    VALUES (NEW.id, NEW.email, user_meta);

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RAISE LOG 'User data: id=%, email=%, raw_user_meta_data=%, raw_app_meta_data=%',
            NEW.id, NEW.email, NEW.raw_user_meta_data, NEW.raw_app_meta_data;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle profile updates with error handling
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
DECLARE
    user_meta JSONB;
BEGIN
    -- Build user metadata with fallbacks
    user_meta := jsonb_build_object(
        'name', COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            OLD.user_metadata->>'name',
            SPLIT_PART(NEW.email, '@', 1)
        ),
        'full_name', COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            OLD.user_metadata->>'full_name',
            SPLIT_PART(NEW.email, '@', 1)
        ),
        'avatar_url', COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            OLD.user_metadata->>'avatar_url',
            'https://api.dicebear.com/7.x/initials/svg?seed=' || SPLIT_PART(NEW.email, '@', 1)
        ),
        'provider_id', COALESCE(
            NEW.raw_app_meta_data->>'provider_id',
            OLD.user_metadata->>'provider_id',
            'email'
        ),
        'email_verified', COALESCE(
            (NEW.raw_app_meta_data->>'email_verified')::boolean,
            (OLD.user_metadata->>'email_verified')::boolean,
            false
        )
    );

    -- Update profiles
    UPDATE public.profiles
    SET 
        user_metadata = user_meta,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.id;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        RAISE LOG 'Error in handle_profile_update: %', SQLERRM;
        RAISE LOG 'User data: id=%, email=%, raw_user_meta_data=%, raw_app_meta_data=%',
            NEW.id, NEW.email, NEW.raw_user_meta_data, NEW.raw_app_meta_data;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_profile_update();

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO postgres;

GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.posts TO anon;
GRANT ALL ON public.posts TO service_role;
GRANT ALL ON public.posts TO postgres;

-- Ensure all existing auth.users have profiles
INSERT INTO public.profiles (id, email, user_metadata)
SELECT 
    id,
    email,
    jsonb_build_object(
        'name', COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)),
        'full_name', COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', SPLIT_PART(email, '@', 1)),
        'avatar_url', COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', 'https://api.dicebear.com/7.x/initials/svg?seed=' || SPLIT_PART(email, '@', 1)),
        'provider_id', COALESCE(raw_app_meta_data->>'provider_id', 'email'),
        'email_verified', COALESCE((raw_app_meta_data->>'email_verified')::boolean, false)
    )
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Create the projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create the comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  added_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (true);

-- Create policies for comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (added_by = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (added_by = auth.uid()); 