import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AdminProtectedContent } from '@/components/auth/admin-protected-content';
import { getMembershipPageById } from '@/app/actions/membership-pages';
import { getMemberships } from '@/app/actions/memberships';
import { PageEditor } from '../components/page-editor';

interface PageProps {
  params: {
    id: string;
  };
}

async function PageEditorContent({ id }: { id: string }) {
  const [page, memberships] = await Promise.all([
    getMembershipPageById(id),
    getMemberships(1, 100, true) // Load all memberships
  ]);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mitgliedschaft Seite bearbeiten</h1>
      </div>

      <PageEditor 
        initialPage={page} 
        memberships={memberships.memberships} 
      />
    </div>
  );
}

export default function MembershipPageEditorPage({ params }: PageProps) {
  return (
    <AdminProtectedContent>
      <Suspense fallback={<div>Laden...</div>}>
        <PageEditorContent id={params.id} />
      </Suspense>
    </AdminProtectedContent>
  );
}
