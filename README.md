# TCGP Simulator

A React web application for simulating Pokémon TCG gameplay.

## Development

```
npm install
npm run dev
```

## Deployment to GitHub Pages

This project is configured to be deployed to GitHub Pages automatically using GitHub Actions. To deploy:

1. Push your changes to the main branch
2. GitHub Actions will automatically build and deploy your app
3. Your app will be available at https://[your-username].github.io/tcgp-sim/

### Manual Deployment

To deploy manually:

```bash
# Build the project
npm run build

# Deploy to GitHub Pages (if you have gh-pages installed)
npm install -g gh-pages
gh-pages -d dist
```

## Configuration

If your repository name is different from `tcgp-sim`, update the `base` property in `vite.config.js` to match your repository name:

```js
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/', 
})
```