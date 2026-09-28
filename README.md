# CV Builder · Beta 0.1.0

Editor visuale per curriculum, costruito con React, TypeScript e Vite. Funziona nel browser senza backend e genera una build statica per GitHub Pages.

## Avvio

```powershell
pnpm install
pnpm run dev
```

Apri l'indirizzo mostrato da Vite, normalmente `http://localhost:5173/`. Su un computer con npm puoi usare `npm install`, `npm run dev` e `npm run build`.

```powershell
pnpm run build
pnpm run test:layout
```

La build viene creata in `dist/`. Per GitHub Pages imposta la base del repository prima della build, per esempio `$env:VITE_BASE_PATH='/CVDevelopment/'; pnpm run build`.

## Uso

- Usa `+` nella libreria per aggiungere un blocco oppure trascinalo nel foglio.
- Clicca un blocco nel CV per aprire i campi di modifica. Su tablet e telefono il pannello Proprietà si apre a destra; il pulsante «Modifica blocco» lo riapre quando serve.
- Nei blocchi **Testo** e **Titolo** puoi scrivere direttamente nel foglio. Per gli altri blocchi usa i campi «Contenuto» nel pannello Proprietà.
- Sul telefono il foglio si adatta alla larghezza dello schermo. Premi «Ingrandisci pagina» per leggere e modificare con lo scorrimento orizzontale, poi «Adatta pagina» per vedere l'intero CV.
- `⋮⋮` sposta l'intero blocco; `⠿` sposta la riga. Rilascia sopra o sotto una riga, in una colonna o ai lati di un blocco per creare una colonna.
- Il menu Layout sulla riga offre una, due o tre colonne. Trascina la maniglia «Colonna» per riordinare, oppure usa le frecce; trascina il divisore ↔ per cambiare la larghezza, con minimo del 20%. Una colonna vuota accetta il blocco selezionato con un clic.
- Per aggiungere un'icona, seleziona un blocco di sezione (per esempio Esperienza o Formazione), apri «Intestazione e icona», attiva «Mostra icona» e scegli il simbolo. Puoi cambiarne dimensione, posizione e colore.
- Usa Annulla/Ripristina o `Ctrl+Z` e `Ctrl+Shift+Z` quando non stai scrivendo in un campo.
- Il CV viene salvato automaticamente nel `localStorage` del browser, con data dell'ultimo aggiornamento. La toolbar mostra lo stato del salvataggio.
- Esporta/Importa JSON per conservare o ripristinare un progetto. L'import accetta versioni 1 e 2; i blocchi v1 vengono migrati in righe singole.
- Anteprima nasconde gli strumenti di modifica. Esporta PDF crea pagine A4 senza i controlli dell'editor.
- Nuovo CV permette di partire da un esempio o da un documento vuoto dopo una conferma.

## Struttura

```text
src/
  components/editor/      Toolbar, canvas, blocchi e fallback errori
  components/sidebar/     Catalogo cliccabile e trascinabile
  components/properties/  Campi di modifica per ogni tipo di blocco
  hooks/                  Cronologia e autosave del documento
  models/                 CVDocument, CVBlock e valori iniziali
  store/                  Documento dimostrativo
  utils/                  JSON, localStorage ed esportazione PDF
  styles/                 Layout dell'editor e stampa
  App.tsx                 Composizione, azioni e drag and drop
```

`CVDocument` versione 2 contiene `rows[]` e `globalStyle`. Ogni riga contiene da una a tre colonne; ogni colonna conserva `width` in percentuale e `blocks[]`. `CVBlock` contiene dati e stile, senza informazioni di posizione. La cronologia conserva fino a 50 stati nella sessione corrente.

`src/utils/layout.ts` gestisce spostamenti, preset e larghezze; `src/utils/documentStorage.ts` convalida e migra il JSON. `lucide-react` fornisce le icone SVG delle sezioni.

## Limiti attuali

L'editor mostra un foglio continuo con indicatori dei confini A4. Il PDF cerca di spezzare tra le righe; una riga o un blocco più alto di una pagina può comunque essere diviso. Il PDF usa immagini delle pagine, quindi il testo non è selezionabile e anche le icone sono rasterizzate ad alta risoluzione. L'editing dei gruppi di competenze e delle lingue viene applicato quando esci dal rispettivo campo.
