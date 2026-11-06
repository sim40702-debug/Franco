// disegni.js: i disegni (SVG) di Franco e della sua casetta
// "currentColor" = il colore del testo dell'elemento (scuro sulla Scrivania, chiaro nel notch)

// ===== FRANCO =====
// Il disegno guarda a destra. Le parti con una classe si possono mostrare,
// nascondere o muovere dal CSS (per esempio l'aspirapolvere o l'annaffiatoio)
function disegnoOmino() {
  return '' +
    '<svg class="disegno" viewBox="0 0 90 90">' +

    // --- aspirapolvere (si vede solo quando lavora) ---
    '  <g class="aspirapolvere">' +
    '    <path d="M16 62 C 8 38, 38 26, 54 44" stroke="#444" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
    '    <rect x="4" y="60" width="24" height="22" rx="7" fill="#e5483b" stroke="currentColor" stroke-width="2"/>' +
    '    <rect x="9" y="64" width="14" height="13" rx="3" fill="#fff" opacity="0.75"/>' +
    '    <rect class="livello" x="9" y="77" width="14" height="0" rx="2" fill="#8b6b4a"/>' +
    '    <circle class="ruota" cx="10" cy="84" r="3.5" fill="#222" stroke="#888" stroke-width="1" stroke-dasharray="2 2"/>' +
    '    <circle class="ruota" cx="22" cy="84" r="3.5" fill="#222" stroke="#888" stroke-width="1" stroke-dasharray="2 2"/>' +
    '  </g>' +

    // --- gambe ---
    '  <line class="gamba gamba-a" x1="40" y1="58" x2="33" y2="86" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
    '  <line class="gamba gamba-b" x1="40" y1="58" x2="47" y2="86" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +

    '  <g class="busto">' +
    // corpo e braccia
    '    <line x1="40" y1="27" x2="40" y2="58" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
    '    <line class="braccio" x1="40" y1="36" x2="54" y2="44" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>' +
    '    <line class="braccio" x1="40" y1="39" x2="53" y2="49" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>' +
    // braccia in alto (quando si stiracchia)
    '    <g class="braccia-alte">' +
    '      <line x1="40" y1="34" x2="23" y2="16" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>' +
    '      <line x1="40" y1="34" x2="58" y2="15" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>' +
    '    </g>' +
    // testa
    '    <circle cx="40" cy="17" r="10" fill="#fff" stroke="currentColor" stroke-width="3"/>' +
    '    <g class="occhi-aperti">' +
    '      <circle class="occhio" cx="43" cy="16" r="1.7" fill="#222"/>' +
    '      <circle class="occhio" cx="48" cy="16" r="1.7" fill="#222"/>' +
    '    </g>' +
    '    <g class="occhi-chiusi">' +
    '      <line x1="41" y1="17" x2="44.5" y2="17" stroke="#222" stroke-width="1.8" stroke-linecap="round"/>' +
    '      <line x1="46.5" y1="17" x2="50" y2="17" stroke="#222" stroke-width="1.8" stroke-linecap="round"/>' +
    '    </g>' +
    '    <path d="M43 22 Q46 24 49 21" stroke="#222" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    // cappellino
    '    <path d="M30 14 Q31 3 41 4 Q50 5 50 13 Z" fill="#2f6fed" stroke="currentColor" stroke-width="2"/>' +
    '    <line x1="48" y1="13" x2="57" y2="14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
    '  </g>' +

    // --- tubo rigido e bocchetta (fanno parte dell'aspirapolvere) ---
    '  <g class="aspirapolvere tubo">' +
    '    <line x1="54" y1="45" x2="74" y2="83" stroke="#666" stroke-width="3.5" stroke-linecap="round"/>' +
    '    <rect x="66" y="82" width="20" height="6" rx="2" fill="#333"/>' +
    '  </g>' +

    // --- annaffiatoio (quando annaffia i fiori) ---
    '  <g class="annaffiatoio">' +
    '    <rect x="50" y="42" width="16" height="13" rx="3" fill="#3fa34d" stroke="currentColor" stroke-width="1.5"/>' +
    '    <line x1="66" y1="45" x2="76" y2="38" stroke="#3fa34d" stroke-width="3" stroke-linecap="round"/>' +
    '    <circle class="goccia" cx="78" cy="44" r="1.6" fill="#5ab4ff"/>' +
    '    <circle class="goccia g2" cx="80" cy="44" r="1.6" fill="#5ab4ff"/>' +
    '    <circle class="goccia g3" cx="76" cy="44" r="1.6" fill="#5ab4ff"/>' +
    '  </g>' +

    '  <text class="zzz" x="54" y="4">z z</text>' +
    '  <text class="esclamazione" x="58" y="6">!</text>' +
    '</svg>';
}


// ===== CASETTA CON GIARDINO =====
// Il disegno è grande 340 x 170. A sinistra la casa, a destra il giardino.
// Le parti con un id le accende o le muove script.js
function disegnoCasa() {
  // steccato: un paletto ogni 14 pixel
  let steccato = "";
  for (let x = 160; x <= 330; x = x + 14) {
    steccato = steccato + '<rect x="' + x + '" y="122" width="7" height="30" rx="3" fill="#fff8ec" stroke="#b9a68a" stroke-width="1"/>';
  }

  return '' +
    '<svg class="disegno-casa" viewBox="0 0 340 170">' +

    // --- prato ---
    '  <rect x="0" y="148" width="340" height="22" rx="8" fill="#5aa845"/>' +
    '  <rect x="0" y="148" width="340" height="5" rx="2" fill="#6fc15a"/>' +

    // --- steccato del giardino ---
    '  <rect x="155" y="130" width="182" height="5" fill="#fff8ec" stroke="#b9a68a" stroke-width="1"/>' +
    steccato +

    // --- fumo dal camino (d'inverno) ---
    '  <g id="fumo">' +
    '    <circle class="sbuffo" cx="119" cy="10" r="6" fill="#ddd"/>' +
    '    <circle class="sbuffo s2" cx="123" cy="2" r="5" fill="#e8e8e8"/>' +
    '    <circle class="sbuffo s3" cx="117" cy="-6" r="4" fill="#f2f2f2"/>' +
    '  </g>' +

    // --- casa ---
    '  <rect x="112" y="16" width="14" height="28" fill="#8a5a44" stroke="#5b3a2c" stroke-width="2"/>' +
    '  <rect x="15" y="50" width="130" height="102" fill="#f3e2c3" stroke="#6b4f35" stroke-width="2.5"/>' +
    '  <line x1="15" y1="101" x2="145" y2="101" stroke="#d8c39c" stroke-width="2"/>' +
    '  <polygon points="3,56 80,6 157,56" fill="#c0504d" stroke="#6b3030" stroke-width="2.5" stroke-linejoin="round"/>' +

    // finestre del primo piano
    '  <rect class="finestra" x="32" y="62" width="32" height="28" rx="2" stroke="#6b4f35" stroke-width="2"/>' +
    '  <rect class="finestra" x="96" y="62" width="32" height="28" rx="2" stroke="#6b4f35" stroke-width="2"/>' +
    '  <line x1="48" y1="62" x2="48" y2="90" stroke="#6b4f35" stroke-width="1.5"/>' +
    '  <line x1="112" y1="62" x2="112" y2="90" stroke="#6b4f35" stroke-width="1.5"/>' +

    // Franco che guarda dalla finestra (si vede solo ogni tanto)
    '  <g id="facciaFinestra">' +
    '    <circle cx="48" cy="80" r="8" fill="#fff" stroke="#222" stroke-width="2"/>' +
    '    <circle cx="46" cy="79" r="1.3" fill="#222"/>' +
    '    <circle cx="51" cy="79" r="1.3" fill="#222"/>' +
    '    <path d="M41 77 Q42 69 49 70 Q55 71 55 76 Z" fill="#2f6fed" stroke="#222" stroke-width="1.5"/>' +
    '  </g>' +

    // la Z che esce dalla finestra quando dorme
    '  <text id="zzzCasa" x="66" y="60">z z</text>' +

    // finestra del piano terra
    '  <rect class="finestra" x="96" y="112" width="32" height="26" rx="2" stroke="#6b4f35" stroke-width="2"/>' +
    '  <line x1="112" y1="112" x2="112" y2="138" stroke="#6b4f35" stroke-width="1.5"/>' +

    // porta (dietro c'è il buio di casa)
    '  <rect x="34" y="108" width="30" height="44" rx="3" fill="#2a1d12"/>' +
    '  <g id="porta">' +
    '    <rect x="34" y="108" width="30" height="44" rx="3" fill="#8b5a2b" stroke="#5b3a1a" stroke-width="2"/>' +
    '    <circle cx="58" cy="132" r="2" fill="#f2c94c"/>' +
    '  </g>' +

    // targhetta con il nome
    '  <rect x="30" y="94" width="38" height="11" rx="3" fill="#fff8ec" stroke="#6b4f35" stroke-width="1"/>' +
    '  <text id="targhetta" x="49" y="102.5" text-anchor="middle">Franco</text>' +

    // --- fiori ---
    '  <line x1="178" y1="150" x2="178" y2="136" stroke="#3d7a2e" stroke-width="2"/>' +
    '  <line x1="192" y1="150" x2="192" y2="132" stroke="#3d7a2e" stroke-width="2"/>' +
    '  <line x1="206" y1="150" x2="206" y2="138" stroke="#3d7a2e" stroke-width="2"/>' +
    '  <circle cx="178" cy="134" r="5" fill="#ff6b8b"/><circle cx="178" cy="134" r="2" fill="#ffd34d"/>' +
    '  <circle cx="192" cy="130" r="5" fill="#ffa64d"/><circle cx="192" cy="130" r="2" fill="#fff"/>' +
    '  <circle cx="206" cy="136" r="5" fill="#b07cff"/><circle cx="206" cy="136" r="2" fill="#ffd34d"/>' +

    // --- panchina ---
    '  <rect x="262" y="124" width="50" height="5" rx="2" fill="#a0683a"/>' +
    '  <rect x="260" y="134" width="54" height="6" rx="2" fill="#b8763f"/>' +
    '  <rect x="264" y="140" width="4" height="11" fill="#7a4a24"/>' +
    '  <rect x="306" y="140" width="4" height="11" fill="#7a4a24"/>' +
    '</svg>';
}


// ===== MACCHINA =====
// Disegno 100 x 56, guarda a destra. Franco si vede al finestrino quando guida
function disegnoAuto() {
  return '' +
    '<svg class="disegno-auto" viewBox="0 0 100 56">' +
    // carrozzeria
    '  <path d="M6 42 L6 31 Q8 24 19 23 L30 22 L40 10 Q42 8 46 8 L66 8 Q70 8 72 11 L82 22 L90 24 Q97 26 97 33 L97 42 Z" fill="#f2b632" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>' +
    // finestrino
    '  <path d="M44 12 L66 12 L76 22 L36 22 Z" fill="#bfe6ff" stroke="#222" stroke-width="1.5"/>' +
    // Franco che guida
    '  <g class="guidatore">' +
    '    <circle cx="57" cy="17" r="5" fill="#fff" stroke="#222" stroke-width="1.5"/>' +
    '    <circle cx="59" cy="16.5" r="0.9" fill="#222"/>' +
    '    <path d="M52 15 Q52 10 57 10 Q62 10 62 14 Z" fill="#2f6fed" stroke="#222" stroke-width="1"/>' +
    '  </g>' +
    // porta e faro
    '  <line x1="56" y1="22" x2="56" y2="40" stroke="#222" stroke-width="1.5"/>' +
    '  <circle cx="94" cy="31" r="2.5" fill="#fff6b0" stroke="#222" stroke-width="1"/>' +
    // ruote
    '  <g class="ruota-auto"><circle cx="26" cy="44" r="8" fill="#222"/><circle cx="26" cy="44" r="3.5" fill="#bbb" stroke="#555" stroke-width="2" stroke-dasharray="2 2"/></g>' +
    '  <g class="ruota-auto"><circle cx="77" cy="44" r="8" fill="#222"/><circle cx="77" cy="44" r="3.5" fill="#bbb" stroke="#555" stroke-width="2" stroke-dasharray="2 2"/></g>' +
    '</svg>';
}


// ===== CAMION SPAZZATRICE =====
// Disegno 150 x 80, guarda a destra. Davanti c'è la spazzola che raccoglie i file
function disegnoCamion() {
  return '' +
    '<svg class="disegno-camion" viewBox="0 0 150 80">' +
    // cassone
    '  <rect x="4" y="10" width="90" height="52" rx="6" fill="#3fa34d" stroke="#1f5c27" stroke-width="2.5"/>' +
    '  <rect x="12" y="18" width="74" height="26" rx="3" fill="#1f5c27" opacity="0.35"/>' +
    '  <rect class="carico" x="12" y="44" width="74" height="0" rx="2" fill="#8b6b4a"/>' +
    '  <text class="scritta" x="49" y="56" text-anchor="middle" font-size="8" font-weight="bold" fill="#fff">ASPIRATO</text>' +
    // cabina
    '  <path d="M94 24 L118 24 Q124 24 127 30 L134 44 L134 62 L94 62 Z" fill="#f5f5f5" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>' +
    '  <path d="M100 29 L117 29 Q120 29 122 33 L127 43 L100 43 Z" fill="#bfe6ff" stroke="#222" stroke-width="1.5"/>' +
    // lampeggiante arancione sul tetto
    '  <rect x="104" y="18" width="10" height="6" rx="2" fill="#ff9f1c" stroke="#222" stroke-width="1"/>' +
    // Franco che guida
    '  <g class="guidatore">' +
    '    <circle cx="112" cy="37" r="5" fill="#fff" stroke="#222" stroke-width="1.5"/>' +
    '    <circle cx="114" cy="36.5" r="0.9" fill="#222"/>' +
    '    <path d="M107 35 Q107 30 112 30 Q117 30 117 34 Z" fill="#2f6fed" stroke="#222" stroke-width="1"/>' +
    '  </g>' +
    // spazzola davanti
    '  <line x1="130" y1="60" x2="138" y2="66" stroke="#555" stroke-width="3"/>' +
    '  <g class="spazzola-camion">' +
    '    <circle cx="140" cy="68" r="9" fill="#ffcc33" stroke="#8a6d00" stroke-width="1.5"/>' +
    '    <circle cx="140" cy="68" r="9" fill="none" stroke="#8a6d00" stroke-width="3" stroke-dasharray="3 4"/>' +
    '  </g>' +
    // ruote
    '  <g class="ruota-auto"><circle cx="28" cy="66" r="10" fill="#222"/><circle cx="28" cy="66" r="4" fill="#bbb" stroke="#555" stroke-width="2" stroke-dasharray="2 2"/></g>' +
    '  <g class="ruota-auto"><circle cx="112" cy="66" r="10" fill="#222"/><circle cx="112" cy="66" r="4" fill="#bbb" stroke="#555" stroke-width="2" stroke-dasharray="2 2"/></g>' +
    '</svg>';
}
