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

  // Update title and company name with flexible selectors
  updateElements('.product-title, .title, h1.product-name, .item-title', el => {
    el.textContent = data.title || '';
  });

  updateElements('.company-name, .brand-name, .merchant-name', el => {
    el.textContent = data.company_name || '';
  });

  // Update description with proper HTML support
  updateElements('.product-description, .description-text, .item-description', el => {
    el.innerHTML = data.description || '';
  });

  // Update specifications with structure preservation
  if (data.specs && data.specs.length > 0) {
    updateElements('.specs-container, .specifications, .tech-specs', el => {
      // Keep existing structure by using first spec item as template
      const existingSpec = el.querySelector('.spec-item');
      if (existingSpec) {
        const template = existingSpec.cloneNode(true) as HTMLElement;
        el.innerHTML = '';
        data.specs.forEach(spec => {
          const newSpec = template.cloneNode(true) as HTMLElement;
          const label = newSpec.querySelector('.spec-label, .label');
          const value = newSpec.querySelector('.spec-value, .value');
          if (label) label.textContent = spec.label;
          if (value) value.textContent = spec.value;
          el.appendChild(newSpec);
        });
      } else {
        // Fallback to basic structure
        el.innerHTML = data.specs.map(spec => `
          <div class="spec-item">
            <span class="spec-label">${spec.label}:</span>
            <span class="spec-value">${spec.value}</span>
          </div>
        `).join('');
      }
    });
  }

  // Update company sections with improved matching
  if (data.companyInfo && data.companyInfo.length > 0) {
    // Try to find container first
    const container = doc.querySelector('.company-sections, .info-sections, .about-sections');
    const sections = doc.querySelectorAll('.company-section, .info-section, .about-section');

    if (container && sections.length > 0) {
      // Use first section as template
      const template = sections[0].cloneNode(true) as HTMLElement;
      container.innerHTML = '';

      data.companyInfo.forEach(info => {
        const newSection = template.cloneNode(true) as HTMLElement;
        if (info.id) newSection.id = info.id;

        // Update icon/svg with multiple selector matching
        const iconContainer = newSection.querySelector('.icon-container, .section-icon, .info-icon');
        if (iconContainer) iconContainer.innerHTML = info.svg || '';

        // Update title with multiple selector matching
        const title = newSection.querySelector('h3, h4, .section-title, .info-title');
        if (title) title.textContent = info.title || '';

        // Update description with multiple selector matching
        const desc = newSection.querySelector('p, .section-description, .info-description');
        if (desc) desc.textContent = info.description || '';

        container.appendChild(newSection);
      });
    } else {
      // Update individual sections if no container found
      sections.forEach((section, index) => {
        if (index < data.companyInfo.length) {
          const info = data.companyInfo[index];
          const iconContainer = section.querySelector('.icon-container, .section-icon, .info-icon');
          const title = section.querySelector('h3, h4, .section-title, .info-title');
          const desc = section.querySelector('p, .section-description, .info-description');

          if (iconContainer && info.svg) iconContainer.innerHTML = info.svg;
          if (title) title.textContent = info.title || '';
          if (desc) desc.textContent = info.description || '';
        }
      });
    }
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
      mainImage.setAttribute('alt', `Product image 1`);
    }
  }

  return doc.documentElement.outerHTML;
}

/**
 * Generates a basic template from scratch when no existing template is provided
 */
function generateBasicTemplate(data: TemplateData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title || 'Product Template'}</title>
      </head>
      <body>
        <div class="template-container">
          <header>
            <h1 class="product-title">${data.title || ''}</h1>
            <div class="company-name">${data.company_name || ''}</div>
          </header>
          <main>
            <div class="product-gallery"></div>
            <div class="product-description">${data.description || ''}</div>
            <div class="specifications"></div>
            <div class="company-sections"></div>
          </main>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generates a gallery section (HTML + CSS) for any number of images
 */
export function generateGallerySection(images: {url: string}[]): string {
  return `
    <div class="gallery">
      ${images.map((image, index) => `
        <div class="gallery-item">
          <img src="${image.url}" alt="Product image ${index + 1}" />
        </div>
      `).join('')}
    </div>
  `;
}