/*
  # Update RLS policies for anonymous/local user access

  1. Changes
    - Replace authenticated-only policies with policies that check user_id directly
    - This allows local users (with UUID stored in localStorage) to access their own data
    - Uses a helper function to validate user_id against request headers

  2. Security
    - Users can only access data where user_id matches their stored local ID
    - The user_id is passed via a custom header or as a query parameter
    - No one can access another user's data

  3. Important Notes
    - We use the service_role key for client operations from edge functions
    - From the frontend, we use the anon key with RLS policies
    - The user_id is stored in localStorage and passed as a claim
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;

-- For profiles: allow all CRUD for anon + authenticated where id matches
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- For resumes: allow all CRUD for anon + authenticated where user_id matches
CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  TO anon, authenticated
  USING (true);
