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
2. Configure the environment:
   - Copy `.env.local.example` to `.env.local`
   - Fill in the required variables (see [GitHub configuration](#github-configuration) and [Gemini configuration](#gemini-configuration))
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
VITE_PUBLIC_BASE_PATH=/nome-repo/    # opzionale, utile per GitHub Pages
```

Se il token non è configurato l'applicazione continua a funzionare in sola lettura e qualsiasi modifica (nuove prenotazioni, utenti o case) viene salvata solamente in memoria temporanea. Impostando il token verranno effettuati commit automatici nei file JSON all'interno di `public/data/`.

### Deployment su GitHub Pages

Il repository include un workflow GitHub Actions (`Deploy to GitHub Pages`) che compila automaticamente l'app e pubblica la cartella `dist/` su GitHub Pages ogni volta che effettui un push su `main`. Una volta abilitato Pages nelle impostazioni del repository, scegli **GitHub Actions** come sorgente di pubblicazione in modo che la pipeline gestisca build e deploy senza dover committare i file generati.

Per evitare errori 404 sugli asset quando l'app è pubblicata in una sottocartella (ad esempio `https://<owner>.github.io/<repo>/`), imposta la variabile `VITE_PUBLIC_BASE_PATH` nel file `.env.local` con il valore della sottocartella, includendo la slash iniziale e finale, ad esempio:

```
VITE_PUBLIC_BASE_PATH=/LeCaseDiCittaFutura2/
```

In assenza della variabile l'app utilizza automaticamente percorsi relativi durante la build, in modo da funzionare anche su GitHub Pages.

## Gemini configuration

Imposta la variabile `GEMINI_API_KEY` nel file `.env.local` se l'app o i tuoi script necessitano dell'accesso all'API Gemini. La chiave viene esposta a tempo di build tramite `process.env.GEMINI_API_KEY` e può essere recuperata nel codice client con `import.meta.env.GEMINI_API_KEY` se necessario.
