import { TemplateData } from '../types';

/**
 * Generates HTML template based on provided template data
 */
export function generateTemplate(data: TemplateData): string {
  if (data.rawHtml) {
    let html = data.rawHtml;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Store original sections before making any changes
    const originalSections = {
      companySections: doc.querySelector('.company-sections')?.outerHTML,
      header: doc.querySelector('header')?.outerHTML,
      productCard: doc.querySelector('.product-card')?.outerHTML,
      description: doc.querySelector('.description-section')?.outerHTML,
      specs: doc.querySelector('.specs-section')?.outerHTML
    };

    // Update company sections while preserving structure
    if (data.companyInfo.length > 0) {
      const companySections = doc.querySelector('.company-sections');
      if (companySections) {
        const sectionTemplate = companySections.querySelector('.company-section')?.cloneNode(true) as HTMLElement;
        
        // Clear existing sections but keep the container
        companySections.innerHTML = '';
        
        // Add updated sections using the original structure
        data.companyInfo.forEach(section => {
          const newSection = sectionTemplate.cloneNode(true) as HTMLElement;
          if (!newSection) return;
          
          // Update section content while maintaining structure
          const iconContainer = newSection.querySelector('.icon-container');
          const title = newSection.querySelector('h3');
          const description = newSection.querySelector('p');
          
          if (iconContainer) iconContainer.innerHTML = section.svg || '';
          if (title) title.textContent = section.title;
          if (description) description.textContent = section.description;
          
          if (section.id) newSection.id = section.id;
          companySections.appendChild(newSection);
        });
        
        html = doc.documentElement.outerHTML;
      }
    }

    // If any section is missing, restore it from original
    for (const [key, content] of Object.entries(originalSections)) {
      if (content && !html.includes(content)) {
        const insertPoint = html.lastIndexOf('</body>');
        html = html.slice(0, insertPoint) + content + html.slice(insertPoint);
      }
    }

    return html;
  }

  // If no raw HTML provided, generate basic template
  return generateBasicTemplate(data);
}

/**
 * Generates a basic template from scratch when no existing template is provided
 */
function generateBasicTemplate(data: TemplateData): string {
  // Create image gallery HTML
  const galleryHTML = data.images.length > 0 
    ? `
      <div class="product-gallery">
        <div class="gallery-slider">
          ${data.images.map((_, idx) => 
            `<input type="radio" name="gallery-select" id="gallery-select-${idx}" class="gallery-select" ${idx === 0 ? 'checked' : ''} />`
          ).join('\n')}

          <div class="gallery-main-container">
            ${data.images.map((image, idx) => 
              `<div class="gallery-main-image" id="main-image-${idx}">
                <img src="${image.url}" alt="Product image ${idx + 1}">
               </div>`
            ).join('\n')}

            <div class="gallery-arrows">
              <label for="gallery-select-${data.images.length - 1}" class="gallery-arrow prev" id="gallery-prev"></label>
              <label for="gallery-select-1" class="gallery-arrow next" id="gallery-next"></label>
            </div>
          </div>

          <div class="gallery-thumbnails">
            <div class="thumbnail-scroll">
              ${data.images.map((image, idx) => 
                `<label for="gallery-select-${idx}" class="thumbnail-item" data-for="main-image-${idx}">
                  <img src="${image.url}" alt="Thumbnail ${idx + 1}">
                 </label>`
              ).join('\n')}
            </div>
          </div>
        </div>

        <style>
          .gallery-slider {
            position: relative;
            width: 100%;
            margin-bottom: 20px;
          }

          .gallery-select {
            display: none;
          }

          .gallery-main-container {
            position: relative;
            width: 100%;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
          }

          .gallery-main-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1;
          }

          .gallery-main-image img {
            width: 100%;
            height: auto;
            display: block;
          }

          .gallery-arrows {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            pointer-events: none;
          }

          .gallery-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            pointer-events: auto;
          }

          .gallery-arrow:before {
            content: '';
            display: block;
            width: 10px;
            height: 10px;
            border-style: solid;
            border-width: 3px 3px 0 0;
            border-color: #333;
          }

          .gallery-arrow.prev {
            left: 10px;
          }

          .gallery-arrow.prev:before {
            transform: rotate(-135deg);
            margin-left: 5px;
          }

          .gallery-arrow.next {
            right: 10px;
          }

          .gallery-arrow.next:before {
            transform: rotate(45deg);
            margin-right: 5px;
          }

          .gallery-thumbnails {
            width: 100%;
            overflow-x: auto;
          }

          .thumbnail-scroll {
            display: flex;
            gap: 10px;
          }

          .thumbnail-item {
            flex: 0 0 80px;
            height: 80px;
            border: 2px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;
            opacity: 0.7;
            transition: all 0.3s ease;
          }

          .thumbnail-item:hover {
            opacity: 1;
            border-color: #999;
          }

          .thumbnail-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          /* Selected image and thumbnail states */
          #gallery-select-0:checked ~ .gallery-main-container #main-image-0,
          #gallery-select-1:checked ~ .gallery-main-container #main-image-1,
          #gallery-select-2:checked ~ .gallery-main-container #main-image-2,
          #gallery-select-3:checked ~ .gallery-main-container #main-image-3,
          #gallery-select-4:checked ~ .gallery-main-container #main-image-4 {
            opacity: 1;
            z-index: 5;
          }

          #gallery-select-0:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-0"],
          #gallery-select-1:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-1"],
          #gallery-select-2:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-2"],
          #gallery-select-3:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-3"],
          #gallery-select-4:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-4"] {
            opacity: 1;
            border-color: #3498db;
          }
        </style>

        <script>
          // Simple navigation script
          document.addEventListener('DOMContentLoaded', function() {
            const radioButtons = document.querySelectorAll('.gallery-select');
            const prevArrow = document.getElementById('gallery-prev');
            const nextArrow = document.getElementById('gallery-next');

            // Update arrows to point to correct images
            function updateArrows() {
              let currentIdx = 0;
              radioButtons.forEach((radio, idx) => {
                if (radio.checked) currentIdx = idx;
              });

              const prevIdx = currentIdx === 0 ? radioButtons.length - 1 : currentIdx - 1;
              const nextIdx = currentIdx === radioButtons.length - 1 ? 0 : currentIdx + 1;

              prevArrow.setAttribute('for', 'gallery-select-' + prevIdx);
              nextArrow.setAttribute('for', 'gallery-select-' + nextIdx);
            }

            // Add event listeners to update arrows when selection changes
            radioButtons.forEach(radio => {
              radio.addEventListener('change', updateArrows);
            });

            // Initial arrow setup
            updateArrows();
          });
        </script>
      </div>
    ` 
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
        .thumbnail-sets {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        .thumbnail-set {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
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