import { TemplateData } from '../types';
import DOMPurify from 'dompurify';

/**
 * Parses an HTML template to extract editable data
 */
export function parseTemplate(html: string): TemplateData {
  // Create a temporary DOM to parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Extract template data
  const data: TemplateData = {
    title: '',
    company_name: '',
    subtitle: '',
    price: '',
    currency: 'EUR',
    description: '',
    images: [],
    specs: [],
    companyInfo: [],
    rawHtml: html
  };
  
  // Extract company name
  const brandText = doc.querySelector('.brand-text h1');
  if (brandText) {
    data.company_name = brandText.textContent?.trim() || '';
  }
  
  // Extract subtitle/slogan
  const subtitle = doc.querySelector('.brand-text p');
  if (subtitle) {
    data.subtitle = subtitle.textContent?.trim() || '';
  }
  
  // Extract product title (first check the product card title)
  const productTitle = doc.querySelector('.product-card h2.product-title, .product-card h2');
  if (productTitle) {
    data.title = productTitle.textContent?.trim() || '';
  } else {
    // Try product info section looking for the first h2 that's not Produktbeschreibung
    const productInfoCards = doc.querySelectorAll('.product-info .card');
    for (let i = 0; i < productInfoCards.length; i++) {
      const card = productInfoCards[i];
      const h2 = card.querySelector('h2');
      if (h2 && 
          !h2.textContent?.includes('Produktbeschreibung') && 
          !h2.textContent?.includes('Product Description') &&
          !h2.textContent?.includes('Technische Daten') &&
          !h2.textContent?.includes('Technical Data')) {
        data.title = h2.textContent?.trim() || '';
        break;
      }
    }
    
    // If still no title, try any first h2 in product-info
    if (!data.title) {
      const headerTitle = doc.querySelector('.product-info h2');
      if (headerTitle) {
        data.title = headerTitle.textContent?.trim() || '';
      }
    }
  }
  
  // Extract price
  const priceEl = doc.querySelector('.price');
  if (priceEl) {
    const priceText = priceEl.textContent?.trim() || '';
    // Try to extract currency and price
    const currencyMatch = priceText.match(/^([^0-9]+)/);
    const priceMatch = priceText.match(/([0-9.,]+)/);
    
    if (currencyMatch && currencyMatch[1]) {
      data.currency = currencyMatch[1].trim();
    }
    
    if (priceMatch && priceMatch[1]) {
      data.price = priceMatch[1].trim();
    }
  }
  
  // Extract description (first look for the specific description section)
  // Look for h2 with "Produktbeschreibung" text first
  const descriptionHeading = Array.from(doc.querySelectorAll('h2, h3')).find(h => 
    h.textContent?.includes('Produktbeschreibung') || 
    h.textContent?.includes('Product Description'));
  
  if (descriptionHeading) {
    // Get the parent element of the heading - which is likely the container
    const container = descriptionHeading.parentElement;
    if (container) {
      // Try to find the div containing the description right after the heading
      const descriptionDiv = container.querySelector('div');
      if (descriptionDiv) {
        data.description = descriptionDiv.innerHTML || '';
      }
      
      // If no div found, try paragraphs
      if (!data.description && container.querySelectorAll('p').length > 0) {
        const paragraphs = container.querySelectorAll('p');
        const descriptionHtml = Array.from(paragraphs)
          .map(p => p.outerHTML)
          .join('');
        data.description = descriptionHtml;
      }
    }
  } 
  
  // If still no description, try to find a product-card or product-info description
  if (!data.description) {
    const productInfoSections = doc.querySelectorAll('.product-info .card, .product-card');
    // Convert NodeList to Array to safely iterate
    Array.from(productInfoSections).forEach(section => {
      const h2 = section.querySelector('h2');
      if (h2 && (h2.textContent?.includes('Produktbeschreibung') || h2.textContent?.includes('Product Description'))) {
        const descriptionDiv = section.querySelector('div:not(.tags):not(.button-container)');
        if (descriptionDiv && !data.description) {
          data.description = descriptionDiv.innerHTML || '';
        }
      }
    });
  }
  
  // Last resort - try direct approach if no heading found
  if (!data.description) {
    const descriptionEl = doc.querySelector('.description-text');
    if (descriptionEl) {
      data.description = descriptionEl.innerHTML || '';
    }
  }
  
  // Ensure description HTML is sanitized
  if (data.description) {
    // In a browser environment, use DOMPurify to sanitize HTML
    if (typeof DOMPurify !== 'undefined') {
      data.description = DOMPurify.sanitize(data.description);
    }
  }
  
  // Extract images - multiple approaches to find all possible images
  
  // 1. Look for main image first
  const mainImage = doc.querySelector('.main-image img');
  if (mainImage) {
    const src = mainImage.getAttribute('src');
    if (src && !src.includes('placeholder')) {
      data.images.push({ id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`, url: src });
    }
  }
  
  // 2. Look for gallery items and image containers
  const galleryItems = doc.querySelectorAll('.gallery-item img, .gallery-container img, .gallery img');
  Array.from(galleryItems).forEach((img, index) => {
    const src = img.getAttribute('src');
    if (src && !src.includes('placeholder') && !data.images.some(image => image.url === src)) {
      data.images.push({ id: `img-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`, url: src });
    }
  });
  
  // 3. Look for thumbnails
  const thumbnails = doc.querySelectorAll('.thumbnail img');
  Array.from(thumbnails).forEach((img, index) => {
    const src = img.getAttribute('src');
    if (src && !src.includes('placeholder') && !data.images.some(image => image.url === src)) {
      data.images.push({ id: `img-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`, url: src });
    }
  });
  
  // 4. Last resort - look for any images
  if (data.images.length === 0) {
    const allImages = doc.querySelectorAll('img');
    Array.from(allImages)
      .filter(img => {
        const src = img.getAttribute('src');
        return src && 
              src.indexOf('placeholder') === -1 && 
              src.indexOf('icon') === -1 && 
              src.indexOf('logo') === -1 &&
              (
                (src.indexOf('webp') > -1) || 
                (src.indexOf('jpg') > -1) || 
                (src.indexOf('jpeg') > -1) || 
                (src.indexOf('png') > -1)
              );
      })
      .forEach((img, index) => {
        const src = img.getAttribute('src');
        if (src && !data.images.some(image => image.url === src)) {
          data.images.push({ id: `img-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`, url: src });
        }
      });
  }
  
  // Extract tech specs - first try standard spec items
  let specItems = doc.querySelectorAll('.spec-item, .tech-item');
  
  // If no specs found, look for tech-data section
  if (!specItems.length) {
    const techData = doc.querySelector('.tech-data, .tech-specs');
    if (techData) {
      specItems = techData.querySelectorAll('.tech-item');
    }
  }
  
  // Convert NodeList to Array for safer iteration
  Array.from(specItems).forEach((item, index) => {
    // Try different class combinations for spec names and values
    const nameEl = item.querySelector('.spec-name, .tech-label');
    const valueEl = item.querySelector('.spec-value, .tech-value');
    
    if (nameEl && valueEl) {
      data.specs.push({
        id: `spec-${index + 1}`,
        label: nameEl.textContent?.trim() || '',
        value: valueEl.textContent?.trim() || ''
      });
    }
  });
  
  // Extract company info sections - first try direct company-section classes
  let companySections = doc.querySelectorAll('.company-section');
  
  // If no company sections found, look for company-info and info-cards
  if (!companySections.length) {
    const companyInfo = doc.querySelector('.company-info');
    if (companyInfo) {
      const infoCards = companyInfo.querySelectorAll('.info-cards .card');
      companySections = infoCards;
    }
  }
  
  // Process each company section - convert NodeList to Array for safer iteration
  Array.from(companySections).forEach((section, index) => {
    const id = section.id || `company-section-${index + 1}`;
    
    // Try to find icon container with different selectors
    const iconContainer = section.querySelector('.icon-container, .info-icon');
    let svg = '';
    if (iconContainer) {
      svg = iconContainer.innerHTML || '';
    }
    
    // Try to find title with various selectors
    let titleEl = section.querySelector('.section-content h3, h3, h4');
    if (!titleEl && section.classList.contains('card')) {
      titleEl = section.querySelector('h3');
    }
    
    // Try to find description with various selectors
    let descEl = section.querySelector('.section-content p, p');
    
    // Only add if we have either a title or description
    if (titleEl || descEl) {
      data.companyInfo.push({
        id,
        title: titleEl ? titleEl.textContent?.trim() || '' : '',
        description: descEl ? descEl.textContent?.trim() || '' : '',
        svg
      });
    }
  });
  
  return data;
}