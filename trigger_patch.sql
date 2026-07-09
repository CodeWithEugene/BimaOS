-- Idempotent patch: align public.users with the KYC fields used by the app
-- and make the signup trigger reliably copy the selected role.

-- 1. Add KYC columns only if they don't already exist.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS national_id_number VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kra_pin VARCHAR(50);

-- 2. Recreate the new-user handler with a full field mapping.
--    ON CONFLICT keeps re-runs safe if a profile row already exists.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone_number, full_name, role, national_id_number, kra_pin)
  VALUES (
    new.id,
    COALESCE(new.phone, new.email, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'consumer'),
    COALESCE(new.raw_user_meta_data->>'national_id_number', ''),
    COALESCE(new.raw_user_meta_data->>'kra_pin', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    national_id_number = EXCLUDED.national_id_number,
    kra_pin = EXCLUDED.kra_pin;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. (Re)attach the trigger so every new auth user gets a profile.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
