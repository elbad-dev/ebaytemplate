import { db } from '../server/db';
import { templateStyles, svgIcons } from '../shared/schema';

// Seed template styles for different product types and visual styles
async function seedTemplateStyles() {
  console.log('Seeding template styles...');
  
  const styles = [
    // Modern product template
    {
      name: 'Modern Product Showcase',
      description: 'A clean, modern template with a focus on product images and sleek design elements.',
      thumbnail: '/styles/modern-product.jpg',
      type: 'product',
      style: 'modern',
      colorScheme: 'light',
      htmlStructure: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{{TITLE}}</title>
          <style>
            {{CSS_STYLES}}
          </style>
        </head>
        <body>
          <div class="container">
            <header class="product-header">
              <h1 class="product-title">{{TITLE}}</h1>
              <p class="product-subtitle">{{SUBTITLE}}</p>
              <div class="product-price">{{CURRENCY}}{{PRICE}}</div>
            </header>
            
            {{IMAGES}}
            
            <div class="product-content">
              <div class="product-description">
                {{DESCRIPTION}}
              </div>
              
              {{SPECS}}
            </div>
            
            {{COMPANY_SECTIONS}}
          </div>
          <script>
            {{JS_INTERACTIONS}}
          </script>
        </body>
        </html>
      `,
      cssStyles: `
        :root {
          --color-primary: #3498db;
          --color-secondary: #2c3e50;
          --color-accent: #e74c3c;
          --color-background: #ffffff;
          --color-text: #333333;
          --font-primary: 'Arial', sans-serif;
          --font-secondary: 'Georgia', serif;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: var(--font-primary);
          color: var(--color-text);
          background-color: var(--color-background);
          line-height: 1.6;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .product-header {
          margin-bottom: 30px;
          text-align: center;
        }
        
        .product-title {
          font-size: 36px;
          color: var(--color-secondary);
          margin-bottom: 10px;
        }
        
        .product-subtitle {
          font-size: 18px;
          color: #666;
          margin-bottom: 15px;
        }
        
        .product-price {
          font-size: 28px;
          font-weight: bold;
          color: var(--color-accent);
        }
        
        .product-gallery {
          margin-bottom: 40px;
        }
        
        .main-gallery {
          display: flex;
          justify-content: center;
          margin-bottom: 15px;
        }
        
        .gallery-image-container {
          max-width: 600px;
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .gallery-image {
          width: 100%;
          height: auto;
        }
        
        .thumbnails {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .thumbnail-container {
          width: 80px;
          height: 80px;
          overflow: hidden;
          border-radius: 4px;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.3s, transform 0.3s;
        }
        
        .thumbnail-container:hover {
          opacity: 1;
          transform: translateY(-2px);
        }
        
        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .product-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        
        .product-description {
          line-height: 1.8;
        }
        
        .specs-container {
          margin-bottom: 40px;
        }
        
        .specs-title {
          font-size: 24px;
          color: var(--color-secondary);
          margin-bottom: 15px;
          border-bottom: 2px solid var(--color-primary);
          padding-bottom: 5px;
        }
        
        .specs-list {
          display: grid;
          gap: 10px;
        }
        
        .spec-item {
          display: grid;
          grid-template-columns: 1fr 2fr;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        
        .spec-label {
          font-weight: bold;
          color: var(--color-secondary);
        }
        
        .company-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 60px;
          text-align: center;
        }
        
        .company-section {
          padding: 30px 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          transition: transform 0.3s;
        }
        
        .company-section:hover {
          transform: translateY(-5px);
        }
        
        .company-section-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 15px;
          color: var(--color-primary);
        }
        
        .company-section-title {
          font-size: 20px;
          color: var(--color-secondary);
          margin-bottom: 10px;
        }
        
        @media (max-width: 768px) {
          .product-content {
            grid-template-columns: 1fr;
          }
          
          .product-title {
            font-size: 28px;
          }
          
          .product-price {
            font-size: 24px;
          }
        }
      `,
      jsInteractions: `
        document.addEventListener('DOMContentLoaded', function() {
          const thumbnails = document.querySelectorAll('.thumbnail-container');
          const mainImage = document.querySelector('.gallery-image');
          
          if (thumbnails.length > 0 && mainImage) {
            thumbnails.forEach(thumb => {
              thumb.addEventListener('click', function() {
                const imgSrc = this.querySelector('img').src;
                mainImage.src = imgSrc;
                
                // Update active state
                thumbnails.forEach(t => t.style.opacity = '0.7');
                this.style.opacity = '1';
              });
            });
          }
        });
      `,
      createdAt: new Date().toISOString(),
    },
    
    // Classic product template
    {
      name: 'Classic Product Detail',
      description: 'A traditional template with emphasis on product features and technical details.',
      thumbnail: '/styles/classic-product.jpg',
      type: 'product',
      style: 'classic',
      colorScheme: 'light',
      htmlStructure: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{{TITLE}}</title>
          <style>
            {{CSS_STYLES}}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="product-container">
              <div class="product-images">
                {{IMAGES}}
              </div>
              
              <div class="product-details">
                <h1 class="product-title">{{TITLE}}</h1>
                <h2 class="product-subtitle">{{SUBTITLE}}</h2>
                <div class="product-price">{{CURRENCY}}{{PRICE}}</div>
                
                <div class="product-description">
                  {{DESCRIPTION}}
                </div>
                
                {{SPECS}}
              </div>
            </div>
            
            {{COMPANY_SECTIONS}}
          </div>
          <script>
            {{JS_INTERACTIONS}}
          </script>
        </body>
        </html>
      `,
      cssStyles: `
        :root {
          --color-primary: #4a6fa5;
          --color-secondary: #333;
          --color-accent: #b33030;
          --color-background: #f4f4f4;
          --color-text: #222;
          --font-primary: 'Times New Roman', serif;
          --font-secondary: 'Arial', sans-serif;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: var(--font-primary);
          color: var(--color-text);
          background-color: var(--color-background);
          line-height: 1.5;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px;
          background-color: #fff;
          border: 1px solid #ddd;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .product-container {
          display: flex;
          flex-wrap: wrap;
          gap: 40px;
          margin-bottom: 50px;
        }
        
        .product-images {
          flex: 1;
          min-width: 300px;
        }
        
        .product-details {
          flex: 1;
          min-width: 300px;
        }
        
        .product-title {
          font-size: 32px;
          color: var(--color-secondary);
          margin-bottom: 10px;
          font-weight: normal;
        }
        
        .product-subtitle {
          font-size: 18px;
          color: #555;
          margin-bottom: 15px;
          font-weight: normal;
          font-style: italic;
        }
        
        .product-price {
          font-size: 28px;
          font-weight: bold;
          color: var(--color-accent);
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 15px;
        }
        
        .product-description {
          line-height: 1.7;
          margin-bottom: 30px;
        }
        
        .main-gallery {
          border: 1px solid #ddd;
          padding: 10px;
          margin-bottom: 15px;
          background: #fff;
        }
        
        .gallery-image {
          width: 100%;
          height: auto;
        }
        
        .thumbnails {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .thumbnail-container {
          width: 70px;
          height: 70px;
          border: 1px solid #ddd;
          padding: 3px;
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
        
        .specs-container {
          margin-bottom: 40px;
        }
        
        .specs-title {
          font-size: 22px;
          color: var(--color-secondary);
          margin-bottom: 15px;
          font-weight: normal;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        
        .specs-list {
          border: 1px solid #ddd;
        }
        
        .spec-item {
          display: flex;
          padding: 12px 15px;
          border-bottom: 1px solid #ddd;
        }
        
        .spec-item:last-child {
          border-bottom: none;
        }
        
        .spec-item:nth-child(odd) {
          background-color: #f9f9f9;
        }
        
        .spec-label {
          font-weight: bold;
          width: 200px;
          flex-shrink: 0;
        }
        
        .company-sections {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 30px;
          border-top: 1px solid #ddd;
          padding-top: 30px;
        }
        
        .company-section {
          flex: 1;
          min-width: 300px;
          padding: 20px;
          border: 1px solid #ddd;
          background-color: #f9f9f9;
        }
        
        .company-section-icon {
          float: left;
          width: 50px;
          height: 50px;
          margin-right: 15px;
          color: var(--color-primary);
        }
        
        .company-section-title {
          font-size: 18px;
          color: var(--color-secondary);
          margin-bottom: 10px;
        }
      `,
      jsInteractions: `
        document.addEventListener('DOMContentLoaded', function() {
          const thumbnails = document.querySelectorAll('.thumbnail-container');
          const mainImage = document.querySelector('.gallery-image');
          
          if (thumbnails.length > 0 && mainImage) {
            thumbnails.forEach(thumb => {
              thumb.addEventListener('click', function() {
                const imgSrc = this.querySelector('img').src;
                mainImage.src = imgSrc;
                
                // Update active state
                thumbnails.forEach(t => t.style.borderColor = '#ddd');
                this.style.borderColor = 'var(--color-primary)';
              });
            });
          }
        });
      `,
      createdAt: new Date().toISOString(),
    },
    
    // Minimalist product template
    {
      name: 'Minimalist Product Display',
      description: 'A clean, minimalist template that puts focus on product imagery with ample whitespace.',
      thumbnail: '/styles/minimalist-product.jpg',
      type: 'product',
      style: 'minimalist',
      colorScheme: 'light',
      htmlStructure: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{{TITLE}}</title>
          <style>
            {{CSS_STYLES}}
          </style>
        </head>
        <body>
          <div class="container">
            <main class="product">
              <div class="product-gallery">
                {{IMAGES}}
              </div>
              
              <div class="product-info">
                <h1 class="product-title">{{TITLE}}</h1>
                <p class="product-subtitle">{{SUBTITLE}}</p>
                <div class="product-price">{{CURRENCY}}{{PRICE}}</div>
                
                <div class="product-description">
                  {{DESCRIPTION}}
                </div>
                
                {{SPECS}}
              </div>
            </main>
            
            <footer>
              {{COMPANY_SECTIONS}}
            </footer>
          </div>
          <script>
            {{JS_INTERACTIONS}}
          </script>
        </body>
        </html>
      `,
      cssStyles: `
        :root {
          --color-primary: #000;
          --color-secondary: #333;
          --color-accent: #555;
          --color-background: #fff;
          --color-text: #222;
          --font-primary: 'Helvetica', 'Arial', sans-serif;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: var(--font-primary);
          color: var(--color-text);
          background-color: var(--color-background);
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
        }
        
        .container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .product {
          display: grid;
          grid-template-columns: 6fr 4fr;
          gap: 60px;
          margin-bottom: 80px;
        }
        
        .product-gallery {
          position: relative;
        }
        
        .main-gallery {
          margin-bottom: 20px;
        }
        
        .gallery-image {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .thumbnails {
          display: flex;
          gap: 15px;
        }
        
        .thumbnail-container {
          width: 80px;
          height: 80px;
          opacity: 0.6;
          transition: opacity 0.2s;
          cursor: pointer;
        }
        
        .thumbnail-container:hover,
        .thumbnail-container.active {
          opacity: 1;
        }
        
        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .product-info {
          padding-top: 20px;
        }
        
        .product-title {
          font-size: 26px;
          font-weight: 300;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        
        .product-subtitle {
          font-size: 16px;
          color: #666;
          margin-bottom: 20px;
        }
        
        .product-price {
          font-size: 24px;
          margin-bottom: 30px;
        }
        
        .product-description {
          font-size: 15px;
          line-height: 1.7;
          margin-bottom: 40px;
        }
        
        .specs-container {
          margin-bottom: 40px;
        }
        
        .specs-title {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
        }
        
        .specs-list {
          border-top: 1px solid #eee;
        }
        
        .spec-item {
          display: flex;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }
        
        .spec-label {
          width: 140px;
          color: #666;
        }
        
        footer {
          border-top: 1px solid #eee;
          padding-top: 60px;
        }
        
        .company-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 40px;
        }
        
        .company-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .company-section-icon {
          width: 40px;
          height: 40px;
          margin-bottom: 15px;
        }
        
        .company-section-title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        
        .company-section-description {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }
        
        @media (max-width: 900px) {
          .product {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
      `,
      jsInteractions: `
        document.addEventListener('DOMContentLoaded', function() {
          const thumbnails = document.querySelectorAll('.thumbnail-container');
          const mainImage = document.querySelector('.gallery-image');
          
          if (thumbnails.length > 0 && mainImage) {
            // Set first thumbnail as active
            thumbnails[0].classList.add('active');
            
            thumbnails.forEach(thumb => {
              thumb.addEventListener('click', function() {
                const imgSrc = this.querySelector('img').src;
                
                // Fade out/in effect
                mainImage.style.opacity = '0';
                setTimeout(() => {
                  mainImage.src = imgSrc;
                  mainImage.style.opacity = '1';
                }, 200);
                
                // Update active state
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
              });
            });
            
            // Add fade transition to main image
            mainImage.style.transition = 'opacity 0.2s';
          }
        });
      `,
      createdAt: new Date().toISOString(),
    }
  ];
  
  // Insert the template styles
  for (const style of styles) {
    const result = await db.insert(templateStyles).values(style).returning();
    console.log(`Added template style: ${style.name}`);
  }
}

// Seed SVG icons for use in company information sections
async function seedSvgIcons() {
  console.log('Seeding SVG icons...');
  
  const icons = [
    {
      name: 'Shipping',
      category: 'business',
      tags: ['shipping', 'delivery', 'truck', 'transport'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Shield Check',
      category: 'business',
      tags: ['security', 'guarantee', 'protection', 'warranty'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>',
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Support',
      category: 'business',
      tags: ['support', 'customer service', 'help', 'assistance'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c-4.97 0-9-4.03-9-9m9 9a9 9 0 0 0 9-9m-9 0a9 9 0 0 0-9 9m0 0a9 9 0 0 1 9-9"></path><circle cx="12" cy="12" r="1"></circle></svg>',
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Recycle',
      category: 'environment',
      tags: ['recycle', 'environment', 'eco', 'green'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"></path><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"></path><path d="m14 16-3 3 3 3"></path><path d="M8.293 13.596 4.5 9.497l4.5-.001"></path><path d="m10.765 5.37 1.654-2.86a1.83 1.83 0 0 1 1.575-.885h.013a1.784 1.784 0 0 1 1.574.89l2.635 4.565"></path><path d="m19.5 9.5-3 5.196"></path><path d="m18 8-3-5-3 5"></path></svg>',
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Star Rating',
      category: 'ecommerce',
      tags: ['rating', 'review', 'feedback', 'score'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Gift',
      category: 'ecommerce',
      tags: ['gift', 'present', 'special offer', 'bonus'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>',
      createdAt: new Date().toISOString(),
    }
  ];
  
  // Insert the SVG icons
  for (const icon of icons) {
    const result = await db.insert(svgIcons).values(icon).returning();
    console.log(`Added SVG icon: ${icon.name}`);
  }
}

// Main function to run all seed operations
async function main() {
  try {
    await seedTemplateStyles();
    await seedSvgIcons();
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    process.exit(0);
  }
}

// Run the main function
main();