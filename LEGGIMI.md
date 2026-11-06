# Franco

Franco vive in una casetta a due piani con il giardino, in basso a sinistra
sulla Scrivania. Di solito dorme. Ogni tanto esce da solo: si siede sulla
panchina, annaffia i fiori, si stiracchia o si affaccia alla finestra.
Di notte dorme e basta. D'inverno esce il fumo dal camino.

Per svegliarlo clicca la casetta (oppure il notch in alto).
Si sveglia di colpo, commenta il disordine e ti dà il menu.
Se gli dici di pulire prende l'aspirapolvere, si porta via i file della
Scrivania e li svuota nel bidone vicino a casa. Poi torna a dormire.

Se sulla Scrivania ci sono più di 40 file si rifiuta... finché non insisti.

La prima volta che apri l'app ti chiede come lo vuoi chiamare
(il nome compare anche sulla targhetta della porta).

## Provarla

1. Apri il Terminale nella cartella Franco
2. `npm install` (solo la prima volta)
3. `npm start`

## Farla diventare un'app vera (Franco.app, con l'icona)

1. `npm run app`
2. Trovi l'app in `dist/Franco-darwin-arm64/Franco.app`
3. Trascinala nella cartella Applicazioni

Franco non ha l'icona nel Dock: per chiudere l'app usa "Chiudi l'app" nel menu.

## Permessi del Mac

La prima volta il Mac chiede due cose: rispondi **Consenti** a tutte e due.

- Controllare il **Finder**: serve per sapere dove sono le icone
- Accedere alle cartelle **Scrivania** e **Documenti**: serve per spostare i file

## Dove finiscono i file

- **In Aspirato**: cartella `Documenti/Aspirato`
- **Nel Cestino**: li puoi sempre recuperare dal Cestino
- **Per finta**: non tocca niente

## I file del progetto

- `main.js`: la parte Node.js (finestra, file veri, permessi)
- `preload.js`: il ponte tra main.js e la pagina
- `index.html`, `style.css`: la pagina e la grafica
- `disegni.js`: i disegni di Franco e della casetta
- `frasi.js`: tutte le frasi di Franco (cambiale come vuoi!)
- `script.js`: come si comporta Franco
- `icona.icns`: l'icona dell'app

## Cose che puoi cambiare facilmente

In cima a `script.js`:

- `CAPIENZA`: quanti file ci stanno nel sacco
- `VELOCITA`: quanto cammina veloce
- `TROPPI_FILE`: con quanti file inizia a protestare
- `CORREZIONE_X` e `CORREZIONE_Y`: se passa accanto alle icone invece che sopra
