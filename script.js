// script.js: Franco, la sua casetta, il notch e il menu
// Le cose del Mac (leggere e spostare file) le fa main.js, qui le chiamo con window.mac
// I disegni sono in disegni.js, le frasi in frasi.js

// ===== IMPOSTAZIONI =====
const CAPIENZA = 12;      // quanti file ci stanno nel sacco dell'aspirapolvere
const VELOCITA = 3;       // di quanti pixel cammina a ogni passo
const TROPPI_FILE = 40;   // con più file di così Franco protesta
// Se Franco passa un po' accanto alle icone invece che sopra,
// cambia questi due numeri (in pixel)
const CORREZIONE_X = 0;
const CORREZIONE_Y = 0;

// ===== ELEMENTI DELLA PAGINA =====
const casa = document.getElementById("casa");
const bidone = document.getElementById("bidone");
const omino = document.getElementById("omino");
const fumetto = document.getElementById("fumetto");
const popupCasa = document.getElementById("popupCasa");

const notch = document.getElementById("notch");
const notchTesto = document.getElementById("notchTesto");
const pannello = document.getElementById("pannello");
const ominoGrande = document.getElementById("ominoGrande");
const fumettoPannello = document.getElementById("fumettoPannello");
const intestazione = document.querySelector(".intestazione");

const sceltaNome = document.getElementById("sceltaNome");
const campoNome = document.getElementById("campoNome");
const menu = document.getElementById("menu");
const menuLavoro = document.getElementById("menuLavoro");
const statoLavoro = document.getElementById("statoLavoro");

const btnNome = document.getElementById("btnNome");
const btnPulisci = document.getElementById("btnPulisci");
const btnReport = document.getElementById("btnReport");
const btnCartella = document.getElementById("btnCartella");
const btnCambiaNome = document.getElementById("btnCambiaNome");
const btnDormi = document.getElementById("btnDormi");
const btnChiudi = document.getElementById("btnChiudi");
const btnPausa = document.getElementById("btnPausa");
const btnBasta = document.getElementById("btnBasta");
const btnChiudiMenu = document.getElementById("btnChiudiMenu");
const bottoniModo = document.querySelectorAll(".modo");

// ===== VARIABILI =====
let nomeOmino = "Franco";   // lo usa anche frasi.js
let schermo = null;         // misure dello schermo (barra dei menu, fondo)

// stato di Franco:
//   in_casa   dorme in casa              sveglio   menu aperto
//   esce      va in giardino             attivita  fa qualcosa in giardino
//   rientra   torna alla porta
//   carica, attesa, vai, al_bidone, svuota   = sta pulendo
let stato = "in_casa";

let ominoX = 0;             // posizione dei piedi di Franco
let ominoY = 0;
let direzione = 1;          // 1 = guarda a destra, -1 = guarda a sinistra
let menuDove = null;        // dov'è aperto il menu: "notch", "casa" oppure null

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
  return stato === "carica" || stato === "attesa" || stato === "vai" || stato === "al_bidone" || stato === "svuota";
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

// Parla dentro il menu: nel notch usa il fumetto del menu,
// sulla casetta usa il suo fumetto normale
function parlaMenu(testo) {
  if (menuDove === "notch") {
    fumettoPannello.textContent = testo;
  } else {
    parla(testo, 4500);
  }
}

// Mostra solo una sezione del menu
function mostraSezione(sezione) {
  sceltaNome.style.display = "none";
  menu.style.display = "none";
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

// Testo a destra del notch chiuso
function aggiornaNotch() {
  let testo = "";
  if (stato === "in_casa") {
    testo = "<span>z</span><span>z</span><span>z</span>";
  } else if (staLavorando()) {
    testo = sacco + "/" + CAPIENZA;
  }
  // lo cambio solo se è diverso (così le z non ripartono da capo)
  if (testo !== ultimoTestoNotch) {
    notchTesto.innerHTML = testo;
    ultimoTestoNotch = testo;
  }
}

// Riempie la finestrella dell'aspirapolvere
function aggiornaSacco() {
  let livello = omino.querySelector(".livello");
  let altezza = 13 * Math.min(sacco / CAPIENZA, 1);
  livello.setAttribute("y", 77 - altezza);
  livello.setAttribute("height", altezza);
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


// ===== LA CASETTA =====

// Un punto del disegno della casa (340 x 170) sullo schermo
function puntoCasa(x, y) {
  return {
    x: 10 + x,                     // la casa è a 10px dal bordo sinistro
    y: schermo.fondo - 170 + y     // ed è appoggiata sopra il Dock
  };
}

function posizionePorta() {
  return puntoCasa(49, 154);
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
  // sbadiglio: davanti a casa
  let p = puntoCasa(150, 158);
  return { x: p.x, y: p.y, direzione: 1, posa: "braccia-su" };
}

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

// Franco esce dalla porta
function esciDallaPorta() {
  casa.classList.remove("dorme-casa");
  casa.classList.remove("alla-finestra");
  luce(true);
  porta(true);

  let p = posizionePorta();
  ominoX = p.x;
  ominoY = p.y;
  direzione = 1;
  omino.style.display = "block";
  disegnaOmino();

  setTimeout(function () {
    porta(false);
  }, 900);
}

// Franco entra in casa e va a dormire
function entraInCasa() {
  togliPose();
  porta(true);
  omino.style.display = "none";
  stato = "in_casa";

  setTimeout(function () {
    porta(false);
  }, 500);

  // dopo un po' spegne la luce e si addormenta
  setTimeout(function () {
    if (stato === "in_casa" && menuDove === null) {
      luce(false);
      casa.classList.add("dorme-casa");
    }
  }, 2500);

  programmaUscita(false);
}

// Toglie tutte le pose (seduto, annaffia, aspirapolvere...)
function togliPose() {
  omino.classList.remove("cammina", "seduto", "annaffia", "braccia-su", "sorpreso", "con-aspirapolvere", "aspira", "dorme");
}


// ===== FRANCO ESCE DA SOLO =====

// Decide fra quanto tempo uscirà di nuovo
function programmaUscita(subito) {
  clearTimeout(timerUscita);
  let secondi = subito ? casuale(10, 20) : casuale(45, 120);
  timerUscita = setTimeout(esceDaSolo, secondi * 1000);
}

function esceDaSolo() {
  // solo se è in casa, nessun menu è aperto ed è giorno
  if (stato !== "in_casa" || menuDove !== null || eNotte()) {
    programmaUscita(false);
    return;
  }

  let scelte = ["panchina", "fiori", "sbadiglio", "finestra"];
  let scelta = scelte[casuale(0, scelte.length - 1)];

  if (scelta === "finestra") {
    // si affaccia alla finestra del primo piano
    casa.classList.remove("dorme-casa");
    luce(true);
    casa.classList.add("alla-finestra");
    setTimeout(function () {
      casa.classList.remove("alla-finestra");
      if (stato === "in_casa" && menuDove === null) {
        luce(false);
        casa.classList.add("dorme-casa");
      }
    }, 6000);
    programmaUscita(false);
    return;
  }

  // esce in giardino
  attivita = scelta;
  esciDallaPorta();
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

// Apre il menu nel notch oppure sopra la casetta
function apriMenu(dove) {
  chiudiMenu();
  menuDove = dove;
  insistito = false;
  btnPulisci.textContent = "Pulisci la Scrivania";

  if (dove === "notch") {
    notch.appendChild(pannello);
    notch.classList.add("aperto");
  } else {
    popupCasa.appendChild(pannello);
    popupCasa.classList.add("aperto");
  }
}

function chiudiMenu() {
  notch.classList.remove("aperto");
  popupCasa.classList.remove("aperto");
  menuDove = null;
  fermaReport();
}

function aggiornaMenuLavoro() {
  if (inPausa) {
    statoLavoro.textContent = nomeOmino + " è in pausa. Sacco: " + sacco + "/" + CAPIENZA;
    btnPausa.textContent = "Riprendi";
  } else {
    statoLavoro.textContent = nomeOmino + " sta pulendo. Sacco: " + sacco + "/" + CAPIENZA + ", file presi: " + presi;
    btnPausa.textContent = "Pausa";
  }
}

// Clic sulla casetta: Franco si sveglia e apre la porta
async function svegliaDallaCasa() {
  if (staLavorando()) {
    apriMenu("casa");
    aggiornaMenuLavoro();
    mostraSezione(menuLavoro);
    return;
  }

  clearTimeout(timerAttivita);

  if (stato === "in_casa") {
    // dormiva: si sveglia di colpo!
    esciDallaPorta();
    stato = "sveglio";
    omino.classList.add("sorpreso");
    parla(frase("sveglia"));
    setTimeout(function () {
      omino.classList.remove("sorpreso");
    }, 800);
  } else {
    // era già fuori in giardino
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
    apriMenu("casa");
    mostraSezione(menu);
    parlaMenu(fraseDisordine(lista));
  }, 1400);
}

// Clic sul notch: Franco si sveglia nel notch
async function apriNotch() {
  apriMenu("notch");

  if (staLavorando()) {
    intestazione.style.display = "none";
    aggiornaMenuLavoro();
    mostraSezione(menuLavoro);
    return;
  }

  intestazione.style.display = "flex";
  mostraSezione(null);
  fumettoPannello.textContent = "";

  let dormiva = (stato === "in_casa");
  if (dormiva) {
    // in casa si accende la luce
    casa.classList.remove("dorme-casa");
    luce(true);
    ominoGrande.className = "con-aspirapolvere dorme";
    setTimeout(function () {
      ominoGrande.className = "con-aspirapolvere sorpreso";
      fumettoPannello.textContent = frase("sveglia");
    }, 700);
  } else {
    ominoGrande.className = "con-aspirapolvere";
    fumettoPannello.textContent = frase("chiamato");
  }

  let lista = await window.mac.leggiFile();
  numeroFile = lista.length;

  setTimeout(function () {
    if (menuDove !== "notch") {
      return;
    }
    ominoGrande.className = "con-aspirapolvere";
    fumettoPannello.textContent = fraseDisordine(lista);
    mostraSezione(menu);
  }, dormiva ? 2400 : 1000);
}

// "Torna a dormire"
function tornaADormire() {
  chiudiMenu();
  if (omino.style.display === "block") {
    parla(frase("buonanotte"));
    togliPose();
    stato = "rientra";
  } else {
    stato = "in_casa";
    setTimeout(function () {
      if (stato === "in_casa" && menuDove === null) {
        luce(false);
        casa.classList.add("dorme-casa");
      }
    }, 800);
    programmaUscita(false);
  }
}

// La prima volta: Franco esce di casa e chiede il nome
function presentati() {
  esciDallaPorta();
  stato = "sveglio";
  omino.classList.add("sorpreso");
  setTimeout(function () {
    omino.classList.remove("sorpreso");
  }, 800);

  apriMenu("casa");
  mostraSezione(sceltaNome);
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
  aggiornaTarghetta();
  await window.mac.salvaNome(nome);
  parlaMenu(frase("nomeSalvato"));
  mostraSezione(menu);
}


// ===== MOVIMENTO =====

// Disegna Franco nella posizione giusta
function disegnaOmino() {
  omino.style.left = (ominoX - 45) + "px"; // il disegno è largo 90px
  omino.style.top = (ominoY - 88) + "px";  // i piedi sono in basso
  omino.querySelector(".disegno").style.transform = "scaleX(" + direzione + ")"; // si gira

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

// Fa un passo verso (x, y). Restituisce quanto manca
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

// Dove sta il bidone (accanto al giardino)
function posizioneBidone() {
  return { x: 394, y: schermo.fondo - 14 };
}


// ===== IL LAVORO =====

function iniziaPulizia() {
  chiudiMenu();
  clearTimeout(timerAttivita);
  giaPresi = [];
  sacco = 0;
  presi = 0;
  smettila = false;
  inPausa = false;
  togliPose();

  // se è in casa esce dalla porta
  if (omino.style.display !== "block") {
    esciDallaPorta();
  }

  omino.classList.add("con-aspirapolvere"); // prende l'aspirapolvere
  aggiornaSacco();
  parla(frase("parto"));
  stato = "carica";
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

// Decide cosa fare dopo
function prossimaMossa() {
  if (smettila) {
    stato = (sacco > 0) ? "al_bidone" : "rientra";
    return;
  }
  if (sacco >= CAPIENZA) {
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

// Franco passa con la bocchetta sopra un file e lo risucchia (senza fermarsi)
async function risucchia(file) {
  giaPresi.push(file.nome);
  sacco++;
  presi++;
  aggiornaSacco();

  omino.classList.add("aspira");
  setTimeout(function () {
    omino.classList.remove("aspira");
  }, 400);

  // ogni tanto commenta
  if (Math.random() < 0.4) {
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

// Svuota l'aspirapolvere nel bidone
function svuota() {
  stato = "svuota";
  omino.classList.remove("cammina");
  bidone.classList.add("aperto");

  // un po' di polvere vola nel bidone
  let b = posizioneBidone();
  for (let i = 0; i < 6; i++) {
    setTimeout(function () {
      let pallina = document.createElement("div");
      pallina.className = "polvere";
      document.body.appendChild(pallina);
      volanti.push({ elemento: pallina, x: ominoX - 25, y: ominoY - 25, scala: 1, giro: 0, versoBidone: true, grande: 10, bidoneX: b.x, bidoneY: b.y - 70 });
    }, i * 150);
  }

  setTimeout(function () {
    bidone.classList.remove("aperto");
    sacco = 0;
    aggiornaSacco();
    parla(frase("svuota"));
    stato = smettila ? "rientra" : "carica";
  }, 1500);
}

// Muove le icone risucchiate e la polvere
function muoviVolanti() {
  let bocchettaX = ominoX + 32 * direzione;
  let bocchettaY = ominoY - 4;

  for (let i = volanti.length - 1; i >= 0; i--) {
    let v = volanti[i];
    let versoX = v.versoBidone ? v.bidoneX : bocchettaX;
    let versoY = v.versoBidone ? v.bidoneY : bocchettaY;

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
    return;
  }

  if (stato === "esce") {
    let posto = postoAttivita(attivita);
    if (cammina(posto.x, posto.y) === 0) {
      iniziaAttivita();
    }
  } else if (stato === "rientra") {
    let p = posizionePorta();
    if (cammina(p.x, p.y) === 0) {
      entraInCasa();
    }
  } else if (stato === "carica") {
    caricaFile();
  } else if (stato === "vai") {
    // cammina in modo che la bocchetta (davanti a lui) arrivi sul file
    let lato = (bersaglio.x > ominoX) ? 1 : -1;
    cammina(bersaglio.x - 32 * lato, bersaglio.y + 30);

    let bocchettaX = ominoX + 32 * direzione;
    let bocchettaY = ominoY - 4;
    if (distanza(bocchettaX, bocchettaY, bersaglio.x, bersaglio.y + 20) < 32) {
      let file = bersaglio;
      daPrendere.splice(daPrendere.indexOf(file), 1);
      risucchia(file);
      prossimaMossa();
    }
  } else if (stato === "al_bidone") {
    let b = posizioneBidone();
    if (cammina(b.x + 70, b.y) === 0) {
      direzione = -1; // si gira verso il bidone
      svuota();
    }
  }

  if (omino.style.display === "block") {
    disegnaOmino();
  }
}


// ===== MOUSE =====
// i clic vanno all'app solo se il mouse è sopra il notch, la casetta,
// il menu o Franco, altrimenti passano al Mac
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


// ===== PULSANTI =====
notch.addEventListener("click", function (evento) {
  // i clic sui pulsanti del menu non devono riaprire il notch
  if (evento.target.closest("button, input")) {
    return;
  }
  if (!notch.classList.contains("aperto")) {
    apriNotch();
  }
});

casa.addEventListener("click", function () {
  if (menuDove === "casa") {
    tornaADormire(); // secondo clic sulla casa: chiude
  } else {
    svegliaDallaCasa();
  }
});

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
    parlaMenu(frase("troppi", { n: numeroFile }));
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
  iniziaPulizia();
  if (haInsistito) {
    parla(frase("convinto"), 3500);
  }
});

btnReport.addEventListener("click", async function () {
  fermaReport();
  let lista = await window.mac.leggiFile();
  numeroFile = lista.length;
  let frasi = fraseReport(lista);

  // una frase ogni 3 secondi e mezzo
  for (let i = 0; i < frasi.length; i++) {
    let timer = setTimeout(function () {
      parlaMenu(frasi[i]);
    }, i * 3500);
    timerReport.push(timer);
  }
});

btnCartella.addEventListener("click", function () {
  window.mac.apriCartella();
});

btnCambiaNome.addEventListener("click", function () {
  fermaReport();
  parlaMenu("Come mi vuoi chiamare?");
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
  schermo = await window.mac.info();

  // il notch è alto come la barra dei menu
  let altezzaBarra = Math.max(schermo.barraMenu, 24);
  notch.style.height = altezzaBarra + "px";
  intestazione.style.marginTop = (altezzaBarra + 10) + "px";

  // casetta e bidone appoggiati sopra il Dock, menu sopra la casetta
  casa.innerHTML = disegnoCasa();
  casa.style.top = (schermo.fondo - 170) + "px";
  bidone.style.top = (schermo.fondo - 94) + "px";
  popupCasa.style.bottom = (window.innerHeight - schermo.fondo + 215) + "px";

  // d'inverno esce il fumo dal camino (novembre - febbraio)
  let mese = new Date().getMonth(); // 0 = gennaio
  if (mese >= 10 || mese <= 1) {
    casa.classList.add("inverno");
  }

  // disegno Franco (sulla Scrivania e nel notch)
  omino.insertAdjacentHTML("beforeend", disegnoOmino());
  ominoGrande.innerHTML = disegnoOmino();

  setInterval(passo, 20); // 20 millisecondi = 50 volte al secondo

  // la prima volta chiede il nome
  let nome = await window.mac.leggiNome();
  if (nome) {
    nomeOmino = nome;
    aggiornaTarghetta();
    casa.classList.add("dorme-casa");
    programmaUscita(true); // la prima uscita arriva presto
  } else {
    presentati();
  }
}

avvio();
