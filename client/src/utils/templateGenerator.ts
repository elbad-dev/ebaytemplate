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
      const headerTitleRegex = /<div\s+class="product-info"[^>]*>.*?<h2[^>]*>(.*?)<\/h2>/;
      if (headerTitleRegex.test(html)) {
        html = html.replace(headerTitleRegex, (match) => {
          return match.replace(/<h2[^>]*>(.*?)<\/h2>/, `<h2>${ data.title }</h2>`);
        });
      }
      
      // Finally try product card title but avoid company sections
      const productCardTitleRegex = /<div\s+class="(?!brand-text|company)[^"]*">.*?<h2[^>]*>(.*?)<\/h2>/;
      if (productCardTitleRegex.test(html)) {
        html = html.replace(productCardTitleRegex, (match) => {
          // Only replace if not in a company or brand section
          if (!match.includes('brand-text') && !match.includes('company-section')) {
            return match.replace(/<h2[^>]*>(.*?)<\/h2>/, `<h2>${ data.title }</h2>`);
          }
          return match;
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
      // Specifically target the description section with a heading
      const descriptionRegex = /<h3>Produktbeschreibung<\/h3>\s*<div\s+class="description-text"[^>]*>.*?<\/div>/;
      if (descriptionRegex.test(html)) {
        html = html.replace(descriptionRegex, `<h3>Produktbeschreibung</h3><div class="description-text">${ data.description }</div>`);
      } else {
        // Alternative pattern
        const altDescriptionRegex = /<div\s+class="description-text"[^>]*>.*?<\/div>/;
        if (altDescriptionRegex.test(html)) {
          html = html.replace(altDescriptionRegex, `<div class="description-text">${ data.description }</div>`);
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
      data.companyInfo.forEach(section => {
        if (section.id) {
          const sectionRegex = new RegExp(`<div\\s+id="${section.id}"[^>]*>.*?<\\/div>`);
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
    }
    
    // Handle image gallery
    if (data.images.length > 0) {
      // Main image - using multiline matching without 's' flag
      const mainImageRegex = /<div\s+class="main-image"[^>]*>[\s\S]*?<img[^>]*src="[^"]*"[^>]*>[\s\S]*?<\/div>/;
      if (mainImageRegex.test(html)) {
        html = html.replace(mainImageRegex, `<div class="main-image"><img src="${data.images[0].url}" alt="Product image"></div>`);
      }
      
      // Thumbnail gallery
      const thumbnailsContent = data.images.map(image => `
        <div class="thumbnail">
          <img src="${image.url}" alt="Product thumbnail">
        </div>
      `).join('');
      
      const thumbnailsRegex = /<div\s+class="thumbnails"[^>]*>[\s\S]*?<\/div>/;
      if (thumbnailsRegex.test(html)) {
        html = html.replace(thumbnailsRegex, `<div class="thumbnails">${ thumbnailsContent }</div>`);
      }
      
      // Update image gallery if it exists
      const galleryImagesContent = data.images.map(image => `
        <div class="gallery-item">
          <img src="${image.url}" alt="Product image">
        </div>
      `).join('');
      
      const galleryRegex = /<div\s+class="gallery-container"[^>]*>[\s\S]*?<\/div>/;
      if (galleryRegex.test(html)) {
        html = html.replace(galleryRegex, `<div class="gallery-container">${ galleryImagesContent }</div>`);
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
        <div class="main-image">
          <img src="${data.images[0].url}" alt="Product image">
        </div>
        <div class="thumbnails">
          ${data.images.map(image => `
            <div class="thumbnail">
              <img src="${image.url}" alt="Product thumbnail">
            </div>
          `).join('')}
        </div>
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