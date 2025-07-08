import { TemplateData } from '../types';

/**
 * Generates HTML template based on provided template data
 */
export function generateTemplate(data: TemplateData): string {
  if (!data) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(data.rawHtml || '', 'text/html');

  // Helper function to update content while preserving structure
  const updateElements = (selector: string, callback: (el: Element) => void) => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach(callback);
  };

  // Update title and company name
  updateElements('.product-title, .title, h1.product-name', el => {
    el.textContent = data.title || '';
  });

  updateElements('.company-name, .brand-name, .merchant-name', el => {
    el.textContent = data.company_name || '';
  });

  // Update description with HTML support
  updateElements('.product-description, .description-text, .item-description', el => {
    el.innerHTML = data.description || '';
  });

  // Update specifications
  if (data.specs && data.specs.length > 0) {
    updateElements('.specs-container, .specifications, .tech-specs', el => {
      el.innerHTML = data.specs.map(spec => `
        <div class="spec-item">
          <span class="spec-label">${spec.label}:</span>
          <span class="spec-value">${spec.value}</span>
        </div>
      `).join('');
    });
  }

  // Update company info sections
  if (data.companyInfo && data.companyInfo.length > 0) {
    const companySections = doc.querySelectorAll('.company-section, .about-section, .info-section');
    companySections.forEach((section, idx) => {
      if (idx < data.companyInfo.length) {
        const info = data.companyInfo[idx];
        const iconContainer = section.querySelector('.icon-container, .section-icon');
        const titleEl = section.querySelector('h3, h4, .section-title');
        const descEl = section.querySelector('p, .section-description');

        if (iconContainer) iconContainer.innerHTML = info.svg || '';
        if (titleEl) titleEl.textContent = info.title || '';
        if (descEl) descEl.textContent = info.description || '';
      }
    });
  }

  // Handle image gallery
  if (data.images && data.images.length > 0) {
    const gallerySection = doc.querySelector('.gallery, .product-gallery');
    if (gallerySection) {
      const newGallery = parser.parseFromString(generateGallerySection(data.images), 'text/html');
      const newGalleryContent = newGallery.querySelector('.gallery, .product-gallery');
      if (newGalleryContent) {
        gallerySection.replaceWith(newGalleryContent);
      }
    }

    // Also update any standalone main product image
    const mainImage = doc.querySelector('.main-image img, .product-main-image img');
    if (mainImage && data.images[0]) {
      mainImage.setAttribute('src', data.images[0].url);
      mainImage.setAttribute('alt', data.images[0].alt || 'Product image');
    }
  }

  return doc.documentElement.outerHTML;
}