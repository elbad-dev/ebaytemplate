import { TemplateData } from '../types';

/**
 * Generates HTML template based on provided template data
 */
export function generateTemplate(data: TemplateData): string {
  if (data.rawHtml) {
    // If we have a raw HTML template, we'll modify it
    let html = data.rawHtml;

    // Replace company name if it exists - using a more specific selector to the brand-text area
    if (data.company_name) {
      const companyNameRegex = /<div\s+class="brand-text">\s*<h1[^>]*>(.*?)<\/h1>/;
      if (companyNameRegex.test(html)) {
        html = html.replace(companyNameRegex, `<div class="brand-text"><h1>${ data.company_name }</h1>`);
      } else {
        // Try alternative company name patterns
        const altCompanyNameRegex = /<header[^>]*>.*?<h1[^>]*>(.*?)<\/h1>/;
        if (altCompanyNameRegex.test(html)) {
          html = html.replace(altCompanyNameRegex, (match) => {
            return match.replace(/<h1[^>]*>(.*?)<\/h1>/, `<h1>${ data.company_name }</h1>`);
          });
        }
      }
    }

    // Replace product title if it exists - making selectors more specific to avoid conflicts
    if (data.title) {
      // First try the card product title with specific class
      const titleRegex = /<h2\s+class="product-title"[^>]*>(.*?)<\/h2>/;
      if (titleRegex.test(html)) {
        html = html.replace(titleRegex, `<h2 class="product-title">${ data.title }</h2>`);
      }

      // Then try the product info section in header with specific parent element
      const headerTitleRegex = /<div\s+class="product-info"[^>]*>[\s\S]*?<h2[^>]*>(.*?)<\/h2>/;
      if (headerTitleRegex.test(html)) {
        html = html.replace(headerTitleRegex, (match) => {
          return match.replace(/<h2[^>]*>(.*?)<\/h2>/, `<h2>${ data.title }</h2>`);
        });
      }

      // Update product title in product card
      const productCardH2Regex = /<div\s+class="product-card"[^>]*>[\s\S]*?<h2[^>]*>(.*?)<\/h2>/;
      if (productCardH2Regex.test(html)) {
        html = html.replace(productCardH2Regex, (match) => {
          return match.replace(/<h2[^>]*>(.*?)<\/h2>/, `<h2>${ data.title }</h2>`);
        });
      }

      // ALSO update any standalone product title h2 elements
      const productTitleH2 = html.match(/<h2[^>]*?product-title[^>]*?>(.*?)<\/h2>/g);
      if (productTitleH2) {
        productTitleH2.forEach(match => {
          html = html.replace(match, `<h2 class="product-title">${ data.title }</h2>`);
        });
      }
    }

    // Replace subtitle/slogan if it exists
    if (data.subtitle) {
      const subtitleRegex = /<div\s+class="brand-text">.*?<p[^>]*>(.*?)<\/p>/;
      if (subtitleRegex.test(html)) {
        html = html.replace(subtitleRegex, (match) => {
          return match.replace(/<p[^>]*>(.*?)<\/p>/, `<p>${ data.subtitle }</p>`);
        });
      }
    }

    // Replace price if it exists
    if (data.price) {
      const priceRegex = /<span\s+class="price"[^>]*>(.*?)<\/span>/;
      if (priceRegex.test(html)) {
        html = html.replace(priceRegex, `<span class="price">${ data.currency } ${ data.price }</span>`);
      }
    }

    // Replace description if it exists
    if (data.description) {
      // Try multiple patterns to find and replace the description section

      // Pattern 1: Standard heading + div pattern
      const descriptionRegex1 = /<h[23]>.*?Produktbeschreibung.*?<\/h[23]>\s*<div[^>]*>([\s\S]*?)<\/div>/i;
      if (descriptionRegex1.test(html)) {
        html = html.replace(descriptionRegex1, (match, p1) => {
          return match.replace(p1, data.description || '');
        });
      } 
      // Pattern 2: Direct class-based targeting
      else {
        const descriptionRegex2 = /<div\s+class="description-text"[^>]*>([\s\S]*?)<\/div>/i;
        if (descriptionRegex2.test(html)) {
          html = html.replace(descriptionRegex2, `<div class="description-text">${data.description || ''}</div>`);
        }
        // Pattern 3: Product info card pattern
        else {
          const cardDescriptionRegex = /<div\s+class="product-info"[^>]*>[\s\S]*?<h2[^>]*>.*?Produktbeschreibung.*?<\/h2>\s*<div[^>]*>([\s\S]*?)<\/div>/i;
          if (cardDescriptionRegex.test(html)) {
            html = html.replace(cardDescriptionRegex, (match, p1) => {
              return match.replace(p1, data.description || '');
            });
          }
          // Pattern 4: General card containing description
          else {
            const generalCardRegex = /<div\s+class="card"[^>]*>[\s\S]*?<h2[^>]*>.*?(?:Produkt|Beschreibung).*?<\/h2>\s*<div[^>]*>([\s\S]*?)<\/div>/i;
            if (generalCardRegex.test(html)) {
              html = html.replace(generalCardRegex, (match, p1) => {
                return match.replace(p1, data.description || '');
              });
            }
          }
        }
      }

      // Last resort: If we still couldn't find a matching pattern, try to locate any div after a heading with "description" in it
      if (!html.includes(data.description)) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const headings = Array.from(doc.querySelectorAll('h2, h3'));

        for (const heading of headings) {
          if (heading.textContent?.toLowerCase().includes('beschreibung') || 
              heading.textContent?.toLowerCase().includes('description')) {
            let nextEl = heading.nextElementSibling;
            if (nextEl && nextEl.tagName === 'DIV') {
              // Found a match - now replace this in the HTML string
              const tempDiv = document.createElement('div');
              tempDiv.appendChild(nextEl.cloneNode(true));
              const divHtml = tempDiv.innerHTML;
              html = html.replace(divHtml, `<div>${data.description}</div>`);
              break;
            }
          }
        }
      }
    }

    // Replace technical specs if they exist
    if (data.specs.length > 0) {
      const specsContent = data.specs.map(spec => `
        <div class="spec-item">
          <div class="spec-name">${spec.label}</div>
          <div class="spec-value">${spec.value}</div>
        </div>
      `).join('');

      const specsRegex = /<div\s+class="specs-container"[^>]*>.*?<\/div>/;
      if (specsRegex.test(html)) {
        html = html.replace(specsRegex, `<div class="specs-container">${ specsContent }</div>`);
      }
    }

    // Replace company info sections if they exist
    if (data.companyInfo.length > 0) {
      // First approach: Replace sections by ID if it exists
      data.companyInfo.forEach(section => {
        if (section.id) {
          const sectionRegex = new RegExp(`<div\\s+id="${section.id}"[^>]*>.*?<\\/div>`, 's');
          if (sectionRegex.test(html)) {
            const sectionContent = `
              <div id="${section.id}" class="company-section">
                <div class="icon-container">${section.svg || ''}</div>
                <div class="section-content">
                  <h3>${section.title}</h3>
                  <p>${section.description}</p>
                </div>
              </div>
            `;
            html = html.replace(sectionRegex, sectionContent);
          }
        }
      });

      // Second approach: Look for company-sections container and replace the whole thing
      const companySectionsRegex = /<div\s+class="company-sections"[^>]*>([\s\S]*?)<\/div>/i;
      if (companySectionsRegex.test(html)) {
        const companySectionsContent = data.companyInfo.map(section => `
          <div class="company-section" ${section.id ? `id="${section.id}"` : ''}>
            <div class="icon-container">${section.svg || ''}</div>
            <div class="section-content">
              <h3>${section.title}</h3>
              <p>${section.description}</p>
            </div>
          </div>
        `).join('');

        html = html.replace(companySectionsRegex, `<div class="company-sections">${companySectionsContent}</div>`);
      }

      // Third approach: Look for about-us or company-info section and replace all company-section divs
      const aboutSectionRegex = /<div\s+class="(?:about-us|company-info)-section"[^>]*>[\s\S]*?<h3[^>]*>.*?About\s+Us.*?<\/h3>([\s\S]*?)<\/div>/i;
      if (aboutSectionRegex.test(html)) {
        html = html.replace(aboutSectionRegex, (match, content) => {
          // Replace the content after the heading but before the closing div
          const companySectionsContent = data.companyInfo.map(section => `
            <div class="company-section" ${section.id ? `id="${section.id}"` : ''}>
              <div class="icon-container">${section.svg || ''}</div>
              <div class="section-content">
                <h3>${section.title}</h3>
                <p>${section.description}</p>
              </div>
            </div>
          `).join('');

          return match.replace(content, `<div class="company-sections">${companySectionsContent}</div>`);
        });
      }

      // Fourth approach: If we have company sections in the template but not in the structure we expect,
      // try to match them by title and replace them individually
      if (data.companyInfo.length > 0) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const companySections = doc.querySelectorAll('.company-section, .about-section');

        if (companySections.length > 0) {
          // We found some company sections, let's try to update them
          Array.from(companySections).forEach((section, index) => {
            if (index < data.companyInfo.length) {
              const dataSection = data.companyInfo[index];
              const titleEl = section.querySelector('h3, h4');
              const descEl = section.querySelector('p');
              const iconEl = section.querySelector('.icon-container, .icon');

              if (titleEl) {
                titleEl.textContent = dataSection.title;
              }

              if (descEl) {
                descEl.textContent = dataSection.description;
              }

              if (iconEl && dataSection.svg) {
                iconEl.innerHTML = dataSection.svg;
              }

              // Now update the HTML string
              const tempDiv = document.createElement('div');
              tempDiv.appendChild(section.cloneNode(true));
              const oldHtml = tempDiv.innerHTML;

              // Create new section HTML
              const newSectionHtml = `
                <div class="company-section">
                  <div class="icon-container">${dataSection.svg || ''}</div>
                  <div class="section-content">
                    <h3>${dataSection.title}</h3>
                    <p>${dataSection.description}</p>
                  </div>
                </div>
              `;

              html = html.replace(oldHtml, newSectionHtml);
            }
          });
        }
      }
    }

    // Handle image gallery
    if (data.images.length > 0) {
      // Main image - using multiline matching without 's' flag
      const mainImageRegex = /<div\s+class="main-image"[^>]*>[\s\S]*?<img[^>]*src="[^"]*"[^>]*>[\s\S]*?<\/div>/;
      if (mainImageRegex.test(html)) {
        html = html.replace(mainImageRegex, `<div class="main-image"><img src="${data.images[0].url}" alt="Product image"></div>`);
      }

      // Check for advanced gallery patterns first
      // Gallery with radio inputs and multiple main images
      const gallerySliderRegex = /<div\s+class="gallery-slider"[^>]*>[\s\S]*?<\/div>/i;
      if (gallerySliderRegex.test(html)) {
        // Generate radio inputs for image selection
        const radioInputs = data.images.map((_, idx) => 
          `<input type="radio" name="gallery-select" id="gallery-select-${idx}" class="gallery-select" ${idx === 0 ? 'checked' : ''} />`
        ).join('\n');

        // Generate main images
        const mainImages = data.images.map((image, idx) => 
          `<div class="gallery-main-image" id="main-image-${idx}">
            <img src="${image.url}" alt="Product image ${idx + 1}">
           </div>`
        ).join('\n');

        // Generate thumbnails with labels linked to radio inputs
        const thumbnails = data.images.map((image, idx) => 
          `<label for="gallery-select-${idx}" class="thumbnail-item" data-for="main-image-${idx}">
            <img src="${image.url}" alt="Thumbnail ${idx + 1}">
           </label>`
        ).join('\n');

        // Generate navigation arrows
        const navArrows = `
          <div class="gallery-arrows">
            <label for="gallery-select-${data.images.length - 1}" class="gallery-arrow prev" id="gallery-prev"></label>
            <label for="gallery-select-1" class="gallery-arrow next" id="gallery-next"></label>
          </div>
        `;

        // Full replacement with custom navigation script
        const galleryHTML = `
          <div class="gallery-slider">
            ${radioInputs}
            <div class="gallery-main-container">
              ${mainImages}
              ${navArrows}
            </div>
            <div class="gallery-thumbnails">
              <div class="thumbnail-scroll">
                ${thumbnails}
              </div>
            </div>
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
        `;

        html = html.replace(gallerySliderRegex, galleryHTML);
      }

      // Standard thumbnail gallery
      const thumbnailsContent = data.images.map(image => `
        <div class="thumbnail">
          <img src="${image.url}" alt="Product thumbnail">
        </div>
      `).join('');

      const thumbnailsRegex = /<div\s+class="thumbnails"[^>]*>[\s\S]*?<\/div>/;
      if (thumbnailsRegex.test(html)) {
        html = html.replace(thumbnailsRegex, `<div class="thumbnails">${thumbnailsContent}</div>`);
      }

      // Basic gallery container
      const galleryImagesContent = data.images.map(image => `
        <div class="gallery-item">
          <img src="${image.url}" alt="Product image">
        </div>
      `).join('');

      const galleryRegex = /<div\s+class="gallery-container"[^>]*>[\s\S]*?<\/div>/;
      if (galleryRegex.test(html)) {
        html = html.replace(galleryRegex, `<div class="gallery-container">${galleryImagesContent}</div>`);
      }

      // CSS Gallery pattern (common in eBay templates)
      // Store the original template structure
      const originalHtml = html;
      
      // First identify and store all major sections
      const sections = {
        gallery: /<div\s+class="(?:product-gallery|gallery)"[^>]*>[\s\S]*?<\/div>/i,
        productCard: /<div\s+class="product-card"[^>]*>[\s\S]*?<\/div>/i,
        description: /<div\s+class="description-text"[^>]*>[\s\S]*?<\/div>/i,
        specs: /<div\s+class="specs-container"[^>]*>[\s\S]*?<\/div>/i,
        company: /<div\s+class="company-sections"[^>]*>[\s\S]*?<\/div>/i
      };

      // Extract all existing sections
      const sectionContents = {};
      for (const [key, regex] of Object.entries(sections)) {
        const match = html.match(regex);
        if (match) {
          sectionContents[key] = {
            content: match[0],
            index: html.indexOf(match[0])
          };
        }
      }

      // Handle gallery section if it exists
      const hasGallery = sections.gallery.test(html);
      if (hasGallery) {
        // Create gallery HTML with sets of 5 thumbnails
        const createThumbnailSets = (images) => {
          const sets = [];
          for(let i = 0; i < images.length; i += 5) {
            const setNumber = Math.floor(i / 5) + 1;
            sets.push(`
              <!-- Set ${setNumber}: Images ${i + 1}-${Math.min(i + 5, images.length)} -->
              <div class="thumbnail-set set${setNumber}">
                ${images.slice(i, i + 5).map((image, idx) => `
                  <label class="thumbnail" for="img${i + idx + 1}">
                    <img src="${image.url}" alt="Thumbnail ${i + idx + 1}">
                  </label>
                `).join('')}
              </div>
            `);
          }
          return sets.join('');
        };

        const cssGalleryHTML = `
          <div class="gallery">
            ${data.images.map((_, idx) => `
              <input type="radio" name="gallery" id="img${idx + 1}" ${idx === 0 ? 'checked' : ''}>
            `).join('')}
            
            <div class="gallery-container">
              ${data.images.map((image, idx) => `
                <img src="${image.url}" alt="Product Detail ${idx + 1}" class="gallery-item" id="main${idx + 1}">
              `).join('')}
              
              ${data.images.map((_, idx) => `
                ${idx > 0 ? `<label class="gallery-arrow prev" for="img${idx}"></label>` : ''}
                ${idx < data.images.length - 1 ? `<label class="gallery-arrow next" for="img${idx + 2}"></label>` : ''}
              `).join('')}
            </div>

            <div class="thumbnail-sets">
              ${createThumbnailSets(data.images)}
            </div>
          </div>
        `;

        // Replace only the gallery section while preserving others
        if (sectionContents.gallery) {
          html = html.slice(0, sectionContents.gallery.index) + 
                 cssGalleryHTML + 
                 html.slice(sectionContents.gallery.index + sectionContents.gallery.content.length);
        }
        
        // Verify all sections are still present
        const missingSection = Object.entries(sections).find(([key, regex]) => {
          if (key === 'gallery') return false; // Skip gallery check since we just updated it
          return !regex.test(html);
        });

        if (missingSection) {
          console.warn(`Section ${missingSection[0]} was lost during update - restoring from original`);
          const [key, regex] = missingSection;
          const originalMatch = originalHtml.match(regex);
          if (originalMatch) {
            // Find appropriate insertion point
            const insertPoint = html.lastIndexOf('</div>');
            html = html.slice(0, insertPoint) + originalMatch[0] + html.slice(insertPoint);
          }
        }
      }
    }

    return html;
  } else {
    // If no raw HTML provided, generate a new one from scratch
    return generateBasicTemplate(data);
  }
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