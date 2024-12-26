import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export function PageHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-2xl font-bold">Landing Pages</h3>
      <Link href="/admin/landing-pages/new">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Page
        </Button>
      </Link>
    </div>
  );
}
