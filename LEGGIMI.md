# Franco

Franco vive sulla tua Scrivania, in basso a sinistra. Si vede solo sulla
Scrivania: le finestre delle app gli stanno sopra, e se cambi spazio
(Mission Control, Ctrl + frecce) non ti segue.

## Casetta o tappetino (lo scegli nelle Impostazioni)

- **Con la casetta**: casetta a due piani con giardino, panchina e fiori.
  Ogni tanto esce da solo: si siede sulla panchina, annaffia i fiori,
  si stiracchia o si affaccia alla finestra. D'inverno esce il fumo dal camino.
  Per svegliarlo clicca la casetta.
- **Senza casetta**: dorme sdraiato su un tappetino. Per svegliarlo clicca lui.

Di notte dorme e basta.

## Il notch (lo puoi spegnere nelle Impostazioni)

Una striscia nera attaccata al notch: cliccandola svegli Franco anche
quando la Scrivania è coperta dalle app.

## Pulire

- **Pulisci la Scrivania**: prende l'aspirapolvere e si porta via i file.
  Se un file è lontano prende la macchina, parcheggia vicino e scende.
  Con più di 40 file si rifiuta... finché non insisti.
- **Per favore, usa il camion**: arriva un camion spazzatrice, Franco sale
  e pulisce con il camion (ci stanno 40 file). Se glielo chiedi con
  gentilezza non protesta mai.

Quando è pieno svuota tutto nel bidone, poi torna a dormire.

## Provarla

1. Apri il Terminale nella cartella Franco
2. `npm install` (solo la prima volta)
3. `npm start`

## Farla diventare un'app vera (Franco.app, con l'icona)

1. `npm run app`
2. Trovi l'app in `dist/Franco-darwin-arm64/Franco.app`
3. Trascinala nella cartella Applicazioni

Franco non ha l'icona nel Dock: per chiudere l'app vai in
Impostazioni e premi "Chiudi l'app".

## Permessi del Mac

La prima volta il Mac chiede due cose: rispondi **Consenti** a tutte e due.

- Controllare il **Finder**: serve per sapere dove sono le icone
- Accedere alle cartelle **Scrivania** e **Documenti**: serve per spostare i file

## Dove finiscono i file

- **In Aspirato**: cartella `Documenti/Aspirato`
- **Nel Cestino**: li puoi sempre recuperare dal Cestino
- **Per finta**: non tocca niente

## I file del progetto

- `main.js`: la parte Node.js (finestre, file veri, impostazioni)
- `preload.js`: il ponte tra main.js e le pagine
- `index.html`, `style.css`: la pagina di Franco e la grafica
- `notch.html`: la striscia del notch
- `disegni.js`: i disegni di Franco, della casetta, della macchina e del camion
- `frasi.js`: tutte le frasi di Franco (cambiale come vuoi!)
- `script.js`: come si comporta Franco
- `icona.icns`: l'icona dell'app

## Cose che puoi cambiare facilmente

In cima a `script.js`:

- `CAPIENZA` e `CAPIENZA_CAMION`: quanti file ci stanno
- `VELOCITA`, `VELOCITA_AUTO`, `VELOCITA_CAMION`: quanto vanno veloci
- `LONTANO`: da quanti pixel in su prende la macchina
- `TROPPI_FILE`: con quanti file inizia a protestare
- `CORREZIONE_X` e `CORREZIONE_Y`: se passa accanto alle icone invece che sopra
