'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUsers, getUserStats, getUserProfile } from "@/app/actions/users";
import type { User, UserProfile } from "@/types/user";
import { useToast } from "@/components/ui/use-toast";
import { UserDetails } from "@/components/admin/users/user-details";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    last30Days: number;
    byRole: {
      admin: number;
      moderator: number;
      user: number;
    };
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [currentPage]);

  async function loadUsers() {
    try {
      setIsLoading(true);
      const result = await getUsers(currentPage, 20);
      setUsers(result.users);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Fehler",
        description: "Die Benutzer konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStats() {
    try {
      const userStats = await getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  async function handleUserDetails(user: User) {
    try {
      const userProfile = await getUserProfile(user.id);
      if (userProfile) {
        setSelectedUser(userProfile);
      } else {
        toast({
          title: "Fehler",
          description: "Benutzerprofil konnte nicht geladen werden.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: "Fehler",
        description: "Benutzerprofil konnte nicht geladen werden.",
        variant: "destructive"
      });
    }
  }

  function getRoleBadge(role: User['role']) {
    const roleMap: Record<string, { label: string; className: string }> = {
      'admin': { label: 'Administrator', className: 'bg-red-100 text-red-800' },
      'moderator': { label: 'Moderator', className: 'bg-yellow-100 text-yellow-800' },
      'user': { label: 'Benutzer', className: 'bg-green-100 text-green-800' }
    };

    const roleInfo = roleMap[role] || { label: role, className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={roleInfo.className}>
        {roleInfo.label}
      </Badge>
    );
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Benutzer</h2>
        <Button onClick={() => loadUsers()}>Aktualisieren</Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Gesamt Benutzer</h3>
            <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Letzte 30 Tage</h3>
            <p className="mt-2 text-3xl font-semibold">{stats.last30Days}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Rollen</h3>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Administratoren</span>
                <span className="font-medium">{stats.byRole.admin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Moderatoren</span>
                <span className="font-medium">{stats.byRole.moderator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Benutzer</span>
                <span className="font-medium">{stats.byRole.user}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt am</TableHead>
                <TableHead>Letzter Login</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {user.wooCommerceUserId ? `#${user.wooCommerceUserId}` : user.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{user.displayName || 'Nicht angegeben'}</p>
                      {(user.firstName || user.lastName) && (
                        <p className="text-sm text-gray-500">
                          {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {user.isActive ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nie'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUserDetails(user)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Seite {currentPage} von {totalPages}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Zurück
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= totalPages}
              >
                Weiter
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* User Details Dialog */}
      {selectedUser && (
        <UserDetails
          user={selectedUser}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
