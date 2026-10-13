# Otter Builder · Beta 0.1.0

Editor visuale per curriculum, costruito con React, TypeScript e Vite. Funziona nel browser senza backend e genera una build statica per GitHub Pages.

## Avvio

```bash
npm install
npm run dev
```

Apri l'indirizzo mostrato da Vite, normalmente `http://localhost:5173/`. Puoi usare anche `pnpm` se lo hai installato.

Se PowerShell mostra `pnpm: The term 'pnpm' is not recognized`, verifica prima `node --version` e `npm --version`. Se entrambi rispondono, avvia il progetto con:

```powershell
npm install
npm run dev
```

Se anche `node` o `npm` non vengono riconosciuti, installa Node.js con npm e riapri PowerShell prima di riprovare. Per vedere gli script disponibili usa `npm run` (oppure `pnpm run` dopo aver installato pnpm).

```bash
npm run build
```

La build viene creata in `dist/`. Su macOS o Linux, per GitHub Pages puoi usare `VITE_BASE_PATH=/CVDevelopment/ npm run build`; su PowerShell usa `$env:VITE_BASE_PATH='/CVDevelopment/'; npm run build`.

Il percorso predefinito è `/projectLittleOne/`. Per pubblicare alla radice di un dominio usa `VITE_BASE_PATH=/`. Il logo con una lontra minimale in un cerchio verde si trova in `public/otter-logo.svg` ed è usato sia nella barra superiore sia come favicon; Vite ne adatta il collegamento al percorso della build.

## Uso

- Lo switch **sole/luna**, accanto al logo nella barra superiore, cambia colori, testi e icone dell'interfaccia con una transizione fluida. La prima apertura segue il tema del sistema; la scelta resta nel browser. Il foglio e il PDF conservano i colori del CV. Con la preferenza di sistema per movimento ridotto, la transizione è disattivata.
- Parti da **Essenziale**, **Professionale**, **Creativo** o da un CV vuoto. I tre passi **Dati**, **Esperienze** e **Revisione** portano ai campi principali e all’anteprima.
- Usa `+` nella libreria per aggiungere un blocco oppure trascinalo nel foglio. Sul telefono **Aggiungi sezione** apre il catalogo in un pannello richiudibile.
- Clicca un contenuto nel CV per aprire e mettere a fuoco il campo corrispondente nelle proprietà. Su tablet e telefono il pannello Proprietà si apre a destra; il pulsante «Modifica blocco» lo riapre quando serve.
- Nel blocco **Informazioni personali**, i contatti mostrano icone per email, telefono, località e profili. In Proprietà → Contatti scegli la riga o da una a tre colonne e, se preferisci, nascondi le icone. Le colonne si riducono quando il blocco è stretto.
- Su desktop la libreria, il CV e le proprietà scorrono separatamente. La finestra resta ferma mentre scorri il contenuto sotto il mouse.
- Su desktop puoi comprimere i pannelli laterali o trascinare i separatori per cambiarne la larghezza. La libreria usa due colonne quando è larga; le proprietà affiancano le sezioni quando c'è spazio. Le preferenze restano nel browser.
- Tutti i blocchi, compresi **Testo** e **Titolo**, si modificano dai campi «Contenuto» nel pannello Proprietà.
- **Altre azioni → Stile del CV** apre font, colori e sfondo dell'intero documento anche quando è selezionata una sezione. **Personalizza aspetto** nelle proprietà della sezione modifica invece quella sezione.
- Sotto il foglio, **Guida rapida: modifica, layout e salvataggio** spiega i comandi principali e la differenza tra PDF e copia modificabile. Il menu **Altre azioni** si chiude con `Esc` o cliccando fuori.
- Sul telefono il foglio si adatta alla larghezza dello schermo. Premi «Ingrandisci pagina» per leggere e modificare con lo scorrimento orizzontale, poi «Adatta pagina» per vedere l'intero CV.
- Passa il mouse sopra un blocco: compare il cursore a mano e puoi trascinarlo direttamente. Cliccalo per mostrare i comandi sotto il contenuto. Rilascia sopra o sotto una riga, in una colonna o ai lati di un blocco per creare una colonna.
- Il menu Layout sulla riga mostra miniature di una, due o tre colonne. Il comando **Sposta sezione in** sposta una sezione in un’altra colonna o in una nuova riga senza trascinarla. Trascina il comando «Riga» o «Colonna» per riordinarle, oppure usa le frecce. Passa il mouse tra due colonne e trascina la linea con il cursore di ridimensionamento per cambiarne la larghezza, con minimo del 20%. Una colonna vuota accetta il blocco selezionato con un clic.
- Per aggiungere un'icona, seleziona un blocco di sezione (per esempio Esperienza o Formazione), apri «Intestazione e icona», attiva «Mostra icona» e scegli il simbolo. Puoi cambiarne dimensione, posizione e colore.
- Il blocco **Immagine** accetta PNG, JPG e WebP. Puoi scegliere larghezza, altezza, adattamento e descrizione alternativa.
- Nel blocco **Informazioni personali** puoi caricare una foto profilo, metterla a sinistra o a destra del nome e scegliere fra dieci forme e la dimensione.
- Nelle proprietà puoi applicare colore o immagine allo sfondo dell'intero blocco, compresa l'area dei comandi, e regolarne l'opacità. Nello stile generale puoi fare lo stesso per il CV e caricare un font WOFF2, WOFF, TTF o OTF, da usare per tutto il CV o per un singolo blocco.
- Per le immagini di sfondo scegli **Riempi**, **Adatta**, **Allunga**, **Affianca**, **Centra** o **Intervallo**. Sul CV, Allunga ripete l'immagine per ogni pagina A4; Intervallo estende un'unica immagine lungo tutto il documento.
- Usa Annulla/Ripristina o `Ctrl+Z` e `Ctrl+Shift+Z` quando non stai scrivendo in un campo. Dopo un’eliminazione, il messaggio **Annulla** recupera la sezione o la riga.
- Ogni CV ha un nome modificabile nella barra superiore e viene salvato separatamente nel `localStorage` del browser, con data dell’ultimo aggiornamento. **I miei CV** riapre i progetti salvati. Immagini e font caricati sono inclusi nel progetto e nel JSON esportato; la toolbar mostra lo stato del salvataggio.
- **Scarica copia modificabile** salva il progetto in JSON; **Apri copia modificabile** lo importa come nuovo progetto. L’import accetta versioni 1 e 2; i blocchi v1 vengono migrati in righe singole.
- **Anteprima** o `Alt+P` mostra le effettive pagine del PDF, con testo selezionabile e link attivi. **Scarica PDF** crea pagine A4 senza i controlli dell’editor.
- **Nuovo CV**, importazione e generazione casuale creano progetti separati, conservando i precedenti.

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

`CVDocument` versione 2 contiene `rows[]`, `globalStyle` e un campo `name` facoltativo. I JSON esistenti senza nome restano compatibili. Ogni riga contiene da una a tre colonne; ogni colonna conserva `width` in percentuale e `blocks[]`. `CVBlock` contiene dati e stile, senza informazioni di posizione. La cronologia conserva fino a 50 stati nella sessione corrente.

I progetti usano l’indice `cv-builder-projects-v1`, la scelta attiva `cv-builder-active-project-v1` e una chiave `cv-builder-project-v1:<id>` per documento. Il salvataggio precedente resta disponibile come recupero e viene importato senza cancellarlo.

`src/utils/layout.ts` gestisce spostamenti, preset e larghezze; `src/utils/documentStorage.ts` convalida e migra il JSON. `lucide-react` fornisce le icone SVG delle sezioni.

## Limiti attuali

L'editor mostra un foglio continuo con indicatori dei confini A4. Il PDF cerca di spezzare tra le righe; una riga o un blocco più alto di una pagina può comunque essere diviso. Il PDF conserva l’aspetto tramite immagini ad alta risoluzione e aggiunge testo invisibile selezionabile e ricercabile, oltre ai link. Il livello di testo usa Noto Sans, incluso con licenza OFL; caratteri fuori dalla copertura del font possono non essere estratti correttamente, pur restando visibili. L'editing dei gruppi di competenze e delle lingue viene applicato quando esci dal rispettivo campo.

### CV casuali per prove grafiche

Il pulsante **CV casuale** genera un documento modificabile con identità e percorsi inventati in quattro ambiti professionali. Scegli contenuti brevi, medi o lunghi, una disposizione casuale o da una a tre colonne e un avatar generico facoltativo. Le tre colonne si applicano alle sezioni complementari; nome e percorso principale restano a tutta larghezza. Font, colori, contatti e forma dell’avatar variano a ogni generazione.

La generazione funziona offline, senza API: utilizza font di sistema e un avatar PNG creato localmente e incluso nel JSON. I recapiti sono dimostrativi, con link su example.com. Il documento precedente resta accessibile da **I miei CV**; scarica una copia modificabile per conservarla fuori dal browser.

Esegui `npm run test:random` per verificare varietà, disposizioni, quantità dei contenuti e compatibilità JSON su 360 documenti generati.
