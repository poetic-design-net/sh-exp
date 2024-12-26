import { Suspense } from 'react';
import { AdminProtectedContent } from '@/components/auth/admin-protected-content';
import { getMembershipPages } from '@/app/actions/membership-pages';
import { getMemberships } from '@/app/actions/memberships';
import { MembershipPagesList } from './components/membership-pages-list';
import { CreateMembershipPageButton } from './components/create-page-button';

async function MembershipPagesContent() {
  const [pages, memberships] = await Promise.all([
    getMembershipPages(),
    getMemberships(1, 100, true) // Load all memberships
  ]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mitgliedschaft Seiten</h1>
        <CreateMembershipPageButton memberships={memberships.memberships} />
      </div>

      <MembershipPagesList 
        initialPages={pages} 
        memberships={memberships.memberships} 
      />
    </div>
  );
}

export default function MembershipPagesPage() {
  return (
    <AdminProtectedContent>
      <Suspense fallback={<div>Laden...</div>}>
        <MembershipPagesContent />
      </Suspense>
    </AdminProtectedContent>
  );
}
