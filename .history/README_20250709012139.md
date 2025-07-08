# eBay Template Designer

A modern React-based eBay template editor with TypeScript, Tailwind CSS, and a full-stack architecture.

## 🚀 Live Demo

Visit the live application: [https://yourusername.github.io/EbayTemplateDesigner/](https://yourusername.github.io/EbayTemplateDesigner/)

## 📦 GitHub Pages Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions.

### Setup Instructions:

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Click on "Settings" tab
   - Scroll down to "Pages" section
   - Under "Source", select "GitHub Actions"
   - Save the settings

3. **The deployment will automatically trigger** when you push to the `main` branch.

### Local Development

```bash
# Install dependencies
npm install

# Start development server (full-stack)
npm run dev

# Build for production (client only)
npm run build:client

# Build full application (client + server)
npm run build
```

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Express, Node.js, TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Passport.js
- **UI Components:** Radix UI, Shadcn/ui
- **Deployment:** GitHub Pages (frontend), Vercel/Railway (full-stack)

## 📁 Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── .github/         # GitHub Actions workflows
└── dist/           # Build output
```

## 🔧 Configuration

The project is configured to work both locally and on GitHub Pages:

- Local development: `npm run dev` (runs full-stack)
- GitHub Pages: `npm run build:client` (frontend only)
- Production: `npm run build` (full-stack)

## 📝 Notes

- GitHub Pages deployment only includes the frontend React application
- For full-stack functionality, deploy the server separately to platforms like Vercel, Railway, or Heroku
- The client build is configured to work with GitHub Pages base path

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
