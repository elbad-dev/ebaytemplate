# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in the eBay Template Designer, please report it responsibly:

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email security concerns to: [your-email@example.com]
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Features

### Client-Side Processing
- All template processing happens in the browser
- No sensitive data is sent to external servers
- No user data persistence on GitHub Pages

### HTML Sanitization
- All HTML content is sanitized using DOMPurify
- Malicious scripts and dangerous elements are removed
- Safe subset of HTML tags and attributes allowed

### File Upload Security
- File size limits enforced (5MB for files, 1MB for content)
- File type validation (HTML files only)
- Content size limits for text processing
- MIME type verification with fallback to file extension

### Content Security Policy
- Strict CSP headers prevent XSS attacks
- Restricts resource loading to trusted sources
- Blocks inline scripts except where necessary

### Demo Mode Security
- No real authentication credentials stored
- No persistent data storage
- Client-side only operation
- Simulated authentication for demonstration

## Security Headers

The application implements the following security headers:

- `Content-Security-Policy`: Prevents XSS and injection attacks
- `X-Frame-Options`: Prevents clickjacking attacks
- `X-Content-Type-Options`: Prevents MIME sniffing attacks
- `X-XSS-Protection`: Enables browser XSS filtering
- `Referrer-Policy`: Controls referrer information

## Dependencies

### Security-Critical Dependencies
- **DOMPurify**: HTML sanitization library
- **TypeScript**: Type safety to prevent runtime errors
- **Vite**: Build tool with built-in security features

### Automated Security Scanning
- GitHub Actions workflow for dependency auditing
- Weekly automated security scans
- npm audit integration for vulnerability detection

## Best Practices

### For Users
1. Only upload HTML templates from trusted sources
2. Verify template content before use
3. Be cautious with templates containing external resources
4. Report suspicious behavior immediately

### For Developers
1. Always sanitize user input with DOMPurify
2. Validate file types and sizes
3. Use TypeScript for type safety
4. Follow secure coding practices
5. Keep dependencies updated

## Limitations

Since this is a static site hosted on GitHub Pages:
- No server-side processing means no server-side vulnerabilities
- No database means no SQL injection risks
- No user accounts means no credential theft risks
- All processing is client-side and transparent

## Updates

This security policy is updated as needed when new features are added or security practices evolve.

Last updated: July 2025
