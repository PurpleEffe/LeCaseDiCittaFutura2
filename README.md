<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zO2xM-oIpH4CbUvPjAuCO_NhUAqGJCBt

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure the connection to GitHub:
   - Copy `.env.local.example` to `.env.local`
   - Fill in the required variables (see [GitHub configuration](#github-configuration))
3. Run the app:
   `npm run dev`

## GitHub configuration

Il backend dell'applicazione utilizza i file JSON pubblicati su GitHub Pages come database e, quando sono disponibili le credenziali, effettua il commit automatico delle modifiche sul repository. Crea un file `.env.local` con le seguenti variabili:

```
VITE_GITHUB_OWNER=<owner del repository>
VITE_GITHUB_REPO=<nome del repository>
VITE_GITHUB_TOKEN=<token con permesso "contents:write">
VITE_GITHUB_BRANCH=main             # opzionale, default "main"
VITE_GITHUB_PAGES_BASE_URL=https://<owner>.github.io/<repo>   # opzionale
VITE_GITHUB_DATA_PATH=public/data    # opzionale
VITE_GITHUB_PAGES_DATA_PATH=data     # opzionale
```

Se il token non è configurato l'applicazione continua a funzionare in sola lettura e qualsiasi modifica (nuove prenotazioni, utenti o case) viene salvata solamente in memoria temporanea. Impostando il token verranno effettuati commit automatici nei file JSON all'interno di `public/data/`.
