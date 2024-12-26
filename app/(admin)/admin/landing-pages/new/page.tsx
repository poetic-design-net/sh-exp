"use client";

import { CreateLandingPageForm } from "./create-landing-page-form";

export default function NewLandingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold">Create New Landing Page</h3>
      </div>

      <div className="bg-white border border-neutral-100 rounded-xl p-6">
        <CreateLandingPageForm />
      </div>
    </div>
  );
}
