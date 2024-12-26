"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Membership } from "@/types/membership";

interface MembershipCardProps {
  membership: Membership;
}

export function MembershipCard({ membership }: MembershipCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-semibold text-gray-900">
          {membership.name}
        </h3>
        <p className="mt-2 text-sm text-gray-500 flex-grow">
          {membership.description}
        </p>
        <div className="mt-4 space-y-2">
          <div className="text-sm text-gray-600">
            Duration: {membership.duration} days
          </div>
          {membership.features && membership.features.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Features:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                {membership.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-sm text-gray-600">
            Status: <span className={membership.isActive ? "text-green-600" : "text-yellow-600"}>
              {membership.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Link href={`/admin/memberships/${membership.id}/edit`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
