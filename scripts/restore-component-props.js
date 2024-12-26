const { getLandingPages, updateLandingPage } = require('../services/landing-pages');

// Default props from component-props.ts
const defaultHeroProps = {
  titleBold: "",
  titleNormal: "",
  subtitle: "",
  topBannerText: "",
  description: "",
  ctaText: "",
  ctaLink: "",
  backgroundImage: ""
};

const defaultIntroProps = {
  title: "",
  stats: {
    value: "",
    description: ""
  },
  features: []
};

async function restoreComponentProps() {
  try {
    // Get all landing pages
    const pages = await getLandingPages();
    
    // Find the intensiventbildung page
    const page = pages.find(p => p.slug === 'intensiventbildung');
    
    if (!page) {
      console.error('Landing page not found');
      return;
    }

    // Update components with restored props
    const updatedComponents = page.components.map(component => {
      if (component.type === 'hero') {
        return {
          ...component,
          props: defaultHeroProps
        };
      }
      if (component.type === 'intro') {
        return {
          ...component,
          props: defaultIntroProps
        };
      }
      return component;
    });
    
    // Update the landing page
    await updateLandingPage(page.id, {
      components: updatedComponents
    });
    
    console.log('Successfully restored props for hero and intro components');
  } catch (error) {
    console.error('Error restoring component props:', error);
  }
}

restoreComponentProps();
