# LDD MD Enhancer — Landing Page

Landing page for the **LDD MD Enhancer** Chrome extension by LavenderDragonDesign.

## Deploy on GitHub Pages (recommended)

1. Push this folder (or its contents) to a GitHub repo
2. Go to **Settings → Pages**
3. Under **Source**, select `Deploy from a branch`
4. Choose `main` branch and `/ (root)` folder → Save
5. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO`

## Deploy on Netlify (optional)

Drag the folder onto [netlify.com](https://netlify.com) or connect your GitHub repo. The `netlify.toml` is already configured.

## Before going live

Replace every `YOUR_GITHUB_USERNAME/YOUR_REPO` placeholder in `index.html` with your actual GitHub repo URL.

When your Chrome Web Store link is ready:
- Update the CWS links in `index.html` (search `YOUR_CHROME_STORE_LINK_HERE`)
- Update the redirect in `netlify.toml` if using Netlify

## Files

| File | Purpose |
|------|---------|
| `index.html` | The landing page |
| `_config.yml` | GitHub Pages — tells Jekyll not to process raw HTML |
| `netlify.toml` | Netlify config — headers + `/install` redirect |
| `robots.txt` | SEO crawl rules |
