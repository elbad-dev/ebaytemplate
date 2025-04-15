import { db } from '../server/db';
import { templateStyles } from '../shared/schema';

/**
 * This script creates 10 different template styles with various gallery layouts
 * All styles are modern and simple but with different gallery presentations
 * Each style will work with our app's photo adding functionality and meet eBay standards
 */

const styles = [
  {
    name: "Modern Classic Gallery",
    description: "Clean and modern horizontal gallery with simple thumbnail navigation",
    thumbnail: "/styles/modern-product.jpg",
    type: "product",
    style: "modern",
    color_scheme: "light",
    html_structure: `
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
            <div class="logo-container">{{LOGO}}</div>
            <h1 class="product-title">{{TITLE}}</h1>
            <p class="product-subtitle">{{SUBTITLE}}</p>
            <div class="price">{{CURRENCY}}{{PRICE}}</div>
          </header>
          
          <div class="gallery">
            {{IMAGES}}
          </div>
          
          <div class="product-section">
            <h2 class="section-title">Product Description</h2>
            <div class="product-description">{{DESCRIPTION}}</div>
          </div>
          
          <div class="tech-section">
            <h2 class="section-title">Technical Specifications</h2>
            {{SPECS}}
          </div>
          
          <div class="about-section">
            <h2 class="section-title">About Us</h2>
            {{COMPANY_SECTIONS}}
          </div>
        </div>
        <script>
          {{JS_INTERACTIONS}}
        </script>
      </body>
      </html>
    `,
    css_styles: `
      :root {
        --color-primary: #3498db;
        --color-secondary: #2c3e50;
        --color-accent: #e74c3c;
        --color-background: #ffffff;
        --color-text: #333333;
        --color-muted: #7f8c8d;
        --color-border: #ecf0f1;
        --font-primary: Arial, sans-serif;
        --font-secondary: Georgia, serif;
        --radius: 8px;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
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
        text-align: center;
        margin-bottom: 40px;
      }
      
      .logo-container {
        margin-bottom: 20px;
      }
      
      .logo-container img {
        max-width: 200px;
        height: auto;
      }
      
      .product-title {
        font-size: 32px;
        color: var(--color-secondary);
        margin-bottom: 10px;
      }
      
      .product-subtitle {
        font-size: 18px;
        color: var(--color-muted);
        margin-bottom: 15px;
      }
      
      .price {
        font-size: 24px;
        font-weight: bold;
        color: var(--color-accent);
      }
      
      .section-title {
        font-size: 24px;
        color: var(--color-secondary);
        margin-bottom: 20px;
        position: relative;
        padding-bottom: 10px;
      }
      
      .section-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 50px;
        height: 3px;
        background-color: var(--color-primary);
      }
      
      .product-section, .tech-section, .about-section {
        margin-bottom: 40px;
      }
      
      .product-description {
        margin-bottom: 30px;
        line-height: 1.8;
      }
      
      /* Classic Gallery Styles */
      .gallery {
        margin-bottom: 40px;
        position: relative;
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        padding-bottom: 70%;
        border-radius: var(--radius);
        overflow: hidden;
        background-color: #f8f9fa;
        margin-bottom: 15px;
      }
      
      .gallery-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: none;
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 50%;
        display: none;
        cursor: pointer;
        z-index: 10;
      }
      
      .gallery-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-style: solid;
        border-width: 2px 2px 0 0;
        border-color: var(--color-text);
      }
      
      .gallery-arrow.prev {
        left: 15px;
      }
      
      .gallery-arrow.prev::before {
        transform: translate(-30%, -50%) rotate(-135deg);
      }
      
      .gallery-arrow.next {
        right: 15px;
      }
      
      .gallery-arrow.next::before {
        transform: translate(-70%, -50%) rotate(45deg);
      }
      
      input[type="radio"] {
        display: none;
      }
      
      .thumbnail-sets {
        display: flex;
        justify-content: center;
      }
      
      .thumbnail-set {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }
      
      .thumbnail {
        width: 80px;
        height: 80px;
        border: 2px solid var(--color-border);
        border-radius: calc(var(--radius) - 4px);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .thumbnail:hover {
        border-color: var(--color-primary);
      }
      
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Tech specs styles */
      .tech-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .tech-row {
        display: flex;
        border-bottom: 1px solid var(--color-border);
      }
      
      .tech-row:last-child {
        border-bottom: none;
      }
      
      .tech-label {
        flex: 1;
        padding: 12px;
        font-weight: bold;
        color: var(--color-secondary);
        background-color: rgba(236, 240, 241, 0.5);
      }
      
      .tech-value {
        flex: 2;
        padding: 12px;
      }
      
      /* Company section styles */
      .info-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .info-card {
        border: 1px solid var(--color-border);
        border-radius: var(--radius);
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: transform 0.3s, box-shadow 0.3s;
      }
      
      .info-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      }
      
      .card-icon {
        width: 60px;
        height: 60px;
        margin-bottom: 15px;
        color: var(--color-primary);
      }
      
      .info-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        color: var(--color-secondary);
      }
      
      .info-description {
        color: var(--color-muted);
      }
      
      /* Responsive styles */
      @media (max-width: 768px) {
        .product-content {
          grid-template-columns: 1fr;
        }
        
        .thumbnail {
          width: 60px;
          height: 60px;
        }
      }
    `,
    js_interactions: ""
  },
  {
    name: "Minimal Grid Gallery",
    description: "Modern minimalist template with a grid gallery layout",
    thumbnail: "/styles/minimal-grid.jpg",
    type: "product",
    style: "minimalist",
    color_scheme: "light",
    html_structure: `
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
            <div class="header-left">
              <div class="logo-container">{{LOGO}}</div>
              <h1 class="product-title">{{TITLE}}</h1>
              <p class="product-subtitle">{{SUBTITLE}}</p>
            </div>
            <div class="header-right">
              <div class="price">{{CURRENCY}}{{PRICE}}</div>
            </div>
          </header>
          
          <div class="gallery">
            {{IMAGES}}
          </div>
          
          <div class="product-content">
            <div class="product-description">
              <h2 class="section-title">About This Product</h2>
              <div class="description-content">{{DESCRIPTION}}</div>
            </div>
            
            <div class="product-specs">
              <h2 class="section-title">Specifications</h2>
              {{SPECS}}
            </div>
          </div>
          
          <div class="company-info">
            <h2 class="section-title">Why Choose Us</h2>
            {{COMPANY_SECTIONS}}
          </div>
        </div>
        <script>
          {{JS_INTERACTIONS}}
        </script>
      </body>
      </html>
    `,
    css_styles: `
      :root {
        --color-primary: #00bcd4;
        --color-secondary: #263238;
        --color-accent: #ff5722;
        --color-background: #ffffff;
        --color-text: #37474f;
        --color-muted: #78909c;
        --color-border: #eceff1;
        --font-primary: 'Helvetica Neue', Arial, sans-serif;
        --radius: 4px;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
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
        padding: 30px 20px;
      }
      
      .product-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 40px;
      }
      
      .header-left {
        flex: 3;
      }
      
      .header-right {
        flex: 1;
        text-align: right;
      }
      
      .logo-container {
        margin-bottom: 20px;
      }
      
      .logo-container img {
        max-width: 180px;
        height: auto;
      }
      
      .product-title {
        font-size: 28px;
        font-weight: 600;
        color: var(--color-secondary);
        margin-bottom: 10px;
        letter-spacing: -0.5px;
      }
      
      .product-subtitle {
        font-size: 16px;
        color: var(--color-muted);
        margin-bottom: 10px;
      }
      
      .price {
        font-size: 24px;
        font-weight: 600;
        color: var(--color-accent);
        background-color: rgba(255, 87, 34, 0.1);
        padding: 10px 15px;
        border-radius: var(--radius);
        display: inline-block;
      }
      
      /* Grid Gallery Styles */
      .gallery {
        margin-bottom: 40px;
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        padding-bottom: 60%;
        background-color: #f5f5f5;
        border-radius: var(--radius);
        overflow: hidden;
        margin-bottom: 10px;
      }
      
      .gallery-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: none;
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 36px;
        height: 36px;
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        display: none;
        cursor: pointer;
        z-index: 10;
      }
      
      .gallery-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 8px;
        height: 8px;
        border-style: solid;
        border-width: 2px 2px 0 0;
        border-color: var(--color-text);
      }
      
      .gallery-arrow.prev {
        left: 15px;
      }
      
      .gallery-arrow.prev::before {
        transform: translate(-30%, -50%) rotate(-135deg);
      }
      
      .gallery-arrow.next {
        right: 15px;
      }
      
      .gallery-arrow.next::before {
        transform: translate(-70%, -50%) rotate(45deg);
      }
      
      input[type="radio"] {
        display: none;
      }
      
      .thumbnail-sets {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 8px;
      }
      
      .thumbnail-set {
        display: contents;
      }
      
      .thumbnail {
        width: 100%;
        aspect-ratio: 1;
        border: 2px solid transparent;
        border-radius: var(--radius);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .thumbnail:hover {
        border-color: var(--color-primary);
      }
      
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Content area */
      .product-content {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 40px;
        margin-bottom: 50px;
      }
      
      .section-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--color-secondary);
        margin-bottom: 20px;
        position: relative;
        padding-bottom: 10px;
      }
      
      .section-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 30px;
        height: 2px;
        background-color: var(--color-primary);
      }
      
      .description-content {
        line-height: 1.8;
      }
      
      /* Tech specs styling */
      .tech-table {
        width: 100%;
      }
      
      .tech-row {
        border-bottom: 1px solid var(--color-border);
      }
      
      .tech-row:last-child {
        border-bottom: none;
      }
      
      .tech-label {
        padding: 10px 0;
        color: var(--color-muted);
        font-weight: 500;
        font-size: 14px;
      }
      
      .tech-value {
        padding: 10px 0;
        font-size: 15px;
      }
      
      /* Company info styling */
      .company-info {
        margin-top: 60px;
      }
      
      .info-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }
      
      .info-card {
        padding: 20px;
        border-radius: var(--radius);
        background-color: #f9f9f9;
        transition: transform 0.3s ease;
      }
      
      .info-card:hover {
        transform: translateY(-5px);
      }
      
      .card-icon {
        color: var(--color-primary);
        margin-bottom: 15px;
      }
      
      .info-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
        color: var(--color-secondary);
      }
      
      .info-description {
        font-size: 14px;
        color: var(--color-muted);
        line-height: 1.6;
      }
      
      /* Responsive styling */
      @media (max-width: 768px) {
        .product-header {
          flex-direction: column;
        }
        
        .header-right {
          margin-top: 20px;
          text-align: left;
        }
        
        .product-content {
          grid-template-columns: 1fr;
        }
      }
    `,
    js_interactions: ""
  },
  {
    name: "Bold Card Gallery",
    description: "Bold product presentation with card-style gallery",
    thumbnail: null,
    type: "product",
    style: "bold",
    color_scheme: "colorful",
    html_structure: `
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
          <div class="logo-area">
            <div class="logo-container">{{LOGO}}</div>
          </div>
          
          <header class="product-header">
            <h1 class="product-title">{{TITLE}}</h1>
            <p class="product-subtitle">{{SUBTITLE}}</p>
            <div class="price-tag">{{CURRENCY}}{{PRICE}}</div>
          </header>
          
          <div class="gallery">
            {{IMAGES}}
          </div>
          
          <div class="content-grid">
            <div class="description-area">
              <h2 class="section-title">Product Description</h2>
              <div class="product-description">{{DESCRIPTION}}</div>
            </div>
            
            <div class="specs-area">
              <h2 class="section-title">Technical Details</h2>
              {{SPECS}}
            </div>
          </div>
          
          <div class="about-us">
            <h2 class="section-title">Why Choose Us</h2>
            {{COMPANY_SECTIONS}}
          </div>
        </div>
        <script>
          {{JS_INTERACTIONS}}
        </script>
      </body>
      </html>
    `,
    css_styles: `
      :root {
        --color-primary: #6200ea;
        --color-secondary: #0091ea;
        --color-accent: #ff3d00;
        --color-background: #ffffff;
        --color-text: #212121;
        --color-muted: #757575;
        --color-border: #e0e0e0;
        --font-primary: 'Segoe UI', Roboto, sans-serif;
        --radius: 12px;
        --shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
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
        padding: 40px 20px;
      }
      
      .logo-area {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .logo-container img {
        max-height: 80px;
        width: auto;
      }
      
      .product-header {
        text-align: center;
        margin-bottom: 40px;
      }
      
      .product-title {
        font-size: 36px;
        font-weight: 800;
        background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 15px;
        letter-spacing: -0.5px;
      }
      
      .product-subtitle {
        font-size: 18px;
        color: var(--color-muted);
        margin-bottom: 20px;
      }
      
      .price-tag {
        display: inline-block;
        background-color: var(--color-accent);
        color: white;
        font-size: 24px;
        font-weight: bold;
        padding: 8px 25px;
        border-radius: 30px;
        box-shadow: 0 4px 10px rgba(255, 61, 0, 0.3);
      }
      
      /* Bold Card Gallery Styles */
      .gallery {
        margin-bottom: 60px;
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        padding-bottom: 65%;
        background-color: #f5f5f5;
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow);
        margin-bottom: 20px;
      }
      
      .gallery-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: none;
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 50px;
        height: 50px;
        background-color: white;
        border-radius: 50%;
        display: none;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .gallery-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 12px;
        height: 12px;
        border-style: solid;
        border-width: 3px 3px 0 0;
        border-color: var(--color-primary);
      }
      
      .gallery-arrow.prev {
        left: 20px;
      }
      
      .gallery-arrow.prev::before {
        transform: translate(-30%, -50%) rotate(-135deg);
      }
      
      .gallery-arrow.next {
        right: 20px;
      }
      
      .gallery-arrow.next::before {
        transform: translate(-70%, -50%) rotate(45deg);
      }
      
      input[type="radio"] {
        display: none;
      }
      
      .thumbnail-sets {
        display: flex;
        justify-content: center;
        overflow-x: auto;
        padding-bottom: 10px;
      }
      
      .thumbnail-set {
        display: flex;
        gap: 12px;
      }
      
      .thumbnail {
        width: 90px;
        height: 90px;
        border: 3px solid transparent;
        border-radius: var(--radius);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      
      .thumbnail:hover {
        transform: translateY(-5px);
      }
      
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Content Grid */
      .content-grid {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 40px;
        margin-bottom: 50px;
      }
      
      .section-title {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 25px;
        position: relative;
        color: var(--color-primary);
        display: inline-block;
      }
      
      .section-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -5px;
        width: 50%;
        height: 4px;
        background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
        border-radius: 2px;
      }
      
      .product-description {
        line-height: 1.8;
        font-size: 16px;
      }
      
      /* Tech specs styling */
      .tech-table {
        width: 100%;
        background-color: #f9f9f9;
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      
      .tech-row {
        display: flex;
        flex-direction: column;
        border-bottom: 1px solid var(--color-border);
        padding: 12px 15px;
      }
      
      .tech-row:last-child {
        border-bottom: none;
      }
      
      .tech-label {
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: 4px;
      }
      
      .tech-value {
        color: var(--color-text);
      }
      
      /* About us styling */
      .about-us {
        margin-top: 60px;
      }
      
      .info-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 25px;
      }
      
      .info-card {
        background-color: #f9f9f9;
        border-radius: var(--radius);
        padding: 25px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .info-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 5px;
        height: 100%;
        background: linear-gradient(to bottom, var(--color-primary), var(--color-secondary));
      }
      
      .info-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.12);
      }
      
      .card-icon {
        color: var(--color-primary);
        margin-bottom: 20px;
        font-size: 28px;
      }
      
      .info-title {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 12px;
        color: var(--color-primary);
      }
      
      .info-description {
        color: var(--color-muted);
        line-height: 1.7;
      }
      
      /* Responsive styling */
      @media (max-width: 768px) {
        .content-grid {
          grid-template-columns: 1fr;
          gap: 30px;
        }
        
        .product-title {
          font-size: 28px;
        }
        
        .thumbnail {
          width: 70px;
          height: 70px;
        }
      }
    `,
    js_interactions: ""
  },
  {
    name: "Elegant Slideshow",
    description: "Refined elegant template with smooth slideshow gallery",
    thumbnail: null,
    type: "product",
    style: "elegant",
    color_scheme: "light",
    html_structure: `
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
            <div class="header-branding">
              <div class="logo">{{LOGO}}</div>
            </div>
            
            <div class="header-content">
              <h1 class="product-title">{{TITLE}}</h1>
              <p class="product-subtitle">{{SUBTITLE}}</p>
              <div class="product-price">{{CURRENCY}}{{PRICE}}</div>
            </div>
          </header>
          
          <div class="gallery">
            {{IMAGES}}
          </div>
          
          <div class="product-details">
            <div class="product-description">
              <h2 class="section-title">About This Product</h2>
              <div class="description-content">{{DESCRIPTION}}</div>
            </div>
          </div>
          
          <div class="product-specifications">
            <h2 class="section-title">Product Specifications</h2>
            {{SPECS}}
          </div>
          
          <div class="company-showcase">
            <h2 class="section-title">Why Choose Us</h2>
            {{COMPANY_SECTIONS}}
          </div>
        </div>
        <script>
          {{JS_INTERACTIONS}}
        </script>
      </body>
      </html>
    `,
    css_styles: `
      :root {
        --color-primary: #9c8570;
        --color-secondary: #3a3a3a;
        --color-accent: #d2b48c;
        --color-background: #f9f9f9;
        --color-text: #4a4a4a;
        --color-muted: #7c7c7c;
        --color-border: #e6e6e6;
        --font-primary: 'Georgia', serif;
        --font-secondary: 'Playfair Display', serif;
        --radius: 0px;
        --shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: var(--font-primary);
        color: var(--color-text);
        background-color: var(--color-background);
        line-height: 1.8;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 50px 20px;
      }
      
      .product-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 50px;
      }
      
      .header-branding {
        margin-bottom: 30px;
      }
      
      .logo img {
        max-height: 90px;
        width: auto;
      }
      
      .product-title {
        font-family: var(--font-secondary);
        font-size: 36px;
        font-weight: 400;
        color: var(--color-secondary);
        margin-bottom: 10px;
        letter-spacing: 1px;
      }
      
      .product-subtitle {
        font-size: 18px;
        color: var(--color-muted);
        margin-bottom: 25px;
        max-width: 700px;
      }
      
      .product-price {
        font-size: 22px;
        font-weight: 500;
        color: var(--color-primary);
        border-bottom: 1px solid var(--color-accent);
        padding-bottom: 5px;
        display: inline-block;
      }
      
      /* Elegant Slideshow Gallery Styles */
      .gallery {
        margin-bottom: 60px;
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        padding-bottom: 70%;
        background-color: white;
        box-shadow: var(--shadow);
        margin-bottom: 20px;
        overflow: hidden;
      }
      
      .gallery-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: none;
        opacity: 0;
        transition: opacity 0.4s ease;
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background-color: rgba(255, 255, 255, 0.9);
        display: none;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s ease;
      }
      
      .gallery-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-style: solid;
        border-width: 1px 1px 0 0;
        border-color: var(--color-secondary);
      }
      
      .gallery-arrow.prev {
        left: 0;
      }
      
      .gallery-arrow.prev::before {
        transform: translate(-30%, -50%) rotate(-135deg);
      }
      
      .gallery-arrow.next {
        right: 0;
      }
      
      .gallery-arrow.next::before {
        transform: translate(-70%, -50%) rotate(45deg);
      }
      
      .gallery-arrow:hover {
        background-color: var(--color-accent);
      }
      
      input[type="radio"] {
        display: none;
      }
      
      .thumbnail-sets {
        display: flex;
        justify-content: center;
      }
      
      .thumbnail-set {
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        gap: 12px;
      }
      
      .thumbnail {
        width: 80px;
        height: 80px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        opacity: 0.6;
      }
      
      .thumbnail:hover {
        opacity: 1;
      }
      
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Section styling */
      .section-title {
        font-family: var(--font-secondary);
        font-size: 24px;
        font-weight: 400;
        color: var(--color-secondary);
        margin-bottom: 30px;
        text-align: center;
        position: relative;
      }
      
      .section-title::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 1px;
        background-color: var(--color-accent);
      }
      
      .product-details {
        margin-bottom: 60px;
      }
      
      .description-content {
        max-width: 800px;
        margin: 0 auto;
        text-align: center;
        font-size: 16px;
        line-height: 1.9;
      }
      
      /* Product specs styling */
      .product-specifications {
        margin-bottom: 60px;
      }
      
      .tech-table {
        max-width: 800px;
        margin: 0 auto;
        border-collapse: collapse;
        width: 100%;
      }
      
      .tech-row {
        display: flex;
        border-bottom: 1px solid var(--color-border);
      }
      
      .tech-row:nth-child(odd) {
        background-color: rgba(210, 180, 140, 0.05);
      }
      
      .tech-label {
        flex: 1;
        padding: 15px;
        font-weight: 500;
        color: var(--color-secondary);
      }
      
      .tech-value {
        flex: 2;
        padding: 15px;
      }
      
      /* Company showcase styling */
      .company-showcase {
        margin-top: 80px;
      }
      
      .info-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
        max-width: 1000px;
        margin: 0 auto;
      }
      
      .info-card {
        text-align: center;
        padding: 40px 20px;
        border: 1px solid var(--color-border);
        transition: all 0.3s ease;
      }
      
      .info-card:hover {
        border-color: var(--color-accent);
        background-color: white;
        box-shadow: var(--shadow);
      }
      
      .card-icon {
        color: var(--color-primary);
        margin-bottom: 25px;
      }
      
      .info-title {
        font-family: var(--font-secondary);
        font-size: 18px;
        margin-bottom: 15px;
        color: var(--color-secondary);
      }
      
      .info-description {
        color: var(--color-muted);
        line-height: 1.7;
        font-size: 15px;
      }
      
      /* Responsive styling */
      @media (max-width: 768px) {
        .product-title {
          font-size: 28px;
        }
        
        .description-content {
          text-align: left;
        }
        
        .thumbnail {
          width: 60px;
          height: 60px;
        }
      }
    `,
    js_interactions: ""
  },
  {
    name: "Modern Tech Showcase",
    description: "High-tech look with special focus on product specifications",
    thumbnail: null,
    type: "product",
    style: "modern",
    color_scheme: "dark",
    html_structure: `
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
            <div class="logo-wrapper">{{LOGO}}</div>
            <div class="header-content">
              <h1 class="product-title">{{TITLE}}</h1>
              <p class="product-subtitle">{{SUBTITLE}}</p>
              <div class="product-price">{{CURRENCY}}{{PRICE}}</div>
            </div>
          </header>
          
          <div class="gallery">
            {{IMAGES}}
          </div>
          
          <div class="product-grid">
            <div class="description-box">
              <h2 class="section-title">Product Description</h2>
              <div class="description-content">{{DESCRIPTION}}</div>
            </div>
            
            <div class="specs-box">
              <h2 class="section-title">Technical Specifications</h2>
              {{SPECS}}
            </div>
          </div>
          
          <div class="company-features">
            <h2 class="section-title">Key Features</h2>
            {{COMPANY_SECTIONS}}
          </div>
        </div>
        <script>
          {{JS_INTERACTIONS}}
        </script>
      </body>
      </html>
    `,
    css_styles: `
      :root {
        --color-primary: #00aaff;
        --color-secondary: #1a1a1a;
        --color-accent: #ff5722;
        --color-background: #121212;
        --color-surface: #1e1e1e;
        --color-text: #f0f0f0;
        --color-muted: #999999;
        --color-border: #333333;
        --font-primary: 'Roboto', 'Segoe UI', Arial, sans-serif;
        --radius: 8px;
        --glow: 0 0 10px rgba(0, 170, 255, 0.5);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
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
        padding: 30px 20px;
      }
      
      .product-header {
        display: flex;
        align-items: center;
        margin-bottom: 40px;
      }
      
      .logo-wrapper {
        flex: 0 0 150px;
        margin-right: 30px;
      }
      
      .logo-wrapper img {
        max-width: 100%;
        height: auto;
        filter: drop-shadow(0 0 5px rgba(0, 170, 255, 0.7));
      }
      
      .header-content {
        flex: 1;
      }
      
      .product-title {
        font-size: 32px;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 8px;
        background: linear-gradient(90deg, var(--color-text) 0%, var(--color-primary) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .product-subtitle {
        font-size: 16px;
        color: var(--color-muted);
        margin-bottom: 15px;
      }
      
      .product-price {
        font-size: 24px;
        font-weight: 600;
        color: var(--color-accent);
        display: inline-block;
        padding: 6px 15px;
        border: 1px solid var(--color-accent);
        border-radius: var(--radius);
      }
      
      /* Tech Gallery Styles */
      .gallery {
        margin-bottom: 50px;
        position: relative;
        border: 1px solid var(--color-border);
        border-radius: var(--radius);
        overflow: hidden;
        background-color: var(--color-surface);
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        padding-bottom: 60%;
        background-color: rgba(255, 255, 255, 0.02);
        overflow: hidden;
      }
      
      .gallery-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: none;
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.6);
        border: 1px solid var(--color-primary);
        border-radius: 50%;
        display: none;
        cursor: pointer;
        z-index: 10;
        box-shadow: var(--glow);
      }
      
      .gallery-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-style: solid;
        border-width: 2px 2px 0 0;
        border-color: var(--color-primary);
      }
      
      .gallery-arrow.prev {
        left: 15px;
      }
      
      .gallery-arrow.prev::before {
        transform: translate(-30%, -50%) rotate(-135deg);
      }
      
      .gallery-arrow.next {
        right: 15px;
      }
      
      .gallery-arrow.next::before {
        transform: translate(-70%, -50%) rotate(45deg);
      }
      
      input[type="radio"] {
        display: none;
      }
      
      .thumbnail-sets {
        display: flex;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.4);
        padding: 15px;
      }
      
      .thumbnail-set {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }
      
      .thumbnail {
        width: 70px;
        height: 70px;
        border: 2px solid var(--color-border);
        border-radius: var(--radius);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .thumbnail:hover {
        border-color: var(--color-primary);
        box-shadow: var(--glow);
        transform: scale(1.05);
      }
      
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Grid layout */
      .product-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 50px;
      }
      
      .description-box, .specs-box {
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius);
        padding: 25px;
      }
      
      .section-title {
        font-size: 22px;
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: 20px;
        position: relative;
        padding-bottom: 10px;
        letter-spacing: 0.5px;
      }
      
      .section-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 40px;
        height: 3px;
        background-color: var(--color-primary);
        border-radius: 1.5px;
      }
      
      .description-content {
        line-height: 1.8;
        color: var(--color-text);
      }
      
      /* Tech specs styling */
      .tech-table {
        width: 100%;
      }
      
      .tech-row {
        border-bottom: 1px solid var(--color-border);
        padding: 12px 0;
      }
      
      .tech-row:last-child {
        border-bottom: none;
      }
      
      .tech-label {
        font-weight: 500;
        color: var(--color-primary);
        margin-bottom: 5px;
      }
      
      .tech-value {
        color: var(--color-text);
      }
      
      /* Company features styling */
      .company-features {
        margin-top: 60px;
      }
      
      .info-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
      }
      
      .info-card {
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius);
        padding: 25px;
        transition: all 0.3s ease;
      }
      
      .info-card:hover {
        border-color: var(--color-primary);
        box-shadow: var(--glow);
        transform: translateY(-5px);
      }
      
      .card-icon {
        color: var(--color-primary);
        margin-bottom: 20px;
      }
      
      .info-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 15px;
        color: var(--color-text);
      }
      
      .info-description {
        color: var(--color-muted);
        line-height: 1.7;
      }
      
      /* Responsive styling */
      @media (max-width: 768px) {
        .product-header {
          flex-direction: column;
          text-align: center;
        }
        
        .logo-wrapper {
          margin-right: 0;
          margin-bottom: 20px;
        }
        
        .product-grid {
          grid-template-columns: 1fr;
        }
        
        .product-title {
          font-size: 26px;
        }
        
        .thumbnail {
          width: 60px;
          height: 60px;
        }
      }
    `,
    js_interactions: ""
  },
  {
    name: "Clean Service Showcase",
    description: "Clean and professional template perfect for service providers",
    thumbnail: null,
    type: "service",
    style: "modern",
    color_scheme: "light",
    html_structure: `
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
          <header class="service-header">
            <div class="branding">
              <div class="logo-container">{{LOGO}}</div>
              <h1 class="service-title">{{TITLE}}</h1>
              <p class="service-tagline">{{SUBTITLE}}</p>
              <div class="pricing">Starting from {{CURRENCY}}{{PRICE}}</div>
            </div>
          </header>
          
          <div class="gallery">
            {{IMAGES}}
          </div>
          
          <div class="service-content">
            <div class="service-description">
              <h2 class="section-title">Our Service</h2>
              <div class="description-text">{{DESCRIPTION}}</div>
            </div>
            
            <div class="service-options">
              <h2 class="section-title">Service Options</h2>
              {{SPECS}}
            </div>
          </div>
          
          <div class="company-benefits">
            <h2 class="section-title">Why Choose Us</h2>
            {{COMPANY_SECTIONS}}
          </div>
        </div>
        <script>
          {{JS_INTERACTIONS}}
        </script>
      </body>
      </html>
    `,
    css_styles: `
      :root {
        --color-primary: #4a90e2;
        --color-secondary: #333333;
        --color-accent: #50c878;
        --color-background: #ffffff;
        --color-text: #444444;
        --color-muted: #777777;
        --color-border: #e6e6e6;
        --font-primary: 'Open Sans', 'Segoe UI', sans-serif;
        --radius: 10px;
        --shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: var(--font-primary);
        color: var(--color-text);
        background-color: var(--color-background);
        line-height: 1.6;
      }
      
      .container {
        max-width: 1140px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      
      .service-header {
        text-align: center;
        margin-bottom: 50px;
      }
      
      .logo-container {
        margin-bottom: 25px;
      }
      
      .logo-container img {
        max-height: 80px;
        width: auto;
      }
      
      .service-title {
        font-size: 34px;
        font-weight: 700;
        color: var(--color-secondary);
        margin-bottom: 15px;
      }
      
      .service-tagline {
        font-size: 18px;
        color: var(--color-muted);
        margin-bottom: 20px;
        max-width: 700px;
        margin-left: auto;
        margin-right: auto;
      }
      
      .pricing {
        display: inline-block;
        background-color: var(--color-accent);
        color: white;
        font-weight: 600;
        padding: 8px 20px;
        border-radius: 50px;
        font-size: 16px;
        letter-spacing: 0.5px;
      }
      
      /* Service Gallery Styles */
      .gallery {
        margin-bottom: 50px;
        box-shadow: var(--shadow);
        border-radius: var(--radius);
        overflow: hidden;
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%; /* 16:9 ratio */
        background-color: #f9f9f9;
      }
      
      .gallery-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: none;
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        display: none;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      
      .gallery-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-style: solid;
        border-width: 2px 2px 0 0;
        border-color: var(--color-secondary);
      }
      
      .gallery-arrow.prev {
        left: 15px;
      }
      
      .gallery-arrow.prev::before {
        transform: translate(-30%, -50%) rotate(-135deg);
      }
      
      .gallery-arrow.next {
        right: 15px;
      }
      
      .gallery-arrow.next::before {
        transform: translate(-70%, -50%) rotate(45deg);
      }
      
      input[type="radio"] {
        display: none;
      }
      
      .thumbnail-sets {
        display: flex;
        padding: 15px;
        background-color: #f9f9f9;
        justify-content: center;
      }
      
      .thumbnail-set {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }
      
      .thumbnail {
        width: 80px;
        height: 60px;
        border: 2px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .thumbnail:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
      }
      
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Service content */
      .service-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 40px;
        margin-bottom: 60px;
      }
      
      .section-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--color-secondary);
        margin-bottom: 25px;
        position: relative;
      }
      
      .section-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -8px;
        width: 40px;
        height: 3px;
        background-color: var(--color-primary);
      }
      
      .description-text {
        font-size: 16px;
        line-height: 1.8;
      }
      
      /* Service options styling */
      .service-options {
        background-color: #f9f9f9;
        border-radius: var(--radius);
        padding: 25px;
      }
      
      .tech-table {
        width: 100%;
      }
      
      .tech-row {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--color-border);
      }
      
      .tech-row:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      
      .tech-label {
        font-weight: 600;
        color: var(--color-secondary);
        margin-bottom: 5px;
      }
      
      .tech-value {
        color: var(--color-text);
      }
      
      /* Company benefits styling */
      .company-benefits {
        margin-top: 40px;
      }
      
      .info-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
      }
      
      .info-card {
        background-color: white;
        border-radius: var(--radius);
        padding: 30px;
        box-shadow: var(--shadow);
        transition: transform 0.3s ease;
      }
      
      .info-card:hover {
        transform: translateY(-10px);
      }
      
      .card-icon {
        color: var(--color-primary);
        font-size: 32px;
        margin-bottom: 20px;
      }
      
      .info-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--color-secondary);
        margin-bottom: 15px;
      }
      
      .info-description {
        color: var(--color-muted);
        line-height: 1.7;
      }
      
      /* Responsive styling */
      @media (max-width: 768px) {
        .service-content {
          grid-template-columns: 1fr;
          gap: 30px;
        }
        
        .service-title {
          font-size: 28px;
        }
        
        .service-tagline {
          font-size: 16px;
        }
        
        .thumbnail {
          width: 60px;
          height: 45px;
        }
      }
    `,
    js_interactions: ""
  },
  {
    name: "Portfolio Showcase",
    description: "Artistic template ideal for showcasing creative work and portfolios",
    thumbnail: null,
    type: "portfolio",
    style: "modern",
    color_scheme: "light",
    html_structure: `
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
          <header class="portfolio-header">
            <div class="branding">
              <div class="logo-box">{{LOGO}}</div>
            </div>
            <div class="header-text">
              <h1 class="portfolio-title">{{TITLE}}</h1>
              <p class="portfolio-subtitle">{{SUBTITLE}}</p>
              <div class="portfolio-price">{{CURRENCY}}{{PRICE}}</div>
            </div>
          </header>
          
          <div class="gallery">
            {{IMAGES}}
          </div>
          
          <div class="project-description">
            <h2 class="section-title">Project Details</h2>
            <div class="description-content">{{DESCRIPTION}}</div>
          </div>
          
          <div class="project-specs">
            <h2 class="section-title">Project Specifications</h2>
            {{SPECS}}
          </div>
          
          <div class="about-designer">
            <h2 class="section-title">About the Creator</h2>
            {{COMPANY_SECTIONS}}
          </div>
        </div>
        <script>
          {{JS_INTERACTIONS}}
        </script>
      </body>
      </html>
    `,
    css_styles: `
      :root {
        --color-primary: #ff4e50;
        --color-secondary: #2c3e50;
        --color-accent: #27ae60;
        --color-background: #ffffff;
        --color-text: #333333;
        --color-muted: #7f8c8d;
        --color-border: #ecf0f1;
        --font-primary: 'Montserrat', 'Avenir Next', sans-serif;
        --radius: 8px;
        --shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
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
        padding: 50px 20px;
      }
      
      .portfolio-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 60px;
        text-align: center;
      }
      
      .branding {
        margin-bottom: 30px;
      }
      
      .logo-box {
        max-width: 120px;
        margin: 0 auto;
      }
      
      .logo-box img {
        width: 100%;
        height: auto;
      }
      
      .header-text {
        max-width: 800px;
      }
      
      .portfolio-title {
        font-size: 36px;
        font-weight: 800;
        color: var(--color-secondary);
        margin-bottom: 15px;
        letter-spacing: -0.5px;
      }
      
      .portfolio-subtitle {
        font-size: 18px;
        color: var(--color-muted);
        margin-bottom: 25px;
      }
      
      .portfolio-price {
        display: inline-block;
        background-color: var(--color-accent);
        color: white;
        font-weight: 600;
        font-size: 18px;
        padding: 8px 20px;
        border-radius: 4px;
      }
      
      /* Portfolio Gallery Styles */
      .gallery {
        margin-bottom: 60px;
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        padding-bottom: 66.67%; /* 3:2 ratio */
        background-color: #f9f9f9;
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow);
        margin-bottom: 15px;
      }
      
      .gallery-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: none;
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        display: none;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
      }
      
      .gallery-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-style: solid;
        border-width: 2px 2px 0 0;
        border-color: var(--color-secondary);
      }
      
      .gallery-arrow.prev {
        left: 20px;
      }
      
      .gallery-arrow.prev::before {
        transform: translate(-30%, -50%) rotate(-135deg);
      }
      
      .gallery-arrow.next {
        right: 20px;
      }
      
      .gallery-arrow.next::before {
        transform: translate(-70%, -50%) rotate(45deg);
      }
      
      input[type="radio"] {
        display: none;
      }
      
      .thumbnail-sets {
        display: flex;
        justify-content: center;
      }
      
      .thumbnail-set {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 10px;
        width: 100%;
      }
      
      .thumbnail {
        aspect-ratio: 1;
        border: 2px solid transparent;
        border-radius: var(--radius);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .thumbnail:hover {
        transform: scale(1.05);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Project sections */
      .project-description,
      .project-specs {
        margin-bottom: 60px;
      }
      
      .section-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--color-secondary);
        margin-bottom: 25px;
        position: relative;
        display: inline-block;
      }
      
      .section-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -5px;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, var(--color-primary), transparent);
      }
      
      .description-content {
        font-size: 16px;
        line-height: 1.8;
        max-width: 900px;
      }
      
      /* Specs styling */
      .tech-table {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .tech-row {
        background-color: #f9f9f9;
        border-radius: var(--radius);
        padding: 15px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      }
      
      .tech-label {
        font-weight: 600;
        color: var(--color-secondary);
        margin-bottom: 8px;
      }
      
      .tech-value {
        color: var(--color-text);
      }
      
      /* About designer styling */
      .about-designer {
        margin-top: 40px;
      }
      
      .info-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
      }
      
      .info-card {
        background-color: #f9f9f9;
        border-radius: var(--radius);
        padding: 30px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .info-card:hover {
        transform: translateY(-10px);
        box-shadow: var(--shadow);
      }
      
      .card-icon {
        color: var(--color-primary);
        margin-bottom: 20px;
      }
      
      .info-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--color-secondary);
        margin-bottom: 15px;
      }
      
      .info-description {
        color: var(--color-muted);
        line-height: 1.7;
      }
      
      /* Responsive styling */
      @media (max-width: 768px) {
        .portfolio-title {
          font-size: 28px;
        }
        
        .thumbnail-set {
          grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
        }
      }
    `,
    js_interactions: ""
  },
  {
    name: "Simple Corporate Profile",
    description: "Clean and simple template for corporate company profiles",
    thumbnail: null,
    type: "company",
    style: "minimalist",
    color_scheme: "light",
    html_structure: `
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
          <header class="company-header">
            <div class="logo-container">{{LOGO}}</div>
            <h1 class="company-name">{{TITLE}}</h1>
            <p class="company-slogan">{{SUBTITLE}}</p>
          </header>
          
          <div class="gallery">
            {{IMAGES}}
          </div>
          
          <div class="company-about">
            <h2 class="section-title">About Us</h2>
            <div class="about-content">{{DESCRIPTION}}</div>
          </div>
          
          <div class="company-values">
            <h2 class="section-title">Our Values</h2>
            {{COMPANY_SECTIONS}}
          </div>
          
          <div class="company-details">
            <h2 class="section-title">Company Details</h2>
            {{SPECS}}
          </div>
        </div>
        <script>
          {{JS_INTERACTIONS}}
        </script>
      </body>
      </html>
    `,
    css_styles: `
      :root {
        --color-primary: #0077cc;
        --color-secondary: #292929;
        --color-accent: #f8f8f8;
        --color-background: #ffffff;
        --color-text: #444444;
        --color-muted: #777777;
        --color-border: #eeeeee;
        --font-primary: 'Arial', 'Helvetica Neue', sans-serif;
        --radius: 4px;
        --shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: var(--font-primary);
        color: var(--color-text);
        background-color: var(--color-background);
        line-height: 1.6;
      }
      
      .container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      
      .company-header {
        text-align: center;
        margin-bottom: 50px;
      }
      
      .logo-container {
        margin-bottom: 20px;
      }
      
      .logo-container img {
        max-height: 80px;
        width: auto;
      }
      
      .company-name {
        font-size: 32px;
        font-weight: 600;
        color: var(--color-secondary);
        margin-bottom: 10px;
      }
      
      .company-slogan {
        font-size: 18px;
        color: var(--color-muted);
      }
      
      /* Corporate Gallery Styles */
      .gallery {
        margin-bottom: 60px;
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%; /* 16:9 ratio */
        background-color: var(--color-accent);
        overflow: hidden;
        margin-bottom: 10px;
      }
      
      .gallery-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: none;
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 36px;
        height: 36px;
        background-color: rgba(255, 255, 255, 0.8);
        display: none;
        cursor: pointer;
        z-index: 10;
      }
      
      .gallery-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 8px;
        height: 8px;
        border-style: solid;
        border-width: 2px 2px 0 0;
        border-color: var(--color-secondary);
      }
      
      .gallery-arrow.prev {
        left: 10px;
      }
      
      .gallery-arrow.prev::before {
        transform: translate(-30%, -50%) rotate(-135deg);
      }
      
      .gallery-arrow.next {
        right: 10px;
      }
      
      .gallery-arrow.next::before {
        transform: translate(-70%, -50%) rotate(45deg);
      }
      
      input[type="radio"] {
        display: none;
      }
      
      .thumbnail-sets {
        display: flex;
        justify-content: center;
      }
      
      .thumbnail-set {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }
      
      .thumbnail {
        width: 70px;
        height: 50px;
        border: 1px solid var(--color-border);
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.2s ease;
      }
      
      .thumbnail:hover {
        border-color: var(--color-primary);
      }
      
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Company sections */
      .company-about,
      .company-values,
      .company-details {
        margin-bottom: 50px;
      }
      
      .section-title {
        font-size: 22px;
        font-weight: 600;
        color: var(--color-secondary);
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--color-border);
      }
      
      .about-content {
        font-size: 16px;
        line-height: 1.8;
        max-width: 900px;
      }
      
      /* Company values styling */
      .info-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 25px;
      }
      
      .info-card {
        background-color: var(--color-accent);
        padding: 25px;
        border-left: 3px solid var(--color-primary);
      }
      
      .card-icon {
        color: var(--color-primary);
        margin-bottom: 15px;
      }
      
      .info-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-secondary);
        margin-bottom: 10px;
      }
      
      .info-description {
        color: var(--color-text);
        line-height: 1.7;
      }
      
      /* Company details styling */
      .tech-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .tech-row {
        display: flex;
        border-bottom: 1px solid var(--color-border);
      }
      
      .tech-row:last-child {
        border-bottom: none;
      }
      
      .tech-label {
        flex: 1;
        padding: 12px 10px;
        font-weight: 600;
        color: var(--color-secondary);
        background-color: var(--color-accent);
      }
      
      .tech-value {
        flex: 2;
        padding: 12px 10px;
      }
      
      /* Responsive styling */
      @media (max-width: 768px) {
        .company-name {
          font-size: 26px;
        }
        
        .company-slogan {
          font-size: 16px;
        }
        
        .thumbnail {
          width: 60px;
          height: 45px;
        }
      }
    `,
    js_interactions: ""
  },
  {
    name: "Vibrant Product Showcase",
    description: "Colorful and eye-catching template for product showcases",
    thumbnail: null,
    type: "product",
    style: "bold",
    color_scheme: "colorful",
    html_structure: `
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
            <div class="logo-area">{{LOGO}}</div>
            <div class="product-info">
              <h1 class="product-title">{{TITLE}}</h1>
              <p class="product-subtitle">{{SUBTITLE}}</p>
              <div class="product-price-tag">{{CURRENCY}}{{PRICE}}</div>
            </div>
          </header>
          
          <div class="gallery">
            {{IMAGES}}
          </div>
          
          <div class="product-highlights">
            <div class="main-description">
              <h2 class="section-title">Product Description</h2>
              <div class="description-text">{{DESCRIPTION}}</div>
            </div>
            
            <div class="main-specs">
              <h2 class="section-title">Specifications</h2>
              {{SPECS}}
            </div>
          </div>
          
          <div class="company-features">
            <h2 class="section-title">Features & Benefits</h2>
            {{COMPANY_SECTIONS}}
          </div>
        </div>
        <script>
          {{JS_INTERACTIONS}}
        </script>
      </body>
      </html>
    `,
    css_styles: `
      :root {
        --color-primary: #ff5252;
        --color-secondary: #5c6bc0;
        --color-accent: #ffeb3b;
        --color-background: #ffffff;
        --color-text: #212121;
        --color-muted: #757575;
        --color-border: #e0e0e0;
        --font-primary: 'Poppins', 'Helvetica Neue', sans-serif;
        --radius: 12px;
        --shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: var(--font-primary);
        color: var(--color-text);
        background-color: var(--color-background);
        line-height: 1.6;
      }
      
      .container {
        max-width: 1140px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      
      .product-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 40px;
      }
      
      .logo-area {
        margin-bottom: 25px;
      }
      
      .logo-area img {
        max-height: 80px;
        width: auto;
      }
      
      .product-info {
        max-width: 800px;
      }
      
      .product-title {
        font-size: 36px;
        font-weight: 800;
        background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 15px;
      }
      
      .product-subtitle {
        font-size: 18px;
        color: var(--color-muted);
        margin-bottom: 20px;
      }
      
      .product-price-tag {
        display: inline-block;
        background-color: var(--color-accent);
        color: var(--color-text);
        font-weight: 700;
        font-size: 20px;
        padding: 8px 25px;
        border-radius: 30px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        transform: rotate(-2deg);
      }
      
      /* Vibrant Gallery Styles */
      .gallery {
        margin-bottom: 60px;
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow);
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        padding-bottom: 65%;
        background-image: linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%, #f3f3f3), 
                         linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%, #f3f3f3);
        background-size: 20px 20px;
        background-position: 0 0, 10px 10px;
        overflow: hidden;
      }
      
      .gallery-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: none;
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 50px;
        height: 50px;
        background-color: white;
        border-radius: 50%;
        display: none;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
      
      .gallery-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 12px;
        height: 12px;
        border-style: solid;
        border-width: 3px 3px 0 0;
      }
      
      .gallery-arrow.prev {
        left: 20px;
      }
      
      .gallery-arrow.prev::before {
        border-color: var(--color-primary);
        transform: translate(-30%, -50%) rotate(-135deg);
      }
      
      .gallery-arrow.next {
        right: 20px;
      }
      
      .gallery-arrow.next::before {
        border-color: var(--color-secondary);
        transform: translate(-70%, -50%) rotate(45deg);
      }
      
      input[type="radio"] {
        display: none;
      }
      
      .thumbnail-sets {
        display: flex;
        justify-content: center;
        background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
        padding: 15px;
      }
      
      .thumbnail-set {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }
      
      .thumbnail {
        width: 80px;
        height: 80px;
        border: 3px solid rgba(255, 255, 255, 0.5);
        border-radius: var(--radius);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .thumbnail:hover {
        transform: scale(1.1);
        border-color: white;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
      
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Product highlights */
      .product-highlights {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 40px;
        margin-bottom: 60px;
      }
      
      .section-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 20px;
        position: relative;
        padding-bottom: 10px;
      }
      
      .section-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 40px;
        height: 4px;
        background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
        border-radius: 2px;
      }
      
      .description-text {
        font-size: 16px;
        line-height: 1.8;
      }
      
      /* Specs styling */
      .main-specs {
        background-color: #f9f9f9;
        padding: 25px;
        border-radius: var(--radius);
      }
      
      .tech-table {
        width: 100%;
      }
      
      .tech-row {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px dashed var(--color-border);
      }
      
      .tech-row:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      
      .tech-label {
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: 5px;
      }
      
      .tech-value {
        color: var(--color-text);
      }
      
      /* Company features styling */
      .company-features {
        margin-top: 40px;
      }
      
      .info-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 30px;
      }
      
      .info-card {
        background-color: white;
        border-radius: var(--radius);
        padding: 30px;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        z-index: 1;
      }
      
      .info-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
        z-index: -1;
      }
      
      .info-card:hover {
        transform: translateY(-10px);
      }
      
      .card-icon {
        font-size: 32px;
        margin-bottom: 20px;
        background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .info-title {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 15px;
        color: var(--color-text);
      }
      
      .info-description {
        color: var(--color-muted);
        line-height: 1.7;
      }
      
      /* Responsive styling */
      @media (max-width: 768px) {
        .product-highlights {
          grid-template-columns: 1fr;
        }
        
        .product-title {
          font-size: 28px;
        }
        
        .thumbnail {
          width: 60px;
          height: 60px;
        }
      }
    `,
    js_interactions: ""
  },
  {
    name: "Classic Business Template",
    description: "Traditional and professional design for established businesses",
    thumbnail: null,
    type: "company",
    style: "classic",
    color_scheme: "light",
    html_structure: `
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
          <header class="company-header">
            <div class="header-content">
              <div class="logo-wrapper">{{LOGO}}</div>
              <div class="company-info">
                <h1 class="company-name">{{TITLE}}</h1>
                <p class="company-tagline">{{SUBTITLE}}</p>
              </div>
            </div>
          </header>
          
          <div class="gallery">
            {{IMAGES}}
          </div>
          
          <div class="company-intro">
            <h2 class="section-title">Company Overview</h2>
            <div class="company-description">{{DESCRIPTION}}</div>
          </div>
          
          <div class="company-values">
            <h2 class="section-title">Our Values</h2>
            {{COMPANY_SECTIONS}}
          </div>
          
          <div class="company-facts">
            <h2 class="section-title">Company Information</h2>
            {{SPECS}}
          </div>
        </div>
        <script>
          {{JS_INTERACTIONS}}
        </script>
      </body>
      </html>
    `,
    css_styles: `
      :root {
        --color-primary: #003366;
        --color-secondary: #333333;
        --color-accent: #cc9900;
        --color-background: #ffffff;
        --color-text: #333333;
        --color-muted: #666666;
        --color-border: #dddddd;
        --font-primary: 'Times New Roman', serif;
        --font-secondary: 'Georgia', serif;
        --radius: 0px;
        --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: var(--font-primary);
        color: var(--color-text);
        background-color: var(--color-background);
        line-height: 1.6;
      }
      
      .container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      
      .company-header {
        margin-bottom: 40px;
        border-bottom: 2px solid var(--color-border);
        padding-bottom: 30px;
      }
      
      .header-content {
        display: flex;
        align-items: center;
      }
      
      .logo-wrapper {
        flex: 0 0 150px;
        margin-right: 30px;
      }
      
      .logo-wrapper img {
        max-width: 100%;
        height: auto;
      }
      
      .company-info {
        flex: 1;
      }
      
      .company-name {
        font-family: var(--font-secondary);
        font-size: 32px;
        font-weight: 700;
        color: var(--color-primary);
        margin-bottom: 10px;
      }
      
      .company-tagline {
        font-style: italic;
        color: var(--color-muted);
        font-size: 18px;
      }
      
      /* Classic Gallery Styles */
      .gallery {
        margin-bottom: 50px;
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%; /* 16:9 ratio */
        background-color: #f5f5f5;
        margin-bottom: 10px;
        border: 1px solid var(--color-border);
      }
      
      .gallery-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: none;
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background-color: rgba(255, 255, 255, 0.8);
        display: none;
        cursor: pointer;
        z-index: 10;
        border: 1px solid var(--color-border);
      }
      
      .gallery-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-style: solid;
        border-width: 2px 2px 0 0;
        border-color: var(--color-primary);
      }
      
      .gallery-arrow.prev {
        left: 15px;
      }
      
      .gallery-arrow.prev::before {
        transform: translate(-30%, -50%) rotate(-135deg);
      }
      
      .gallery-arrow.next {
        right: 15px;
      }
      
      .gallery-arrow.next::before {
        transform: translate(-70%, -50%) rotate(45deg);
      }
      
      input[type="radio"] {
        display: none;
      }
      
      .thumbnail-sets {
        display: flex;
        justify-content: center;
      }
      
      .thumbnail-set {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 5px;
      }
      
      .thumbnail {
        width: 80px;
        height: 60px;
        border: 1px solid var(--color-border);
        cursor: pointer;
        transition: border-color 0.2s ease;
      }
      
      .thumbnail:hover {
        border-color: var(--color-primary);
      }
      
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Company sections */
      .company-intro,
      .company-values,
      .company-facts {
        margin-bottom: 50px;
      }
      
      .section-title {
        font-family: var(--font-secondary);
        font-size: 24px;
        font-weight: 700;
        color: var(--color-primary);
        margin-bottom: 20px;
        border-bottom: 1px solid var(--color-accent);
        padding-bottom: 10px;
        display: inline-block;
      }
      
      .company-description {
        font-size: 16px;
        line-height: 1.8;
        max-width: 900px;
      }
      
      /* Values styling */
      .info-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
      }
      
      .info-card {
        background-color: #f9f9f9;
        padding: 25px;
        border: 1px solid var(--color-border);
      }
      
      .card-icon {
        color: var(--color-accent);
        margin-bottom: 15px;
      }
      
      .info-title {
        font-family: var(--font-secondary);
        font-size: 20px;
        font-weight: 700;
        color: var(--color-primary);
        margin-bottom: 15px;
      }
      
      .info-description {
        color: var(--color-text);
        line-height: 1.7;
      }
      
      /* Company facts styling */
      .tech-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid var(--color-border);
      }
      
      .tech-row {
        display: flex;
      }
      
      .tech-row:nth-child(even) {
        background-color: #f9f9f9;
      }
      
      .tech-label {
        flex: 1;
        padding: 12px 15px;
        font-weight: 700;
        color: var(--color-primary);
        border-right: 1px solid var(--color-border);
        border-bottom: 1px solid var(--color-border);
      }
      
      .tech-value {
        flex: 2;
        padding: 12px 15px;
        border-bottom: 1px solid var(--color-border);
      }
      
      .tech-row:last-child .tech-label,
      .tech-row:last-child .tech-value {
        border-bottom: none;
      }
      
      /* Responsive styling */
      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          text-align: center;
        }
        
        .logo-wrapper {
          margin-right: 0;
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 26px;
        }
        
        .thumbnail {
          width: 70px;
          height: 50px;
        }
      }
    `,
    js_interactions: ""
  },
  {
    name: "Minimalist Dark Tech",
    description: "Sleek dark-themed template focusing on technical products",
    thumbnail: null,
    type: "product",
    style: "minimalist",
    color_scheme: "dark",
    html_structure: `
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
            <div class="brand">{{LOGO}}</div>
            <h1 class="product-title">{{TITLE}}</h1>
            <p class="product-subtitle">{{SUBTITLE}}</p>
            <div class="price">{{CURRENCY}}{{PRICE}}</div>
          </header>
          
          <div class="gallery">
            {{IMAGES}}
          </div>
          
          <div class="content-columns">
            <div class="description-column">
              <h2 class="section-title">About</h2>
              <div class="product-description">{{DESCRIPTION}}</div>
            </div>
            
            <div class="specs-column">
              <h2 class="section-title">Technical Specs</h2>
              {{SPECS}}
            </div>
          </div>
          
          <div class="features">
            <h2 class="section-title">Features</h2>
            {{COMPANY_SECTIONS}}
          </div>
        </div>
        <script>
          {{JS_INTERACTIONS}}
        </script>
      </body>
      </html>
    `,
    css_styles: `
      :root {
        --color-primary: #00e5ff;
        --color-secondary: #ffffff;
        --color-accent: #ff3d00;
        --color-background: #121212;
        --color-surface: #1e1e1e;
        --color-text: #e0e0e0;
        --color-muted: #9e9e9e;
        --color-border: #333333;
        --font-primary: 'Inter', 'Roboto', sans-serif;
        --radius: 4px;
        --shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: var(--font-primary);
        color: var(--color-text);
        background-color: var(--color-background);
        line-height: 1.6;
      }
      
      .container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 50px 20px;
      }
      
      .product-header {
        text-align: center;
        margin-bottom: 50px;
      }
      
      .brand {
        margin-bottom: 25px;
      }
      
      .brand img {
        max-height: 60px;
        width: auto;
        filter: brightness(0) invert(1);
      }
      
      .product-title {
        font-size: 32px;
        font-weight: 600;
        color: var(--color-secondary);
        margin-bottom: 10px;
        letter-spacing: -0.5px;
      }
      
      .product-subtitle {
        font-size: 16px;
        color: var(--color-muted);
        margin-bottom: 20px;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }
      
      .price {
        display: inline-block;
        color: var(--color-primary);
        font-size: 20px;
        font-weight: 600;
        border: 1px solid var(--color-primary);
        padding: 8px 20px;
        border-radius: var(--radius);
      }
      
      /* Minimalist Dark Gallery Styles */
      .gallery {
        margin-bottom: 60px;
        background-color: var(--color-surface);
        border-radius: var(--radius);
        overflow: hidden;
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        padding-bottom: 60%;
        background-color: rgba(255, 255, 255, 0.03);
      }
      
      .gallery-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: none;
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        cursor: pointer;
        z-index: 10;
      }
      
      .gallery-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-style: solid;
        border-width: 2px 2px 0 0;
        border-color: var(--color-primary);
      }
      
      .gallery-arrow.prev {
        left: 0;
      }
      
      .gallery-arrow.prev::before {
        transform: translate(-30%, -50%) rotate(-135deg);
      }
      
      .gallery-arrow.next {
        right: 0;
      }
      
      .gallery-arrow.next::before {
        transform: translate(-70%, -50%) rotate(45deg);
      }
      
      input[type="radio"] {
        display: none;
      }
      
      .thumbnail-sets {
        display: flex;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.05);
        padding: 15px;
      }
      
      .thumbnail-set {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
        gap: 8px;
        width: 100%;
        max-width: 600px;
      }
      
      .thumbnail {
        aspect-ratio: 1;
        background-color: rgba(255, 255, 255, 0.1);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .thumbnail:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Content columns */
      .content-columns {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 40px;
        margin-bottom: 60px;
      }
      
      .section-title {
        font-size: 20px;
        font-weight: 500;
        color: var(--color-primary);
        margin-bottom: 20px;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      
      .product-description {
        font-size: 16px;
        line-height: 1.8;
      }
      
      /* Specs styling */
      .specs-column {
        background-color: var(--color-surface);
        padding: 25px;
        border-radius: var(--radius);
      }
      
      .tech-table {
        width: 100%;
      }
      
      .tech-row {
        padding-bottom: 15px;
        margin-bottom: 15px;
        border-bottom: 1px solid var(--color-border);
      }
      
      .tech-row:last-child {
        padding-bottom: 0;
        margin-bottom: 0;
        border-bottom: none;
      }
      
      .tech-label {
        font-size: 14px;
        color: var(--color-muted);
        margin-bottom: 5px;
      }
      
      .tech-value {
        color: var(--color-text);
      }
      
      /* Features styling */
      .features {
        margin-top: 60px;
      }
      
      .info-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .info-card {
        background-color: var(--color-surface);
        padding: 30px;
        border-radius: var(--radius);
        border-left: 2px solid var(--color-primary);
      }
      
      .card-icon {
        color: var(--color-primary);
        margin-bottom: 20px;
      }
      
      .info-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-secondary);
        margin-bottom: 15px;
      }
      
      .info-description {
        color: var(--color-muted);
        line-height: 1.7;
        font-size: 14px;
      }
      
      /* Responsive styling */
      @media (max-width: 768px) {
        .content-columns {
          grid-template-columns: 1fr;
        }
        
        .product-title {
          font-size: 26px;
        }
        
        .thumbnail-set {
          grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
        }
      }
    `,
    js_interactions: ""
  }
];

async function createTemplateStyles() {
  try {
    // First, let's delete any existing styles to ensure clean data
    await db.delete(templateStyles);
    
    console.log('Deleted existing template styles');
    
    // Set a default thumbnail for all styles
    const defaultThumbnail = "/styles/modern-product.jpg";
    
    // Now insert all our new styles with a thumbnail
    for (const style of styles) {
      // Ensure all thumbnails have a value and add created_at
      const styleWithThumbnail = {
        ...style,
        thumbnail: style.thumbnail || defaultThumbnail,
        created_at: new Date()
      };
      
      await db.insert(templateStyles).values(styleWithThumbnail);
    }
    
    console.log(`Successfully created ${styles.length} template styles`);
  } catch (error) {
    console.error('Error creating template styles:', error);
  }
}

// Run the function
createTemplateStyles();