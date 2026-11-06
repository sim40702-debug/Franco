// script.js: Franco, la sua casetta (se c'è), la macchina, il camion e il menu
// Le cose del Mac (leggere e spostare file) le fa main.js, qui le chiamo con window.mac
// I disegni sono in disegni.js, le frasi in frasi.js

// ===== IMPOSTAZIONI =====
const CAPIENZA = 12;          // quanti file ci stanno nell'aspirapolvere
const CAPIENZA_CAMION = 40;   // quanti file ci stanno nel camion
const VELOCITA = 3;           // di quanti pixel cammina a ogni passo
const VELOCITA_AUTO = 9;      // la macchina va 3 volte più veloce
const VELOCITA_CAMION = 6;    // il camion va 2 volte più veloce
const LONTANO = 450;          // da quanti pixel in su prende la macchina
const TROPPI_FILE = 40;       // con più file di così Franco protesta
// Se Franco passa un po' accanto alle icone invece che sopra,
// cambia questi due numeri (in pixel)
const CORREZIONE_X = 0;
const CORREZIONE_Y = 0;

// ===== ELEMENTI DELLA PAGINA =====
const casa = document.getElementById("casa");
const tappetino = document.getElementById("tappetino");
const zzzTappetino = document.getElementById("zzzTappetino");
const bidone = document.getElementById("bidone");
const auto = document.getElementById("auto");
const camion = document.getElementById("camion");
const omino = document.getElementById("omino");
const fumetto = document.getElementById("fumetto");
const popup = document.getElementById("popup");

const sceltaNome = document.getElementById("sceltaNome");
const campoNome = document.getElementById("campoNome");
const menu = document.getElementById("menu");
const sezioneImpostazioni = document.getElementById("impostazioni");
const menuLavoro = document.getElementById("menuLavoro");
const statoLavoro = document.getElementById("statoLavoro");
const sceltaCasa = document.getElementById("sceltaCasa");
const sceltaNotch = document.getElementById("sceltaNotch");

const btnNome = document.getElementById("btnNome");
const btnPulisci = document.getElementById("btnPulisci");
const btnCamion = document.getElementById("btnCamion");
const btnReport = document.getElementById("btnReport");
const btnCartella = document.getElementById("btnCartella");
const btnImpostazioni = document.getElementById("btnImpostazioni");
const btnDormi = document.getElementById("btnDormi");
const btnCambiaNome = document.getElementById("btnCambiaNome");
const btnIndietro = document.getElementById("btnIndietro");
const btnChiudi = document.getElementById("btnChiudi");
const btnPausa = document.getElementById("btnPausa");
const btnBasta = document.getElementById("btnBasta");
const btnChiudiMenu = document.getElementById("btnChiudiMenu");
const bottoniModo = document.querySelectorAll(".modo");

// ===== VARIABILI =====
let nomeOmino = "Franco";   // lo usa anche frasi.js
let impostazioni = { nome: "", casa: true, notch: true };
let fondo = 0;              // dove finisce lo spazio della Scrivania (sopra il Dock)
let lato = "sinistra";      // dove sta la casa: "sinistra" (Mac) o "destra" (Windows)

// stato di Franco:
//   dorme     dorme in casa o sul tappetino       sveglio   menu aperto
//   esce      va in giardino                      attivita  fa qualcosa in giardino
//   rientra   torna a casa / al tappetino          riporta_auto  riporta a casa la macchina
//   carica, attesa, vai, al_bidone, svuota        sta pulendo
//   camion_arriva, camion_a_casa, camion_va_via   il camion
let stato = "dorme";

let ominoX = 0;             // posizione dei piedi di Franco
let ominoY = 0;
let direzione = 1;          // 1 = guarda a destra, -1 = guarda a sinistra
let sdraiato = false;       // true = dorme sul tappetino
let saltoInizio = 0;        // quando ha fatto il salto di spavento
let menuAperto = false;

// macchina
let autoX = 0;
let autoY = 0;
let direzioneAuto = 1;
let inAuto = false;
let pianoAuto = null;       // per la destinazione attuale: prende la macchina o no?

// camion
let conCamion = false;      // questa pulizia la fa con il camion
let inCamion = false;       // Franco è dentro il camion
let camionX = 0;
let camionY = 0;
let direzioneCamion = 1;

// pulizia
let inPausa = false;
let smettila = false;       // true = finisce e torna a casa
let sacco = 0;
let presi = 0;
let modalita = "documenti"; // documenti, cestino, prova
let bersaglio = null;
let daPrendere = [];
let giaPresi = [];
let volanti = [];           // icone e polvere che volano
let staAggiornando = false;

let numeroFile = 0;         // quanti file c'erano l'ultima volta che ha guardato
let insistito = false;      // true = hai già insistito con "ti prego"
let attivita = null;        // cosa sta facendo in giardino

let ultimaFrase = 0;        // quando ha parlato l'ultima volta
let timerFumetto = null;
let timerReport = [];
let timerUscita = null;
let timerAttivita = null;
let ultimoTestoNotch = "";
let ignoroMouse = true;


// ===== FUNZIONI DI AIUTO =====

function distanza(x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy); // teorema di Pitagora
}

// Numero intero casuale tra min e max
function casuale(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// È notte? (di notte Franco non esce da solo)
function eNotte() {
  let ora = new Date().getHours();
  return ora >= 22 || ora < 7;
}

// Sta pulendo?
function staLavorando() {
  return stato === "carica" || stato === "attesa" || stato === "vai" ||
         stato === "al_bidone" || stato === "svuota" || stato === "riporta_auto" ||
         stato === "camion_arriva" || stato === "camion_a_casa" || stato === "camion_va_via";
}

// Quanti file ci stanno adesso (aspirapolvere o camion)
function capienza() {
  return conCamion ? CAPIENZA_CAMION : CAPIENZA;
}

// Franco parla (fumetto sopra la testa)
function parla(testo, durata) {
  if (!durata) {
    durata = 2800;
  }
  fumetto.textContent = testo;
  fumetto.classList.add("visibile");
  ultimaFrase = Date.now();

  clearTimeout(timerFumetto);
  timerFumetto = setTimeout(function () {
    fumetto.classList.remove("visibile");
  }, durata);
}

// Parla solo se non ha appena detto qualcos'altro
function parlaOgniTanto(testo) {
  if (Date.now() - ultimaFrase > 3000) {
    parla(testo);
  }
}

// Mostra solo una sezione del menu
function mostraSezione(sezione) {
  sceltaNome.style.display = "none";
  menu.style.display = "none";
  sezioneImpostazioni.style.display = "none";
  menuLavoro.style.display = "none";
  if (sezione) {
    sezione.style.display = "block";
  }
}

// Ferma le frasi del report se ce ne sono ancora in arrivo
function fermaReport() {
  for (let i = 0; i < timerReport.length; i++) {
    clearTimeout(timerReport[i]);
  }
  timerReport = [];
}

// Testo a destra del notch (lo manda a main.js, che lo passa al notch)
function aggiornaNotch() {
  let testo = "";
  if (stato === "dorme") {
    testo = "<span>z</span><span>z</span><span>z</span>";
  } else if (staLavorando()) {
    testo = sacco + "/" + capienza();
  }
  if (testo !== ultimoTestoNotch) {
    window.mac.testoNotch(testo);
    ultimoTestoNotch = testo;
  }
}

// Riempie la finestrella dell'aspirapolvere (o il cassone del camion)
function aggiornaSacco() {
  let pieno = Math.min(sacco / capienza(), 1);

  let livello = omino.querySelector(".livello");
  livello.setAttribute("y", 77 - 13 * pieno);
  livello.setAttribute("height", 13 * pieno);

  let carico = camion.querySelector(".carico");
  carico.setAttribute("y", 44 - 26 * pieno);
  carico.setAttribute("height", 26 * pieno);
}

function aggiornaTarghetta() {
  document.getElementById("targhetta").textContent = nomeOmino;
}

// Che tipo di file è (per scegliere la frase)
function tipoDiFile(file) {
  let nome = file.nome.toLowerCase();
  if (file.dimensione > 200 * 1024 * 1024) {
    return "pesanteAspira";
  }
  if (file.giorni > 180) {
    return "vecchioAspira";
  }
  if (nome.endsWith(".png") || nome.endsWith(".jpg") || nome.endsWith(".jpeg") || nome.endsWith(".heic") || nome.endsWith(".gif")) {
    return "immagine";
  }
  if (nome.endsWith(".pdf") || nome.endsWith(".docx") || nome.endsWith(".txt") || nome.endsWith(".pages")) {
    return "documento";
  }
  return "generico";
}

// È uno screenshot? (in italiano il Mac li chiama "Istantanea schermo...")
function eScreenshot(nome) {
  return nome.startsWith("Istantanea") || nome.startsWith("Screenshot") || nome.startsWith("Schermata");
}


// ===== COMMENTI SULLA SCRIVANIA =====

// Frase su quanto è disordinata
function fraseDisordine(lista) {
  let n = lista.length;
  if (n === 0) {
    return frase("pulita");
  } else if (n < 6) {
    return frase("poco", { n: n });
  } else if (n < 20) {
    return frase("medio", { n: n });
  } else {
    return frase("tanto", { n: n });
  }
}

// Tutte le frasi del report, una dopo l'altra
function fraseReport(lista) {
  let frasi = [fraseDisordine(lista)];

  let screenshot = 0;
  let vecchio = null;
  let pesante = null;
  for (let i = 0; i < lista.length; i++) {
    let file = lista[i];
    if (eScreenshot(file.nome)) {
      screenshot++;
    }
    if (vecchio === null || file.giorni > vecchio.giorni) {
      vecchio = file;
    }
    if (pesante === null || file.dimensione > pesante.dimensione) {
      pesante = file;
    }
  }

  if (screenshot >= 3) {
    frasi.push(frase("screenshot", { n: screenshot }));
  }
  if (vecchio && vecchio.giorni > 30) {
    frasi.push(frase("vecchio", { file: vecchio.nome, giorni: vecchio.giorni }));
  }
  if (pesante && pesante.dimensione > 100 * 1024 * 1024) {
    let mb = Math.round(pesante.dimensione / (1024 * 1024));
    frasi.push(frase("pesante", { file: pesante.nome, mb: mb }));
  }
  return frasi;
}


// ===== DOVE STANNO LE COSE =====
// Sul Mac la casa è in basso a SINISTRA, su Windows in basso a DESTRA
// (perché su Windows le icone partono da sinistra).
// Tutte le posizioni sono scritte come se la casa fosse a sinistra:
// la funzione dalBordo() le gira dall'altra parte quando serve.

// x misurata dal bordo dello schermo dove sta la casa
function dalBordo(x) {
  if (lato === "destra") {
    return window.innerWidth - x;
  }
  return x;
}

// 1 se la casa è a sinistra, -1 se è a destra (serve per le direzioni)
function segno() {
  return (lato === "destra") ? -1 : 1;
}

// Dove inizia il disegno della casa (largo 340)
function sinistraCasa() {
  return (lato === "destra") ? window.innerWidth - 350 : 10;
}

// Un punto del disegno della casa (340 x 170) sullo schermo
function puntoCasa(x, y) {
  return { x: sinistraCasa() + x, y: fondo - 170 + y };
}

// Dove va Franco per tornare a casa: la porta oppure il tappetino
function posizioneCasaFranco() {
  if (impostazioni.casa) {
    return puntoCasa(49, 154);
  }
  return { x: dalBordo(72), y: fondo - 10 };
}

// Il bidone: accanto al giardino, oppure accanto al tappetino
function posizioneBidone() {
  if (impostazioni.casa) {
    // sul Mac a destra del giardino, su Windows a sinistra della casa
    let x = (lato === "destra") ? sinistraCasa() - 44 : 394;
    return { x: x, y: fondo - 14 };
  }
  return { x: dalBordo(172), y: fondo - 14 };
}

// Dove è parcheggiata la macchina quando non la usa
function posizioneParcheggio() {
  let b = posizioneBidone();
  return { x: b.x + 116 * segno(), y: fondo - 12 };
}

// I posti del giardino dove Franco fa le sue cose
function postoAttivita(nome) {
  if (nome === "panchina") {
    let p = puntoCasa(284, 164);
    return { x: p.x, y: p.y, direzione: 1, posa: "seduto" };
  }
  if (nome === "fiori") {
    let p = puntoCasa(236, 158);
    return { x: p.x, y: p.y, direzione: -1, posa: "annaffia" };
  }
  // sbadiglio: davanti a casa, oppure vicino al tappetino
  let casaFranco = posizioneCasaFranco();
  let x = impostazioni.casa ? puntoCasa(150, 158).x : casaFranco.x + 40 * segno();
  return { x: x, y: casaFranco.y, direzione: 1, posa: "braccia-su" };
}

// Mette casa, tappetino, bidone e macchina al posto giusto
function sistemaScena() {
  casa.style.display = impostazioni.casa ? "block" : "none";
  casa.style.left = sinistraCasa() + "px";
  tappetino.style.display = impostazioni.casa ? "none" : "block";
  tappetino.style.left = (dalBordo(72) - 58) + "px"; // il tappetino è largo 116
  zzzTappetino.style.left = (dalBordo(72) - 36) + "px";

  let b = posizioneBidone();
  bidone.style.left = (b.x - 32) + "px";
  bidone.style.top = (fondo - 94) + "px";

  tappetino.style.top = (fondo - 22) + "px";
  zzzTappetino.style.top = (fondo - 60) + "px";

  // la macchina torna al parcheggio (se non la sta usando)
  if (!inAuto && !staLavorando()) {
    let p = posizioneParcheggio();
    autoX = p.x;
    autoY = p.y;
    direzioneAuto = segno();
  }
  disegnaAuto();

  // il menu compare sopra la casa (a sinistra o a destra)
  if (lato === "destra") {
    popup.style.left = (window.innerWidth - 14 - 360) + "px";
  } else {
    popup.style.left = "14px";
  }

  // se dorme, lo rimetto a dormire nel posto giusto
  if (stato === "dorme") {
    mettiADormire();
  }
}


// ===== CASA, SONNO E RISVEGLIO =====

function luce(accesa) {
  if (accesa) {
    casa.classList.add("luce-accesa");
  } else {
    casa.classList.remove("luce-accesa");
  }
}

function porta(aperta) {
  if (aperta) {
    casa.classList.add("porta-aperta");
  } else {
    casa.classList.remove("porta-aperta");
  }
}

// Toglie tutte le pose (seduto, annaffia, aspirapolvere...)
function togliPose() {
  omino.classList.remove("cammina", "seduto", "annaffia", "braccia-su", "sorpreso", "con-aspirapolvere", "aspira", "dorme");
}

// Franco esce di casa (o si alza dal tappetino)
function alzati() {
  sdraiato = false;
  togliPose();
  zzzTappetino.style.display = "none";
  casa.classList.remove("dorme-casa");
  casa.classList.remove("alla-finestra");

  let p = posizioneCasaFranco();
  ominoX = p.x;
  ominoY = p.y;
  direzione = segno(); // guarda verso il centro dello schermo
  omino.style.display = "block";

  if (impostazioni.casa) {
    luce(true);
    porta(true);
    setTimeout(function () {
      porta(false);
    }, 900);
  }
  disegnaOmino();
}

// Franco va a dormire (in casa o sul tappetino)
function mettiADormire() {
  togliPose();
  stato = "dorme";

  if (impostazioni.casa) {
    // entra in casa
    porta(true);
    omino.style.display = "none";
    zzzTappetino.style.display = "none";
    setTimeout(function () {
      porta(false);
    }, 500);
    // dopo un po' spegne la luce e si addormenta
    setTimeout(function () {
      if (stato === "dorme" && !menuAperto) {
        luce(false);
        casa.classList.add("dorme-casa");
      }
    }, 2500);
  } else {
    // si sdraia sul tappetino
    let p = posizioneCasaFranco();
    ominoX = p.x;
    ominoY = p.y;
    sdraiato = true;
    omino.classList.add("dorme");
    omino.style.display = "block";
    zzzTappetino.style.display = "block";
    disegnaOmino();
  }

  programmaUscita(false);
}

// Torna a casa: se la macchina non è al parcheggio, prima la riporta
function tornaACasa() {
  let p = posizioneParcheggio();
  if (inAuto || distanza(autoX, autoY, p.x, p.y) > 30) {
    stato = "riporta_auto";
  } else {
    stato = "rientra";
  }
}


// ===== FRANCO FA LE SUE COSE DA SOLO =====

// Decide fra quanto tempo farà qualcosa
function programmaUscita(subito) {
  clearTimeout(timerUscita);
  let secondi = subito ? casuale(10, 20) : casuale(45, 120);
  timerUscita = setTimeout(esceDaSolo, secondi * 1000);
}

function esceDaSolo() {
  // solo se dorme, il menu è chiuso ed è giorno
  if (stato !== "dorme" || menuAperto || eNotte()) {
    programmaUscita(false);
    return;
  }

  let scelte = ["sbadiglio"]; // senza casetta: si alza e si stiracchia
  if (impostazioni.casa) {
    scelte = ["panchina", "fiori", "sbadiglio", "finestra"];
  }
  let scelta = scelte[casuale(0, scelte.length - 1)];

  if (scelta === "finestra") {
    // si affaccia alla finestra del primo piano
    casa.classList.remove("dorme-casa");
    luce(true);
    casa.classList.add("alla-finestra");
    setTimeout(function () {
      casa.classList.remove("alla-finestra");
      if (stato === "dorme" && !menuAperto) {
        luce(false);
        casa.classList.add("dorme-casa");
      }
    }, 6000);
    programmaUscita(false);
    return;
  }

  attivita = scelta;
  alzati();
  stato = "esce";
}

function iniziaAttivita() {
  let posto = postoAttivita(attivita);
  stato = "attivita";
  direzione = posto.direzione;
  omino.classList.remove("cammina");
  omino.classList.add(posto.posa);
  parla(frase(attivita));

  clearTimeout(timerAttivita);
  timerAttivita = setTimeout(function () {
    if (stato === "attivita") {
      togliPose();
      stato = "rientra";
    }
  }, 9000);
}


// ===== MENU =====

function apriMenu(sezione) {
  fermaReport();
  menuAperto = true;
  insistito = false;
  btnPulisci.textContent = "Pulisci la Scrivania";
  popup.style.bottom = (window.innerHeight - fondo + 215) + "px";
  popup.classList.add("aperto");
  mostraSezione(sezione);
  window.mac.menuAperto(); // la finestra viene davanti, così il menu si vede
}

function chiudiMenu() {
  fermaReport();
  menuAperto = false;
  popup.classList.remove("aperto");
  window.mac.menuChiuso();
}

function aggiornaMenuLavoro() {
  let cosa = conCamion ? "Camion" : "Sacco";
  if (inPausa) {
    statoLavoro.textContent = nomeOmino + " è in pausa. " + cosa + ": " + sacco + "/" + capienza();
    btnPausa.textContent = "Riprendi";
  } else {
    statoLavoro.textContent = nomeOmino + " sta pulendo. " + cosa + ": " + sacco + "/" + capienza() + ", file presi: " + presi;
    btnPausa.textContent = "Pausa";
  }
}

// Franco si sveglia (clic sulla casa, su di lui o sul notch)
async function sveglia() {
  if (menuAperto) {
    return;
  }

  if (staLavorando()) {
    aggiornaMenuLavoro();
    apriMenu(menuLavoro);
    return;
  }

  clearTimeout(timerAttivita);

  if (stato === "dorme") {
    // dormiva: si sveglia di colpo!
    alzati();
    stato = "sveglio";
    omino.classList.add("sorpreso");
    saltoInizio = Date.now();
    parla(frase("sveglia"));
    setTimeout(function () {
      omino.classList.remove("sorpreso");
    }, 900);
  } else {
    // era già sveglio in giardino
    togliPose();
    stato = "sveglio";
    parla(frase("chiamato"));
  }

  let lista = await window.mac.leggiFile();
  numeroFile = lista.length;

  setTimeout(function () {
    if (stato !== "sveglio") {
      return;
    }
    apriMenu(menu);
    parla(fraseDisordine(lista), 4500);
  }, 1400);
}

// "Torna a dormire"
function tornaADormire() {
  chiudiMenu();
  parla(frase("buonanotte"));
  togliPose();
  tornaACasa();
}

// La prima volta: Franco si presenta e chiede il nome
function presentati() {
  alzati();
  stato = "sveglio";
  omino.classList.add("sorpreso");
  saltoInizio = Date.now();
  setTimeout(function () {
    omino.classList.remove("sorpreso");
  }, 900);

  apriMenu(sceltaNome);
  parla(frase("presentazione"), 60000); // resta finché non rispondi
  campoNome.value = nomeOmino;

  window.mac.mouse(false); // per poter scrivere subito nel campo
  ignoroMouse = false;
  setTimeout(function () {
    campoNome.focus();
    campoNome.select();
  }, 500);
}

async function salvaNome() {
  let nome = campoNome.value.trim();
  if (nome === "") {
    nome = "Franco";
  }
  nomeOmino = nome;
  impostazioni.nome = nome;
  aggiornaTarghetta();
  await window.mac.salvaImpostazioni(impostazioni);
  parla(frase("nomeSalvato"), 4500);
  mostraSezione(menu);
}


// ===== DISEGNARE =====

// Disegna Franco nella posizione giusta
function disegnaOmino() {
  omino.style.left = (ominoX - 45) + "px"; // il disegno è largo 90px
  omino.style.top = (ominoY - 88) + "px";  // i piedi sono in basso

  // salto di spavento quando si sveglia (dura 0,4 secondi)
  let salto = 0;
  let passati = Date.now() - saltoInizio;
  if (passati < 400) {
    salto = -18 * Math.sin(Math.PI * passati / 400);
  }

  let trasforma = "translateY(" + salto + "px) scaleX(" + direzione + ")";
  if (sdraiato) {
    // sdraiato sul tappetino: lo giro di lato e lo appoggio a terra
    trasforma = "translateY(28px) rotate(-90deg)";
  }
  omino.querySelector(".disegno").style.transform = trasforma;

  // il fumetto non deve uscire dallo schermo (a sinistra o a destra)
  let metaFumetto = fumetto.offsetWidth / 2;
  let spostamento = 0;
  if (ominoX - metaFumetto < 8) {
    spostamento = 8 - (ominoX - metaFumetto);
  } else if (ominoX + metaFumetto > window.innerWidth - 8) {
    spostamento = (window.innerWidth - 8) - (ominoX + metaFumetto);
  }
  fumetto.style.marginLeft = spostamento + "px";
}

function disegnaAuto() {
  auto.style.left = (autoX - 50) + "px"; // la macchina è larga 100px
  auto.style.top = (autoY - 52) + "px";
  auto.querySelector("svg").style.transform = "scaleX(" + direzioneAuto + ")";
}

function disegnaCamion() {
  camion.style.left = (camionX - 75) + "px"; // il camion è largo 150px
  camion.style.top = (camionY - 76) + "px";
  camion.querySelector("svg").style.transform = "scaleX(" + direzioneCamion + ")";
  // la scritta la giro di nuovo, se no si legge al contrario
  camion.querySelector(".scritta").style.transform = "scaleX(" + direzioneCamion + ")";
}


// ===== MOVIMENTO =====

// Franco fa un passo verso (x, y). Restituisce quanto manca
function cammina(x, y) {
  let manca = distanza(ominoX, ominoY, x, y);

  if (manca <= VELOCITA) {
    ominoX = x;
    ominoY = y;
    omino.classList.remove("cammina");
    return 0;
  }

  ominoX = ominoX + (x - ominoX) / manca * VELOCITA;
  ominoY = ominoY + (y - ominoY) / manca * VELOCITA;

  // si gira dalla parte dove va
  if (x > ominoX + 2) {
    direzione = 1;
  } else if (x < ominoX - 2) {
    direzione = -1;
  }

  omino.classList.add("cammina");
  return manca;
}

// La macchina (con Franco dentro) va verso (x, y). Restituisce quanto manca
function guidaAuto(x, y) {
  let manca = distanza(autoX, autoY, x, y);
  auto.classList.add("in-moto");

  if (manca <= VELOCITA_AUTO) {
    autoX = x;
    autoY = y;
    auto.classList.remove("in-moto");
    manca = 0;
  } else {
    autoX = autoX + (x - autoX) / manca * VELOCITA_AUTO;
    autoY = autoY + (y - autoY) / manca * VELOCITA_AUTO;
    if (x > autoX + 2) {
      direzioneAuto = 1;
    } else if (x < autoX - 2) {
      direzioneAuto = -1;
    }
  }

  // Franco è dentro: si muove con la macchina
  ominoX = autoX;
  ominoY = autoY;
  direzione = direzioneAuto;
  disegnaAuto();
  return manca;
}

// Il camion va verso (x, y). Restituisce quanto manca
function guidaCamion(x, y) {
  let manca = distanza(camionX, camionY, x, y);
  camion.classList.add("in-moto");

  if (manca <= VELOCITA_CAMION) {
    camionX = x;
    camionY = y;
    camion.classList.remove("in-moto");
    manca = 0;
  } else {
    camionX = camionX + (x - camionX) / manca * VELOCITA_CAMION;
    camionY = camionY + (y - camionY) / manca * VELOCITA_CAMION;
    if (x > camionX + 2) {
      direzioneCamion = 1;
    } else if (x < camionX - 2) {
      direzioneCamion = -1;
    }
  }

  // se Franco è dentro si muove con il camion
  if (inCamion) {
    ominoX = camionX;
    ominoY = camionY;
    direzione = direzioneCamion;
  }
  disegnaCamion();
  return manca;
}

function saliInAuto() {
  inAuto = true;
  omino.style.display = "none";
  auto.classList.add("guida");
  parlaOgniTanto(frase("auto"));
}

function scendiDallAuto() {
  inAuto = false;
  auto.classList.remove("guida");
  auto.classList.remove("in-moto");
  ominoX = autoX;
  ominoY = autoY;
  omino.style.display = "block";
}

// Conviene prendere la macchina per andare fino a (x, y)?
function convieneAuto(x, y) {
  let aPiedi = distanza(ominoX, ominoY, x, y);
  if (aPiedi < LONTANO) {
    return false;
  }
  // tempo per andare alla macchina + guidare (la macchina è 3 volte più veloce)
  let conLaMacchina = distanza(ominoX, ominoY, autoX, autoY) + distanza(autoX, autoY, x, y) / 3 + 60;
  return conLaMacchina < aPiedi * 0.75;
}

// Franco va verso (x, y): a piedi, oppure in macchina se è lontano.
// Restituisce 0 solo quando è arrivato a piedi
function spostati(x, y) {
  // nuova destinazione? decido se prendere la macchina
  if (pianoAuto === null || distanza(pianoAuto.x, pianoAuto.y, x, y) > 40) {
    pianoAuto = { x: x, y: y, usa: inAuto || convieneAuto(x, y) };
  }

  if (inAuto) {
    let manca = guidaAuto(x, y);
    if (manca < 60) {
      // parcheggia vicino e scende
      scendiDallAuto();
      pianoAuto.usa = false;
    }
    return manca + 1;
  }

  if (pianoAuto.usa) {
    // va a prendere la macchina
    if (cammina(autoX, autoY) === 0) {
      saliInAuto();
    }
    return 999;
  }

  return cammina(x, y);
}

// Si sposta con il camion (se pulisce con il camion) oppure a piedi/in macchina
function muovi(x, y) {
  if (conCamion) {
    return guidaCamion(x, y);
  }
  return spostati(x, y);
}

// Il punto che aspira: la bocchetta dell'aspirapolvere o la spazzola del camion
function puntoAspirazione() {
  if (conCamion) {
    return { x: camionX + 66 * direzioneCamion, y: camionY - 8 };
  }
  return { x: ominoX + 32 * direzione, y: ominoY - 4 };
}


// ===== IL LAVORO =====

function iniziaPulizia(usaCamion) {
  chiudiMenu();
  clearTimeout(timerAttivita);
  giaPresi = [];
  sacco = 0;
  presi = 0;
  smettila = false;
  inPausa = false;
  pianoAuto = null;
  conCamion = usaCamion;

  if (stato === "dorme") {
    alzati();
  }
  togliPose();
  aggiornaSacco();

  if (usaCamion) {
    // il camion arriva dal bordo dello schermo (dalla parte della casa)
    parla(frase("camion"), 4000);
    camionX = dalBordo(-120);
    camionY = ominoY;
    direzioneCamion = segno();
    camion.style.display = "block";
    disegnaCamion();
    stato = "camion_arriva";
  } else {
    omino.classList.add("con-aspirapolvere"); // prende l'aspirapolvere
    parla(frase("parto"));
    stato = "carica";
  }
}

// Prende la lista dal Mac e tiene solo i file non ancora presi
function preparaLista(lista) {
  daPrendere = [];
  for (let i = 0; i < lista.length; i++) {
    if (!giaPresi.includes(lista[i].nome)) {
      lista[i].x = lista[i].x + CORREZIONE_X;
      lista[i].y = lista[i].y + CORREZIONE_Y;
      daPrendere.push(lista[i]);
    }
  }
}

// Trova il file più vicino
function fileVicino() {
  let migliore = null;
  let distanzaMigliore = 999999;
  for (let i = 0; i < daPrendere.length; i++) {
    let d = distanza(ominoX, ominoY, daPrendere[i].x, daPrendere[i].y);
    if (d < distanzaMigliore) {
      distanzaMigliore = d;
      migliore = daPrendere[i];
    }
  }
  return migliore;
}

// Lavoro finito: il camion lo riporta a casa, oppure torna da solo
function fineLavoro() {
  if (conCamion) {
    stato = "camion_a_casa";
  } else {
    tornaACasa();
  }
}

// Decide cosa fare dopo
function prossimaMossa() {
  if (smettila) {
    if (sacco > 0) {
      stato = "al_bidone";
    } else {
      fineLavoro();
    }
    return;
  }
  if (sacco >= capienza()) {
    parla(frase("saccoPieno"));
    stato = "al_bidone";
    return;
  }
  if (daPrendere.length === 0) {
    stato = "carica";
    return;
  }
  bersaglio = fileVicino();
  stato = "vai";
}

// Chiede al Mac i file della Scrivania
async function caricaFile() {
  stato = "attesa";
  let lista = await window.mac.leggiFile();
  if (stato !== "attesa") {
    return; // nel frattempo è cambiato qualcosa
  }
  preparaLista(lista);

  if (daPrendere.length === 0) {
    // finito!
    parla(frase("finito"));
    smettila = true;
  }
  prossimaMossa();
}

// Aggiorna le posizioni mentre Franco continua a camminare
// (il Finder a volte risistema le icone quando ne togli una)
async function aggiornaPosizioni() {
  if (staAggiornando) {
    return;
  }
  staAggiornando = true;
  let lista = await window.mac.leggiFile();
  staAggiornando = false;

  if (stato !== "vai") {
    return;
  }
  preparaLista(lista);

  let trovato = null;
  for (let i = 0; i < daPrendere.length; i++) {
    if (bersaglio && daPrendere[i].nome === bersaglio.nome) {
      trovato = daPrendere[i];
    }
  }
  if (trovato) {
    bersaglio = trovato;
  } else {
    prossimaMossa();
  }
}

// Passa sopra un file e lo risucchia (senza fermarsi)
async function risucchia(file) {
  giaPresi.push(file.nome);
  sacco++;
  presi++;
  aggiornaSacco();

  omino.classList.add("aspira");
  setTimeout(function () {
    omino.classList.remove("aspira");
  }, 400);

  // ogni tanto commenta (solo a piedi, dal camion non si sente)
  if (!conCamion && Math.random() < 0.4) {
    parlaOgniTanto(frase(tipoDiFile(file)));
  }

  // 1. prendo l'immagine dell'icona PRIMA di spostare il file
  let icona = await window.mac.icona(file.nome);
  if (icona) {
    let immagine = document.createElement("img");
    immagine.className = "volante";
    immagine.src = icona;
    document.body.appendChild(immagine);
    volanti.push({ elemento: immagine, x: file.x, y: file.y, scala: 1, giro: 0, versoBidone: false, grande: 64 });
  }

  // 2. sposto il file vero (o non faccio niente in modalità prova)
  let riuscito = await window.mac.aspira(file.nome, modalita);
  if (!riuscito) {
    sacco--;
    presi--;
    aggiornaSacco();
  }

  // 3. intanto aggiorno le posizioni delle altre icone
  aggiornaPosizioni();
}

// Svuota nel bidone
function svuota() {
  stato = "svuota";
  omino.classList.remove("cammina");
  bidone.classList.add("aperto");

  // un po' di polvere vola nel bidone (dal camion ne vola di più)
  let b = posizioneBidone();
  let partenzaX = conCamion ? camionX - 50 * direzioneCamion : ominoX - 25;
  let partenzaY = conCamion ? camionY - 50 : ominoY - 25;
  let quante = conCamion ? 12 : 6;
  for (let i = 0; i < quante; i++) {
    setTimeout(function () {
      let pallina = document.createElement("div");
      pallina.className = "polvere";
      document.body.appendChild(pallina);
      volanti.push({ elemento: pallina, x: partenzaX, y: partenzaY, scala: 1, giro: 0, versoBidone: true, grande: 10, bidoneX: b.x, bidoneY: b.y - 70 });
    }, i * 120);
  }

  setTimeout(function () {
    bidone.classList.remove("aperto");
    sacco = 0;
    aggiornaSacco();
    parla(frase("svuota"));
    if (smettila) {
      fineLavoro();
    } else {
      stato = "carica";
    }
  }, 1600);
}

// Muove le icone risucchiate e la polvere
function muoviVolanti() {
  let punto = puntoAspirazione();

  for (let i = volanti.length - 1; i >= 0; i--) {
    let v = volanti[i];
    let versoX = v.versoBidone ? v.bidoneX : punto.x;
    let versoY = v.versoBidone ? v.bidoneY : punto.y;

    v.x = v.x + (versoX - v.x) * 0.22;
    v.y = v.y + (versoY - v.y) * 0.22;
    v.scala = v.scala - 0.05;
    v.giro = v.giro + 25;

    if (v.scala <= 0.05) {
      v.elemento.remove();
      volanti.splice(i, 1); // tolgo dall'array
    } else {
      v.elemento.style.left = (v.x - v.grande / 2) + "px";
      v.elemento.style.top = (v.y - v.grande / 2) + "px";
      v.elemento.style.transform = "scale(" + v.scala + ") rotate(" + v.giro + "deg)";
    }
  }
}


// ===== CICLO PRINCIPALE =====
// questa funzione viene chiamata 50 volte al secondo
function passo() {
  muoviVolanti();
  aggiornaNotch();

  if (inPausa) {
    omino.classList.remove("cammina");
    auto.classList.remove("in-moto");
    camion.classList.remove("in-moto");
    return;
  }

  // --- vita tranquilla ---
  if (stato === "esce") {
    let posto = postoAttivita(attivita);
    if (cammina(posto.x, posto.y) === 0) {
      iniziaAttivita();
    }
  } else if (stato === "rientra") {
    let p = posizioneCasaFranco();
    if (cammina(p.x, p.y) === 0) {
      mettiADormire();
    }
  } else if (stato === "riporta_auto") {
    // riporta la macchina al parcheggio, poi va a casa
    let p = posizioneParcheggio();
    if (!inAuto) {
      if (cammina(autoX, autoY) === 0) {
        saliInAuto();
      }
    } else if (guidaAuto(p.x, p.y) === 0) {
      direzioneAuto = segno();
      scendiDallAuto();
      disegnaAuto();
      stato = "rientra";
    }

  // --- il camion ---
  } else if (stato === "camion_arriva") {
    if (guidaCamion(ominoX, ominoY) === 0) {
      // Franco sale sul camion
      inCamion = true;
      omino.style.display = "none";
      stato = "carica";
    }
  } else if (stato === "camion_a_casa") {
    let p = posizioneCasaFranco();
    if (guidaCamion(p.x + 60 * segno(), p.y) === 0) {
      // Franco scende, il camion se ne va
      inCamion = false;
      ominoX = camionX - 60 * segno();
      ominoY = camionY;
      direzione = segno();
      omino.style.display = "block";
      parla(frase("grazieCamion"));
      stato = "camion_va_via";
    }
  } else if (stato === "camion_va_via") {
    if (guidaCamion(dalBordo(-200), camionY) === 0) {
      camion.style.display = "none";
      conCamion = false;
      tornaACasa();
    }

  // --- pulizia ---
  } else if (stato === "carica") {
    caricaFile();
  } else if (stato === "vai") {
    // va in modo che la bocchetta (o la spazzola del camion) arrivi sul file
    let lato = (bersaglio.x > ominoX) ? 1 : -1;
    let davanti = conCamion ? 66 : 32;
    muovi(bersaglio.x - davanti * lato, bersaglio.y + 30);

    if (!inAuto) {
      let punto = puntoAspirazione();
      let raggio = conCamion ? 45 : 32;
      if (distanza(punto.x, punto.y, bersaglio.x, bersaglio.y + 20) < raggio) {
        let file = bersaglio;
        daPrendere.splice(daPrendere.indexOf(file), 1);
        risucchia(file);
        prossimaMossa();
      }
    }
  } else if (stato === "al_bidone") {
    let b = posizioneBidone();
    let distanzaBidone = conCamion ? 110 : 70;
    if (muovi(b.x + distanzaBidone * segno(), b.y) === 0) {
      direzione = -segno(); // si gira verso il bidone
      direzioneCamion = -segno();
      if (conCamion) {
        disegnaCamion();
      }
      svuota();
    }
  }

  if (omino.style.display === "block") {
    disegnaOmino();
  }
}


// ===== MOUSE =====
// i clic vanno all'app solo se il mouse è sopra la casetta, il menu o Franco,
// altrimenti passano al Mac
document.addEventListener("mousemove", function (evento) {
  let sotto = document.elementFromPoint(evento.clientX, evento.clientY);
  let cliccabile = sotto && sotto.closest(".cliccabile");

  if (cliccabile && ignoroMouse) {
    window.mac.mouse(false);
    ignoroMouse = false;
  } else if (!cliccabile && !ignoroMouse) {
    window.mac.mouse(true);
    ignoroMouse = true;
  }
});

// se lo tocchi mentre lavora si lamenta
omino.addEventListener("mouseenter", function () {
  if (staLavorando()) {
    parlaOgniTanto(frase("disturbo"));
  }
});


// ===== CLIC =====
casa.addEventListener("click", function () {
  if (menuAperto) {
    tornaADormire(); // secondo clic sulla casa: chiude
  } else {
    sveglia();
  }
});

omino.addEventListener("click", function () {
  if (!menuAperto) {
    sveglia();
  }
});

// il notch (se è acceso) sveglia Franco
window.mac.quandoSvegliaDalNotch(sveglia);

btnNome.addEventListener("click", salvaNome);
campoNome.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter") {
    salvaNome();
  }
});

btnPulisci.addEventListener("click", function () {
  // troppi file: la prima volta si rifiuta
  if (numeroFile > TROPPI_FILE && !insistito) {
    insistito = true;
    parla(frase("troppi", { n: numeroFile }), 4500);
    btnPulisci.textContent = "Dai " + nomeOmino + ", ti prego!";
    return;
  }

  if (modalita === "cestino") {
    let sicuro = confirm("I file della Scrivania finiranno nel Cestino. Vuoi continuare?");
    if (!sicuro) {
      return;
    }
  }

  let haInsistito = insistito;
  iniziaPulizia(false);
  if (haInsistito) {
    parla(frase("convinto"), 3500);
  }
});

// se glielo chiedi per favore usa il camion (e non protesta mai)
btnCamion.addEventListener("click", function () {
  if (modalita === "cestino") {
    let sicuro = confirm("I file della Scrivania finiranno nel Cestino. Vuoi continuare?");
    if (!sicuro) {
      return;
    }
  }
  iniziaPulizia(true);
});

btnReport.addEventListener("click", async function () {
  fermaReport();
  let lista = await window.mac.leggiFile();
  numeroFile = lista.length;
  let frasi = fraseReport(lista);

  // una frase ogni 3 secondi e mezzo
  for (let i = 0; i < frasi.length; i++) {
    let timer = setTimeout(function () {
      parla(frasi[i], 3300);
    }, i * 3500);
    timerReport.push(timer);
  }
});

btnCartella.addEventListener("click", function () {
  window.mac.apriCartella();
});

btnImpostazioni.addEventListener("click", function () {
  sceltaCasa.checked = impostazioni.casa;
  sceltaNotch.checked = impostazioni.notch;
  mostraSezione(sezioneImpostazioni);
});

btnIndietro.addEventListener("click", function () {
  mostraSezione(menu);
});

// casetta sì / no
sceltaCasa.addEventListener("change", function () {
  impostazioni.casa = sceltaCasa.checked;
  window.mac.salvaImpostazioni(impostazioni);

  // Franco è sveglio davanti a te: si sposta nel nuovo posto
  if (stato === "sveglio") {
    let p = posizioneCasaFranco();
    ominoX = p.x;
    ominoY = p.y;
  }
  sistemaScena();
  if (impostazioni.casa) {
    luce(true);
  }
});

// notch sì / no
sceltaNotch.addEventListener("change", function () {
  impostazioni.notch = sceltaNotch.checked;
  window.mac.salvaImpostazioni(impostazioni);
  window.mac.impostaNotch(impostazioni.notch);
});

btnCambiaNome.addEventListener("click", function () {
  fermaReport();
  parla("Come mi vuoi chiamare?", 60000);
  campoNome.value = nomeOmino;
  mostraSezione(sceltaNome);
  campoNome.focus();
  campoNome.select();
});

btnDormi.addEventListener("click", tornaADormire);

btnChiudi.addEventListener("click", function () {
  window.mac.esci();
});

// scelta di dove vanno i file
for (let i = 0; i < bottoniModo.length; i++) {
  bottoniModo[i].addEventListener("click", function () {
    for (let j = 0; j < bottoniModo.length; j++) {
      bottoniModo[j].classList.remove("scelto");
    }
    bottoniModo[i].classList.add("scelto");
    modalita = bottoniModo[i].dataset.modo;
  });
}

btnPausa.addEventListener("click", function () {
  inPausa = !inPausa;
  parla(inPausa ? frase("pausa") : frase("riparto"));
  aggiornaMenuLavoro();
});

btnBasta.addEventListener("click", function () {
  smettila = true;
  inPausa = false;
  chiudiMenu();
  parla(frase("basta"));
  if (stato === "vai" || stato === "carica" || stato === "attesa") {
    prossimaMossa();
  }
});

btnChiudiMenu.addEventListener("click", chiudiMenu);


// ===== AVVIO =====
async function avvio() {
  let info = await window.mac.info();
  fondo = info.fondo;
  lato = info.lato;

  // il notch c'è solo sul Mac: altrimenti tolgo l'interruttore
  if (!info.notch) {
    sceltaNotch.closest("label").style.display = "none";
  }

  // disegni
  casa.innerHTML = disegnoCasa();
  casa.style.top = (fondo - 170) + "px";
  omino.insertAdjacentHTML("beforeend", disegnoOmino());
  auto.innerHTML = disegnoAuto();
  camion.innerHTML = disegnoCamion();

  // d'inverno esce il fumo dal camino (novembre - febbraio)
  let mese = new Date().getMonth(); // 0 = gennaio
  if (mese >= 10 || mese <= 1) {
    casa.classList.add("inverno");
  }

  // impostazioni salvate
  impostazioni = await window.mac.leggiImpostazioni();
  if (impostazioni.nome) {
    nomeOmino = impostazioni.nome;
  }
  aggiornaTarghetta();
  sistemaScena();

  setInterval(passo, 20); // 20 millisecondi = 50 volte al secondo

  // la prima volta chiede il nome
  if (impostazioni.nome) {
    mettiADormire();
    programmaUscita(true); // la prima volta esce presto
  } else {
    presentati();
  }
}

avvio();
