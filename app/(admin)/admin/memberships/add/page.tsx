import { PageHeader } from "@/components/admin/shared/page-header";
import { MembershipForm } from "../components/membership-form";

export default function AddMembershipPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Membership"
        description="Create a new membership plan"
      />
      <div className="max-w-2xl">
        <MembershipForm />
      </div>
    </div>
  );
}
