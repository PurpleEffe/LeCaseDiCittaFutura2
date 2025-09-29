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

- I dati iniziali (case, festività, prenotazioni e utenti demo) sono contenuti nei file JSON sotto `public/data/`.
- Al primo accesso l'applicazione legge questi file statici; tutte le modifiche successive (nuove prenotazioni, registrazioni, aggiornamenti gestore) vengono salvate nel `localStorage` del browser.
- In questo modo non servono API esterne o chiavi di autenticazione: l'app resta completamente statica e funziona anche su GitHub Pages.
- Per tornare ai dati originali elimina le voci che iniziano con `lcdcf:data:` dal `localStorage` oppure usa la funzione "Svuota dati sito" del browser.

## Deploy su GitHub Pages

Il repository include un workflow GitHub Actions (`Deploy to GitHub Pages`) che compila automaticamente l'app e pubblica la cartella `dist/` su GitHub Pages ad ogni push sul branch `main`.

Quando pubblichi in una sottocartella (es. `https://<utente>.github.io/<repo>/`) ricorda di impostare `VITE_PUBLIC_BASE_PATH` nel file `.env.local` (ad esempio `/LeCaseDiCittaFutura2/`) prima di eseguire `npm run build`, così gli asset saranno generati con i percorsi corretti.
