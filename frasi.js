// frasi.js: tutte le frasi che dice l'omino
// Puoi cambiarle o aggiungerne quante vuoi!
// Nelle frasi puoi usare:
//   {io}     il nome dell'omino (es. Franco)
//   {n}      un numero (quanti file, quanti screenshot...)
//   {file}   il nome di un file
//   {giorni} da quanti giorni il file è lì
//   {mb}     quanto pesa il file in MB

const FRASI = {
  // la prima volta che apri l'app
  presentazione: [
    "Ciao! Sono il tuo nuovo spazzino. Come mi vuoi chiamare?"
  ],
  nomeSalvato: [
    "{io}! Mi piace. Piacere di conoscerti!",
    "{io}... suona bene. Allora iniziamo?"
  ],

  // quando lo svegli
  sveglia: [
    "Eh?! Chi è? Ah... sei tu.",
    "Aaah! Che spavento!",
    "Mmh... stavo sognando una Scrivania pulita...",
    "Cosa c'è? Stavo dormendo così bene!",
    "Sono sveglio! Sono sveglio!"
  ],

  // quanto è disordinata la Scrivania
  pulita: [
    "La Scrivania è già pulita. Posso tornare a dormire?",
    "Qui è tutto in ordine. Bravo!"
  ],
  poco: [
    "Dai, non è così male. Solo {n} file.",
    "{n} file. Si può fare di peggio."
  ],
  medio: [
    "Mmh, {n} file... un po' di disordine c'è.",
    "{n} file sulla Scrivania. Ci vorrebbe una passata."
  ],
  tanto: [
    "Aaah, ma che disordine qui sulla Scrivania! {n} file!",
    "{n} file?! Ma come fai a lavorare così?",
    "Mamma mia... {n} file. Qui serve un professionista."
  ],
  screenshot: [
    "Ma quanti screenshot hai? Ne conto {n}!",
    "{n} screenshot... ma li guardi mai?"
  ],
  vecchio: [
    "\"{file}\" è qui da {giorni} giorni... lo vuoi ancora?",
    "C'è un file di {giorni} giorni fa. Ha fatto le ragnatele!"
  ],
  pesante: [
    "\"{file}\" pesa {mb} MB, mi si piega la schiena solo a guardarlo!",
    "{mb} MB in un file solo?! Ma cosa c'è dentro?"
  ],

  // se lo chiami mentre è già fuori in giardino
  chiamato: ["Sì? Dimmi.", "Eccomi!", "Cosa c'è?"],

  // troppi file (più di 40): prima si rifiuta...
  troppi: [
    "No dai... {n} file?! Mi prendi in giro?",
    "{n} file?! Io non ci vengo, eh.",
    "Ma scherzi? {n} file? Chiama un'impresa di pulizie!"
  ],
  // ...poi se insisti accetta
  convinto: [
    "Va bene... ma solo perché sei tu.",
    "Uff. Ok, ok. Ma poi mi offri un caffè.",
    "E va bene! Ma è l'ultima volta."
  ],

  // quando esce da solo in giardino
  panchina: ["Ah, che pace...", "Un po' di sole non fa male.", "Si sta bene qui."],
  fiori: ["Su, bevete, piccoli.", "Questi fiori sono la mia passione.", "Che belli che sono!"],
  sbadiglio: ["Aaaah... che sonno.", "Mi stiracchio un attimo...", "Uaaah..."],

  // mentre lavora
  parto: [
    "Va bene, va bene, pulisco io...",
    "Ok, si parte!",
    "Ci penso io. Come sempre."
  ],
  immagine: ["Un'altra foto...", "Ancora screenshot?", "Bella foto. Via!"],
  documento: ["Carta, carta, carta...", "Chissà se l'hai mai letto.", "Compiti?"],
  pesanteAspira: ["Uff, che peso!", "Questo pesa una tonnellata!", "La mia schiena..."],
  vecchioAspira: ["Questo è preistorico!", "Polvere di anni fa..."],
  generico: ["Via!", "Preso!", "Slurp!", "Uno in meno.", "Anche questo!"],
  saccoPieno: ["Sacco pieno! Vado a svuotarlo.", "Non ci sta più niente, vado al bidone."],
  svuota: ["Ecco fatto.", "Plof!", "Che liberazione."],
  finito: ["Scrivania pulita! Era ora.", "Fatto! Adesso torno a dormire.", "Lavoro finito. Buonanotte!"],
  disturbo: ["Ehi, non disturbare!", "Sto lavorando!", "Mi fai il solletico!", "Giù le mani!"],
  pausa: ["Pausa caffè!", "Mi riposo un attimo..."],
  riparto: ["Ok, riprendo.", "Si torna al lavoro."],
  basta: ["Va bene, torno a casa...", "Finalmente!"],
  buonanotte: ["Buonanotte...", "Zzz... chiamami se serve."]
};


// Sceglie una frase a caso di un tipo e ci mette dentro i valori
// esempio: frase("tanto", { n: 30 })
function frase(tipo, valori) {
  let lista = FRASI[tipo];
  let testo = lista[Math.floor(Math.random() * lista.length)];

  testo = testo.replaceAll("{io}", nomeOmino);
  if (valori) {
    for (let chiave in valori) {
      testo = testo.replaceAll("{" + chiave + "}", valori[chiave]);
    }
  }
  return testo;
}
