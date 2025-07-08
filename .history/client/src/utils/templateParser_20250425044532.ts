import { TemplateData } from '../types';
import DOMPurify from 'dompurify';

/**
 * Parses an HTML template to extract editable data
 */
export function parseTemplate(html: string): TemplateData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
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
  
  // Extract company name and logo
  const brandSection = doc.querySelector('.brand-section, .company-info');
  if (brandSection) {
    const brandName = brandSection.querySelector('.brand-name, .company-name');
    if (brandName) {
      data.company_name = brandName.textContent?.trim() || '';
    }
    
    const brandLogo = brandSection.querySelector('.brand-logo img, .company-logo img');
    if (brandLogo) {
      const logoSrc = brandLogo.getAttribute('src');
      if (logoSrc) {
        data.logo = logoSrc;
      }
    }
  }
  
  // Extract subtitle/slogan
  const subtitle = doc.querySelector('.brand-slogan, .company-slogan, .subtitle');
  if (subtitle) {
    data.subtitle = subtitle.textContent?.trim() || '';
  }
  
  // Extract product title (try multiple patterns)
  const titleSelectors = [
    '.product-title',
    '.product-name',
    '.product-info h1',
    '.product-card h2',
    '.main-content h1'
  ];

  for (const selector of titleSelectors) {
    const titleElement = doc.querySelector(selector);
    if (titleElement) {
      data.title = titleElement.textContent?.trim() || '';
      break;
    }
  }
  
  // Extract price and currency
  const priceElement = doc.querySelector('.price, .product-price');
  if (priceElement) {
    const priceText = priceElement.textContent?.trim() || '';
    const currencyMatch = priceText.match(/^([€$£¥]|\w{3})\s*/);
    const priceMatch = priceText.match(/[\d.,]+/);
    
    if (currencyMatch) {
      const currencySymbol = currencyMatch[1];
      // Map common currency symbols to codes
      const currencyMap: { [key: string]: string } = {
        '€': 'EUR',
        '$': 'USD',
        '£': 'GBP',
        '¥': 'JPY'
      };
      data.currency = currencyMap[currencySymbol] || currencySymbol;
    }
    
    if (priceMatch) {
      data.price = priceMatch[0];
    }
  }

  // Extract description using multiple patterns
  const descriptionSelectors = [
    '.product-description',
    '.description-text',
    '.product-info .description',
    '.product-content .description'
  ];

  for (const selector of descriptionSelectors) {
    const descElement = doc.querySelector(selector);
    if (descElement) {
      data.description = DOMPurify.sanitize(descElement.innerHTML);
      break;
    }
  }

  // If no description found, try finding it after a description heading
  if (!data.description) {
    const headings = Array.from(doc.querySelectorAll('h2, h3'));
    for (const heading of headings) {
      if (heading.textContent?.toLowerCase().includes('description') || 
          heading.textContent?.toLowerCase().includes('beschreibung')) {
        const nextElement = heading.nextElementSibling;
        if (nextElement) {
          data.description = DOMPurify.sanitize(nextElement.innerHTML);
          break;
        }
      }
    }
  }

  // Extract images from various gallery patterns
  const galleryImages = new Set<string>();
  
  // Try multiple image container patterns
  const imageContainers = doc.querySelectorAll(
    '.gallery img, .product-gallery img, .gallery-main img, .gallery-thumbnails img'
  );
  
  imageContainers.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.includes('placeholder') && !src.includes('logo')) {
      galleryImages.add(src);
    }
  });

  // Convert gallery images to required format
  data.images = Array.from(galleryImages).map((url, index) => ({
    id: `img-${Date.now()}-${index}`,
    url
  }));

  // Extract specifications
  const specContainers = doc.querySelectorAll('.spec-item, .tech-item, .specification-item');
  specContainers.forEach((spec, index) => {
    const label = spec.querySelector('.spec-label, .tech-label, .label');
    const value = spec.querySelector('.spec-value, .tech-value, .value');
    
    if (label && value) {
      data.specs.push({
        id: `spec-${index}`,
        label: label.textContent?.trim() || '',
        value: value.textContent?.trim() || ''
      });
    }
  });

  // Extract company info sections
  const companySecConditions = [
    '.company-section',
    '.info-card',
    '.about-section',
    '.company-info-item'
  ];

  let companySections: NodeListOf<Element> = doc.querySelectorAll(companySecConditions.join(', '));
  
  Array.from(companySections).forEach((section, index) => {
    const id = section.id || `company-section-${index}`;
    const iconContainer = section.querySelector('.icon-container, .info-icon, .section-icon');
    const titleElement = section.querySelector('h3, h4, .section-title');
    const descElement = section.querySelector('p, .section-description');
    
    const svg = iconContainer ? iconContainer.innerHTML : '';
    const title = titleElement ? titleElement.textContent?.trim() : '';
    const description = descElement ? descElement.textContent?.trim() : '';
    
    if (title || description) {
      data.companyInfo.push({
        id,
        title: title || '',
        description: description || '',
        svg: svg || ''
      });
    }
  });

  return data;
}