import { TemplateData, TemplateStyle } from "@shared/schema";

/**
 * Generate HTML from template data using a specific template style
 * @param templateData The data to include in the template
 * @param templateStyle The style configuration to use
 */
export function generateStyledTemplate(
  templateData: TemplateData,
  templateStyle: TemplateStyle
): string {
  // Start with the style's HTML structure
  let html = templateStyle.htmlStructure;
  
  // Replace all placeholder variables with actual content
  // Title and basic info
  html = html.replace(/\{\{TITLE\}\}/g, templateData.title || '');
  html = html.replace(/\{\{SUBTITLE\}\}/g, templateData.subtitle || '');
  html = html.replace(/\{\{PRICE\}\}/g, templateData.price || '');
  html = html.replace(/\{\{CURRENCY\}\}/g, getCurrencySymbol(templateData.currency || 'USD'));
  html = html.replace(/\{\{DESCRIPTION\}\}/g, templateData.description || '');
  
  // Replace CSS styles
  let cssStyles = templateStyle.cssStyles;
  
  // Customize CSS with user-selected color preferences if provided
  if (templateData.colorPrimary) {
    cssStyles = cssStyles.replace(/var\(--color-primary[^)]*\)/g, templateData.colorPrimary);
  }
  if (templateData.colorSecondary) {
    cssStyles = cssStyles.replace(/var\(--color-secondary[^)]*\)/g, templateData.colorSecondary);
  }
  if (templateData.colorAccent) {
    cssStyles = cssStyles.replace(/var\(--color-accent[^)]*\)/g, templateData.colorAccent);
  }
  if (templateData.colorBackground) {
    cssStyles = cssStyles.replace(/var\(--color-background[^)]*\)/g, templateData.colorBackground);
  }
  if (templateData.colorText) {
    cssStyles = cssStyles.replace(/var\(--color-text[^)]*\)/g, templateData.colorText);
  }
  
  // Inject the customized CSS
  html = html.replace(/\{\{CSS_STYLES\}\}/g, cssStyles);
  
  // Generate images HTML
  let imagesHtml = '';
  if (templateData.images && templateData.images.length > 0) {
    // Main gallery images - all images with radio button selection
    const mainImagesHtml = templateData.images.map((img, idx) => `
      <input type="radio" name="gallery-select" id="gallery-select-${idx}" ${idx === 0 ? 'checked' : ''} class="gallery-select" />
      <div class="gallery-main-image" id="main-image-${idx}" data-id="${img.id}">
        <img src="${img.url}" alt="${templateData.title || 'Product'}" />
      </div>
    `).join('');
    
    // Thumbnail images with labels connected to radio buttons
    const thumbnailsHtml = templateData.images.map((img, idx) => `
      <label for="gallery-select-${idx}" class="thumbnail-item" data-for="main-image-${idx}" data-id="${img.id}">
        <img src="${img.url}" alt="Thumbnail ${idx + 1}" />
      </label>
    `).join('');
    
    // Create a complete gallery with pure CSS interaction
    imagesHtml = `
      <div class="product-gallery">
        <div class="gallery-main-wrapper">
          <div class="gallery-main">
            ${mainImagesHtml}
          </div>
        </div>
        
        <div class="gallery-thumbnails">
          <div class="thumbnail-scroll">
            ${thumbnailsHtml}
          </div>
        </div>
        
        <style>
          /* Simple gallery styles compatible with eBay listing restrictions */
          .product-gallery {
            margin-bottom: 30px;
          }
          
          .gallery-main-wrapper {
            position: relative;
            border: 1px solid #eee;
            border-radius: 4px;
            width: 100%;
            margin-bottom: 10px;
            text-align: center;
          }
          
          .gallery-main {
            position: relative;
            width: 100%;
            height: 400px;
          }
          
          .gallery-select {
            position: absolute;
            opacity: 0;
          }
          
          .gallery-main-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            text-align: center;
            display: none;
          }
          
          .gallery-main-image img {
            max-width: 100%;
            max-height: 100%;
            margin: 0 auto;
          }
          
          /* Show selected image - basic display property for eBay compatibility */
          .gallery-select:checked + .gallery-main-image {
            opacity: 1;
            display: block;
          }
          
          /* Thumbnails */
          .gallery-thumbnails {
            width: 100%;
            overflow-x: auto;
          }
          
          .thumbnail-scroll {
            display: table;
            width: 100%;
          }
          
          .thumbnail-item {
            display: inline-block;
            width: 80px;
            height: 80px;
            border: 2px solid #ddd;
            overflow: hidden;
            cursor: pointer;
            margin-right: 8px;
            margin-bottom: 8px;
          }
          
          .thumbnail-item img {
            width: 100%;
            height: 100%;
          }
          
          .thumbnail-item:hover {
            border-color: #3498db;
          }
          
          /* Selected thumbnail - basic selector for eBay compatibility */
          .gallery-select:checked ~ .gallery-thumbnails .thumbnail-item[data-for] {
            border-color: #ddd;
          }
          
          /* Individual selectors for thumbnails - eBay compatible */
          #gallery-select-0:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-0"],
          #gallery-select-1:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-1"],
          #gallery-select-2:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-2"],
          #gallery-select-3:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-3"],
          #gallery-select-4:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-4"],
          #gallery-select-5:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-5"],
          #gallery-select-6:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-6"],
          #gallery-select-7:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-7"],
          #gallery-select-8:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-8"],
          #gallery-select-9:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-9"] {
            border-color: #3498db;
          }
        </style>
      </div>
    `;
  }
  html = html.replace(/\{\{IMAGES\}\}/g, imagesHtml);
  
  // Generate specifications HTML
  let specsHtml = '';
  if (templateData.specs && templateData.specs.length > 0) {
    specsHtml = `
      <div class="specs-container">
        <h2 class="specs-title">Technical Specifications</h2>
        <div class="specs-list">
          ${templateData.specs.map(spec => `
            <div class="spec-item">
              <div class="spec-label">${spec.label}</div>
              <div class="spec-value">${spec.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  html = html.replace(/\{\{SPECS\}\}/g, specsHtml);
  
  // Generate company sections HTML
  let companySectionsHtml = '';
  if (templateData.companyInfo && templateData.companyInfo.length > 0) {
    companySectionsHtml = `
      <div class="company-sections">
        ${templateData.companyInfo.map(section => `
          <div class="company-section">
            <div class="company-section-icon">${section.svg}</div>
            <div class="company-section-title">${section.title}</div>
            <div class="company-section-description">${section.description}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  html = html.replace(/\{\{COMPANY_SECTIONS\}\}/g, companySectionsHtml);
  
  // Add minimal JavaScript for gallery - compatible with eBay restrictions
  const simpleGalleryJs = `
    // Basic thumbnail-to-main image selector for old browsers or when CSS selectors aren't fully supported
    document.addEventListener("DOMContentLoaded", function() {
      var thumbnails = document.querySelectorAll(".thumbnail-item");
      var mainImages = document.querySelectorAll(".gallery-main-image");
      
      for(var i = 0; i < thumbnails.length; i++) {
        thumbnails[i].onclick = function() {
          // Show this image
          var targetId = this.getAttribute("data-for");
          var targetImage = document.getElementById(targetId);
          
          // Hide all images
          for(var j = 0; j < mainImages.length; j++) {
            mainImages[j].style.display = "none";
            mainImages[j].style.opacity = "0";
          }
          
          // Show target image
          if(targetImage) {
            targetImage.style.display = "block";
            targetImage.style.opacity = "1";
          }
          
          // Remove active class from all thumbnails
          for(var k = 0; k < thumbnails.length; k++) {
            thumbnails[k].style.borderColor = "#ddd";
          }
          
          // Add active class to clicked thumbnail
          this.style.borderColor = "#3498db";
        };
      }
    });
  `;
  
  // Combine with any additional JS from the style
  if (templateStyle.jsInteractions) {
    html = html.replace(/\{\{JS_INTERACTIONS\}\}/g, simpleGalleryJs + templateStyle.jsInteractions);
  } else {
    html = html.replace(/\{\{JS_INTERACTIONS\}\}/g, simpleGalleryJs);
  }
  
  return html;
}

/**
 * Generate a default template when no style is selected
 * @param templateData The data to include in the template
 */
export function generateDefaultTemplate(templateData: TemplateData): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${templateData.title || 'Product'}</title>
    <style>
      :root {
        --color-primary: ${templateData.colorPrimary || '#3498db'};
        --color-secondary: ${templateData.colorSecondary || '#2c3e50'};
        --color-accent: ${templateData.colorAccent || '#e74c3c'};
        --color-background: ${templateData.colorBackground || '#ffffff'};
        --color-text: ${templateData.colorText || '#333333'};
        --font-heading: ${templateData.fontHeading || 'Arial, sans-serif'};
        --font-body: ${templateData.fontBody || 'Arial, sans-serif'};
      }
      
      body {
        font-family: var(--font-body);
        line-height: 1.6;
        color: var(--color-text);
        background-color: var(--color-background);
        margin: 0;
        padding: 0;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .product-header {
        margin-bottom: 30px;
      }
      
      .product-title {
        font-family: var(--font-heading);
        font-size: 32px;
        font-weight: bold;
        color: var(--color-secondary);
        margin-bottom: 10px;
      }
      
      .product-subtitle {
        font-size: 20px;
        color: #666;
        margin-bottom: 5px;
      }
      
      .product-price {
        font-size: 24px;
        font-weight: bold;
        color: var(--color-accent);
        margin-bottom: 20px;
      }
      
      /* Gallery styles */
      .product-gallery {
        margin-bottom: 30px;
      }
      
      .main-gallery {
        display: flex;
        justify-content: center;
        margin-bottom: 15px;
      }
      
      .gallery-image-container {
        max-width: 100%;
        height: auto;
        overflow: hidden;
      }
      
      .gallery-image {
        width: 100%;
        max-width: 600px;
        height: auto;
        object-fit: contain;
      }
      
      .thumbnails {
        display: flex;
        flex-wrap: nowrap;
        gap: 10px;
        overflow-x: auto;
        padding-bottom: 10px;
      }
      
      .thumbnail-container {
        flex: 0 0 auto;
        width: 80px;
        height: 80px;
        border: 2px solid #ddd;
        overflow: hidden;
        cursor: pointer;
      }
      
      .thumbnail-container:hover {
        border-color: var(--color-primary);
      }
      
      .thumbnail-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Description styles */
      .product-description {
        margin-bottom: 30px;
        line-height: 1.8;
      }
      
      /* Specification styles */
      .specs-container {
        margin-bottom: 30px;
      }
      
      .specs-title {
        font-family: var(--font-heading);
        font-size: 24px;
        font-weight: bold;
        color: var(--color-secondary);
        margin-bottom: 15px;
      }
      
      .specs-list {
        border: 1px solid #eee;
        border-radius: 4px;
      }
      
      .spec-item {
        display: flex;
        border-bottom: 1px solid #eee;
        padding: 12px 15px;
      }
      
      .spec-item:last-child {
        border-bottom: none;
      }
      
      .spec-label {
        font-weight: bold;
        width: 200px;
        color: var(--color-secondary);
      }
      
      .spec-value {
        flex: 1;
      }
      
      /* Company sections */
      .company-sections {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 40px;
      }
      
      .company-section {
        flex: 1;
        min-width: 300px;
        padding: 20px;
        border: 1px solid #eee;
        border-radius: 4px;
        background-color: #f9f9f9;
      }
      
      .company-section-icon {
        width: 60px;
        height: 60px;
        margin-bottom: 15px;
        color: var(--color-primary);
      }
      
      .company-section-title {
        font-family: var(--font-heading);
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        color: var(--color-secondary);
      }
      
      /* Responsive styles */
      @media (max-width: 768px) {
        .product-title {
          font-size: 28px;
        }
        
        .product-subtitle {
          font-size: 18px;
        }
        
        .company-section {
          min-width: 100%;
        }
        
        .spec-item {
          flex-direction: column;
        }
        
        .spec-label {
          width: 100%;
          margin-bottom: 5px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="product-header">
        <div class="product-title">${templateData.title}</div>
        ${templateData.subtitle ? `<div class="product-subtitle">${templateData.subtitle}</div>` : ''}
        ${templateData.price ? `<div class="product-price">${getCurrencySymbol(templateData.currency || 'USD')}${templateData.price}</div>` : ''}
      </div>
      
      ${templateData.images && templateData.images.length > 0 ? `
      <div class="product-gallery">
        <div class="gallery-main-wrapper">
          <div class="gallery-main">
            ${templateData.images.map((img, idx) => `
              <input type="radio" name="gallery-select" id="gallery-select-${idx}" ${idx === 0 ? 'checked' : ''} class="gallery-select" />
              <div class="gallery-main-image" id="main-image-${idx}" data-id="${img.id}">
                <img src="${img.url}" alt="${templateData.title || 'Product'}" />
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="gallery-thumbnails">
          <div class="thumbnail-scroll">
            ${templateData.images.map((img, idx) => `
              <label for="gallery-select-${idx}" class="thumbnail-item" data-for="main-image-${idx}" data-id="${img.id}">
                <img src="${img.url}" alt="Thumbnail ${idx + 1}" />
              </label>
            `).join('')}
          </div>
        </div>
        
        <style>
          .product-gallery {
            margin-bottom: 30px;
          }
          
          .gallery-main-wrapper {
            position: relative;
            border: 1px solid #eee;
            border-radius: 4px;
            aspect-ratio: 4/3;
            overflow: hidden;
            margin-bottom: 10px;
          }
          
          .gallery-main {
            position: relative;
            width: 100%;
            height: 100%;
          }
          
          .gallery-select {
            position: absolute;
            opacity: 0;
            pointer-events: none;
          }
          
          .gallery-main-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .gallery-main-image img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          
          /* Show selected image */
          .gallery-select:checked + .gallery-main-image {
            opacity: 1;
            z-index: 2;
          }
          
          /* Thumbnails */
          .gallery-thumbnails {
            width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: thin;
            scrollbar-color: #ddd #f7f7f7;
          }
          
          .thumbnail-scroll {
            display: flex;
            gap: 10px;
            padding-bottom: 5px;
          }
          
          .thumbnail-item {
            flex: 0 0 80px;
            height: 80px;
            border: 2px solid #ddd;
            overflow: hidden;
            cursor: pointer;
            display: block;
          }
          
          .thumbnail-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .thumbnail-item:hover {
            border-color: var(--color-primary);
          }
          
          /* Selected thumbnail */
          #gallery-select-0:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-0"],
          #gallery-select-1:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-1"],
          #gallery-select-2:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-2"],
          #gallery-select-3:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-3"],
          #gallery-select-4:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-4"],
          #gallery-select-5:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-5"],
          #gallery-select-6:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-6"],
          #gallery-select-7:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-7"],
          #gallery-select-8:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-8"],
          #gallery-select-9:checked ~ .gallery-thumbnails .thumbnail-item[data-for="main-image-9"] {
            border-color: var(--color-primary);
            position: relative;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .gallery-main-wrapper {
              aspect-ratio: 1/1;
            }
            
            .thumbnail-item {
              flex: 0 0 60px;
              height: 60px;
            }
          }
        </style>
      </div>
      ` : ''}
      
      ${templateData.description ? `
      <div class="product-description">
        ${templateData.description}
      </div>
      ` : ''}
      
      ${templateData.specs && templateData.specs.length > 0 ? `
      <div class="specs-container">
        <h2 class="specs-title">Technical Specifications</h2>
        <div class="specs-list">
          ${templateData.specs.map(spec => `
            <div class="spec-item">
              <div class="spec-label">${spec.label}</div>
              <div class="spec-value">${spec.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${templateData.companyInfo && templateData.companyInfo.length > 0 ? `
      <div class="company-sections">
        ${templateData.companyInfo.map(section => `
          <div class="company-section">
            <div class="company-section-icon">${section.svg}</div>
            <div class="company-section-title">${section.title}</div>
            <div class="company-section-description">${section.description}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
    
    <script>
      // Simple gallery interactivity - eBay compatible
      document.addEventListener('DOMContentLoaded', function() {
        // Basic thumbnail-to-main image selector for old browsers or when CSS selectors aren't fully supported
        var thumbnails = document.querySelectorAll(".thumbnail-item");
        var mainImages = document.querySelectorAll(".gallery-main-image");
        
        for(var i = 0; i < thumbnails.length; i++) {
          thumbnails[i].onclick = function() {
            // Show this image
            var targetId = this.getAttribute("data-for");
            var targetImage = document.getElementById(targetId);
            
            // Hide all images
            for(var j = 0; j < mainImages.length; j++) {
              mainImages[j].style.display = "none";
              mainImages[j].style.opacity = "0";
            }
            
            // Show target image
            if(targetImage) {
              targetImage.style.display = "block";
              targetImage.style.opacity = "1";
            }
            
            // Remove active class from all thumbnails
            for(var k = 0; k < thumbnails.length; k++) {
              thumbnails[k].style.borderColor = "#ddd";
            }
            
            // Add active class to clicked thumbnail
            this.style.borderColor = "#3498db";
          };
        }
      });
    </script>
  </body>
  </html>
  `;
}

/**
 * Helper function to get currency symbol from currency code
 */
function getCurrencySymbol(currency: string): string {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'KRW': '₩',
    'INR': '₹',
    'RUB': '₽',
    'BRL': 'R$',
    'CAD': 'C$',
    'AUD': 'A$',
  };
  
  return currencySymbols[currency] || currency;
}