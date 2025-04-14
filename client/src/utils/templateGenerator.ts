import { TemplateData } from '@shared/schema';
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
      $(selector).each((i: number, el: any) => {
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
    
    // Update the logo if it exists
    if (templateData.logo) {
      const logoStr = templateData.logo; // Local constant to avoid undefined errors
      
      // Update image-based logos
      $('img[src*="logo"], img.logo, .header-logo img, .brand-logo img, .logo img, header img').each((i: number, el: any) => {
        // If the logo is a URL to an image
        if (!logoStr.includes('<svg')) {
          $(el).attr('src', logoStr);
        } else {
          // If it's an SVG, replace the img tag with the SVG
          $(el).replaceWith(logoStr);
        }
      });
      
      // Update SVG-based logos
      $('.logo svg, .header-logo svg, .brand-logo svg').each((i: number, el: any) => {
        // If the logo is an SVG, replace it
        if (logoStr.includes('<svg')) {
          $(el).replaceWith(logoStr);
        } else {
          // If it's an image URL, replace the SVG with an img tag
          $(el).replaceWith(`<img src="${logoStr}" alt="Logo" />`);
        }
      });
    }
    
    // Update price
    if (templateData.price) {
      $('.price').each((i: number, el: any) => {
        const currencySymbol = getCurrencySymbol(templateData.currency || 'EUR');
        $(el).text(`${currencySymbol}${templateData.price}`);
      });
    }
    
    // Update gallery images
    if (templateData.images.length > 0) {
      // Check if the gallery uses eBay-style structure with radio buttons and arrows
      const hasEbayStyleGallery = $('input[type="radio"][name="gallery"]').length > 0 && 
                                 $('.gallery-arrow').length > 0 && 
                                 $('#main1').length > 0;
      
      if (hasEbayStyleGallery) {
        // This is the exact structure in your example
        const existingCount = $('input[type="radio"][name="gallery"]').length;
        const totalImages = templateData.images.length;
        
        // First update existing images
        for (let i = 0; i < Math.min(existingCount, totalImages); i++) {
          const n = i + 1; // 1-based indexing as in your example
          
          // Update main image
          const mainImage = $(`#main${n}`);
          if (mainImage.length) {
            mainImage.attr('src', templateData.images[i].url);
          }
          
          // Update thumbnail
          const thumbnail = $(`.thumbnail[for="img${n}"] img`);
          if (thumbnail.length) {
            thumbnail.attr('src', templateData.images[i].url);
          }
        }
        
        // Add new images if needed
        if (totalImages > existingCount) {
          // 1. Add new radio buttons
          const radioButtonsContainer = $('input[type="radio"][name="gallery"]').first().parent();
          for (let i = existingCount; i < totalImages; i++) {
            const n = i + 1;
            radioButtonsContainer.append(`<input type="radio" name="gallery" id="img${n}">`);
          }
          
          // 2. Add new prev arrows
          const galleryContainer = $('.gallery-container');
          for (let i = existingCount; i < totalImages; i++) {
            const n = i + 1;
            const prevTarget = n === 1 ? totalImages : n - 1;
            galleryContainer.append(`<label class="gallery-arrow prev" for="img${prevTarget}"></label>`);
          }
          
          // 3. Add new next arrows
          for (let i = existingCount; i < totalImages; i++) {
            const n = i + 1;
            const nextTarget = n === totalImages ? 1 : n + 1;
            galleryContainer.append(`<label class="gallery-arrow next" for="img${nextTarget}"></label>`);
          }
          
          // 4. Add new main images
          for (let i = existingCount; i < totalImages; i++) {
            const n = i + 1;
            galleryContainer.append(`<img src="${templateData.images[i].url}" alt="Werkzeug Detail ${n}" class="gallery-item" id="main${n}">`);
          }
          
          // 5. Add new thumbnails
          const thumbnailsContainer = $('.thumbnail-set.set1');
          for (let i = existingCount; i < totalImages; i++) {
            const n = i + 1;
            thumbnailsContainer.append(`
              <label class="thumbnail" for="img${n}">
                <img src="${templateData.images[i].url}" alt="Thumbnail ${n}">
              </label>
            `);
          }
          
          // Ensure first radio is checked by default
          $('input[type="radio"][name="gallery"]').prop('checked', false);
          $('#img1').prop('checked', true);
        }
      } else {
        // Handle other gallery types
        const mainImages = $('.gallery-item');
        const thumbnailImages = $('.thumbnail img');
        const imgMap = new Map<string, string>();
        
        // Update existing main images
        mainImages.each((i: number, el: any) => {
          if (i < templateData.images.length) {
            const newUrl = templateData.images[i].url;
            const id = $(el).attr('id');
            
            if (id) {
              imgMap.set(id, newUrl);
            }
            
            if ($(el).is('img')) {
              $(el).attr('src', newUrl);
            } else {
              $(el).find('img').attr('src', newUrl);
            }
          }
        });
        
        // Update thumbnails
        thumbnailImages.each((i: number, el: any) => {
          if (i < templateData.images.length) {
            $(el).attr('src', templateData.images[i].url);
            
            // Check if this thumbnail links to a main image
            const label = $(el).closest('label').attr('for');
            if (label && label.startsWith('img')) {
              const imgNum = label.replace('img', '');
              const mainId = `main${imgNum}`;
              imgMap.set(mainId, templateData.images[i].url);
            }
          }
        });
        
        // Add new images if needed
        if (mainImages.length < templateData.images.length) {
          const galleryContainer = $('.gallery-container').first();
          if (galleryContainer.length) {
            for (let i = mainImages.length; i < templateData.images.length; i++) {
              const newId = `main${i + 1}`;
              const newUrl = templateData.images[i].url;
              
              if ($('.gallery-item').first().is('img')) {
                galleryContainer.append(`<img src="${newUrl}" alt="Product image ${i + 1}" class="gallery-item" id="${newId}">`);
              } else {
                galleryContainer.append(`
                  <div class="gallery-item" id="${newId}">
                    <img src="${newUrl}" alt="Product image ${i + 1}" />
                  </div>
                `);
              }
            }
          }
          
          // Add thumbnails
          const thumbnailContainer = $('.thumbnail-set, .thumbnail-sets').first();
          if (thumbnailContainer.length) {
            for (let i = thumbnailImages.length; i < templateData.images.length; i++) {
              const newUrl = templateData.images[i].url;
              thumbnailContainer.append(`
                <div class="thumbnail">
                  <img src="${newUrl}" alt="Thumbnail ${i + 1}" />
                </div>
              `);
            }
          }
        }
      }
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
            $(el).attr('alt', `Product image ${i + 1}`);
          } else {
            // Otherwise look for image inside
            $(el).find('img').attr('src', newUrl);
            $(el).find('img').attr('alt', `Product image ${i + 1}`);
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
          $(el).attr('alt', `Thumbnail ${i + 1}`);
          
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
      
      // Special handling for templates - update all main gallery images
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
      
      // Extra step: Also look for images that might have specific IDs in the format 'main1', 'main2', etc.
      // This is important for templates with CSS selectors targeting specific images
      for (let i = 0; i < templateData.images.length; i++) {
        const imgNum = i + 1;
        const mainId = `main${imgNum}`;
        const mainEl = $(`#${mainId}`);
        
        if (mainEl.length > 0) {
          const imageUrl = templateData.images[i].url;
          if (mainEl.is('img')) {
            mainEl.attr('src', imageUrl);
          } else {
            mainEl.find('img').attr('src', imageUrl);
          }
        }
      }
      
      // If we have more images than slots, add new gallery items and thumbnails
      // First, determine if we need to add more images
      const existingMainImages = mainImages.length;
      const existingThumbnails = thumbnailImages.length;
      
      // Check if we're working with a radio button gallery
      const hasRadioButtonGallery = $('input[type="radio"][name="gallery"]').length > 0;
      
      if (hasRadioButtonGallery) {
        // This is a radio button gallery like in the user's example
        updateRadioButtonGallery($, templateData);
      } else if (existingMainImages < templateData.images.length) {
        // Default handling for other gallery types
        // Find the main gallery container to add new images
        const galleryContainer = $('.gallery-container').first();
        
        if (galleryContainer.length) {
          // Add new gallery items for each additional image
          for (let i = existingMainImages; i < templateData.images.length; i++) {
            const newImage = templateData.images[i];
            const newId = `main${i + 1}`;
            
            // Create new gallery item with the same structure as existing ones
            // Use the same tag (img or div) that existing gallery items use
            let newGalleryItem;
            
            // Check if existing gallery items are direct img tags
            if ($('.gallery-item').first().is('img')) {
              newGalleryItem = $(`<img src="${newImage.url}" alt="Product image ${i + 1}" class="gallery-item" id="${newId}">`);
            } else {
              newGalleryItem = $(`
                <div class="gallery-item" id="${newId}">
                  <img src="${newImage.url}" alt="Product image ${i + 1}" />
                </div>
              `);
            }
            
            // Add to gallery container
            galleryContainer.append(newGalleryItem);
          }
        }
        
        // Now add corresponding thumbnails
        const thumbnailContainer = $('.thumbnail-set.set1, .thumbnail-sets').first();
        
        if (thumbnailContainer.length) {
          // Add new thumbnails for each additional image
          for (let i = existingThumbnails; i < templateData.images.length; i++) {
            const newImage = templateData.images[i];
            const imgNumber = i + 1;
            
            // Create new thumbnail with the same structure as existing ones
            const newThumbnail = $(`
              <div class="thumbnail">
                <img src="${newImage.url}" alt="Thumbnail ${imgNumber}" />
              </div>
            `);
            
            // Add to thumbnail container
            thumbnailContainer.append(newThumbnail);
          }
        }
      }
      
      // Helper function to update a radio button gallery with arrows (like in the user's example)
      const updateRadioButtonGallery = ($: any, templateData: TemplateData) => {
        const totalImages = templateData.images.length;
        const existingRadios = $('input[type="radio"][name="gallery"]').length;
        
        // First let's understand the exact structure of the gallery
        const galleryContainer = $('.gallery-container').first();
        const radioParent = $('input[type="radio"][name="gallery"]').first().parent();
        
        // Update existing images first
        for (let i = 0; i < Math.min(existingRadios, totalImages); i++) {
          const imgNumber = i + 1;
          // Update radio button (nothing to change except ensuring the first is checked)
          if (imgNumber === 1) {
            $(`#img${imgNumber}`).prop('checked', true);
          }
          
          // Update main image
          const mainImage = $(`#main${imgNumber}`);
          if (mainImage.length > 0) {
            mainImage.attr('src', templateData.images[i].url);
          }
          
          // Update thumbnail
          const thumbnail = $(`.thumbnail[for="img${imgNumber}"] img`);
          if (thumbnail.length > 0) {
            thumbnail.attr('src', templateData.images[i].url);
          }
        }
        
        // Now add new elements if we have more images than existing ones
        if (existingRadios < totalImages) {
          // 1. First add new radio buttons in the same position as existing ones
          for (let i = existingRadios; i < totalImages; i++) {
            const imgNumber = i + 1;
            const newRadio = $(`<input type="radio" name="gallery" id="img${imgNumber}">`);
            radioParent.append(newRadio);
          }
          
          // 2. Now add new navigation arrows following the exact pattern in the example
          // First let's understand the structure by examining existing arrows
          const prevArrows = $('.gallery-arrow.prev');
          const nextArrows = $('.gallery-arrow.next');
          
          // Add new 'prev' arrows
          for (let i = existingRadios; i < totalImages; i++) {
            const imgNumber = i + 1;
            // The "for" attribute points to the previous image, with special case for img1->imgN
            const prevImgNumber = imgNumber === 1 ? totalImages : imgNumber - 1;
            const prevArrow = $(`<label class="gallery-arrow prev" for="img${prevImgNumber}"></label>`);
            
            // Insert it after the last prev arrow
            if (prevArrows.length > 0) {
              prevArrows.last().after(prevArrow);
            } else {
              // If no existing arrows, add at beginning of gallery container
              galleryContainer.prepend(prevArrow);
            }
          }
          
          // Add new 'next' arrows
          for (let i = existingRadios; i < totalImages; i++) {
            const imgNumber = i + 1;
            // The "for" attribute points to the next image, with special case for imgN->img1
            const nextImgNumber = imgNumber === totalImages ? 1 : imgNumber + 1;
            const nextArrow = $(`<label class="gallery-arrow next" for="img${nextImgNumber}"></label>`);
            
            // Insert it after the last next arrow
            if (nextArrows.length > 0) {
              nextArrows.last().after(nextArrow);
            } else {
              // If no existing next arrows, add after all prev arrows
              const allPrevArrows = $('.gallery-arrow.prev');
              if (allPrevArrows.length > 0) {
                allPrevArrows.last().after(nextArrow);
              } else {
                galleryContainer.prepend(nextArrow);
              }
            }
          }
          
          // 3. Add new main images
          for (let i = existingRadios; i < totalImages; i++) {
            const imgNumber = i + 1;
            const newImage = templateData.images[i];
            // Follow exact structure from example
            const mainImg = $(`<img src="${newImage.url}" alt="Werkzeug Detail ${imgNumber}" class="gallery-item" id="main${imgNumber}">`);
            
            // Add it after the last main image
            const lastMainImage = $('[id^="main"]:last');
            if (lastMainImage.length > 0) {
              lastMainImage.after(mainImg);
            } else {
              // If no existing main images, add at the end of gallery container
              galleryContainer.append(mainImg);
            }
          }
          
          // 4. Add new thumbnails
          const thumbnailContainer = $('.thumbnail-set.set1').first();
          for (let i = existingRadios; i < totalImages; i++) {
            const imgNumber = i + 1;
            const newImage = templateData.images[i];
            
            // Create exactly the same structure as in the example
            const thumbnail = $(`
              <label class="thumbnail" for="img${imgNumber}">
                <img src="${newImage.url}" alt="Thumbnail ${imgNumber}">
              </label>
            `);
            
            // Add to the thumbnail container
            thumbnailContainer.append(thumbnail);
          }
          
          // 5. Update CSS if needed for the arrows to work properly
          let styleElement = $('style').filter((index: number, el: any) => $(el).text().includes('.gallery-arrow'));
          
          if (styleElement.length === 0) {
            const newStyle = $('<style></style>');
            $('head').append(newStyle);
            styleElement = $('style').last();
          }
          
          let cssRules = '';
          for (let i = 1; i <= totalImages; i++) {
            cssRules += `
              #img${i}:checked ~ .gallery-container #main${i} {
                display: block;
              }
              #img${i}:checked ~ .gallery-container .gallery-arrow.prev[for="img${i === 1 ? totalImages : i - 1}"],
              #img${i}:checked ~ .gallery-container .gallery-arrow.next[for="img${i === totalImages ? 1 : i + 1}"] {
                display: block;
              }
            `;
          }
          
          // Basic rules for all images
          cssRules += `
            .gallery-container .gallery-item {
              display: none;
            }
            .gallery-container .gallery-arrow {
              display: none;
            }
          `;
          
          styleElement.text(styleElement.text() + cssRules);
        }
      }
      
      // For any remaining images that couldn't be added to galleries, update other image patterns
      const updatedMainCount = $('.gallery-item').length;
      if (updatedMainCount < templateData.images.length) {
        let extraIndex = updatedMainCount;
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
          // Check if it's a table or a div-based structure
          const isTable = specTable.is('table') || specTable.find('table').length > 0;
          
          if (isTable) {
            // For table structure - clear existing rows (except header) and add new ones
            const tableEl = specTable.is('table') ? specTable : specTable.find('table');
            tableEl.find('tr:not(:first-child)').remove(); // Keep header row if exists
            
            templateData.specs.forEach(spec => {
              tableEl.append(`
                <tr>
                  <td class="tech-label">${spec.label}</td>
                  <td class="tech-value">${spec.value}</td>
                </tr>
              `);
            });
          } else {
            // For div-based structure that might use the same class
            // First remove all existing specs
            specTable.empty();
            
            // Then add all new specs
            templateData.specs.forEach(spec => {
              specTable.append(`
                <div class="tech-row">
                  <div class="tech-label">${spec.label}</div>
                  <div class="tech-value">${spec.value}</div>
                </div>
              `);
            });
          }
          
          specsUpdated = true;
          break;
        }
      }
      
      // If no spec table found, look for div-based specs
      if (!specsUpdated) {
        const specDivs = $('.spec-item, .tech-item');
        if (specDivs.length) {
          // First, update existing spec items
          specDivs.each((i, el) => {
            if (i < templateData.specs.length) {
              const spec = templateData.specs[i];
              $(el).find('.tech-label, .spec-label').text(spec.label);
              $(el).find('.tech-value, .spec-value').text(spec.value);
            }
          });
          
          // Then, if we have more specs than existing items, add new ones
          if (specDivs.length < templateData.specs.length) {
            const specContainer = specDivs.first().parent();
            
            // Get the structure of an existing spec item to create new ones with same format
            const existingSpecItem = specDivs.first();
            
            for (let i = specDivs.length; i < templateData.specs.length; i++) {
              const spec = templateData.specs[i];
              // Clone the existing item, but replace its content
              const newSpecItem = existingSpecItem.clone();
              newSpecItem.find('.tech-label, .spec-label').text(spec.label);
              newSpecItem.find('.tech-value, .spec-value').text(spec.value);
              
              // Add to the container
              specContainer.append(newSpecItem);
            }
          }
          
          specsUpdated = true;
        }
      }
      
      // If still no specs container found, create a new one with div format
      if (!specsUpdated) {
        // Find a good place to add the tech specs
        const techSection = $('.tech-section');
        if (techSection.length) {
          // Create a container for the specs
          const specContainer = $('<div class="tech-items"></div>');
          
          // Add each spec to the container
          templateData.specs.forEach(spec => {
            specContainer.append(`
              <div class="tech-item">
                <div class="tech-label">${spec.label}</div>
                <div class="tech-value">${spec.value}</div>
              </div>
            `);
          });
          
          // Add the container to the tech section
          techSection.append(specContainer);
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
  
  // Create logo HTML if a logo exists
  const logoHtml = data.logo 
    ? data.logo.includes('<svg') 
      ? `<div class="logo">${data.logo}</div>`
      : `<div class="logo"><img src="${data.logo}" alt="Logo" /></div>`
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
          ${logoHtml ? `<div class="header-logo mb-4">${logoHtml}</div>` : ''}
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
          <h2 class="section-title">Technical Specs</h2>
          ${techSpecs}
        </div>
        
        <div class="company-section">
          <h2 class="section-title">About Us</h2>
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
