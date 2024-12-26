import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/page-header";
import { MembershipForm } from "../../components/membership-form";
import { db } from "@/lib/firebase-admin-server";
import type { Membership } from "@/types/membership";

interface EditMembershipPageProps {
  params: {
    id: string;
  };
}

export default async function EditMembershipPage({ params }: EditMembershipPageProps) {
  const doc = await db.collection("memberships").doc(params.id).get();
  
  if (!doc.exists) {
    notFound();
  }

  const membership = {
    id: doc.id,
    ...doc.data()
  } as Membership;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Membership"
        description="Update membership details"
      />
      <div className="max-w-2xl">
        <MembershipForm initialData={membership} />
      </div>
    </div>
  );
}
