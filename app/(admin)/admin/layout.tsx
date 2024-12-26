import { Navigation } from "@/components/admin/navigation";
import { AdminProtectedContent } from "@/components/auth/admin-protected-content";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedContent>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminProtectedContent>
  );
}
