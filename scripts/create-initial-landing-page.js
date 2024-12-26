const { createLandingPage } = require('./firebase-admin');

const defaultNavItems = [
  { id: '1', label: 'Über mich', href: '#about', order: 1 },
  { id: '2', label: 'Programm Details', href: '#program', order: 2 },
  { id: '3', label: 'Preise', href: '#pricing', order: 3 },
  { id: '4', label: 'Referenzen', href: '#testimonials', order: 4 },
  { id: '5', label: 'Kontakt', href: '#contact', order: 5 }
];

const initialLandingPage = {
  slug: 'intensive',
  title: 'Intensive Training',
  description: 'Personal Training mit Stefan Hiene',
  isActive: true,
  components: [
    {
      id: 'hero-1',
      type: 'hero',
      props: {
        title: 'Personal Training mit Stefan Hiene',
        subtitle: 'Erreiche deine Fitnessziele mit professioneller Unterstützung',
        description: 'Eine einzigartige Kombination aus persönlichem Wachstum, Achtsamkeit und beruflicher Entwicklung.',
        ctaText: 'Jetzt Termin vereinbaren',
        ctaLink: '#contact',
        backgroundImage: '/static/images/Stefan-Hiene-Portrait-1.webp',
        topBannerText: 'Begrenzte Plätze verfügbar. Tritt jetzt der Warteliste bei.',
        navigation: {
          desktopItems: defaultNavItems,
          mobileItems: defaultNavItems,
          settings: {
            mobileBreakpoint: 768,
            showSocialLinks: true,
            enableSearch: false
          }
        }
      },
      order: 0
    }
  ],
  navigation: {
    desktopItems: defaultNavItems,
    mobileItems: defaultNavItems,
    settings: {
      mobileBreakpoint: 768,
      showSocialLinks: true,
      enableSearch: false
    }
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {
    seoTitle: 'Personal Training mit Stefan Hiene - Intensive Training',
    seoDescription: 'Professionelles Personal Training in Hamburg mit Stefan Hiene. Erreichen Sie Ihre Fitnessziele mit individueller Betreuung.',
    ogImage: '/static/images/Stefan-Hiene-Portrait-1.webp'
  }
};

async function createInitialPage() {
  try {
    const id = await createLandingPage(initialLandingPage);
    console.log('Successfully created initial landing page with ID:', id);
  } catch (error) {
    console.error('Error creating initial landing page:', error);
  }
}

createInitialPage();
