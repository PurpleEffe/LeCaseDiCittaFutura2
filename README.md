<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Le Case di Città Futura

Sito web per presentare e gestire le strutture dell'associazione "Città Futura" di Riace. L'interfaccia consente di consultare le case disponibili, inviare richieste di prenotazione e, tramite l'area manager, aggiornare l'inventario e approvare le richieste.

## Avvio locale

**Prerequisiti:** Node.js

1. Installa le dipendenze
   ```bash
   npm install
   ```
2. (Opzionale) Copia `.env.local.example` in `.env.local` e imposta `VITE_PUBLIC_BASE_PATH` se pubblicherai il sito in una sottocartella (es. GitHub Pages).
3. Avvia l'applicazione in sviluppo
   ```bash
   npm run dev
   ```

## Dati e persistenza

- I dataset dell'applicazione (case, festività, prenotazioni e utenti demo) risiedono nei file JSON all'interno della cartella `public/data/` del repository.
- In produzione l'app può leggere questi file direttamente dalla versione pubblicata su GitHub Pages (`https://<utente>.github.io/<repo>/data/*.json`) oppure tramite l'endpoint RAW di GitHub (`https://raw.githubusercontent.com/<owner>/<repo>/<branch>/public/data/*.json`).
- Le operazioni di scrittura (creazione prenotazioni, gestione inventario, registrazioni) utilizzano l'API Contents di GitHub per aggiornare i file JSON nel repository, generando un commit dedicato.
- Per abilitare la scrittura è necessario configurare le variabili d'ambiente `VITE_GITHUB_OWNER`, `VITE_GITHUB_REPO`, `VITE_GITHUB_TOKEN` (PAT con permesso `contents` sul repository) e, se necessario, `VITE_GITHUB_PAGES_BASE_URL`.
- In assenza di token l'app resta in modalità sola lettura: le liste vengono caricate dai file remoti ma gli aggiornamenti genereranno un errore.

## Deploy su GitHub Pages

Il repository include un workflow GitHub Actions (`Deploy to GitHub Pages`) che compila automaticamente l'app e pubblica la cartella `dist/` su GitHub Pages ad ogni push sul branch `main`.

Quando pubblichi in una sottocartella (es. `https://<utente>.github.io/<repo>/`) ricorda di impostare `VITE_PUBLIC_BASE_PATH` nel file `.env.local` (ad esempio `/LeCaseDiCittaFutura2/`) prima di eseguire `npm run build`, così gli asset saranno generati con i percorsi corretti.

### Configurazione Backend GitHub

1. Crea un token personale GitHub (PAT) con permesso `repo` → `contents`.
2. Copia `.env.local.example` in `.env.local` e compila le variabili:
   ```bash
   VITE_GITHUB_OWNER=<owner>
   VITE_GITHUB_REPO=<repo>
   VITE_GITHUB_BRANCH=main # oppure il branch desiderato
   VITE_GITHUB_DATA_DIR=public/data
   VITE_GITHUB_PAGES_BASE_URL=https://<utente>.github.io/<repo>/data # opzionale, ma consigliato su GitHub Pages
   VITE_GITHUB_TOKEN=<PAT>
   ```
3. Pubblica i file JSON della cartella `public/data` nella stessa posizione del branch target (ad esempio con `git push`).
4. Avvia l'applicazione (`npm run dev`) o esegui il build (`npm run build`): tutte le operazioni CRUD utilizzeranno il repository GitHub configurato.
