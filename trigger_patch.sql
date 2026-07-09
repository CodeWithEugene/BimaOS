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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
