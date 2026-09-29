# CV Builder · Beta 0.1.0

Editor visuale per curriculum, costruito con React, TypeScript e Vite. Funziona nel browser senza backend e genera una build statica per GitHub Pages.

## Avvio

```bash
npm install
npm run dev
```

Apri l'indirizzo mostrato da Vite, normalmente `http://localhost:5173/`. Puoi usare anche `pnpm` se lo hai installato.

```bash
npm run build
```

La build viene creata in `dist/`. Su macOS o Linux, per GitHub Pages puoi usare `VITE_BASE_PATH=/CVDevelopment/ npm run build`; su PowerShell usa `$env:VITE_BASE_PATH='/CVDevelopment/'; npm run build`.

## Uso

- Usa `+` nella libreria per aggiungere un blocco oppure trascinalo nel foglio.
- Clicca un blocco nel CV per aprire i campi di modifica. Su tablet e telefono il pannello Proprietà si apre a destra; il pulsante «Modifica blocco» lo riapre quando serve.
- Su desktop la libreria, il CV e le proprietà scorrono separatamente. La finestra resta ferma mentre scorri il contenuto sotto il mouse.
- Su desktop puoi comprimere i pannelli laterali o trascinare i separatori per cambiarne la larghezza. La libreria usa due colonne quando è larga; le proprietà affiancano le sezioni quando c'è spazio. Le preferenze restano nel browser.
- Nei blocchi **Testo** e **Titolo** puoi scrivere direttamente nel foglio. Per gli altri blocchi usa i campi «Contenuto» nel pannello Proprietà.
- Sul telefono il foglio si adatta alla larghezza dello schermo. Premi «Ingrandisci pagina» per leggere e modificare con lo scorrimento orizzontale, poi «Adatta pagina» per vedere l'intero CV.
- Passa il mouse sopra un blocco: compare il cursore a mano e puoi trascinarlo direttamente. Cliccalo per mostrare i comandi sotto il contenuto. Rilascia sopra o sotto una riga, in una colonna o ai lati di un blocco per creare una colonna.
- Il menu Layout sulla riga offre una, due o tre colonne. Trascina il comando «Riga» o «Colonna» per riordinarle, oppure usa le frecce. Passa il mouse tra due colonne e trascina la linea con il cursore di ridimensionamento per cambiarne la larghezza, con minimo del 20%. Una colonna vuota accetta il blocco selezionato con un clic.
- Per aggiungere un'icona, seleziona un blocco di sezione (per esempio Esperienza o Formazione), apri «Intestazione e icona», attiva «Mostra icona» e scegli il simbolo. Puoi cambiarne dimensione, posizione e colore.
- Il blocco **Immagine** accetta PNG, JPG e WebP. Puoi scegliere larghezza, altezza, adattamento e descrizione alternativa.
- Nel blocco **Informazioni personali** puoi caricare una foto profilo, metterla a sinistra o a destra del nome e scegliere fra dieci forme e la dimensione.
- Nelle proprietà puoi applicare colore o immagine allo sfondo dell'intero blocco, compresa l'area dei comandi, e regolarne l'opacità. Nello stile generale puoi fare lo stesso per il CV e caricare un font WOFF2, WOFF, TTF o OTF, da usare per tutto il CV o per un singolo blocco.
- Per le immagini di sfondo scegli **Riempi**, **Adatta**, **Allunga**, **Affianca**, **Centra** o **Intervallo**. Sul CV, Allunga ripete l'immagine per ogni pagina A4; Intervallo estende un'unica immagine lungo tutto il documento.
- Usa Annulla/Ripristina o `Ctrl+Z` e `Ctrl+Shift+Z` quando non stai scrivendo in un campo.
- Il CV viene salvato automaticamente nel `localStorage` del browser, con data dell'ultimo aggiornamento. Immagini e font caricati sono inclusi nel progetto e nel JSON esportato; la toolbar mostra lo stato del salvataggio.
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

### CV casuali per prove grafiche

Il pulsante **CV casuale** genera un documento modificabile con identità e percorsi inventati in quattro ambiti professionali. Scegli contenuti brevi, medi o lunghi, una disposizione casuale o da una a tre colonne e un avatar generico facoltativo. Le tre colonne si applicano alle sezioni complementari; nome e percorso principale restano a tutta larghezza. Font, colori, contatti e forma dell’avatar variano a ogni generazione.

La generazione funziona offline, senza API: utilizza font di sistema e un avatar PNG creato localmente e incluso nel JSON. I recapiti sono dimostrativi, con link su example.com. **Annulla** recupera il documento precedente finché la pagina resta aperta; esporta il JSON per conservarlo tra le sessioni.

Esegui `npm run test:random` per verificare varietà, disposizioni, quantità dei contenuti e compatibilità JSON su 360 documenti generati.
