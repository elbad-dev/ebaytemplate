import { TemplateData } from '../types';

/**
 * Generates HTML template based on provided template data
 */
export function generateTemplate(data: TemplateData): string {
  if (!data) return '';

  // If we have a raw HTML template, use it as base and update only necessary parts
  if (data.rawHtml) {
    let html = data.rawHtml;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Helper to update elements that match a selector
    const updateElements = (selector: string, updater: (element: Element) => void) => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(updater);
    };

    // Update text content sections
    if (data.title) {
      updateElements('.product-title, .product-name', el => {
        el.textContent = data.title;
      });
    }

    if (data.price) {
      updateElements('.product-price', el => {
        el.textContent = data.price || '';
      });
    }

    if (data.description) {
      updateElements('.product-description, .description-text', el => {
        el.textContent = data.description;
      });
    }

    // Update specifications
    if (data.specs && data.specs.length > 0) {
      updateElements('.specs-container, .specifications', el => {
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
      // Try to match existing sections by ID first
      data.companyInfo.forEach(section => {
        if (section.id) {
          const sectionEl = doc.getElementById(section.id);
          if (sectionEl) {
            const iconContainer = sectionEl.querySelector('.icon-container');
            const titleEl = sectionEl.querySelector('h3, h4');
            const descEl = sectionEl.querySelector('p');

            if (iconContainer) iconContainer.innerHTML = section.svg || '';
            if (titleEl) titleEl.textContent = section.title;
            if (descEl) descEl.textContent = section.description;
          }
        }
      });

      // Then look for any remaining company sections to update
      const companySections = doc.querySelectorAll('.company-section');
      companySections.forEach((section, idx) => {
        if (idx < data.companyInfo.length) {
          const info = data.companyInfo[idx];
          const iconContainer = section.querySelector('.icon-container');
          const titleEl = section.querySelector('h3, h4');
          const descEl = section.querySelector('p');

          if (iconContainer) iconContainer.innerHTML = info.svg || '';
          if (titleEl) titleEl.textContent = info.title;
          if (descEl) descEl.textContent = info.description;
        }
      });
    }

    // Handle image gallery
    if (data.images && data.images.length > 0) {
      // If there's a gallery section, replace it entirely
      const gallerySection = doc.querySelector('.gallery, .product-gallery');
      if (gallerySection && data.images?.length > 0) {
        const newGalleryHtml = generateGallerySection(data.images);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newGalleryHtml;
        const newGallery = tempDiv.firstElementChild;

        if (newGallery) {
          gallerySection.replaceWith(newGallery);
        }
      }

      // Update main product image if it exists
      const mainImage = doc.querySelector('.gallery-item') as HTMLImageElement;
      if (mainImage && data.images[0]) {
        mainImage.src = data.images[0].url;
        mainImage.alt = data.images[0].alt || 'Product image';
      }
    }

    // Return the updated HTML while preserving structure and styles
    return doc.documentElement.outerHTML;
  }

  // If no raw HTML provided, generate a new template
  return generateBasicTemplate(data);
}

/**
 * Generates a basic template from scratch when no existing template is provided
 */
function generateBasicTemplate(data: TemplateData): string {
  // Create image gallery HTML
  const galleryHTML = data.images.length > 0 
    ? generateGallerySection(data.images)
    : `
      <div class="product-gallery">
        <div class="main-image">
          <img src="https://via.placeholder.com/500x500" alt="Product image">
        </div>
        <div class="thumbnails">
          <div class="thumbnail">
            <img src="https://via.placeholder.com/100x100" alt="Product thumbnail">
          </div>
        </div>
      </div>
    `;

  // Create tech specs HTML
  const specsHTML = data.specs.length > 0
    ? `
      <div class="specs-section">
        <h3>Technical Specifications</h3>
        <div class="specs-container">
          ${data.specs.map(spec => `
            <div class="spec-item">
              <div class="spec-name">${spec.label}</div>
              <div class="spec-value">${spec.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `
    : '';

  // Create company info HTML
  const companyHTML = data.companyInfo.length > 0
    ? `
      <div class="company-info-section">
        <h3>About Us</h3>
        <div class="company-sections">
          ${data.companyInfo.map(section => `
            <div id="${section.id}" class="company-section">
              <div class="icon-container">${section.svg || ''}</div>
              <div class="section-content">
                <h3>${section.title}</h3>
                <p>${section.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title || 'Product Template'}</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
        }
        .template-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .brand-text {
          flex: 1;
        }
        .brand-text h1 {
          font-size: 24px;
          color: #444;
          margin-bottom: 5px;
        }
        .brand-text p {
          font-size: 16px;
          color: #666;
        }
        .product-info {
          flex: 1;
          text-align: right;
        }
        .product-info h2 {
          font-size: 22px;
          color: #222;
          margin-bottom: 10px;
        }
        .price {
          font-size: 24px;
          font-weight: bold;
          color: #e63946;
        }
        .main-content {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
          margin-bottom: 40px;
        }
        .product-gallery {
          flex: 1;
          min-width: 300px;
        }
        .main-image {
          width: 100%;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        .main-image img {
          width: 100%;
          height: auto;
          display: block;
        }
        .thumbnails {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .thumbnail {
          width: 80px;
          height: 80px;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
        }
        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .product-card {
          flex: 1;
          min-width: 300px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding: 20px;
        }
        .product-card h2 {
          font-size: 20px;
          margin-bottom: 15px;
          color: #333;
        }
        .description-section {
          margin-bottom: 30px;
        }
        .description-section h3 {
          font-size: 18px;
          margin-bottom: 15px;
          color: #333;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        .description-text {
          font-size: 16px;
          line-height: 1.7;
          color: #555;
        }
        .specs-section {
          margin-bottom: 30px;
        }
        .specs-section h3 {
          font-size: 18px;
          margin-bottom: 15px;
          color: #333;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        .specs-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
        }
        .spec-item {
          display: flex;
          background: #f5f5f5;
          padding: 10px 15px;
          border-radius: 6px;
        }
        .spec-name {
          font-weight: bold;
          margin-right: 10px;
          min-width: 120px;
        }
        .spec-value {
          color: #555;
        }
        .company-info-section {
          margin-bottom: 30px;
        }
        .company-info-section h3 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #333;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        .company-sections {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .company-section {
          display: flex;
          align-items: flex-start;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .icon-container {
          width: 50px;
          height: 50px;
          margin-right: 15px;
          color: #3498db;
        }
        .icon-container svg {
          width: 100%;
          height: 100%;
        }
        .section-content h3 {
          font-size: 16px;
          margin-bottom: 8px;
          padding: 0;
          border: none;
        }
        .section-content p {
          font-size: 14px;
          color: #666;
        }
        @media (max-width: 768px) {
          .header-section {
            flex-direction: column;
            align-items: flex-start;
          }
          .brand-text {
            margin-bottom: 15px;
          }
          .product-info {
            text-align: left;
          }
          .main-content {
            flex-direction: column;
          }
        }
      </style>
    </head>
    <body>
      <div class="template-container">
        <div class="header-section">
          <div class="brand-text">
            <h1>${data.company_name || 'Company Name'}</h1>
            <p>${data.subtitle || 'Company Slogan'}</p>
          </div>
          <div class="product-info">
            <h2>${data.title || 'Product Title'}</h2>
            <span class="price">${data.currency} ${data.price || '0.00'}</span>
          </div>
        </div>

        <div class="main-content">
          ${galleryHTML}

          <div class="product-card">
            <h2 class="product-title">${data.title || 'Product Title'}</h2>
            <span class="price">${data.currency} ${data.price || '0.00'}</span>
            <div class="description-section">
              <h3>Produktbeschreibung</h3>
              <div class="description-text">${data.description || 'Product Description'}</div>
            </div>
          </div>
        </div>

        ${specsHTML}

        ${companyHTML}
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates a gallery section (HTML + CSS) for any number of images
 */
export function generateGallerySection(images: {url: string, alt?: string}[]): string {
  if (!images || images.length === 0) return '';

  // Split images into sets of 5
  const setSize = 5;
  const sets = Array.from({ length: Math.ceil(images.length / setSize) }, (_, i) =>
    images.slice(i * setSize, (i + 1) * setSize)
  );

  // Radio inputs for images
  const imageRadios = images.map((_, idx) =>
    `<input type="radio" name="gallery" id="img${idx + 1}"${idx === 0 ? ' checked' : ''}>`
  ).join('\n');

  // Radio inputs for sets
  const setRadios = sets.length > 1 ? sets.map((_, i) =>
    `<input type="radio" name="set" id="set${i + 1}"${i === 0 ? ' checked' : ''}>`
  ).join('\n') : '';

  // Navigation arrows: statically generate for each image
  let navigationArrows = '';
  for (let i = 0; i < images.length; i++) {
    // Previous arrow (skip for first image if you want no wrap, or wrap to last)
    if (i > 0) {
      navigationArrows += `\n<label class="gallery-arrow prev" for="img${i}"></label>`;
    }
    // Next arrow (skip for last image if you want no wrap, or wrap to first)
    if (i < images.length - 1) {
      navigationArrows += `\n<label class="gallery-arrow next" for="img${i + 2}"></label>`;
    }
  }

  // Main images
  const mainImages = images.map((img, idx) =>
    `<img src="${img.url}" alt="${img.alt || `Product detail ${idx + 1}` }" class="gallery-item" loading="lazy" id="main${idx + 1}">`
  ).join('\n');

  // Thumbnails grouped by set
  const thumbnailSets = sets.map((set, setIdx) =>
    `<div class="thumbnail-set set${setIdx + 1}">\n      ${set.map((img, imgIdx) => {
        const globalIdx = setIdx * setSize + imgIdx + 1;
        return `<label class="thumbnail" for="img${globalIdx}"><img src="${img.url}" alt="Thumbnail ${globalIdx}"></label>`;
      }).join('')}\n    </div>`
  ).join('\n');

  // CSS selectors for main image and thumbnail active states
  const showMainSelectors = images.map((_, idx) =>
    `#img${idx + 1}:checked ~ .gallery-container #main${idx + 1}`
  ).join(',\n');
  const showThumbSelectors = images.map((_, idx) =>
    `#img${idx + 1}:checked ~ .thumbnail-sets .thumbnail[for="img${idx + 1}"]`
  ).join(',\n');

  // CSS for showing only the correct arrows for the active image
  let arrowShowCSS = '';
  for (let i = 0; i < images.length; i++) {
    if (i > 0) {
      arrowShowCSS += `#img${i + 1}:checked ~ .gallery-container .gallery-arrow.prev[for="img${i}"] { display: block; }\n`;
    }
    if (i < images.length - 1) {
      arrowShowCSS += `#img${i + 1}:checked ~ .gallery-container .gallery-arrow.next[for="img${i + 2}"] { display: block; }\n`;
    }
  }

  return `
    <div class="gallery product-gallery">
      ${imageRadios}
      ${setRadios}
      <div class="gallery-container">
        ${navigationArrows}
        ${mainImages}
      </div>
      <div class="thumbnail-sets">
        ${thumbnailSets}
      </div>
      <style>
        .product-gallery { width: 100%; max-width: 100%; position: relative; display: flex; flex-direction: column; }
        .product-gallery input[type="radio"] { display: none; }
        .gallery-container { position: relative; width: 100%; padding-bottom: 75%; background: var(--image-bg, #fff); border-radius: var(--radius, 4px); overflow: hidden; }
        .gallery-item { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; transition: opacity 0.3s; z-index: 1; object-fit: contain; }
        ${showMainSelectors} { opacity: 1; z-index: 2; }
        .gallery-arrow { display: none; position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; background: var(--card-bg, #fff); border: 1px solid var(--frame-border, #e5e7eb); border-radius: 50%; cursor: pointer; z-index: 10; }
        .gallery-arrow:before { content: ''; position: absolute; top: 50%; left: 50%; width: 10px; height: 10px; border-style: solid; border-width: 2px 2px 0 0; border-color: var(--text, #000); }
        .gallery-arrow.prev { left: 10px; }
        .gallery-arrow.prev:before { transform: translate(-30%, -50%) rotate(-135deg); }
        .gallery-arrow.next { right: 10px; }
        .gallery-arrow.next:before { transform: translate(-70%, -50%) rotate(45deg); }
        ${arrowShowCSS}
        .thumbnail-sets { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
        .thumbnail-set { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
        .thumbnail { width: 80px; height: 80px; border: 2px solid var(--frame-border, #e5e7eb); border-radius: var(--radius, 4px); overflow: hidden; cursor: pointer; transition: border-color 0.2s; flex-shrink: 0; background: #f9f9f9; }
        .thumbnail img { width: 100%; height: 100%; object-fit: cover; }
        .thumbnail:hover { border-color: var(--primary, #3b82f6); }
        ${showThumbSelectors} { border-color: var(--primary, #3b82f6); }
      </style>
    </div>
  `;
}