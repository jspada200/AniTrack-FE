-- Drop existing tables and functions
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_profile_update() CASCADE;

-- Create the profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  user_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable Row Level Security on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Allow authenticated users to view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create the posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  content JSONB NOT NULL,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  FOREIGN KEY (added_by) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Enable Row Level Security on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create posts policies
CREATE POLICY "Allow authenticated users to view all posts"
  ON posts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to insert their own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Allow users to update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = added_by);

CREATE POLICY "Allow users to delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = added_by);

-- Grant permissions to all roles
GRANT ALL ON profiles TO postgres;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO service_role;

GRANT ALL ON posts TO postgres;
GRANT ALL ON posts TO authenticated;
GRANT ALL ON posts TO anon;
GRANT ALL ON posts TO service_role;

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, user_metadata)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    user_metadata = COALESCE(NEW.raw_user_meta_data, OLD.user_metadata),
    updated_at = TIMEZONE('utc'::text, NOW())
  WHERE id = NEW.id;
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

-- Insert sample profiles for existing users
INSERT INTO profiles (id, email, user_metadata)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'animator@example.com', 
    jsonb_build_object(
      'name', 'John Animator',
      'full_name', 'John Animator',
      'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=animator'
    )
  ),
  ('00000000-0000-0000-0000-000000000002', 'modeler@example.com',
    jsonb_build_object(
      'name', 'Sarah Modeler',
      'full_name', 'Sarah Modeler',
      'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=modeler'
    )
  ),
  ('00000000-0000-0000-0000-000000000003', 'texture@example.com',
    jsonb_build_object(
      'name', 'Mike Texture',
      'full_name', 'Mike Texture',
      'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=texture'
    )
  ),
  ('00000000-0000-0000-0000-000000000004', 'reviewer@example.com',
    jsonb_build_object(
      'name', 'Lisa Reviewer',
      'full_name', 'Lisa Reviewer',
      'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=reviewer'
    )
  ),
  ('a06cbc2e-d9c1-482d-bb44-fd0359611174', 'tex1820@gmail.com',
    jsonb_build_object(
      'name', 'James Spadafora',
      'full_name', 'James Spadafora',
      'avatar_url', 'https://lh3.googleusercontent.com/a/ACg8ocIRz8xOR4QbnjFxSTj8_9KnQRepza0H4MtNAnce1PVltQs96msZ=s96-c',
      'provider_id', '107593813496141062446',
      'email_verified', true
    )
  ),
  ('c1ac2a27-e6c2-42f2-97f5-d5d0fd5f677f', 'spadimationvfx@gmail.com',
    jsonb_build_object(
      'name', 'James Spadafora',
      'full_name', 'James Spadafora',
      'avatar_url', 'https://lh3.googleusercontent.com/a/ACg8ocKc7Gaqf3AkhtGuP2-t4eFn6jKKvaTX41-mpqoNEuBZns-TAg=s96-c',
      'provider_id', '116852607762566465343',
      'email_verified', true
    )
  )
ON CONFLICT (id) DO UPDATE SET
  user_metadata = EXCLUDED.user_metadata,
  updated_at = TIMEZONE('utc'::text, NOW());

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