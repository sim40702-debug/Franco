// main.js: la parte "nascosta" dell'app (Node.js)
// Qui si crea la finestra trasparente e si lavora con i file veri.

const { app, BrowserWindow, ipcMain, screen, shell, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

// ===== CARTELLE E FILE =====
const cartellaScrivania = app.getPath("desktop");
const cartellaDestinazione = path.join(app.getPath("documents"), "Aspirato");
const fileImpostazioni = path.join(app.getPath("userData"), "impostazioni.json");

let finestra;


// Crea una finestra trasparente grande come TUTTO lo schermo
// (anche sopra la barra dei menu, così possiamo usare il notch)
function creaFinestra() {
  const schermo = screen.getPrimaryDisplay();

  finestra = new BrowserWindow({
    x: schermo.bounds.x,
    y: schermo.bounds.y,
    width: schermo.bounds.width,
    height: schermo.bounds.height,
    transparent: true,     // si vede la Scrivania sotto
    frame: false,          // niente bordo e niente pulsanti della finestra
    hasShadow: false,
    resizable: false,
    movable: false,
    enableLargerThanScreen: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  // livello alto: la finestra sta anche sopra la barra dei menu
  finestra.setAlwaysOnTop(true, "screen-saver");
  finestra.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  finestra.setBounds(schermo.bounds);

  // i clic "passano attraverso" la finestra, così puoi usare il Mac normalmente
  // (la pagina li riattiva quando il mouse è sopra il notch o sopra Franco)
  finestra.setIgnoreMouseEvents(true, { forward: true });

  finestra.loadFile("index.html");
}


// Chiede al Finder la posizione delle icone sulla Scrivania
// Restituisce un oggetto tipo: { "foto.png": { x: 1200, y: 80 }, ... }
function posizioniDaFinder() {
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

// Misure dello schermo
ipcMain.handle("info", function () {
  const schermo = screen.getPrimaryDisplay();
  return {
    barraMenu: schermo.workArea.y - schermo.bounds.y,                   // altezza della barra dei menu
    fondo: schermo.workArea.y + schermo.workArea.height - schermo.bounds.y // dove finisce lo spazio (sopra il Dock)
  };
});


// Nome dell'omino (vuoto la prima volta)
ipcMain.handle("leggi-nome", function () {
  try {
    const testo = fs.readFileSync(fileImpostazioni, "utf8");
    return JSON.parse(testo).nome;
  } catch (errore) {
    return ""; // file non ancora creato: è la prima volta
  }
});

ipcMain.handle("salva-nome", function (evento, nome) {
  fs.mkdirSync(path.dirname(fileImpostazioni), { recursive: true });
  fs.writeFileSync(fileImpostazioni, JSON.stringify({ nome: nome }));
  return true;
});


// Lista dei file sulla Scrivania, con posizione, peso e età
ipcMain.handle("leggi-file", async function () {
  const schermo = screen.getPrimaryDisplay();
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
      // posizione vera dell'icona
      x = posizioni[nome].x - schermo.bounds.x;
      y = posizioni[nome].y - schermo.bounds.y;
    } else {
      // posizione di riserva: colonne partendo da destra, come fa il Finder
      let colonna = Math.floor(lista.length / 8);
      let riga = lista.length % 8;
      x = schermo.bounds.width - 70 - colonna * 100;
      y = schermo.workArea.y + 60 + riga * 100;
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
  // niente icona nel Dock: Franco vive nel notch
  if (app.dock) {
    app.dock.hide();
  }
  creaFinestra();
});

app.on("window-all-closed", function () {
  app.quit();
});
