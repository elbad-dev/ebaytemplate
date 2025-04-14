import { TemplateData, Image, TechSpec, CompanySection } from '../types';
import { nanoid } from 'nanoid';
import * as cheerio from 'cheerio';

/**
 * Parse an HTML template to extract editable elements
 */
export function parseTemplate(htmlContent: string): TemplateData {
  try {
    const $ = cheerio.load(htmlContent);
    
    // Extract title
    const title = $('title').text() || 'Product Title';
    
    // Extract images from gallery
    const images: Image[] = [];
    $('.gallery-item').each((i, el) => {
      const imgSrc = $(el).find('img').attr('src');
      if (imgSrc) {
        images.push({
          id: nanoid(),
          url: imgSrc
        });
      }
    });
    
    // If no images found, try finding img tags
    if (images.length === 0) {
      $('img').each((i, el) => {
        const imgSrc = $(el).attr('src');
        if (imgSrc) {
          images.push({
            id: nanoid(),
            url: imgSrc
          });
        }
      });
    }
    
    // Extract technical specifications
    const specs: TechSpec[] = [];
    
    // Try to find tech specs - look for common structures
    $('.tech-table tr, .specifications tr, .specs tr, .tech-specs tr').each((i, el) => {
      const label = $(el).find('td:first-child, th:first-child').text().trim();
      const value = $(el).find('td:last-child, th:last-child').text().trim();
      
      if (label && value) {
        specs.push({
          id: nanoid(),
          label,
          value
        });
      }
    });
    
    // Alternative pattern: .tech-label and .tech-value classes
    $('.tech-label').each((i, el) => {
      const label = $(el).text().trim();
      const value = $(el).next('.tech-value').text().trim();
      
      if (label && value) {
        specs.push({
          id: nanoid(),
          label,
          value
        });
      }
    });
    
    // Extract price if available
    let price = '';
    let currency = 'EUR';
    
    const priceEl = $('.price').first();
    if (priceEl.length) {
      const priceText = priceEl.text().trim();
      // Try to extract price and currency
      const priceMatch = priceText.match(/([€$£])?(\d+(?:,\d+)*(?:\.\d+)?)/);
      
      if (priceMatch) {
        price = priceMatch[2];
        
        // Determine currency
        if (priceMatch[1]) {
          switch (priceMatch[1]) {
            case '€':
              currency = 'EUR';
              break;
            case '$':
              currency = 'USD';
              break;
            case '£':
              currency = 'GBP';
              break;
          }
        }
      }
    }
    
    // Extract subtitle
    let subtitle = '';
    const possibleSubtitles = [
      '.subtitle', '.brand-subtitle', 'h2:first-of-type', '.product-subtitle'
    ];
    
    for (const selector of possibleSubtitles) {
      const subtitleEl = $(selector).first();
      if (subtitleEl.length) {
        subtitle = subtitleEl.text().trim();
        break;
      }
    }
    
    // Extract company info sections
    const companyInfo: CompanySection[] = [];
    
    // Find company info cards - common class patterns
    $('.info-card, .company-card, .info-section, .company-section').each((i, el) => {
      const title = $(el).find('.info-title, .card-title, h3').text().trim();
      const description = $(el).find('.info-description, .card-content, p').text().trim();
      
      // Try to find SVG
      let svg = $(el).find('svg').toString() || '';
      if (!svg) {
        // If no SVG found directly, try finding it in a container
        const svgContainer = $(el).find('.icon, .svg-container, .card-icon');
        if (svgContainer.length) {
          svg = svgContainer.html() || '';
        }
      }
      
      // Add to company sections even if incomplete - user can fill in missing data
      companyInfo.push({
        id: nanoid(),
        title: title || `Section ${i + 1}`,
        description: description || '',
        svg: svg || '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'
      });
    });
    
    // If no company sections found, create default placeholder sections
    if (companyInfo.length === 0) {
      for (let i = 0; i < 3; i++) {
        companyInfo.push({
          id: nanoid(),
          title: `Company Section ${i + 1}`,
          description: 'Add description here',
          svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'
        });
      }
    }
    
    return {
      title,
      subtitle,
      price,
      currency,
      images,
      specs,
      companyInfo,
      rawHtml: htmlContent
    };
  } catch (error) {
    console.error('Error parsing template:', error);
    // Return a default template data structure
    return {
      title: 'Product Title',
      subtitle: '',
      price: '',
      currency: 'EUR',
      images: [],
      specs: [],
      companyInfo: [
        {
          id: nanoid(),
          title: 'Company Section 1',
          description: 'Add description here',
          svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'
        },
        {
          id: nanoid(),
          title: 'Company Section 2',
          description: 'Add description here',
          svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'
        },
        {
          id: nanoid(),
          title: 'Company Section 3',
          description: 'Add description here',
          svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'
        }
      ],
      rawHtml: htmlContent
    };
  }
}
