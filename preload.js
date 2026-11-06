// preload.js: il "ponte" tra la pagina (script.js) e main.js
// La pagina può usare solo le funzioni che metto qui dentro window.mac

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mac", {
  info: function () {
    return ipcRenderer.invoke("info");
  },
  leggiNome: function () {
    return ipcRenderer.invoke("leggi-nome");
  },
  salvaNome: function (nome) {
    return ipcRenderer.invoke("salva-nome", nome);
  },
  leggiFile: function () {
    return ipcRenderer.invoke("leggi-file");
  },
  icona: function (nome) {
    return ipcRenderer.invoke("icona", nome);
  },
  aspira: function (nome, modalita) {
    return ipcRenderer.invoke("aspira", nome, modalita);
  },
  mouse: function (ignora) {
    ipcRenderer.send("mouse", ignora);
  },
  apriCartella: function () {
    ipcRenderer.send("apri-cartella");
  },
  esci: function () {
    ipcRenderer.send("esci");
  }
});
