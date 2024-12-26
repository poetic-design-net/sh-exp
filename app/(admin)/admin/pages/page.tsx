import Link from "next/link";
import { Layout, GitBranch } from "lucide-react";
import { getFunnels } from "@/app/actions/funnels";
import { getLandingPages } from "@/app/actions/landing-pages";

export default async function PagesOverviewPage() {
  const [funnels, landingPages] = await Promise.all([
    getFunnels(),
    getLandingPages(),
  ]);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-8">Seiten-Verwaltung</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Landing Pages Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Layout className="h-6 w-6 mr-2 text-gray-600" />
              <h2 className="text-xl font-semibold">Landing Pages</h2>
            </div>
            <Link
              href="/admin/landing-pages/new"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Neue Landing Page
            </Link>
          </div>
          
          <div className="text-gray-600 mb-4">
            {landingPages.length} aktive Landing Pages
          </div>
          
          <Link
            href="/admin/landing-pages"
            className="text-gray-600 hover:text-black inline-flex items-center"
          >
            Alle Landing Pages verwalten
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Funnels Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <GitBranch className="h-6 w-6 mr-2 text-gray-600" />
              <h2 className="text-xl font-semibold">Verkaufstrichter</h2>
            </div>
            <Link
              href="/admin/funnels/new"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Neuer Funnel
            </Link>
          </div>
          
          <div className="text-gray-600 mb-4">
            {funnels.length} aktive Verkaufstrichter
          </div>
          
          <Link
            href="/admin/funnels"
            className="text-gray-600 hover:text-black inline-flex items-center"
          >
            Alle Verkaufstrichter verwalten
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Schnellübersicht</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-600">Landing Pages</h4>
            <ul className="mt-2 space-y-2">
              <li>Aktiv: {landingPages.filter(p => p.isActive).length}</li>
              <li>Inaktiv: {landingPages.filter(p => !p.isActive).length}</li>
              <li>Gesamt: {landingPages.length}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-600">Verkaufstrichter</h4>
            <ul className="mt-2 space-y-2">
              <li>Aktiv: {funnels.filter(f => f.isActive).length}</li>
              <li>Inaktiv: {funnels.filter(f => !f.isActive).length}</li>
              <li>Gesamt: {funnels.length}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
