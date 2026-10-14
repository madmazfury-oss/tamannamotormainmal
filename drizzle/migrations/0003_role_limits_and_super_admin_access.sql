CREATE OR REPLACE FUNCTION public.enforce_role_limits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE lim int; cnt int;
BEGIN
  lim := CASE NEW.role WHEN 'super_admin' THEN 2 WHEN 'admin' THEN 1 WHEN 'cashier' THEN 5 ELSE 100 END;
  SELECT count(*) INTO cnt FROM public.user_roles WHERE role = NEW.role AND id <> NEW.id;
  IF cnt >= lim THEN
    RAISE EXCEPTION 'ROLE_LIMIT: % accounts limit (%) reached', NEW.role, lim;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER user_roles_limit BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_role_limits();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'phone');
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  ELSIF (SELECT count(*) FROM public.user_roles WHERE role = 'cashier') < 5 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'cashier');
  END IF;
  RETURN NEW;
END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
CREATE POLICY "super admin reads all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin inserts roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin updates roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin deletes roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin reads all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));