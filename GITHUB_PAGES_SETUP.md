# GitHub Pages Deployment Setup

This guide walks through the one-time manual configuration needed for GitHub Pages deployment.

## Prerequisites
- GitHub repository created
- You have admin access to the repository

## Step 1: Configure GitHub Pages

1. Go to your repository on GitHub: `https://github.com/keithamoss/moo-object-experience`

2. Click on **Settings** (top right of the repository page)

3. In the left sidebar, click on **Pages** (under "Code and automation")

4. Under **Source**, select:
   - Source: **GitHub Actions**

   (This allows the GitHub Actions workflow to deploy the site)

5. Save the settings if prompted

## Step 2: Configure Custom Domain

1. Still on the Pages settings page, under **Custom domain**:
   - Enter: `moo.keithandhelenmakestuff.com`
   - Click **Save**

2. Wait for DNS check to complete (GitHub will verify the domain)

## Step 3: Configure DNS in Cloudflare

1. Log in to your Cloudflare dashboard
2. Select your domain: `keithandhelenmakestuff.com`
3. Go to **DNS** > **Records**
4. Click **Add record**
5. Configure the CNAME record:
   - **Type**: `CNAME`
   - **Name**: `moo`
   - **Target**: `keithamoss.github.io`
   - **Proxy status**: DNS only (grey cloud) ⚠️ **Important: Do not proxy initially**
   - **TTL**: Auto
6. Click **Save**

**Important Notes**:
- Use **DNS only** (grey cloud icon) initially so GitHub can verify the domain and provision SSL
- After GitHub has verified the domain and HTTPS is working, you can optionally enable Cloudflare proxy (orange cloud)
- With Cloudflare, DNS propagation is typically very fast (1-5 minutes)

## Step 4: Enable HTTPS

1. Back on the GitHub Pages settings
2. Once DNS is configured and verified, check the box:
   - ☑ **Enforce HTTPS**

This may take a few minutes to become available after DNS verification.

### Optional: Enable Cloudflare Proxy
After GitHub HTTPS is working:
1. Return to Cloudflare DNS settings
2. Edit the `moo` CNAME record
3. Click the cloud icon to enable proxy (turns orange)
4. Ensure Cloudflare SSL/TLS mode is set to **Full** or **Full (strict)**
   - Go to **SSL/TLS** > **Overview**
   - Select **Full** (or **Full (strict)** if you have a valid GitHub Pages cert)

## Step 5: Add Secrets for Google Sheets API (When Ready)

1. Go to **Settings** > **Secrets and variables** > **Actions**

2. Click **New repository secret**

3. Add these secrets:
   - Name: `GOOGLE_SHEETS_API_KEY`
     Value: `your-api-key-here`
   
   - Name: `GOOGLE_SHEET_ID`
     Value: `your-sheet-id-here`

4. Update `.github/workflows/deploy.yml` to uncomment the env variables in the build step

## Step 6: Trigger First Deployment

1. Commit and push the workflow file to the `main` branch:
   ```bash
   git add .github/workflows/deploy.yml public/CNAME
   git commit -m "Add GitHub Pages deployment workflow"
   git push origin main
   ```

2. Go to the **Actions** tab in your repository

3. Watch the "Deploy to GitHub Pages" workflow run

4. Once complete, your site should be live at:
   - `https://keithamoss.github.io/moo-object-experience/` (GitHub Pages default URL)
   - `https://moo.keithandhelenmakestuff.com/` (once DNS propagates)

## Troubleshooting

### Build Fails
- Check the Actions tab for error logs
- Ensure all dependencies are in package.json
- Test build locally: `npm run build`

### Custom Domain Not Working
- Verify DNS records are correct in Cloudflare
- Ensure proxy is **disabled** (grey cloud) during initial setup
- Check that CNAME file exists in the `public/` folder
- Ensure CNAME file contains only the domain (no http://)
- Cloudflare DNS is usually fast (1-5 minutes), if not working after 10 minutes, check for typos

### HTTPS Not Available
- Ensure Cloudflare proxy is **disabled** (grey cloud) initially
- Wait for DNS to fully propagate
- GitHub needs to provision SSL certificate (can take ~1 hour after DNS verification)
- Try unchecking and re-checking "Enforce HTTPS"
- If using Cloudflare proxy: check SSL/TLS mode is set to **Full** or **Full (strict)**

### Page Shows 404
- Ensure the workflow completed successfully
- Check that dist/index.html was created in the build
- Verify Pages source is set to "GitHub Actions"

## Monitoring Deployments

- Every push to `main` will trigger a new deployment
- View deployment history in the **Actions** tab
- View live deployment status in **Settings** > **Pages**

## Related Files

- GitHub Actions workflow: `.github/workflows/deploy.yml`
- CNAME file: `public/CNAME` (copied to dist/ during build)
- Build output: `dist/` (created by `npm run build`)
