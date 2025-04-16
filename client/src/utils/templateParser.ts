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
  const descriptionHeading = Array.from(doc.querySelectorAll('h3')).find(h => 
    h.textContent?.includes('Produktbeschreibung') || 
    h.textContent?.includes('Product Description'));
  
  if (descriptionHeading) {
    // Try to find the description text after this heading
    let descriptionTextEl = descriptionHeading.nextElementSibling;
    if (descriptionTextEl && descriptionTextEl.classList.contains('description-text')) {
      data.description = descriptionTextEl.innerHTML || '';
    } else {
      // Try to find a container with the description-text class
      const parentElement = descriptionHeading.parentElement;
      if (parentElement) {
        descriptionTextEl = parentElement.querySelector('.description-text');
        if (descriptionTextEl) {
          data.description = descriptionTextEl.innerHTML || '';
        }
      }
    }
  } else {
    // Try direct approach if no heading found
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
  
  // Extract company info sections
  const companySections = doc.querySelectorAll('.company-section');
  companySections.forEach((section, index) => {
    const id = section.id || `company-section-${index + 1}`;
    const titleEl = section.querySelector('.section-content h3, h3');
    const contentEl = section.querySelector('.section-content p, p');
    const iconContainer = section.querySelector('.icon-container');
    
    if (titleEl && contentEl) {
      data.companyInfo.push({
        id,
        title: titleEl.textContent?.trim() || '',
        description: contentEl.textContent?.trim() || '',
        svg: iconContainer ? iconContainer.innerHTML || '' : ''
      });
    }
  });
  
  return data;
}