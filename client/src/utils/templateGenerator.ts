import { TemplateData } from '@shared/schema';
import * as cheerio from 'cheerio';

/**
 * Generate HTML from template data by modifying the original HTML
 */
export function generateTemplate(templateData: TemplateData): string {
  if (!templateData.rawHtml) {
    return createBasicTemplate(templateData);
  }
  
  try {
    const $ = cheerio.load(templateData.rawHtml);
    
    // Update title
    $('title').text(templateData.title);
    
    // Update main heading(s)
    const headings = ['h1', '.main-title', '.product-title', '.brand-text h1', '.product-info h2', '.product-info .card h2'];
    for (const selector of headings) {
      $(selector).each((i: number, el: any) => {
        // Save the original styling but update the text content
        const originalStyles = $(el).attr('style') || '';
        $(el).text(templateData.title);
        
        // Make sure we preserve any existing styling
        if (originalStyles) {
          $(el).attr('style', originalStyles);
        }
      });
    }
    
    // Update subtitle
    const subtitleSelectors = ['.subtitle', '.brand-subtitle', 'h2:first-of-type', '.product-subtitle'];
    let subtitleUpdated = false;
    
    for (const selector of subtitleSelectors) {
      if ($(selector).length) {
        $(selector).text(templateData.subtitle || '');
        subtitleUpdated = true;
        break;
      }
    }
    
    // Create subtitle if not found and there is a subtitle to add
    if (!subtitleUpdated && templateData.subtitle) {
      $('h1').after(`<h2 class="subtitle">${templateData.subtitle}</h2>`);
    }
    
    // Update brand text in header if it exists
    if (templateData.title) {
      // Check for brand-text header specifically
      $('.brand-text h1').each((i: number, el: any) => {
        $(el).text(templateData.title);
      });
    }
    
    // Update subtitle in brand section if it exists
    if (templateData.subtitle) {
      // Check for brand-subtitle specifically
      $('.brand-subtitle p').each((i: number, el: any) => {
        $(el).text(templateData.subtitle);
      });
      
      // Also check for subtitle in the brand-text section
      $('.brand-text p').each((i: number, el: any) => {
        // Only update if it's not within a container that has already been updated
        const parentHasH1 = $(el).parent().find('h1').length > 0;
        if (parentHasH1) {
          $(el).text(templateData.subtitle);
        }
      });
    }
    
    // Update the logo if it exists
    if (templateData.logo) {
      const logoStr = templateData.logo; // Local constant to avoid undefined errors
      
      // Update image-based logos
      $('img[src*="logo"], img.logo, .header-logo img, .brand-logo img, .logo img, header img, .brand-info img').each((i: number, el: any) => {
        // If the logo is a URL to an image
        if (!logoStr.includes('<svg')) {
          $(el).attr('src', logoStr);
        } else {
          // If it's an SVG, replace the img tag with the SVG
          $(el).replaceWith(logoStr);
        }
      });
      
      // Update SVG-based logos
      $('.logo svg, .header-logo svg, .brand-logo svg, .brand-info svg').each((i: number, el: any) => {
        // If the logo is an SVG, replace it
        if (logoStr.includes('<svg')) {
          $(el).replaceWith(logoStr);
        } else {
          // If it's an image URL, replace the SVG with an img tag
          $(el).replaceWith(`<img src="${logoStr}" alt="Logo" />`);
        }
      });
    }
    
    // Update price
    if (templateData.price) {
      $('.price').each((i: number, el: any) => {
        const currencySymbol = getCurrencySymbol(templateData.currency || 'EUR');
        $(el).text(`${currencySymbol}${templateData.price}`);
      });
    }
    
    // Update gallery images - Specifically handle the pattern in the user's example
    if (templateData.images.length > 0) {
      // Check if we have the eBay-style gallery with radio buttons, arrows and main images
      const hasEbayGallery = $('input[type="radio"][name="gallery"]').length > 0;
      
      if (hasEbayGallery) {
        // Count existing radio buttons to determine how many images are already in place
        const existingRadios = $('input[type="radio"][name="gallery"]').length;
        const totalImages = templateData.images.length;
        
        // Get container references for all four components
        const galleryContainer = $('.gallery-container');
        const radioContainer = $('input[type="radio"][name="gallery"]').first().parent();
        const thumbnailContainer = $('.thumbnail-set.set1');
        
        // Before updating, get references to existing CSS that manages the image visibility
        const styleElement = $('style:contains("#img")');
        let cssContent = styleElement.html() || '';
        
        // 1. First update existing images
        for (let i = 0; i < Math.min(existingRadios, totalImages); i++) {
          const n = i + 1; // Use 1-based indexing as in the example
          
          // Update main image
          const mainImage = $(`#main${n}`);
          if (mainImage.length) {
            mainImage.attr('src', templateData.images[i].url);
          }
          
          // Update thumbnail
          const thumbnail = $(`.thumbnail[for="img${n}"] img`);
          if (thumbnail.length) {
            thumbnail.attr('src', templateData.images[i].url);
          }
        }
        
        // 2. Add new elements for additional images
        if (totalImages > existingRadios) {
          // a. Add new radio buttons first
          for (let i = existingRadios; i < totalImages; i++) {
            const n = i + 1;
            radioContainer.append(`<input type="radio" name="gallery" id="img${n}">`);
          }
          
          // b. Add CSS selectors for new images (up to 20 images allowed)
          // This is the important part - making sure the correct CSS is in place for selectors
          let newCSS = '';
          for (let i = existingRadios; i < Math.min(totalImages, 20); i++) {
            const n = i + 1;
            newCSS += `
            #img${n}:checked ~ .gallery-container #main${n} {
              display: block;
            }
            `;
          }
          
          // Add directional selectors for new arrows
          for (let i = 0; i < totalImages; i++) {
            const n = i + 1;
            const prevN = n === 1 ? totalImages : n - 1;
            const nextN = n === totalImages ? 1 : n + 1;
            
            newCSS += `
            #img${n}:checked ~ .gallery-container .gallery-arrow.prev[for="img${prevN}"],
            #img${n}:checked ~ .gallery-container .gallery-arrow.next[for="img${nextN}"] {
              display: block;
            }
            `;
          }
          
          // Append the new CSS
          if (styleElement.length) {
            styleElement.append(newCSS);
          } else {
            // If no style element exists, create one
            $('head').append(`<style>${newCSS}</style>`);
          }
          
          // c. Add/Update prev arrow navigation for ALL images (not just new ones)
          // First remove existing arrows to avoid duplicates
          $('.gallery-arrow.prev').remove();
          
          // Add all arrows fresh to ensure consistency
          for (let i = 0; i < totalImages; i++) {
            const n = i + 1;
            const prevTarget = n === 1 ? totalImages : n - 1;
            
            galleryContainer.append(`
              <label class="gallery-arrow prev" for="img${prevTarget}"></label>
            `);
          }
          
          // d. Add/Update next arrow navigation for ALL images
          $('.gallery-arrow.next').remove();
          
          for (let i = 0; i < totalImages; i++) {
            const n = i + 1;
            const nextTarget = n === totalImages ? 1 : n + 1;
            
            galleryContainer.append(`
              <label class="gallery-arrow next" for="img${nextTarget}"></label>
            `);
          }
          
          // e. Add new main images
          for (let i = existingRadios; i < totalImages; i++) {
            const n = i + 1;
            galleryContainer.append(`
              <img src="${templateData.images[i].url}" alt="Product Detail ${n}" class="gallery-item" id="main${n}">
            `);
          }
          
          // f. Add new thumbnails
          for (let i = existingRadios; i < totalImages; i++) {
            const n = i + 1;
            thumbnailContainer.append(`
              <label class="thumbnail" for="img${n}">
                <img src="${templateData.images[i].url}" alt="Thumbnail ${n}">
              </label>
            `);
          }
          
          // Make sure first radio button is checked by default
          $('input[type="radio"][name="gallery"]').prop('checked', false);
          $('#img1').prop('checked', true);
        }
      } else {
        // Handle other gallery types
        const mainImages = $('.gallery-item');
        const thumbnailImages = $('.thumbnail img');
        
        // Update existing images
        mainImages.each((i: number, el: any) => {
          if (i < templateData.images.length) {
            if ($(el).is('img')) {
              $(el).attr('src', templateData.images[i].url);
            } else {
              $(el).find('img').attr('src', templateData.images[i].url);
            }
          }
        });
        
        thumbnailImages.each((i: number, el: any) => {
          if (i < templateData.images.length) {
            $(el).attr('src', templateData.images[i].url);
          }
        });
        
        // Add new images if there are more in the templateData than in the template
        if (mainImages.length < templateData.images.length) {
          const galleryContainer = $('.gallery-container').first();
          if (galleryContainer.length) {
            for (let i = mainImages.length; i < templateData.images.length; i++) {
              if (mainImages.first().is('img')) {
                galleryContainer.append(`<img src="${templateData.images[i].url}" alt="Product image ${i + 1}" class="gallery-item">`);
              } else {
                galleryContainer.append(`
                  <div class="gallery-item">
                    <img src="${templateData.images[i].url}" alt="Product image ${i + 1}" />
                  </div>
                `);
              }
            }
          }
          
          // Add thumbnails
          const thumbnailContainer = $('.thumbnail-set, .thumbnails').first();
          if (thumbnailContainer.length) {
            for (let i = thumbnailImages.length; i < templateData.images.length; i++) {
              thumbnailContainer.append(`
                <div class="thumbnail">
                  <img src="${templateData.images[i].url}" alt="Thumbnail ${i + 1}" />
                </div>
              `);
            }
          }
        }
      }
    }
    
    // Update technical specifications
    if (templateData.specs.length > 0) {
      let specsUpdated = false;
      
      // Try different common tech spec patterns
      const techSpecContainers = [
        '.tech-table', '.specifications', '.specs', '.tech-specs',
        '.spec-table', '.product-specs'
      ];
      
      for (const container of techSpecContainers) {
        const specTable = $(container);
        if (specTable.length) {
          // Check if it's a table or a div-based structure
          const isTable = specTable.is('table') || specTable.find('table').length > 0;
          
          if (isTable) {
            // For table structure - clear existing rows (except header) and add new ones
            const tableEl = specTable.is('table') ? specTable : specTable.find('table');
            tableEl.find('tr:not(:first-child)').remove(); // Keep header row if exists
            
            templateData.specs.forEach(spec => {
              tableEl.append(`
                <tr>
                  <td class="tech-label">${spec.label}</td>
                  <td class="tech-value">${spec.value}</td>
                </tr>
              `);
            });
          } else {
            // For div-based structure that might use the same class
            // First remove all existing specs
            specTable.empty();
            
            // Then add all new specs
            templateData.specs.forEach(spec => {
              specTable.append(`
                <div class="tech-row">
                  <div class="tech-label">${spec.label}</div>
                  <div class="tech-value">${spec.value}</div>
                </div>
              `);
            });
          }
          
          specsUpdated = true;
          break;
        }
      }
      
      // If no spec table found, look for div-based specs
      if (!specsUpdated) {
        const specDivs = $('.spec-item, .tech-item');
        if (specDivs.length) {
          // First, update existing spec items
          specDivs.each((i: number, el: any) => {
            if (i < templateData.specs.length) {
              const spec = templateData.specs[i];
              $(el).find('.tech-label, .spec-label').text(spec.label);
              $(el).find('.tech-value, .spec-value').text(spec.value);
            }
          });
          
          // Then, if we have more specs than existing items, add new ones
          if (specDivs.length < templateData.specs.length) {
            const specContainer = specDivs.first().parent();
            
            // Get the structure of an existing spec item to create new ones with same format
            const existingSpecItem = specDivs.first();
            
            for (let i = specDivs.length; i < templateData.specs.length; i++) {
              const spec = templateData.specs[i];
              // Clone the existing item, but replace its content
              const newSpecItem = existingSpecItem.clone();
              newSpecItem.find('.tech-label, .spec-label').text(spec.label);
              newSpecItem.find('.tech-value, .spec-value').text(spec.value);
              
              // Add to the container
              specContainer.append(newSpecItem);
            }
          }
          
          specsUpdated = true;
        }
      }
    }
    
    // Update product description - preserve HTML formatting
    if (templateData.description) {
      let descriptionUpdated = false;
      
      // First try to find existing description elements
      $('.product-description, .description, .produktbeschreibung').each((i: number, el: any) => {
        $(el).html(templateData.description || '');
        descriptionUpdated = true;
      });
      
      // If no description found but there's a section titled "Produktbeschreibung"
      if (!descriptionUpdated) {
        $('.product-section h2, .section-title, .card-title').each((i: number, el: any) => {
          const title = $(el).text().trim();
          if (title.includes('Produktbeschreibung')) {
            const parent = $(el).parent();
            const descriptionEl = parent.find('p, .description, .content');
            if (descriptionEl.length) {
              descriptionEl.html(templateData.description || '');
              descriptionUpdated = true;
            } else {
              // Add description if there's no content element
              // Insert as raw HTML to preserve formatting
              $(el).after(`<div class="product-description">${templateData.description || ''}</div>`);
              descriptionUpdated = true;
            }
          }
        });
      }
    }
    
    // Update company information sections
    if (templateData.companyInfo.length > 0) {
      const companyContainers = [
        '.info-card', '.company-card', '.info-section', '.company-section',
        '.info-cards .card'
      ];
      
      for (const section of templateData.companyInfo) {
        for (const container of companyContainers) {
          const cards = $(container);
          let updated = false;
          
          cards.each((i: number, el: any) => {
            const sectionIndex = templateData.companyInfo.findIndex(s => s.id === section.id);
            if (i === sectionIndex) {
              // Update title
              $(el).find('.info-title, .card-title, h3').text(section.title);
              
              // Update description
              $(el).find('.info-description, .card-content, p').text(section.description);
              
              // Update SVG if possible
              const svgContainer = $(el).find('.icon, .svg-container, .card-icon');
              if (svgContainer.length) {
                // Increase SVG size by scaling it up
                const enlargedSvg = section.svg
                  .replace('width="24"', 'width="36"')
                  .replace('height="24"', 'height="36"')
                  .replace('stroke-width="2"', 'stroke-width="1.5"');
                svgContainer.html(enlargedSvg);
              } else {
                // If no container found, try to replace the SVG directly
                const enlargedSvg = section.svg
                  .replace('width="24"', 'width="36"')
                  .replace('height="24"', 'height="36"')
                  .replace('stroke-width="2"', 'stroke-width="1.5"');
                $(el).find('svg').replaceWith(enlargedSvg);
              }
              
              updated = true;
            }
          });
          
          if (updated) break;
        }
      }
    }
    
    return $.html();
  } catch (error) {
    console.error('Error generating template:', error);
    return templateData.rawHtml || createBasicTemplate(templateData);
  }
}

/**
 * Create a basic HTML template from scratch if no original template exists
 */
function createBasicTemplate(data: TemplateData): string {
  const currencySymbol = getCurrencySymbol(data.currency || 'EUR');
  
  // Create image gallery HTML with radio buttons like in the example
  const imageGallery = data.images.length > 0 
    ? `
      <div class="gallery">
        <!-- Image Selection Radio Buttons -->
        ${data.images.map((img, index) => `
          <input type="radio" name="gallery" id="img${index + 1}"${index === 0 ? ' checked' : ''}>
        `).join('')}
        
        <!-- Main Image Container -->
        <div class="gallery-container">
          <!-- Navigation Arrows -->
          ${data.images.map((img, index) => {
            const currentIndex = index + 1;
            const prevIndex = currentIndex === 1 ? data.images.length : currentIndex - 1;
            return `<label class="gallery-arrow prev" for="img${prevIndex}"></label>`;
          }).join('')}
          
          ${data.images.map((img, index) => {
            const currentIndex = index + 1;
            const nextIndex = currentIndex === data.images.length ? 1 : currentIndex + 1;
            return `<label class="gallery-arrow next" for="img${nextIndex}"></label>`;
          }).join('')}
          
          <!-- Main Images -->
          ${data.images.map((img, index) => `
            <img src="${img.url}" alt="Product image ${index + 1}" class="gallery-item" id="main${index + 1}">
          `).join('')}
        </div>
        
        <!-- Thumbnail Sets -->
        <div class="thumbnail-sets">
          <div class="thumbnail-set set1">
            ${data.images.map((img, index) => `
              <label class="thumbnail" for="img${index + 1}">
                <img src="${img.url}" alt="Thumbnail ${index + 1}">
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `
    : '<div class="gallery"><p>No product images available</p></div>';
  
  // Create technical specifications HTML
  const techSpecs = data.specs.length > 0
    ? `
      <div class="tech-table">
        ${data.specs.map(spec => `
          <div class="tech-row">
            <div class="tech-label">${spec.label}</div>
            <div class="tech-value">${spec.value}</div>
          </div>
        `).join('')}
      </div>
    `
    : '<div class="tech-table"><p>No technical specifications available</p></div>';
  
  // Create company info HTML
  const companyInfo = data.companyInfo.length > 0
    ? `
      <div class="info-cards">
        ${data.companyInfo.map(info => {
          // Increase SVG size
          const enlargedSvg = info.svg
            .replace('width="24"', 'width="48"')
            .replace('height="24"', 'height="48"')
            .replace('stroke-width="2"', 'stroke-width="1.5"');
            
          return `
          <div class="card info-card">
            <div class="card-icon">${enlargedSvg}</div>
            <h3 class="info-title">${info.title}</h3>
            <p class="info-description">${info.description}</p>
          </div>
          `;
        }).join('')}
      </div>
    `
    : '';
  
  // Create logo HTML if a logo exists
  const logoHtml = data.logo 
    ? data.logo.includes('<svg') 
      ? `<div class="logo">${data.logo}</div>`
      : `<div class="logo"><img src="${data.logo}" alt="Logo" /></div>`
    : '';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        :root {
          --primary: #00a651;
          --background: rgba(255, 255, 255, 0.95);
          --text: #1a1a1a;
          --muted: #666666;
          --border: #e5e5e5;
          --card-bg: rgba(255, 255, 255, 0.95);
          --radius: 16px;
        }
        
        body {
          background-color: var(--background);
          color: var(--text);
          padding: 20px;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .product-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .product-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .subtitle {
          font-size: 18px;
          color: var(--muted);
          margin-bottom: 15px;
        }
        
        .price {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
        }
        
        .gallery {
          margin: 30px 0;
        }
        
        .gallery-container {
          position: relative;
          width: 100%;
          padding-bottom: 75%;
          overflow: hidden;
          border-radius: var(--radius);
          background: var(--background);
          margin-bottom: 15px;
        }
        
        .gallery-item {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: none;
        }
        
        .gallery-item img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .thumbnail-sets {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        
        .thumbnail-set {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border);
          cursor: pointer;
        }
        
        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          display: none;
          z-index: 2;
          cursor: pointer;
        }
        
        .gallery-arrow::before {
          content: '';
          position: absolute;
          width: 15px;
          height: 15px;
          border-top: 3px solid var(--text);
          border-right: 3px solid var(--text);
          top: 50%;
          left: 50%;
        }
        
        .gallery-arrow.prev {
          left: 15px;
        }
        
        .gallery-arrow.prev::before {
          transform: translate(-30%, -50%) rotate(-135deg);
        }
        
        .gallery-arrow.next {
          right: 15px;
        }
        
        .gallery-arrow.next::before {
          transform: translate(-70%, -50%) rotate(45deg);
        }
        
        /* Logic for showing images based on radio selection */
        input[type="radio"] {
          display: none;
        }
        
        ${data.images.map((img, index) => {
          const i = index + 1;
          const prev = i === 1 ? data.images.length : i - 1;
          const next = i === data.images.length ? 1 : i + 1;
          
          return `
            #img${i}:checked ~ .gallery-container #main${i} {
              display: block;
            }
            #img${i}:checked ~ .gallery-container .gallery-arrow.prev[for="img${prev}"],
            #img${i}:checked ~ .gallery-container .gallery-arrow.next[for="img${next}"] {
              display: block;
            }
          `;
        }).join('')}
        
        /* Make thumbnails for selected image stand out */
        ${data.images.map((img, index) => {
          const i = index + 1;
          return `
            #img${i}:checked ~ .thumbnail-sets .thumbnail[for="img${i}"] {
              border-color: var(--color-primary);
              transform: translateY(-2px);
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
          `;
        }).join('')}
        
        .product-section,
        .tech-section {
          margin: 40px 0;
        }
        
        .section-title {
          font-size: 22px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .product-description {
          line-height: 1.6;
          color: var(--text);
          margin-bottom: 30px;
        }
        
        .tech-row {
          display: flex;
          border-bottom: 1px solid var(--border);
          padding: 12px 0;
        }
        
        .tech-label {
          flex: 1;
          font-weight: 500;
          color: var(--muted);
        }
        
        .tech-value {
          flex: 2;
        }
        
        .info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          margin: 40px 0;
        }
        
        .info-card {
          padding: 30px;
          border-radius: var(--radius);
          background: var(--card-bg);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        
        .card-icon {
          margin-bottom: 20px;
          color: var(--primary);
          transform: scale(1.1);
        }
        
        .info-title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #333;
        }
        
        .info-description {
          color: var(--muted);
          line-height: 1.6;
          font-size: 16px;
        }
        
        @media (max-width: 768px) {
          .thumbnail {
            width: 60px;
            height: 60px;
          }
          
          .gallery-container {
            padding-bottom: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="product-header">
          ${logoHtml}
          <h1 class="product-title">${data.title}</h1>
          ${data.subtitle ? `<h2 class="subtitle">${data.subtitle}</h2>` : ''}
          ${data.price ? `<div class="price">${currencySymbol}${data.price}</div>` : ''}
        </div>
        
        ${imageGallery}
        
        <div class="product-section">
          <h2 class="section-title">Produktbeschreibung</h2>
          <div class="product-description">${data.description || ''}</div>
        </div>
        
        <div class="tech-section">
          <h2 class="section-title">Technische Daten</h2>
          ${techSpecs}
        </div>
        
        ${companyInfo ? `<div class="company-section">${companyInfo}</div>` : ''}
      </div>
    </body>
    </html>
  `;
}

/**
 * Helper function to get currency symbol from currency code
 */
function getCurrencySymbol(currency: string): string {
  const currencyMap: Record<string, string> = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'KRW': '₩',
    'INR': '₹',
    'RUB': '₽'
  };
  
  return currencyMap[currency] || currency;
}