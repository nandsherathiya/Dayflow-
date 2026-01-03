-- Create enums for the HRMS system
CREATE TYPE public.user_role AS ENUM ('employee', 'hr', 'admin');
CREATE TYPE public.leave_type AS ENUM ('paid', 'sick', 'unpaid', 'casual');
CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'half_day', 'leave');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  employee_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  department TEXT,
  designation TEXT,
  date_of_joining DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  UNIQUE (user_id, role)
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  status attendance_status NOT NULL DEFAULT 'absent',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, date)
);

-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status leave_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  review_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create payroll table
CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  basic_salary DECIMAL(12, 2) NOT NULL DEFAULT 0,
  allowances DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  net_salary DECIMAL(12, 2) GENERATED ALWAYS AS (basic_salary + COALESCE(allowances, 0) - COALESCE(deductions, 0)) STORED,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, month, year)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is HR or Admin
CREATE OR REPLACE FUNCTION public.is_hr_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('hr', 'admin')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "HR/Admin can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_hr_or_admin(auth.uid()));

CREATE POLICY "Users can update limited fields on their profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "HR/Admin can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_hr_or_admin(auth.uid()));

CREATE POLICY "HR/Admin can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_hr_or_admin(auth.uid()) OR auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "HR/Admin can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_hr_or_admin(auth.uid()));

CREATE POLICY "Only admin can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for attendance
CREATE POLICY "Users can view their own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "HR/Admin can view all attendance" ON public.attendance
  FOR SELECT USING (public.is_hr_or_admin(auth.uid()));

CREATE POLICY "Users can insert their own attendance" ON public.attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance" ON public.attendance
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "HR/Admin can manage all attendance" ON public.attendance
  FOR ALL USING (public.is_hr_or_admin(auth.uid()));

-- RLS Policies for leave_requests
CREATE POLICY "Users can view their own leave requests" ON public.leave_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "HR/Admin can view all leave requests" ON public.leave_requests
  FOR SELECT USING (public.is_hr_or_admin(auth.uid()));

CREATE POLICY "Users can create their own leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending leave requests" ON public.leave_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "HR/Admin can update any leave request" ON public.leave_requests
  FOR UPDATE USING (public.is_hr_or_admin(auth.uid()));

-- RLS Policies for payroll
CREATE POLICY "Users can view their own payroll" ON public.payroll
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "HR/Admin can view all payroll" ON public.payroll
  FOR SELECT USING (public.is_hr_or_admin(auth.uid()));

CREATE POLICY "HR/Admin can manage payroll" ON public.payroll
  FOR ALL USING (public.is_hr_or_admin(auth.uid()));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _role user_role;
BEGIN
  -- Get role from metadata, default to 'employee'
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee');
  
  -- Insert profile
  INSERT INTO public.profiles (user_id, employee_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'employee_id', 'EMP-' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();