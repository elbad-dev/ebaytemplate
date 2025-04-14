import { TemplateData } from '../types';
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
    const headings = ['h1', '.main-title', '.product-title', '.brand-text h1'];
    for (const selector of headings) {
      $(selector).each((_, el) => {
        $(el).text(templateData.title);
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
    
    // Update price
    if (templateData.price) {
      $('.price').each((_, el) => {
        const currencySymbol = getCurrencySymbol(templateData.currency || 'EUR');
        $(el).text(`${currencySymbol}${templateData.price}`);
      });
    }
    
    // Update gallery images
    if (templateData.images.length > 0) {
      // Get all main images and thumbnail images
      const mainImages = $('.gallery-item');
      const thumbnailImages = $('.thumbnail img');
      
      // Create image ID to thumbnail mapping
      // In eBay templates, there's often a pattern like main1, main2, main3 for IDs
      // and thumbnails with labels that reference those IDs
      const mainImageMap = new Map();
      
      // First update main gallery images
      mainImages.each((i, el) => {
        if (i < templateData.images.length) {
          const newUrl = templateData.images[i].url;
          // Store the element ID and the new image URL
          const elementId = $(el).attr('id');
          if (elementId) {
            mainImageMap.set(elementId, newUrl);
          }
          
          // If this is an image element directly, update its src
          if ($(el).is('img')) {
            $(el).attr('src', newUrl);
          } else {
            // Otherwise look for image inside
            $(el).find('img').attr('src', newUrl);
          }
        }
      });
      
      // Now handle thumbnails, with knowledge of which image is in which main slot
      thumbnailImages.each((i, el) => {
        if (i < templateData.images.length) {
          // Get the image URL
          const newUrl = templateData.images[i].url;
          
          // Update thumbnail src
          $(el).attr('src', newUrl);
          
          // Check if this thumbnail is linked to a main image through its label
          const label = $(el).closest('label').attr('for');
          
          // If this is a label that targets a specific image (like "img1" for main1),
          // make sure the URL there is aligned
          if (label && label.startsWith('img')) {
            // Extract the number from img1, img2, etc.
            const imgNumber = label.replace('img', '');
            // Find corresponding main ID (main1, main2, etc.)
            const mainId = `main${imgNumber}`;
            
            // If we've already mapped this main image with a URL, store that connection
            mainImageMap.set(mainId, newUrl);
          }
        }
      });
      
      // Special handling for eBay templates - update all main gallery images
      // with correctly matched thumbnails
      $('.gallery-item').each((_, el) => {
        const id = $(el).attr('id');
        if (id && mainImageMap.has(id)) {
          // If this is a mapped main image, ensure it uses the right URL
          if ($(el).is('img')) {
            $(el).attr('src', mainImageMap.get(id));
          } else {
            $(el).find('img').attr('src', mainImageMap.get(id));
          }
        }
      });
      
      // If we have more images than slots, look for other image patterns
      const allUpdatedImages = mainImages.length + thumbnailImages.length;
      if (allUpdatedImages < templateData.images.length) {
        let extraIndex = allUpdatedImages;
        $('.product-image img, .main-image img').each((_, el) => {
          if (extraIndex < templateData.images.length) {
            $(el).attr('src', templateData.images[extraIndex].url);
            extraIndex++;
          }
        });
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
          // Clear existing rows and add new ones
          specTable.find('tr:not(:first-child)').remove(); // Keep header row if exists
          
          templateData.specs.forEach(spec => {
            specTable.append(`
              <tr>
                <td class="tech-label">${spec.label}</td>
                <td class="tech-value">${spec.value}</td>
              </tr>
            `);
          });
          
          specsUpdated = true;
          break;
        }
      }
      
      // If no spec table found, look for div-based specs
      if (!specsUpdated) {
        const specDivs = $('.spec-item, .tech-item');
        if (specDivs.length) {
          specDivs.each((i, el) => {
            if (i < templateData.specs.length) {
              const spec = templateData.specs[i];
              $(el).find('.tech-label, .spec-label').text(spec.label);
              $(el).find('.tech-value, .spec-value').text(spec.value);
            }
          });
          specsUpdated = true;
        }
      }
    }
    
    // Update product description - preserve HTML formatting
    if (templateData.description) {
      let descriptionUpdated = false;
      
      // First try to find existing description elements
      $('.product-description, .description, .produktbeschreibung').each((_, el) => {
        $(el).html(templateData.description || '');
        descriptionUpdated = true;
      });
      
      // If no description found but there's a section titled "Produktbeschreibung"
      if (!descriptionUpdated) {
        $('.product-section h2, .section-title, .card-title').each((_, el) => {
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
      
      // If still no description section found, create one
      if (!descriptionUpdated) {
        // Find an appropriate place to add the description section
        const possibleTargets = [
          '.product-header', 
          '.gallery', 
          '.tech-section', 
          '.company-section'
        ];
        
        for (const target of possibleTargets) {
          const el = $(target).first();
          if (el.length) {
            el.before(`
              <div class="product-section">
                <h2 class="section-title">Produktbeschreibung</h2>
                <div class="product-description">${templateData.description || ''}</div>
              </div>
            `);
            break;
          }
        }
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
          
          cards.each((i, el) => {
            const sectionIndex = templateData.companyInfo.findIndex(s => s.id === section.id);
            if (i === sectionIndex) {
              // Update title
              $(el).find('.info-title, .card-title, h3').text(section.title);
              
              // Update description
              $(el).find('.info-description, .card-content, p').text(section.description);
              
              // Update SVG if possible
              const svgContainer = $(el).find('.icon, .svg-container, .card-icon');
              if (svgContainer.length) {
                svgContainer.html(section.svg);
              } else {
                // If no container found, try to replace the SVG directly
                $(el).find('svg').replaceWith(section.svg);
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
  
  // Create image gallery HTML
  const imageGallery = data.images.length > 0 
    ? `
      <div class="gallery">
        <div class="gallery-container">
          ${data.images.map((img, index) => `
            <div class="gallery-item" id="main${index + 1}">
              <img src="${img.url}" alt="Product image ${index + 1}" />
            </div>
          `).join('')}
        </div>
        <div class="thumbnail-sets">
          <div class="thumbnail-set set1" style="display: flex;">
            ${data.images.map((img, index) => `
              <div class="thumbnail">
                <img src="${img.url}" alt="Thumbnail ${index + 1}" />
              </div>
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
        ${data.companyInfo.map(info => `
          <div class="card info-card">
            <div class="card-icon">${info.svg}</div>
            <h3 class="info-title">${info.title}</h3>
            <p class="info-description">${info.description}</p>
          </div>
        `).join('')}
      </div>
    `
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
          display: flex;
          align-items: center;
          justify-content: center;
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
        }
        
        .thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        
        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
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
        
        .tech-table {
          width: 100%;
          border-collapse: collapse;
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
          gap: 20px;
          margin: 40px 0;
        }
        
        .info-card {
          padding: 20px;
          border-radius: var(--radius);
          background: var(--card-bg);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .card-icon {
          margin-bottom: 15px;
          color: var(--primary);
        }
        
        .info-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .info-description {
          color: var(--muted);
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="product-header">
          <h1 class="product-title">${data.title}</h1>
          ${data.subtitle ? `<p class="subtitle">${data.subtitle}</p>` : ''}
          ${data.price ? `<div class="price">${currencySymbol}${data.price}</div>` : ''}
        </div>
        
        ${imageGallery}
        
        ${data.description ? `
        <div class="product-section">
          <h2 class="section-title">Produktbeschreibung</h2>
          <div class="product-description">
            ${data.description}
          </div>
        </div>
        ` : ''}
        
        <div class="tech-section">
          <h2 class="section-title">Technical Specifications</h2>
          ${techSpecs}
        </div>
        
        <div class="company-section">
          <h2 class="section-title">About Our Company</h2>
          ${companyInfo}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Helper function to get currency symbol from currency code
 */
function getCurrencySymbol(currency: string): string {
  switch (currency.toUpperCase()) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'GBP':
      return '£';
    default:
      return '€';
  }
}
