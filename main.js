// main.js: la parte "nascosta" dell'app (Node.js)
// Qui si creano le finestre e si lavora con i file veri.

const { app, BrowserWindow, ipcMain, screen, shell, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

// ===== CARTELLE E FILE =====
const cartellaScrivania = app.getPath("desktop");
const cartellaDestinazione = path.join(app.getPath("documents"), "Aspirato");
const fileImpostazioni = path.join(app.getPath("userData"), "impostazioni.json");

// siamo su Windows o su Mac?
const suWindows = process.platform === "win32";
const suMac = process.platform === "darwin";

let finestra;        // la finestra grande con Franco (sulla Scrivania)
let finestraNotch;   // la finestrella del notch (si può spegnere)


// ===== IMPOSTAZIONI =====
// nome dell'omino, se vuoi la casetta, se vuoi il notch
function leggiImpostazioni() {
  let impostazioni = { nome: "", casa: true, notch: true };
  try {
    const salvate = JSON.parse(fs.readFileSync(fileImpostazioni, "utf8"));
    if (salvate.nome !== undefined) { impostazioni.nome = salvate.nome; }
    if (salvate.casa !== undefined) { impostazioni.casa = salvate.casa; }
    if (salvate.notch !== undefined) { impostazioni.notch = salvate.notch; }
  } catch (errore) {
    // file non ancora creato: è la prima volta
  }
  return impostazioni;
}

function salvaImpostazioni(impostazioni) {
  fs.mkdirSync(path.dirname(fileImpostazioni), { recursive: true });
  fs.writeFileSync(fileImpostazioni, JSON.stringify(impostazioni));
}


// ===== FINESTRA DI FRANCO =====
// Grande come lo spazio libero della Scrivania (senza barra dei menu e senza Dock).
// È una finestra normale: le altre app le stanno sopra, quindi Franco
// si vede solo sulla Scrivania. E resta solo nello spazio dove l'hai aperta.
function creaFinestra() {
  const area = screen.getPrimaryDisplay().workArea;

  finestra = new BrowserWindow({
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
    transparent: true,   // si vede la Scrivania sotto
    frame: false,        // niente bordo e niente pulsanti della finestra
    hasShadow: false,
    resizable: false,
    movable: false,
    focusable: false,    // non ruba la tastiera alle altre app
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  // i clic "passano attraverso" la finestra, così puoi usare il Mac normalmente
  // (la pagina li riattiva quando il mouse è sopra Franco, la casa o il menu)
  finestra.setIgnoreMouseEvents(true, { forward: true });

  finestra.loadFile("index.html");
}


// ===== FINESTRELLA DEL NOTCH =====
// Una piccola striscia nera attaccata al notch: cliccandola svegli Franco
function creaNotch() {
  if (finestraNotch || !suMac) {
    return; // c'è già, oppure non siamo su un Mac (il notch c'è solo sul Mac)
  }
  const schermo = screen.getPrimaryDisplay();
  const altezzaBarra = Math.max(schermo.workArea.y - schermo.bounds.y, 24);
  const larghezza = 300;

  finestraNotch = new BrowserWindow({
    x: schermo.bounds.x + Math.round(schermo.bounds.width / 2 - larghezza / 2),
    y: schermo.bounds.y,
    width: larghezza,
    height: altezzaBarra,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    movable: false,
    focusable: false,
    skipTaskbar: true,
    enableLargerThanScreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  // sopra la barra dei menu
  finestraNotch.setAlwaysOnTop(true, "screen-saver");
  finestraNotch.setPosition(schermo.bounds.x + Math.round(schermo.bounds.width / 2 - larghezza / 2), schermo.bounds.y);
  finestraNotch.loadFile("notch.html");
}

function chiudiNotch() {
  if (finestraNotch) {
    finestraNotch.destroy();
    finestraNotch = null;
  }
}


// Chiede al Finder la posizione delle icone sulla Scrivania (solo Mac)
// Restituisce un oggetto tipo: { "foto.png": { x: 1200, y: 80 }, ... }
function posizioniDaFinder() {
  if (!suMac) {
    // su Windows non c'è il Finder: si usano le posizioni di riserva
    return Promise.resolve({});
  }

  const script =
    'tell application "Finder"\n' +
    '  set risultato to ""\n' +
    '  repeat with f in (get every item of desktop)\n' +
    '    try\n' +
    '      set p to desktop position of f\n' +
    '      set risultato to risultato & (name of f) & tab & (item 1 of p) & tab & (item 2 of p) & linefeed\n' +
    '    end try\n' +
    '  end repeat\n' +
    '  return risultato\n' +
    'end tell';

  return new Promise(function (risolvi) {
    execFile("osascript", ["-e", script], function (errore, testo) {
      let posizioni = {};

      if (errore) {
        // per esempio se non hai dato il permesso di controllare il Finder
        risolvi(posizioni);
        return;
      }

      let righe = testo.split("\n");
      for (let i = 0; i < righe.length; i++) {
        let parti = righe[i].split("\t");
        if (parti.length === 3) {
          posizioni[parti[0]] = { x: Number(parti[1]), y: Number(parti[2]) };
        }
      }
      risolvi(posizioni);
    });
  });
}


// ===== COSE CHE LA PAGINA PUO' CHIEDERE =====

// Misure: dove finisce lo spazio (sopra il Dock), dentro la finestra
// e da che parte mettere la casetta: sul Mac a sinistra,
// su Windows a destra (perché a sinistra ci sono le icone)
ipcMain.handle("info", function () {
  const area = screen.getPrimaryDisplay().workArea;
  return {
    fondo: area.height,
    lato: suWindows ? "destra" : "sinistra",
    notch: suMac
  };
});

ipcMain.handle("leggi-impostazioni", function () {
  return leggiImpostazioni();
});

ipcMain.handle("salva-impostazioni", function (evento, impostazioni) {
  salvaImpostazioni(impostazioni);
  return true;
});


// Lista dei file sulla Scrivania, con posizione, peso e età
ipcMain.handle("leggi-file", async function () {
  const area = screen.getPrimaryDisplay().workArea;
  const nomi = fs.readdirSync(cartellaScrivania);
  const posizioni = await posizioniDaFinder();
  let lista = [];

  for (let i = 0; i < nomi.length; i++) {
    let nome = nomi[i];

    // salto i file nascosti (quelli che iniziano con il punto)
    if (nome.startsWith(".")) {
      continue;
    }

    let x;
    let y;
    if (posizioni[nome]) {
      // posizione vera dell'icona (tolgo la barra dei menu)
      x = posizioni[nome].x - area.x;
      y = posizioni[nome].y - area.y;
    } else if (suWindows) {
      // Windows mette le icone in colonne partendo da sinistra in alto
      let righe = Math.max(Math.floor((area.height - 20) / 95), 1);
      let colonna = Math.floor(lista.length / righe);
      let riga = lista.length % righe;
      x = 45 + colonna * 80;
      y = 45 + riga * 95;
    } else {
      // posizione di riserva sul Mac: colonne partendo da destra, come fa il Finder
      let righe = Math.max(Math.floor((area.height - 40) / 100), 1);
      let colonna = Math.floor(lista.length / righe);
      let riga = lista.length % righe;
      x = area.width - 70 - colonna * 100;
      y = 60 + riga * 100;
    }

    // peso in byte e da quanti giorni non viene modificato
    let dimensione = 0;
    let giorni = 0;
    try {
      const info = fs.statSync(path.join(cartellaScrivania, nome));
      dimensione = info.size;
      giorni = Math.floor((Date.now() - info.mtimeMs) / (1000 * 60 * 60 * 24));
    } catch (errore) {
      // non importa
    }

    lista.push({ nome: nome, x: x, y: y, dimensione: dimensione, giorni: giorni });
  }

  return lista;
});


// Immagine dell'icona di un file (serve per l'animazione dell'aspirazione)
ipcMain.handle("icona", async function (evento, nome) {
  const percorso = path.join(cartellaScrivania, nome);

  // prima provo con l'anteprima (per le foto si vede la foto)
  try {
    const anteprima = await nativeImage.createThumbnailFromPath(percorso, { width: 128, height: 128 });
    if (!anteprima.isEmpty()) {
      return anteprima.toDataURL();
    }
  } catch (errore) {
    // niente anteprima, provo con l'icona normale
  }

  try {
    const icona = await app.getFileIcon(percorso, { size: "normal" });
    return icona.toDataURL();
  } catch (errore) {
    return null;
  }
});


// Franco ha aspirato un file: lo sposto davvero
// modalita: "documenti", "cestino" oppure "prova"
ipcMain.handle("aspira", async function (evento, nome, modalita) {
  const percorso = path.join(cartellaScrivania, nome);

  try {
    if (!fs.existsSync(percorso)) {
      return false;
    }

    // in modalità prova non tocco niente
    if (modalita === "prova") {
      return true;
    }

    // nel Cestino (si può sempre recuperare dal Cestino)
    if (modalita === "cestino") {
      await shell.trashItem(percorso);
      return true;
    }

    // nella cartella Documenti/Aspirato
    if (!fs.existsSync(cartellaDestinazione)) {
      fs.mkdirSync(cartellaDestinazione, { recursive: true });
    }

    // se esiste già un file con lo stesso nome aggiungo un numero: foto (2).png
    const estensione = path.extname(nome);
    const nomeSenzaEstensione = path.basename(nome, estensione);
    let nuovoPercorso = path.join(cartellaDestinazione, nome);
    let numero = 2;
    while (fs.existsSync(nuovoPercorso)) {
      nuovoPercorso = path.join(cartellaDestinazione, nomeSenzaEstensione + " (" + numero + ")" + estensione);
      numero++;
    }

    fs.renameSync(percorso, nuovoPercorso);
    return true;
  } catch (errore) {
    console.log("Non riesco a spostare " + nome + ": " + errore.message);
    return false;
  }
});


// Attiva o disattiva i clic sulla finestra
ipcMain.on("mouse", function (evento, ignora) {
  finestra.setIgnoreMouseEvents(ignora, { forward: true });
});

// Menu aperto: la finestra viene davanti (così il menu si vede) e accetta la tastiera
ipcMain.on("menu-aperto", function () {
  finestra.setFocusable(true);
  finestra.setAlwaysOnTop(true, "floating");
  finestra.focus();
});

// Menu chiuso: la finestra torna normale (le altre app le vanno sopra)
ipcMain.on("menu-chiuso", function () {
  finestra.setAlwaysOnTop(false);
  finestra.setFocusable(false);
});

// Il notch è stato cliccato: lo dico alla finestra di Franco
ipcMain.on("notch-cliccato", function () {
  finestra.webContents.send("sveglia-dal-notch");
});

// Testo da mostrare nel notch (z z z, 5/12...)
ipcMain.on("testo-notch", function (evento, testo) {
  if (finestraNotch) {
    finestraNotch.webContents.send("testo-notch", testo);
  }
});

// Accende o spegne il notch dalle impostazioni
ipcMain.on("imposta-notch", function (evento, acceso) {
  if (acceso) {
    creaNotch();
  } else {
    chiudiNotch();
  }
});


// Apre la cartella Documenti/Aspirato nel Finder
ipcMain.on("apri-cartella", function () {
  if (!fs.existsSync(cartellaDestinazione)) {
    fs.mkdirSync(cartellaDestinazione, { recursive: true });
  }
  shell.openPath(cartellaDestinazione);
});


// Chiude l'app
ipcMain.on("esci", function () {
  app.quit();
});


// ===== AVVIO =====
app.whenReady().then(function () {
  // niente icona nel Dock (sul Mac): Franco vive sulla Scrivania
  if (app.dock) {
    app.dock.hide();
  }
  creaFinestra();

  if (leggiImpostazioni().notch) {
    creaNotch();
  }
});

app.on("window-all-closed", function () {
  app.quit();
});
