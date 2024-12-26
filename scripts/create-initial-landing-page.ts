const { createLandingPage } = require('../services/landing-pages');

const initialLandingPage = {
  slug: 'intensive',
  title: '',
  description: '',
  isActive: true,
  components: [
    {
      id: 'hero-1',
      type: 'hero',
      props: {
        title: '',
        subtitle: '',
        ctaText: '',
        ctaLink: '',
        backgroundImage: ''
      },
      order: 0
    },
    {
      id: 'intro-1',
      type: 'intro',
      props: {
        title: '',
        stats: {
          value: '',
          description: ''
        },
        features: []
      },
      order: 1
    }
  ],
  navigation: {
    desktopItems: [],
    mobileItems: [],
    settings: {
      mobileBreakpoint: 768,
      showSocialLinks: true,
      enableSearch: false
    }
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {
    seoTitle: '',
    seoDescription: '',
    ogImage: ''
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
