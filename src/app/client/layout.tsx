import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const STAFF_ROLES = ['insurer', 'adjuster', 'admin'];

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role =
    (user.user_metadata?.role as string | undefined) ||
    profile?.role ||
    'consumer';

  // Insurance staff belong on the B2B portal, not the subscriber portal.
  if (STAFF_ROLES.includes(role)) redirect('/dashboard');

  return <>{children}</>;
}
