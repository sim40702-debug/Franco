// preload.js: il "ponte" tra le pagine (script.js e notch.html) e main.js
// Le pagine possono usare solo le funzioni che metto qui dentro window.mac

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mac", {
  // misure e impostazioni
  info: function () {
    return ipcRenderer.invoke("info");
  },
  leggiImpostazioni: function () {
    return ipcRenderer.invoke("leggi-impostazioni");
  },
  salvaImpostazioni: function (impostazioni) {
    return ipcRenderer.invoke("salva-impostazioni", impostazioni);
  },

  // file della Scrivania
  leggiFile: function () {
    return ipcRenderer.invoke("leggi-file");
  },
  icona: function (nome) {
    return ipcRenderer.invoke("icona", nome);
  },
  aspira: function (nome, modalita) {
    return ipcRenderer.invoke("aspira", nome, modalita);
  },

  // finestra
  mouse: function (ignora) {
    ipcRenderer.send("mouse", ignora);
  },
  menuAperto: function () {
    ipcRenderer.send("menu-aperto");
  },
  menuChiuso: function () {
    ipcRenderer.send("menu-chiuso");
  },
  apriCartella: function () {
    ipcRenderer.send("apri-cartella");
  },
  esci: function () {
    ipcRenderer.send("esci");
  },

  // notch
  impostaNotch: function (acceso) {
    ipcRenderer.send("imposta-notch", acceso);
  },
  testoNotch: function (testo) {
    ipcRenderer.send("testo-notch", testo);
  },
  notchCliccato: function () {
    ipcRenderer.send("notch-cliccato");
  },
  // chiama la funzione quando qualcuno clicca il notch
  quandoSvegliaDalNotch: function (funzione) {
    ipcRenderer.on("sveglia-dal-notch", function () {
      funzione();
    });
  },
  // chiama la funzione quando arriva un nuovo testo per il notch
  quandoTestoNotch: function (funzione) {
    ipcRenderer.on("testo-notch", function (evento, testo) {
      funzione(testo);
    });
  }
});
