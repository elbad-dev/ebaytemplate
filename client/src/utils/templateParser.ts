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
    // Try alternative location (product info in header)
    const headerTitle = doc.querySelector('.product-info h2');
    if (headerTitle) {
      data.title = headerTitle.textContent?.trim() || '';
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
    for (const section of productInfoSections) {
      const h2 = section.querySelector('h2');
      if (h2 && (h2.textContent?.includes('Produktbeschreibung') || h2.textContent?.includes('Product Description'))) {
        const descriptionDiv = section.querySelector('div:not(.tags):not(.button-container)');
        if (descriptionDiv) {
          data.description = descriptionDiv.innerHTML || '';
          break;
        }
      }
    }
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
  
  // Extract images
  const mainImage = doc.querySelector('.main-image img');
  if (mainImage) {
    const src = mainImage.getAttribute('src');
    if (src && !src.includes('placeholder')) {
      data.images.push({ id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`, url: src });
    }
  }
  
  // Extract thumbnails (except for the ones that match the main image)
  const thumbnails = doc.querySelectorAll('.thumbnail img, .gallery-item img');
  thumbnails.forEach((img, index) => {
    const src = img.getAttribute('src');
    if (src && !src.includes('placeholder') && !data.images.some(image => image.url === src)) {
      data.images.push({ id: `img-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`, url: src });
    }
  });
  
  // Extract tech specs
  const specItems = doc.querySelectorAll('.spec-item');
  specItems.forEach((item, index) => {
    const nameEl = item.querySelector('.spec-name');
    const valueEl = item.querySelector('.spec-value');
    
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
  
  // Process each company section
  companySections.forEach((section, index) => {
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