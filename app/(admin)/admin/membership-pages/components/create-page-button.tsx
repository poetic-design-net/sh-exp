"use client";

import { useState } from 'react';
import { Membership } from '@/types/membership';
import { createMembershipPage } from '@/app/actions/membership-pages';
import { generateSlug } from '@/lib/utils/slug';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

interface CreatePageFormData {
  title: string;
  membershipId: string;
}

interface CreateMembershipPageButtonProps {
  memberships: Membership[];
}

export function CreateMembershipPageButton({ memberships }: CreateMembershipPageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const form = useForm<CreatePageFormData>();

  const onSubmit = async (data: CreatePageFormData) => {
    try {
      const page = await createMembershipPage({
        title: data.title,
        membershipId: data.membershipId,
        slug: generateSlug(data.title),
        content: {
          description: '',
          items: []
        },
        isPublished: false
      });

      setIsOpen(false);
      router.push(`/admin/membership-pages/${page.id}`);
    } catch (error) {
      console.error('Error creating page:', error);
      alert('Fehler beim Erstellen der Seite');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Neue Seite erstellen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Mitgliedschaft Seite</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input placeholder="Seitentitel eingeben" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="membershipId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Erforderliche Mitgliedschaft</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Mitgliedschaft auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {memberships.map((membership) => (
                        <SelectItem 
                          key={membership.id} 
                          value={membership.id}
                        >
                          {membership.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">
                Erstellen
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
