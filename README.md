# Stefenhiene Platform

Ein Next.js 14 E-Commerce und Lernplattform-System mit Firebase-Integration.

## Kern-Features

### 1. Content Management
- **Membership Pages**: Geschützter Content für Mitglieder
- **Kurse**: Interaktive Lerneinheiten mit Quiz-Funktion
- **Rich Text Editing**: TipTap Editor mit erweiterten Funktionen
  - Code-Highlighting
  - Tabellen
  - Typographie
  - Farben und Formatierung

### 2. E-Commerce
- Stripe Integration für Zahlungen
- Produkt-Verwaltung
- Bestellabwicklung
- Mitgliedschaften und Abonnements

### 3. Media Management
- Zentrale Media Library
- Bildoptimierung mit Sharp
- Drag & Drop Upload
- Bildergalerien

## Technische Architektur

### 1. Next.js App Router
```
app/
├── (admin)/        # Geschützter Admin-Bereich
├── (auth)/         # Auth-Flow
├── actions/        # Server Actions
└── [dynamicRoutes] # Dynamische Seiten
```

### 2. Firebase Integration

#### Server-seitig (Admin SDK)
```typescript
// services/*-server.ts
import { db } from "lib/firebase-admin-server";

export async function getData() {
  return db.collection("collection")
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => 
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    );
}
```

#### Client-seitig (Server Actions)
```typescript
// app/actions/*.ts
"use server";

import { revalidatePath } from "next/cache";
import { getData } from "services/*-server";

export async function serverAction() {
  const result = await getData();
  revalidatePath("/path");
  return result;
}
```

### 3. Komponenten-Architektur

#### Admin Components
- ClientWrapper für Auth-Schutz
- Optimistische Updates
- Error Boundaries
- Suspense Integration

```typescript
export function AdminComponent() {
  return (
    <ClientWrapper>
      <ErrorBoundary fallback={<ErrorUI />}>
        <Suspense fallback={<LoadingUI />}>
          <Content />
        </Suspense>
      </ErrorBoundary>
    </ClientWrapper>
  );
}
```

#### UI Components (shadcn/ui)
- Radix UI Primitives
- Tailwind CSS
- Themes & Dark Mode
- Responsive Design

### 4. Content-Typen

#### Membership Pages
```typescript
interface MembershipPage {
  id: string;
  membershipId: string;  // Zugriffskontrolle
  content: {
    description?: string;
    items: ContentItem[];
  };
  isPublished: boolean;
}

type ContentType = 
  | 'text'
  | 'video'
  | 'video-embed'
  | 'audio'
  | 'pdf'
  | 'image'
  | 'image-grid';
```

#### Kurse
```typescript
interface Course {
  id: string;
  title: string;
  content: {
    items: CourseContentItem[];
  };
  published: boolean;
}

type CourseContentType = 
  | 'text'
  | 'video-embed'
  | 'image'
  | 'image-grid'
  | 'quiz';
```

## Development Setup

### 1. Environment
```bash
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### 2. Firebase Emulator
```bash
# Start Next.js + Firebase Emulator
npm run dev:local

# Nur Firebase Emulator
npm run dev:emulator
```

### 3. Testing
```bash
# Unit Tests
npm test

# Watch Mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Best Practices

### 1. Server/Client Separation
- Server Components für initiales Rendering
- Client Components für Interaktivität
- Server Actions für Datenoperationen

### 2. Daten-Management
- Optimistische Updates
- Revalidierung mit revalidatePath
- Error Handling mit try/catch
- TypeScript Types für alle Daten

### 3. Authentifizierung
- Firebase Auth für User Management
- Admin-Rollen über Custom Claims
- Protected Routes mit ClientWrapper
- Auth-Status Handling

### 4. Performance
- Lazy Loading für große Komponenten
- Bildoptimierung mit Sharp
- Caching-Strategien
- Bundle-Optimierung

## Deployment

### 1. Vercel
- Automatische Deployments
- Edge Functions
- Image Optimization
- Analytics

### 2. Firebase
- Firestore Datenbank
- Authentication
- Storage für Medien
- Functions (optional)

## Entwicklungs-Workflow

### 1. Neue Features
1. Types definieren
2. Server-Service implementieren
3. Server Actions erstellen
4. UI-Komponenten entwickeln
5. Tests schreiben

### 2. Code-Qualität
- ESLint mit strengen Regeln
- TypeScript strict mode
- Jest Tests
- Error Boundaries

### 3. Debugging
- React DevTools
- Firebase Emulator
- Error Logging
- Performance Monitoring

## Wichtige Hinweise

1. IMMER Server Actions für Datenoperationen verwenden
2. Keine sensiblen Daten im Client
3. TypeScript Types aktuell halten
4. Tests für kritische Funktionen
5. Error Handling nicht vergessen
6. Regelmäßige Dependency Updates
7. Performance Monitoring
