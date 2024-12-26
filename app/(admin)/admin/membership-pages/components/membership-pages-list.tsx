"use client";

import { useState } from 'react';
import { MembershipPage } from '@/types/membership-page';
import { Membership } from '@/types/membership';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { deleteMembershipPage } from '@/app/actions/membership-pages';
import Link from 'next/link';

interface MembershipPagesListProps {
  initialPages: MembershipPage[];
  memberships: Membership[];
}

export function MembershipPagesList({ initialPages, memberships }: MembershipPagesListProps) {
  const [pages, setPages] = useState(initialPages);

  const getMembershipName = (membershipId: string) => {
    const membership = memberships.find(m => m.id === membershipId);
    return membership?.name || 'Unbekannte Mitgliedschaft';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Seite wirklich löschen?')) {
      return;
    }

    try {
      await deleteMembershipPage(id);
      setPages(pages.filter(page => page.id !== id));
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Fehler beim Löschen der Seite');
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead>Mitgliedschaft</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell>{page.title}</TableCell>
              <TableCell>{getMembershipName(page.membershipId)}</TableCell>
              <TableCell>
                {page.isPublished ? (
                  <span className="text-green-600">Veröffentlicht</span>
                ) : (
                  <span className="text-gray-500">Entwurf</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/membership-pages/${page.id}`}>
                    <Button variant="outline" size="sm">
                      Bearbeiten
                    </Button>
                  </Link>
                  <Link href={`/mitgliedschaft/${page.slug}`} target="_blank">
                    <Button variant="outline" size="sm">
                      Öffnen
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(page.id)}
                  >
                    Löschen
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {pages.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                Keine Seiten gefunden
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
