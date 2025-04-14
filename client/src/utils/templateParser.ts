import { TemplateData, Image, TechSpec, CompanySection } from '../types';
import { nanoid } from 'nanoid';
import * as cheerio from 'cheerio';

/**
 * Parse an HTML template to extract editable elements
 */
export function parseTemplate(htmlContent: string): TemplateData {
  try {
    const $ = cheerio.load(htmlContent);
    
    // Extract title from specific product info section (templates)
    let title = '';
    
    // Method 1: Try to find product title from h2 in product-info section
    const productInfoTitle = $('.product-info h2').text().trim();
    if (productInfoTitle && productInfoTitle.includes('Professioneller Werkzeugsatz Premium')) {
      title = productInfoTitle;
    } 
    // Method 2: Look for title near the price section
    else {
      // Find the text that contains "Professioneller Werkzeugsatz Premium" above price
      const priceEl = $('.price').first();
      if (priceEl.length) {
        // Get all headings and text elements that might contain the title
        let foundTitle = false;
        
        // Try to locate the title by looking at headers and text blocks above the price
        $('.card h2, .product-title, .card-title, h2').each((_, el) => {
          const text = $(el).text().trim();
          if (text.includes('Professioneller Werkzeugsatz Premium')) {
            title = text;
            foundTitle = true;
            return false; // Break the loop
          }
        });
        
        if (!foundTitle) {
          // If not found in headers, try paragraphs and other text elements
          $('.card p, .description, .product-description').each((_, el) => {
            const text = $(el).text().trim();
            if (text.includes('Professioneller Werkzeugsatz Premium')) {
              title = text;
              return false; // Break the loop
            }
          });
        }
      }
      
      // Fallback to other common title locations if still not found
      if (!title) {
        title = $('.product-title, h1.title, h1, .product-info h2').first().text().trim() || $('title').text();
      }
    }
    
    // Extract images - specifically from eBay product galleries with image URLs from i.ebayimg.com
    const images: Image[] = [];
    const imageMap = new Map<string, boolean>(); // To track duplicates
    
    // Look for both main and thumbnail images
    const mainImages = new Map<string, string>(); // id -> url mapping for main images
    const thumbnailImages = new Map<string, string>(); // id -> url mapping for thumbnails
    
    // First collect all main gallery images
    $('.gallery-item').each((i, el) => {
      const src = $(el).attr('src');
      const id = $(el).attr('id');
      
      if (src && id && src.includes('i.ebayimg.com/images/') && !src.includes('ebay-logo')) {
        mainImages.set(id, src);
      }
    });
    
    // Then collect thumbnails that correspond to main images
    $('.thumbnail img').each((i, el) => {
      const src = $(el).attr('src');
      const label = $(el).closest('label').attr('for');
      
      // If this thumbnail corresponds to a main image and it's from the target platform, remember it
      if (label && src && src.includes('i.ebayimg.com/images/') && !src.includes('ebay-logo')) {
        thumbnailImages.set(label, src);
      }
    });
    
    // Now add unique images giving preference to main images
    // Convert Map.entries() to Array to avoid iteration issues with older TypeScript targets
    Array.from(mainImages.entries()).forEach(([id, url]) => {
      if (!imageMap.has(url)) {
        images.push({
          id: nanoid(),
          url
        });
        imageMap.set(url, true);
      }
    });
    
    // If no product images found, try finding any img tags with the target platform URLs
    if (images.length === 0) {
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.includes('i.ebayimg.com/images/') && !src.includes('ebay-logo') && !imageMap.has(src)) {
          images.push({
            id: nanoid(),
            url: src
          });
          imageMap.set(src, true);
        }
      });
    }
    
    // Extract technical specifications
    const specs: TechSpec[] = [];
    
    // Try to find tech specs - look for common structures
    $('.tech-specs tr, .specifications tr, .specs tr, .tech-specs tr, .tech-table tr').each((i, el) => {
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
    
    // Extract the logo
    let logo = '';
    
    // Look for logo images in common logo locations
    $('img[src*="logo"], img.logo, .header-logo img, .brand-logo img, .logo img, header img').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        logo = src;
        return false; // Break the loop
      }
    });
    
    // If no logo found, check for SVG logo
    if (!logo) {
      $('.logo svg, .header-logo svg, .brand-logo svg').each((_, el) => {
        logo = $.html(el);
        return false; // Break the loop
      });
    }
    
    // Extract product description from "Produktbeschreibung" section
    let description = '';
    
    // Method 1: Look for a section with title "Produktbeschreibung"
    $('.product-section h2, .section-title, .card-title').each((_, el) => {
      const title = $(el).text().trim();
      if (title.includes('Produktbeschreibung')) {
        const parent = $(el).parent();
        const descriptionEl = parent.find('p, .description, .content').first();
        if (descriptionEl.length) {
          // Preserve the HTML content to keep formatting, colors, and spaces
          description = descriptionEl.html() || '';
          return false; // Break the loop
        }
      }
    });
    
    // Method 2: Look for div with class or ID containing "description"
    if (!description) {
      const descriptionEl = $('.product-description, #description, .description, .produktbeschreibung').first();
      if (descriptionEl.length) {
        // Preserve the HTML content to keep formatting, colors, and spaces
        description = descriptionEl.html() || '';
      }
    }
    
    // Extract company info sections
    const companyInfo: CompanySection[] = [];
    
    // Find company info cards - from template
    $('.info-cards .card').each((i, el) => {
      const title = $(el).find('h3').text().trim();
      const description = $(el).find('p').text().trim();
      
      // Extract SVG from the info-icon container
      let svg = '';
      const infoIcon = $(el).find('.info-icon');
      if (infoIcon.length) {
        svg = infoIcon.html() || '';
      }
      
      // Add to company sections
      companyInfo.push({
        id: nanoid(),
        title: title || `Section ${i + 1}`,
        description: description || '',
        svg: svg || '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'
      });
    });
    
    // Fallback to other common info card patterns if none found
    if (companyInfo.length === 0) {
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
    }
    
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
      description,
      logo,
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
      description: '',
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
