# Student Game Registration Application

A minimalist Navy Blue and White web application designed for game organizers to collect student registrations, auto-lock on reaching student capacity limits, generate direct scan QR codes, and split participants into teams.

## 🚀 How to Deploy to GitHub Pages & Use Your Own Domain

### Option A: Deploy via GitHub Pages (Free)

1. **Upload Code to GitHub**:
   - Create a new repository on GitHub (e.g. `student-game-app`).
   - Extract this zip archive and push the files to your repository:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/student-game-app.git
     git push -u origin main
     ```

2. **Deploy on GitHub**:
   - Go to **Settings > Pages** in your GitHub repository.
   - Under **Build and deployment**, select **GitHub Actions** or set Source to `main` branch.
   - Or deploy easily using free services like **Vercel** or **Netlify** (just connect your GitHub repo and click Deploy).

3. **Custom Domain**:
   - In GitHub repository **Settings > Pages**, type your custom domain into the **Custom domain** field.

---

## 🛠️ Local Development

To run locally on your computer:

```bash
# 1. Install dependencies
npm install

# 2. Start local server accessible over local network/Wi-Fi
npm run dev -- --host
```
