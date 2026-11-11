// ==================== ESTADO GLOBAL DEL DASHBOARD v2.0 ====================
const state = {
  token: localStorage.getItem('ucl_superadmin_token') || '',
  clubs: [],
  players: [],
  topScorers: [],
  seasons: [],
  squads: [],
  matches: [],
  draftMatchEvents: [],
  selectOptionsCache: {}
};

// Imágenes por defecto (SVG embebido) cuando un club o jugador no tiene foto
const DEFAULT_CREST_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%230d1b36'/><text y='43' x='14' font-size='34'>🛡️</text></svg>";
const DEFAULT_PLAYER_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%230d1b36'/><text y='43' x='15' font-size='32'>🏃</text></svg>";

// ==================== FEDERACIONES MIEMBRO DE LA UEFA POR REGIÓN ====================
const UEFA_REGIONS = [
  {
    region: 'Europa Occidental y Central',
    countries: [
      { code: 'GER', name: 'Alemania' },
      { code: 'AUT', name: 'Austria' },
      { code: 'BEL', name: 'Bélgica' },
      { code: 'FRA', name: 'Francia' },
      { code: 'NED', name: 'Países Bajos' },
      { code: 'IRL', name: 'Irlanda' },
      { code: 'LIE', name: 'Liechtenstein (solo compite en Conference League al no tener liga propia)' },
      { code: 'LUX', name: 'Luxemburgo' },
      { code: 'SUI', name: 'Suiza' }
    ]
  },
  {
    region: 'Islas Británicas y Europa del Norte',
    countries: [
      { code: 'ENG', name: 'Inglaterra' },
      { code: 'SCO', name: 'Escocia' },
      { code: 'WAL', name: 'Gales' },
      { code: 'NIR', name: 'Irlanda del Norte' },
      { code: 'DEN', name: 'Dinamarca' },
      { code: 'FIN', name: 'Finlandia' },
      { code: 'ISL', name: 'Islandia' },
      { code: 'NOR', name: 'Noruega' },
      { code: 'SWE', name: 'Suecia' },
      { code: 'FRO', name: 'Islas Feroe' }
    ]
  },
  {
    region: 'Europa del Sur y Países Mediterráneos',
    countries: [
      { code: 'ESP', name: 'España' },
      { code: 'ITA', name: 'Italia' },
      { code: 'POR', name: 'Portugal' },
      { code: 'GRE', name: 'Grecia' },
      { code: 'CYP', name: 'Chipre' },
      { code: 'MLT', name: 'Malta' },
      { code: 'TUR', name: 'Turquía' },
      { code: 'GIB', name: 'Gibraltar' },
      { code: 'AND', name: 'Andorra' },
      { code: 'SMR', name: 'San Marino' }
    ]
  },
  {
    region: 'Europa del Este y Balcanes',
    countries: [
      { code: 'ALB', name: 'Albania' },
      { code: 'BIH', name: 'Bosnia y Herzegovina' },
      { code: 'CRO', name: 'Croacia' },
      { code: 'SVN', name: 'Eslovenia' },
      { code: 'MKD', name: 'Macedonia del Norte' },
      { code: 'MNE', name: 'Montenegro' },
      { code: 'SRB', name: 'Serbia' },
      { code: 'KOS', name: 'Kosovo' },
      { code: 'BUL', name: 'Bulgaria' },
      { code: 'CZE', name: 'República Checa' },
      { code: 'SVK', name: 'Eslovaquia' },
      { code: 'HUN', name: 'Hungría' },
      { code: 'POL', name: 'Polonia' },
      { code: 'ROU', name: 'Rumania' }
    ]
  },
  {
    region: 'Región Báltica y Ex repúblicas Soviéticas / Euroasiáticas',
    countries: [
      { code: 'EST', name: 'Estonia' },
      { code: 'LVA', name: 'Letonia' },
      { code: 'LTU', name: 'Lituania' },
      { code: 'BLR', name: 'Bielorrusia' },
      { code: 'MDA', name: 'Moldavia' },
      { code: 'UKR', name: 'Ucrania' },
      { code: 'RUS', name: 'Rusia (suspendida temporalmente de competiciones UEFA)' },
      { code: 'GEO', name: 'Georgia' },
      { code: 'ARM', name: 'Armenia' },
      { code: 'AZE', name: 'Azerbaiyán' },
      { code: 'KAZ', name: 'Kazajistán' },
      { code: 'ISR', name: 'Israel' }
    ]
  }
];

// ==================== 6 CONFEDERACIONES MUNDIALES PARA NACIONALIDAD DE JUGADORES ====================
const WORLD_CONFEDERATIONS = [
  {
    region: 'UEFA (Unión de Asociaciones Europeas de Fútbol) — 55 miembros',
    countries: [
      { code: 'ALB', name: 'Albania' },
      { code: 'GER', name: 'Alemania' },
      { code: 'AND', name: 'Andorra' },
      { code: 'ARM', name: 'Armenia' },
      { code: 'AUT', name: 'Austria' },
      { code: 'AZE', name: 'Azerbaiyán' },
      { code: 'BEL', name: 'Bélgica' },
      { code: 'BLR', name: 'Bielorrusia' },
      { code: 'BIH', name: 'Bosnia y Herzegovina' },
      { code: 'BUL', name: 'Bulgaria' },
      { code: 'CYP', name: 'Chipre' },
      { code: 'CRO', name: 'Croacia' },
      { code: 'DEN', name: 'Dinamarca' },
      { code: 'SCO', name: 'Escocia' },
      { code: 'SVK', name: 'Eslovaquia' },
      { code: 'SVN', name: 'Eslovenia' },
      { code: 'ESP', name: 'España' },
      { code: 'EST', name: 'Estonia' },
      { code: 'FIN', name: 'Finlandia' },
      { code: 'FRA', name: 'Francia' },
      { code: 'WAL', name: 'Gales' },
      { code: 'GEO', name: 'Georgia' },
      { code: 'GIB', name: 'Gibraltar' },
      { code: 'GRE', name: 'Grecia' },
      { code: 'HUN', name: 'Hungría' },
      { code: 'ENG', name: 'Inglaterra' },
      { code: 'IRL', name: 'Irlanda (República de Irlanda)' },
      { code: 'NIR', name: 'Irlanda del Norte' },
      { code: 'ISL', name: 'Islandia' },
      { code: 'FRO', name: 'Islas Feroe' },
      { code: 'ISR', name: 'Israel' },
      { code: 'ITA', name: 'Italia' },
      { code: 'KAZ', name: 'Kazajistán' },
      { code: 'KOS', name: 'Kosovo' },
      { code: 'LVA', name: 'Letonia' },
      { code: 'LIE', name: 'Liechtenstein' },
      { code: 'LTU', name: 'Lituania' },
      { code: 'LUX', name: 'Luxemburgo' },
      { code: 'MKD', name: 'Macedonia del Norte' },
      { code: 'MLT', name: 'Malta' },
      { code: 'MDA', name: 'Moldavia' },
      { code: 'MNE', name: 'Montenegro' },
      { code: 'NOR', name: 'Noruega' },
      { code: 'NED', name: 'Países Bajos' },
      { code: 'POL', name: 'Polonia' },
      { code: 'POR', name: 'Portugal' },
      { code: 'CZE', name: 'República Checa' },
      { code: 'ROU', name: 'Rumania' },
      { code: 'RUS', name: 'Rusia (federación afiliada; actualmente suspendida de competiciones oficiales)' },
      { code: 'SMR', name: 'San Marino' },
      { code: 'SRB', name: 'Serbia' },
      { code: 'SWE', name: 'Suecia' },
      { code: 'SUI', name: 'Suiza' },
      { code: 'TUR', name: 'Turquía' },
      { code: 'UKR', name: 'Ucrania' }
    ]
  },
  {
    region: 'CONMEBOL (Confederación Sudamericana de Fútbol) — 10 miembros',
    countries: [
      { code: 'ARG', name: 'Argentina' },
      { code: 'BOL', name: 'Bolivia' },
      { code: 'BRA', name: 'Brasil' },
      { code: 'CHI', name: 'Chile' },
      { code: 'COL', name: 'Colombia' },
      { code: 'ECU', name: 'Ecuador' },
      { code: 'PAR', name: 'Paraguay' },
      { code: 'PER', name: 'Perú' },
      { code: 'URU', name: 'Uruguay' },
      { code: 'VEN', name: 'Venezuela' }
    ]
  },
  {
    region: 'CAF (Confederación Africana de Fútbol) — 54 miembros FIFA + 2 asociados',
    countries: [
      { code: 'ANG', name: 'Angola' },
      { code: 'ALG', name: 'Argelia' },
      { code: 'BEN', name: 'Benín' },
      { code: 'BOT', name: 'Botsuana' },
      { code: 'BFA', name: 'Burkina Faso' },
      { code: 'BDI', name: 'Burundi' },
      { code: 'CPV', name: 'Cabo Verde' },
      { code: 'CMR', name: 'Camerún' },
      { code: 'CHA', name: 'Chad' },
      { code: 'COM', name: 'Comoras' },
      { code: 'CGO', name: 'Congo' },
      { code: 'CIV', name: 'Costa de Marfil' },
      { code: 'EGY', name: 'Egipto' },
      { code: 'ERI', name: 'Eritrea' },
      { code: 'SWZ', name: 'Esuatini (Suazilandia)' },
      { code: 'ETH', name: 'Etiopía' },
      { code: 'GAB', name: 'Gabón' },
      { code: 'GAM', name: 'Gambia' },
      { code: 'GHA', name: 'Ghana' },
      { code: 'GUI', name: 'Guinea' },
      { code: 'GNB', name: 'Guinea-Bisáu' },
      { code: 'EQG', name: 'Guinea Ecuatorial' },
      { code: 'KEN', name: 'Kenia' },
      { code: 'LES', name: 'Lesoto' },
      { code: 'LBR', name: 'Liberia' },
      { code: 'LBY', name: 'Libia' },
      { code: 'MAD', name: 'Madagascar' },
      { code: 'MWI', name: 'Malaui' },
      { code: 'MLI', name: 'Mali' },
      { code: 'MAR', name: 'Marruecos' },
      { code: 'MRI', name: 'Mauricio' },
      { code: 'MTN', name: 'Mauritania' },
      { code: 'MOZ', name: 'Mozambique' },
      { code: 'NAM', name: 'Namibia' },
      { code: 'NIG', name: 'Níger' },
      { code: 'NGA', name: 'Nigeria' },
      { code: 'CTA', name: 'República Centroafricana' },
      { code: 'COD', name: 'República Democrática del Congo' },
      { code: 'RWA', name: 'Ruanda' },
      { code: 'STP', name: 'Santo Tomé y Príncipe' },
      { code: 'SEN', name: 'Senegal' },
      { code: 'SEY', name: 'Seychelles' },
      { code: 'SLE', name: 'Sierra Leona' },
      { code: 'SOM', name: 'Somalia' },
      { code: 'RSA', name: 'Sudáfrica' },
      { code: 'SDN', name: 'Sudán' },
      { code: 'SSD', name: 'Sudán del Sur' },
      { code: 'TAN', name: 'Tanzania' },
      { code: 'TOG', name: 'Togo' },
      { code: 'TUN', name: 'Túnez' },
      { code: 'UGA', name: 'Uganda' },
      { code: 'DJI', name: 'Yibuti' },
      { code: 'ZAM', name: 'Zambia' },
      { code: 'ZIM', name: 'Zimbabue' },
      { code: 'REU', name: 'Reunión (miembro asociado CAF, no afiliado a la FIFA)' },
      { code: 'ZAN', name: 'Zanzíbar (miembro asociado CAF, no afiliado a la FIFA)' }
    ]
  },
  {
    region: 'AFC (Confederación Asiática de Fútbol) — 47 miembros (46 FIFA + 1 miembro de confederación)',
    countries: [
      { code: 'AFG', name: 'Afganistán' },
      { code: 'KSA', name: 'Arabia Saudita' },
      { code: 'AUS', name: 'Australia' },
      { code: 'BHR', name: 'Baréin' },
      { code: 'BAN', name: 'Bangladés' },
      { code: 'BRU', name: 'Brunéi' },
      { code: 'BHU', name: 'Bután' },
      { code: 'CAM', name: 'Camboya' },
      { code: 'QAT', name: 'Catar' },
      { code: 'CHN', name: 'China' },
      { code: 'TPE', name: 'China Taipéi (Taiwán)' },
      { code: 'PRK', name: 'Corea del Norte' },
      { code: 'KOR', name: 'Corea del Sur' },
      { code: 'UAE', name: 'Emiratos Árabes Unidos' },
      { code: 'PHI', name: 'Filipinas' },
      { code: 'GUM', name: 'Guam' },
      { code: 'HKG', name: 'Hong Kong' },
      { code: 'IND', name: 'India' },
      { code: 'IDN', name: 'Indonesia' },
      { code: 'IRQ', name: 'Irak' },
      { code: 'IRN', name: 'Irán' },
      { code: 'NMI', name: 'Islas Marianas del Norte (miembro pleno de AFC, no afiliado a la FIFA)' },
      { code: 'JPN', name: 'Japón' },
      { code: 'JOR', name: 'Jordania' },
      { code: 'KGZ', name: 'Kirguistán' },
      { code: 'KUW', name: 'Kuwait' },
      { code: 'LAO', name: 'Laos' },
      { code: 'LBN', name: 'Líbano' },
      { code: 'MAC', name: 'Macao' },
      { code: 'MAS', name: 'Malasia' },
      { code: 'MDV', name: 'Maldivas' },
      { code: 'MNG', name: 'Mongolia' },
      { code: 'MYA', name: 'Myanmar (Birmania)' },
      { code: 'NEP', name: 'Nepal' },
      { code: 'OMA', name: 'Omán' },
      { code: 'PAK', name: 'Pakistán' },
      { code: 'PLE', name: 'Palestina' },
      { code: 'SIN', name: 'Singapur' },
      { code: 'SYR', name: 'Siria' },
      { code: 'SRI', name: 'Sri Lanka' },
      { code: 'THA', name: 'Tailandia' },
      { code: 'TJK', name: 'Tayikistán' },
      { code: 'TLS', name: 'Timor Oriental' },
      { code: 'TKM', name: 'Turkmenistán' },
      { code: 'UZB', name: 'Uzbekistán' },
      { code: 'VIE', name: 'Vietnam' },
      { code: 'YEM', name: 'Yemen' }
    ]
  },
  {
    region: 'CONCACAF (Norteamérica, Centroamérica y el Caribe) — 41 miembros (35 FIFA + 6 regionales)',
    countries: [
      { code: 'AIA', name: 'Anguila' },
      { code: 'ATG', name: 'Antigua y Barbuda' },
      { code: 'ARU', name: 'Aruba' },
      { code: 'BAH', name: 'Bahamas' },
      { code: 'BRB', name: 'Barbados' },
      { code: 'BLZ', name: 'Belice' },
      { code: 'BER', name: 'Bermudas' },
      { code: 'BOE', name: 'Bonaire (miembro CONCACAF, no afiliado a la FIFA)' },
      { code: 'CAN', name: 'Canadá' },
      { code: 'CRC', name: 'Costa Rica' },
      { code: 'CUB', name: 'Cuba' },
      { code: 'CUW', name: 'Curazao' },
      { code: 'DMA', name: 'Dominica' },
      { code: 'SLV', name: 'El Salvador' },
      { code: 'USA', name: 'Estados Unidos' },
      { code: 'GRN', name: 'Granada' },
      { code: 'GLP', name: 'Guadalupe (miembro CONCACAF, no afiliado a la FIFA)' },
      { code: 'GUA', name: 'Guatemala' },
      { code: 'GUF', name: 'Guayana Francesa (miembro CONCACAF, no afiliado a la FIFA)' },
      { code: 'GUY', name: 'Guyana' },
      { code: 'HAI', name: 'Haití' },
      { code: 'HON', name: 'Honduras' },
      { code: 'CAY', name: 'Islas Caimán' },
      { code: 'TCA', name: 'Islas Turcas y Caicos' },
      { code: 'VGB', name: 'Islas Vírgenes Británicas' },
      { code: 'VIR', name: 'Islas Vírgenes de los Estados Unidos' },
      { code: 'JAM', name: 'Jamaica' },
      { code: 'MTQ', name: 'Martinica (miembro CONCACAF, no afiliado a la FIFA)' },
      { code: 'MEX', name: 'México' },
      { code: 'MSR', name: 'Montserrat' },
      { code: 'NCA', name: 'Nicaragua' },
      { code: 'PAN', name: 'Panamá' },
      { code: 'PUR', name: 'Puerto Rico' },
      { code: 'DOM', name: 'República Dominicana' },
      { code: 'SKN', name: 'San Cristóbal y Nieves' },
      { code: 'SMN', name: 'San Martín (Francia) (miembro CONCACAF, no afiliado a la FIFA)' },
      { code: 'VIN', name: 'San Vicente y las Granadinas' },
      { code: 'LCA', name: 'Santa Lucía' },
      { code: 'SMA', name: 'Sint Maarten (Países Bajos) (miembro CONCACAF, no afiliado a la FIFA)' },
      { code: 'SUR', name: 'Surinam' },
      { code: 'TRI', name: 'Trinidad y Tobago' }
    ]
  },
  {
    region: 'OFC (Confederación de Fútbol de Oceanía) — 14 miembros (11 FIFA + 3 asociados/regionales)',
    countries: [
      { code: 'FIJ', name: 'Fiyi' },
      { code: 'COK', name: 'Islas Cook' },
      { code: 'SOL', name: 'Islas Salomón' },
      { code: 'NCL', name: 'Nueva Caledonia' },
      { code: 'NZL', name: 'Nueva Zelanda' },
      { code: 'PNG', name: 'Papúa Nueva Guinea' },
      { code: 'SAM', name: 'Samoa' },
      { code: 'ASA', name: 'Samoa Americana' },
      { code: 'TAH', name: 'Tahití (Polinesia Francesa)' },
      { code: 'TGA', name: 'Tonga' },
      { code: 'VAN', name: 'Vanuatu' },
      { code: 'KIR', name: 'Kiribati (miembro asociado, no afiliado a la FIFA)' },
      { code: 'TUV', name: 'Tuvalu (miembro asociado, no afiliado a la FIFA)' },
      { code: 'NIU', name: 'Niue (antiguo miembro asociado / participante regional)' }
    ]
  }
];

const UEFA_COUNTRY_MAP = {};
UEFA_REGIONS.forEach((group) => {
  group.countries.forEach((c) => {
    UEFA_COUNTRY_MAP[c.code] = c.name.split(' (')[0];
  });
});
WORLD_CONFEDERATIONS.forEach((group) => {
  group.countries.forEach((c) => {
    UEFA_COUNTRY_MAP[c.code] = c.name.split(' (')[0];
  });
});

// Etiquetas legibles para los 12 tipos de eventos
const EVENT_LABELS = {
  GOAL: '⚽ Gol',
  PENALTY_GOAL: '🎯 Gol de Penal',
  OWN_GOAL: '🥅 Autogol',
  PENALTY_MISSED: '🧤 Penal Fallado',
  ASSIST: '👟 Asistencia',
  YELLOW_CARD: '🟨 Amarilla',
  SECOND_YELLOW_RED: '🟨🟥 Doble Amarilla / Roja',
  RED_CARD: '🟥 Roja Directa',
  SUBSTITUTION_IN: '🟢⬆️ Entra de cambio',
  SUBSTITUTION_OUT: '🔴⬇️ Sale de cambio',
  VAR_CANCELLED_GOAL: '📺❌ Gol Anulado VAR',
  INJURY: '🚑 Lesión'
};

const MATCH_STATUS_LABELS = {
  FINISHED: { text: '✅ Finalizado', cls: 'tag-active' },
  SUSPENDED: { text: '⏸️ Suspendido', cls: 'tag-danger' },
  POSTPONED: { text: '📅 Aplazado', cls: 'tag-classic' },
  RESUMED_AND_FINISHED: { text: '🔄 Reanudado y Finalizado', cls: 'tag-swiss' },
  CANCELLED: { text: '🚫 Cancelado', cls: 'tag-danger' }
};

function renderUefaCountrySelect(selectId, filterQuery = '') {
  const select = document.getElementById(selectId);
  if (!select) return;

  const previousValue = select.value;
  const q = filterQuery.trim().toLowerCase();
  const isClubSelect = selectId === 'club-country' || selectId === 'edit-club-country';
  const sourceGroups = isClubSelect ? UEFA_REGIONS : WORLD_CONFEDERATIONS;

  let html = '';
  sourceGroups.forEach((group) => {
    const regionMatches = group.region.toLowerCase().includes(q);
    const matchingCountries = group.countries.filter(
      (c) =>
        !q ||
        regionMatches ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );

    if (matchingCountries.length > 0) {
      const optLabel = isClubSelect ? `🌍 ${escapeHtml(group.region)}` : escapeHtml(group.region);
      html += `<optgroup label="${optLabel}">`;
      matchingCountries.forEach((c) => {
        html += `<option value="${c.code}">${escapeHtml(c.name)} (${c.code})</option>`;
      });
      html += `</optgroup>`;
    }
  });

  select.innerHTML =
    html ||
    `<option value="">${
      isClubSelect
        ? 'Sin coincidencias en las 55 federaciones UEFA'
        : 'Sin coincidencias en las 6 Confederaciones Mundiales'
    }</option>`;

  if (previousValue && Array.from(select.options).some((o) => o.value === previousValue)) {
    select.value = previousValue;
  } else if (!filterQuery && select.querySelector('option[value="ESP"]')) {
    select.value = 'ESP';
  }
}

// ==================== UTILIDADES DE NOTIFICACIÓN (TOAST) ====================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'} ${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// ==================== PETICIONES HTTP Y SUBIDA DE IMÁGENES ====================
async function apiFetch(url, options = {}) {
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Error HTTP ${response.status}`);
  }

  return data;
}

async function uploadImageFile(file, folder = 'players') {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const res = await apiFetch(`/api/v1/upload?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    body: formData
  });

  showToast(`Imagen subida correctamente (${res.url})`, 'success');
  return res.url;
}

function setupImageUploaders() {
  const pairs = [
    {
      fileId: 'club-crest-file',
      urlId: 'club-crest-url',
      previewId: 'club-crest-preview',
      folder: 'clubs',
      fallback: DEFAULT_CREST_SVG
    },
    {
      fileId: 'edit-club-crest-file',
      urlId: 'edit-club-crest-url',
      previewId: 'edit-club-crest-preview',
      folder: 'clubs',
      fallback: DEFAULT_CREST_SVG
    },
    {
      fileId: 'player-photo-file',
      urlId: 'player-photo-url',
      previewId: 'player-photo-preview',
      folder: 'players',
      fallback: DEFAULT_PLAYER_SVG
    },
    {
      fileId: 'edit-player-photo-file',
      urlId: 'edit-player-photo-url',
      previewId: 'edit-player-photo-preview',
      folder: 'players',
      fallback: DEFAULT_PLAYER_SVG
    },
    {
      fileId: 'modal-player-photo-file',
      urlId: 'modal-player-photo-url',
      previewId: null,
      folder: 'players',
      fallback: DEFAULT_PLAYER_SVG
    }
  ];

  pairs.forEach(({ fileId, urlId, previewId, folder, fallback }) => {
    const fileInput = document.getElementById(fileId);
    const urlInput = document.getElementById(urlId);
    const previewImg = previewId ? document.getElementById(previewId) : null;

    if (fileInput && urlInput) {
      fileInput.addEventListener('change', async () => {
        if (!fileInput.files || !fileInput.files[0]) return;
        try {
          const uploadedUrl = await uploadImageFile(fileInput.files[0], folder);
          urlInput.value = uploadedUrl;
          if (previewImg) previewImg.src = uploadedUrl;
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }

    if (urlInput && previewImg) {
      urlInput.addEventListener('input', () => {
        const val = urlInput.value.trim();
        previewImg.src = val || fallback;
      });
      previewImg.addEventListener('error', () => {
        previewImg.src = fallback;
      });
    }
  });
}

// ==================== GESTIÓN DE AUTENTICACIÓN SUPERADMIN Y COLABORADORES ====================
let tempAuthCreds = { email: '', password: '' };

function cleanTokenString(raw) {
  if (!raw) return '';
  let t = String(raw).trim();
  t = t.replace(/^Bearer\s+/i, '').trim();
  t = t.replace(/^Bearer\s+/i, '').trim();
  t = t.replace(/^["']+|["']+$/g, '').trim();
  return t;
}

async function verifyAndUnlock(tokenToTest, showSuccessMsg = true) {
  const cleaned = cleanTokenString(tokenToTest);
  if (!cleaned) {
    showToast('Por favor ingresa un Token JWT válido', 'error');
    return false;
  }

  try {
    state.token = cleaned;
    const res = await apiFetch('/api/v1/auth/verify');
    state.currentUser = res.user || { username: 'usuario', role: 'EDITOR' };
    localStorage.setItem('ucl_superadmin_token', cleaned);

    // Ocultar pantalla de bloqueo
    document.getElementById('auth-overlay')?.classList.add('hidden');

    // Actualizar insignia de rol en la barra superior
    const badge = document.getElementById('active-user-badge');
    const btnResetDb = document.getElementById('btn-reset-db');

    if (badge && res.user) {
      if (res.user.role === 'SUPERADMIN') {
        badge.className = 'role-pill superadmin';
        badge.innerHTML = `👑 SuperAdmin (${escapeHtml(res.user.username)})`;
        if (btnResetDb) {
          btnResetDb.disabled = false;
          btnResetDb.title = 'Vaciar toda la base de datos (Acceso SuperAdmin)';
          btnResetDb.style.opacity = '1';
        }
      } else {
        badge.className = 'role-pill editor';
        badge.innerHTML = `👤 Colaborador / Editor (${escapeHtml(res.user.username)})`;
        if (btnResetDb) {
          btnResetDb.disabled = true;
          btnResetDb.title = 'Acción bloqueada: Solo el SuperAdmin titular puede vaciar la base de datos';
          btnResetDb.style.opacity = '0.4';
        }
      }
    }

    if (showSuccessMsg) {
      const roleName = res.user?.role === 'SUPERADMIN' ? 'SuperAdmin (Acceso Total)' : 'Colaborador / Editor (Acceso Guiado)';
      showToast(`Sesión verificada: ${roleName}`, 'success');
    }

    await loadAllData();
    return true;
  } catch (err) {
    state.token = '';
    state.currentUser = null;
    localStorage.removeItem('ucl_superadmin_token');
    document.getElementById('auth-overlay')?.classList.remove('hidden');
    if (showSuccessMsg) {
      showToast(err.message || 'Token JWT inválido o expirado', 'error');
    }
    return false;
  }
}

function resetAuthForms() {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  const otpInput = document.getElementById('login-otp');
  const tokenInput = document.getElementById('jwt-token-input');

  if (emailInput) emailInput.value = '';
  if (passInput) {
    passInput.value = '';
    passInput.type = 'password';
  }
  if (otpInput) otpInput.value = '';
  if (tokenInput) tokenInput.value = '';

  const eyeBtn = document.getElementById('btn-toggle-password');
  if (eyeBtn) eyeBtn.textContent = '👁️';

  document.getElementById('auth-step-1')?.classList.remove('hidden');
  document.getElementById('auth-step-2')?.classList.add('hidden');
  document.getElementById('collab-token-container')?.classList.add('hidden');
  tempAuthCreds = { email: '', password: '' };
}

function setupAuthHandlers() {
  // 1. Alternar visualización de contraseña (Ojito 👁️ / 🙈)
  const eyeBtn = document.getElementById('btn-toggle-password');
  const passInput = document.getElementById('login-password');
  eyeBtn?.addEventListener('click', () => {
    if (!passInput) return;
    if (passInput.type === 'password') {
      passInput.type = 'text';
      eyeBtn.textContent = '🙈';
      eyeBtn.title = 'Ocultar contraseña';
    } else {
      passInput.type = 'password';
      eyeBtn.textContent = '👁️';
      eyeBtn.title = 'Mostrar contraseña';
    }
  });

  // 2. Paso 1: Enviar correo y contraseña para solicitar código 2FA
  document.getElementById('form-step1-creds')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const btnSubmit = document.getElementById('btn-submit-step1');

    if (!email || !password) {
      showToast('Por favor completa tu correo y tu contraseña maestra', 'error');
      return;
    }

    try {
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = '⏳ Verificando credenciales...';
      }

      const res = await apiFetch('/api/v1/auth/request-code', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      tempAuthCreds = { email, password };

      // Cambiamos a la vista del Paso 2
      document.getElementById('auth-step-1')?.classList.add('hidden');
      const step2 = document.getElementById('auth-step-2');
      if (step2) step2.classList.remove('hidden');

      const emailDisplay = document.getElementById('step2-email-display');
      if (emailDisplay) emailDisplay.textContent = email;

      const otpInput = document.getElementById('login-otp');
      if (otpInput) {
        otpInput.value = '';
        otpInput.focus();
      }

      showToast(res.message || 'Código de verificación generado', 'success');
      if (res.notice) {
        setTimeout(() => showToast(res.notice, 'info'), 700);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = '📨 Enviar Código de Seguridad a mi Correo';
      }
    }
  });

  // 3. Paso 2: Validar Código OTP de 6 dígitos
  document.getElementById('form-step2-otp')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('login-otp')?.value.trim();
    const email = tempAuthCreds.email || document.getElementById('login-email')?.value.trim();
    const btnSubmit = document.getElementById('btn-submit-step2');

    if (!code || code.length !== 6) {
      showToast('Ingresa el código de 6 dígitos completo', 'error');
      return;
    }

    try {
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = '⏳ Validando código 2FA...';
      }

      const res = await apiFetch('/api/v1/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ email, code })
      });

      await verifyAndUnlock(res.token, true);
      resetAuthForms();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = '🚀 Validar Código y Entrar como SuperAdmin';
      }
    }
  });

  // 4. Paso 2: Volver al Paso 1
  document.getElementById('btn-back-to-step1')?.addEventListener('click', () => {
    document.getElementById('auth-step-2')?.classList.add('hidden');
    document.getElementById('auth-step-1')?.classList.remove('hidden');
    const otpInput = document.getElementById('login-otp');
    if (otpInput) otpInput.value = '';
  });

  // 5. Paso 2: Reenviar código
  document.getElementById('btn-resend-otp')?.addEventListener('click', async () => {
    if (!tempAuthCreds.email || !tempAuthCreds.password) {
      showToast('Por favor vuelve al Paso 1 e ingresa tus credenciales', 'error');
      return;
    }

    try {
      const res = await apiFetch('/api/v1/auth/request-code', {
        method: 'POST',
        body: JSON.stringify(tempAuthCreds)
      });
      showToast('Nuevo código generado con éxito', 'success');
      if (res.notice) {
        setTimeout(() => showToast(res.notice, 'info'), 700);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 6. Colaboradores: Desplegar / ocultar sección de Token JWT
  document.getElementById('btn-toggle-collab-section')?.addEventListener('click', () => {
    const container = document.getElementById('collab-token-container');
    container?.classList.toggle('hidden');
  });

  // 7. Colaboradores: Generar Token rápido desde la pantalla de Login o Ingresar con Token JWT pegado
  document.getElementById('btn-generate-collab-login-token')?.addEventListener('click', async () => {
    const passInput = document.getElementById('quick-collab-pass');
    const password = passInput?.value || '';
    if (!password) {
      showToast('Ingresa la clave de colaborador (por defecto: admin_ucl_2026)', 'error');
      return;
    }

    try {
      const res = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'Colaborador_Universidad', password })
      });
      const tokenBox = document.getElementById('jwt-token-input');
      if (tokenBox) tokenBox.value = res.token;
      showToast('Token JWT generado y pegado automáticamente. Haz clic en Validar Token y Entrar.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('form-token-auth')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('jwt-token-input');
    if (input) {
      await verifyAndUnlock(input.value, true);
    }
  });

  // 7.1 Modal Generador de Tokens desde la Barra Superior
  document.getElementById('btn-open-token-generator')?.addEventListener('click', () => {
    document.getElementById('token-generator-modal')?.classList.remove('hidden');
  });

  document.getElementById('btn-close-token-generator')?.addEventListener('click', () => {
    document.getElementById('token-generator-modal')?.classList.add('hidden');
  });

  document.getElementById('form-generate-editor-token')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const collabName = document.getElementById('gen-token-name')?.value.trim() || 'Demo_Universidad';
    const hours = Number(document.getElementById('gen-token-hours')?.value) || 24;

    try {
      let generatedToken = '';
      if (state.currentUser?.role === 'SUPERADMIN') {
        const res = await apiFetch('/api/v1/auth/generate-editor-token', {
          method: 'POST',
          body: JSON.stringify({ collaborator_name: collabName, hours })
        });
        generatedToken = res.token;
      } else {
        const res = await apiFetch('/api/v1/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username: collabName, password: 'admin_ucl_2026' })
        });
        generatedToken = res.token;
      }

      const output = document.getElementById('generated-token-output');
      const resultBox = document.getElementById('generated-token-result-box');
      if (output && resultBox) {
        output.value = generatedToken;
        resultBox.classList.remove('hidden');
      }
      showToast(`Token JWT generado para "${collabName}"`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('btn-copy-generated-token')?.addEventListener('click', async () => {
    const output = document.getElementById('generated-token-output');
    if (output && output.value) {
      await navigator.clipboard.writeText(output.value);
      showToast('Token copiado al portapapeles. Ya puedes pegarlo en Thunder Client o en el Login.', 'success');
    }
  });

  // 8. Cerrar sesión
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    state.token = '';
    state.currentUser = null;
    localStorage.removeItem('ucl_superadmin_token');
    resetAuthForms();
    document.getElementById('auth-overlay')?.classList.remove('hidden');
    showToast('Sesión cerrada correctamente. Debes autenticarte de nuevo.', 'success');
  });

  // 9. Refrescar datos
  document.getElementById('btn-refresh-all')?.addEventListener('click', async () => {
    await loadAllData();
    showToast('Datos sincronizados con PostgreSQL', 'success');
  });

  // 10. Botón Vaciar Base de Datos (Solo SuperAdmin)
  document.getElementById('btn-reset-db')?.addEventListener('click', async () => {
    if (state.currentUser?.role !== 'SUPERADMIN') {
      showToast('Acceso denegado: Solo el SuperAdmin tiene permisos para vaciar la base de datos.', 'error');
      return;
    }

    const confirmation = window.prompt(
      '⚠️ ACCIÓN DESTRUCIVA CRÍTICA (EXCLUSIVO SUPERADMIN)\n\nSe borrarán TODOS los clubes, jugadores, temporadas, plantillas, partidos e incidencias de PostgreSQL.\n\nEscribe exactamente "RESET" para proceder:'
    );

    if (confirmation !== 'RESET') {
      if (confirmation !== null) {
        showToast('Acción cancelada. No se escribió la palabra de confirmación RESET.', 'info');
      }
      return;
    }

    try {
      const res = await apiFetch('/api/v1/admin/reset-database', {
        method: 'DELETE'
      });
      state.draftMatchEvents = [];
      renderDraftEventsList();
      await loadAllData();
      showToast(res.message || 'Base de datos vaciada por completo', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ==================== NAVEGACIÓN ENTRE PESTAÑAS ====================
function setupTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      buttons.forEach((b) => b.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  document.getElementById('btn-open-credits-tab')?.addEventListener('click', () => {
    const creditsTabBtn = document.querySelector('.tab-btn[data-tab="tab-credits"]');
    if (creditsTabBtn) {
      creditsTabBtn.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// ==================== CARGA Y SINCRONIZACIÓN DE DATOS ====================
async function loadAllData() {
  try {
    const activeOnly = document.getElementById('filter-top-scorers-active')?.value || '';
    const topScorersUrl = activeOnly
      ? '/api/v1/players/top-scorers?active_only=true&limit=50'
      : '/api/v1/players/top-scorers?limit=50';

    const [clubsRes, playersRes, topScorersRes, seasonsRes, squadsRes, matchesRes] = await Promise.all([
      apiFetch('/api/v1/clubs'),
      apiFetch('/api/v1/players'),
      apiFetch(topScorersUrl),
      apiFetch('/api/v1/seasons'),
      apiFetch('/api/v1/squads'),
      apiFetch('/api/v1/matches?limit=100')
    ]);

    state.clubs = clubsRes.data || [];
    state.players = playersRes.data || [];
    state.topScorers = topScorersRes.data || [];
    state.seasons = seasonsRes.data || [];
    state.squads = squadsRes.data || [];
    state.matches = matchesRes.data || [];

    // Actualizar KPIs
    document.getElementById('kpi-clubs').textContent = state.clubs.length;
    document.getElementById('kpi-players').textContent = state.players.length;
    document.getElementById('kpi-seasons').textContent = state.seasons.length;
    document.getElementById('kpi-matches').textContent =
      matchesRes.pagination?.total_records ?? state.matches.length;

    // Renderizar Tablas
    renderClubsTable(document.getElementById('search-clubs-table')?.value || '');
    renderPlayersTable(document.getElementById('search-players-table')?.value || '');
    renderSeasonsTable();
    renderMatchesTable(document.getElementById('search-matches-table')?.value || '');

    // Poblar todos los <select> dinámicos
    populateAllSelects();

    // Actualizar Explorador de Plantillas (Bloque B)
    await loadSquadExplorerBoard();
  } catch (err) {
    showToast(`Error cargando datos: ${err.message}`, 'error');
  }
}

// ==================== RENDERIZADO DE TABLAS CON FOTOS Y ESCUDOS ====================
function renderClubsTable(filterText = '') {
  const tbody = document.getElementById('tbody-clubs');
  if (!tbody) return;

  const q = filterText.trim().toLowerCase();
  const filtered = state.clubs.filter((c) => {
    const countryName = (UEFA_COUNTRY_MAP[c.country_code] || '').toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.short_name.toLowerCase().includes(q) ||
      c.country_code.toLowerCase().includes(q) ||
      countryName.includes(q) ||
      c.stadium.toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:24px;">No hay clubes registrados aún. ¡Crea el primero en el formulario!</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((c) => {
      const crestSrc = c.crest_url || DEFAULT_CREST_SVG;
      const countryLabel = UEFA_COUNTRY_MAP[c.country_code]
        ? `${c.country_code} • ${UEFA_COUNTRY_MAP[c.country_code]}`
        : c.country_code;
      return `
      <tr>
        <td>
          <div class="cell-with-media">
            <img src="${escapeHtml(crestSrc)}" class="crest-sm" alt="Escudo" onerror="this.src='${DEFAULT_CREST_SVG}'" />
            <strong>${escapeHtml(c.name)}</strong>
          </div>
        </td>
        <td><span class="tag">${escapeHtml(c.short_name)}</span></td>
        <td><span class="tag tag-swiss">${escapeHtml(countryLabel)}</span></td>
        <td>${escapeHtml(c.stadium)}</td>
        <td><strong>${c.titles_count}</strong> 🏆</td>
        <td>
          <div style="display:flex;gap:6px;">
            <button type="button" class="btn btn-sm" style="padding:4px 8px;font-size:0.75rem;" onclick="window.selectClubForEdit(${c.id})" title="Seleccionar para editar">✏️</button>
            <button type="button" class="btn btn-sm btn-danger" style="padding:4px 8px;font-size:0.75rem;background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.45);color:#fca5a5;" onclick="window.deleteClubById(${c.id})" title="Eliminar club">🗑️</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

function renderPlayersTable(filterText = '') {
  const tbody = document.getElementById('tbody-players');
  if (!tbody) return;

  const q = filterText.trim().toLowerCase();
  const listToRender = state.topScorers.length > 0 ? state.topScorers : state.players;

  const filtered = listToRender.filter((p) => {
    const countryName = (UEFA_COUNTRY_MAP[p.nationality] || '').toLowerCase();
    return (
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
      p.nationality.toLowerCase().includes(q) ||
      countryName.includes(q) ||
      p.position.toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:24px;">No hay jugadores registrados aún.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((p, idx) => {
      const photoSrc = p.photo_url || DEFAULT_PLAYER_SVG;
      const countryLabel = UEFA_COUNTRY_MAP[p.nationality]
        ? `${p.nationality} • ${UEFA_COUNTRY_MAP[p.nationality]}`
        : p.nationality;
      return `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td>
          <div class="cell-with-media">
            <img src="${escapeHtml(photoSrc)}" class="avatar-sm" alt="Foto" onerror="this.src='${DEFAULT_PLAYER_SVG}'" />
            <strong>${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}</strong>
          </div>
        </td>
        <td><span class="tag">${escapeHtml(countryLabel)}</span></td>
        <td>${escapeHtml(p.position)}</td>
        <td><span class="score-pill">${p.total_goals} ⚽</span></td>
        <td>${p.total_appearances} PJ</td>
        <td>
          <span class="tag ${p.active ? 'tag-active' : 'tag-retired'}">
            ${p.active ? '🟢 Activo' : '⚪ Retirado'}
          </span>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button type="button" class="btn btn-sm" style="padding:4px 8px;font-size:0.75rem;" onclick="window.selectPlayerForEdit(${p.id})" title="Seleccionar para editar">✏️</button>
            <button type="button" class="btn btn-sm btn-danger" style="padding:4px 8px;font-size:0.75rem;background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.45);color:#fca5a5;" onclick="window.deletePlayerById(${p.id})" title="Eliminar jugador">🗑️</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

function renderSeasonsTable() {
  const tbody = document.getElementById('tbody-seasons');
  if (!tbody) return;

  if (state.seasons.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:24px;">No hay temporadas registradas aún.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.seasons
    .map((s) => {
      const isSwiss = s.format === 'SWISS_LEAGUE';
      const phasesCount = s.phases ? s.phases.length : 0;

      const champHtml = s.champion
        ? `<div class="cell-with-media">
            <img src="${escapeHtml(s.champion.crest_url || DEFAULT_CREST_SVG)}" class="crest-sm" onerror="this.src='${DEFAULT_CREST_SVG}'" />
            <strong>${escapeHtml(s.champion.name)}</strong>
           </div>`
        : '<span style="color:#64748b;">Por definir</span>';

      const runnerHtml = s.runner_up
        ? `<div class="cell-with-media">
            <img src="${escapeHtml(s.runner_up.crest_url || DEFAULT_CREST_SVG)}" class="crest-sm" onerror="this.src='${DEFAULT_CREST_SVG}'" />
            <span>${escapeHtml(s.runner_up.name)}</span>
           </div>`
        : '<span style="color:#64748b;">Por definir</span>';

      const scorerHtml = s.top_scorer
        ? `<div class="cell-with-media">
            <img src="${escapeHtml(s.top_scorer.photo_url || DEFAULT_PLAYER_SVG)}" class="avatar-sm" onerror="this.src='${DEFAULT_PLAYER_SVG}'" />
            <span>${escapeHtml(s.top_scorer.first_name)} ${escapeHtml(s.top_scorer.last_name)}</span>
           </div>`
        : '<span style="color:#64748b;">Por definir</span>';

      return `
        <tr>
          <td><strong>${s.year_start}/${s.year_end}</strong></td>
          <td>
            <span class="tag ${isSwiss ? 'tag-swiss' : 'tag-classic'}">
              ${s.format} (${s.teams_count} eq.)
            </span>
          </td>
          <td>${champHtml}</td>
          <td>${runnerHtml}</td>
          <td>${scorerHtml}</td>
          <td><span class="tag">${phasesCount} fases</span></td>
        </tr>
      `;
    })
    .join('');
}

function renderMatchesTable(filterText = '') {
  const tbody = document.getElementById('tbody-matches');
  if (!tbody) return;

  const q = filterText.trim().toLowerCase();
  const filtered = state.matches.filter((m) => {
    const home = m.home_team?.name?.toLowerCase() || '';
    const away = m.away_team?.name?.toLowerCase() || '';
    const phase = m.phase?.name?.toLowerCase() || '';
    const stadium = m.stadium?.toLowerCase() || '';
    const status = (m.status || '').toLowerCase();
    return home.includes(q) || away.includes(q) || phase.includes(q) || stadium.includes(q) || status.includes(q);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:24px;">No hay partidos registrados aún.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((m) => {
      const seasonStr = m.season ? `${m.season.year_start}/${m.season.year_end}` : '';
      const phaseStr = m.phase ? m.phase.name : '';
      const extraInfo = [m.group_name || null, m.matchday ? `Jornada ${m.matchday}` : null]
        .filter(Boolean)
        .join(' • ');

      const homeCrest = m.home_team?.crest_url || DEFAULT_CREST_SVG;
      const awayCrest = m.away_team?.crest_url || DEFAULT_CREST_SVG;

      const statusMeta = MATCH_STATUS_LABELS[m.status] || { text: m.status, cls: '' };
      const dateStr = m.match_date ? new Date(m.match_date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : '';

      let suspensionInfoHtml = '';
      if (m.status && m.status !== 'FINISHED') {
        const parts = [];
        if (m.suspended_minute) parts.push(`Detenido al ${m.suspended_minute}'`);
        if (m.suspension_reason) parts.push(`Motivo: ${escapeHtml(m.suspension_reason)}`);
        if (m.resumed_at) {
          parts.push(`Reanudado: ${new Date(m.resumed_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}`);
        }
        if (parts.length > 0) {
          suspensionInfoHtml = `<div style="margin-top:4px;font-size:0.75rem;color:#fde68a;">⚠️ ${parts.join(' | ')}</div>`;
        }
      }

      const eventsHtml =
        Array.isArray(m.events) && m.events.length > 0
          ? m.events
              .map((ev) => {
                const minStr = ev.extra_minute ? `${ev.minute}+${ev.extra_minute}'` : `${ev.minute}'`;
                const pName = ev.player ? `${ev.player.first_name} ${ev.player.last_name}` : 'Jugador';
                const pPhoto = ev.player?.photo_url || DEFAULT_PLAYER_SVG;
                const label = EVENT_LABELS[ev.type] || ev.type;
                const det = ev.detail ? ` <em style="color:#94a3b8;">(${escapeHtml(ev.detail)})</em>` : '';
                return `
                  <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:0.78rem;">
                    <img src="${escapeHtml(pPhoto)}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;" onerror="this.src='${DEFAULT_PLAYER_SVG}'" />
                    <span class="tag">${minStr}</span>
                    <span>${label}</span>
                    <strong>${escapeHtml(pName)}</strong>${det}
                  </div>
                `;
              })
              .join('')
          : '<span style="color:#64748b;font-size:0.78rem;">Sin incidencias registradas</span>';

      return `
        <tr>
          <td>
            <strong>${seasonStr}</strong><br/>
            <span class="tag">${escapeHtml(phaseStr)}</span>
            ${extraInfo ? `<br/><small style="color:#00d4ff;">${escapeHtml(extraInfo)}</small>` : ''}
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <div class="cell-with-media">
                <img src="${escapeHtml(homeCrest)}" class="crest-sm" onerror="this.src='${DEFAULT_CREST_SVG}'" />
                <strong>${escapeHtml(m.home_team?.name || '')}</strong>
              </div>
              <span class="score-pill">${m.home_score} - ${m.away_score}</span>
              <div class="cell-with-media">
                <img src="${escapeHtml(awayCrest)}" class="crest-sm" onerror="this.src='${DEFAULT_CREST_SVG}'" />
                <strong>${escapeHtml(m.away_team?.name || '')}</strong>
              </div>
            </div>
          </td>
          <td>
            <span class="tag ${statusMeta.cls}">${statusMeta.text}</span>
            <div style="margin-top:4px;font-size:0.8rem;">🏟️ ${escapeHtml(m.stadium)}</div>
            <small style="color:#94a3b8;">📅 ${dateStr}</small>
            ${suspensionInfoHtml}
          </td>
          <td>${eventsHtml}</td>
        </tr>
      `;
    })
    .join('');
}

// ==================== POBLACIÓN DINÁMICA DE <SELECT> (CERO IDs MANUALES) ====================
function setSelectOptions(selectId, optionsArray, emptyOptionLabel = null) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const previousValue = select.value;
  const fullList = [];

  if (emptyOptionLabel !== null) {
    fullList.push({ value: '', label: emptyOptionLabel });
  }

  optionsArray.forEach((opt) => fullList.push(opt));
  state.selectOptionsCache[selectId] = fullList;

  renderSelectFromCache(selectId, '');

  if (previousValue && Array.from(select.options).some((o) => o.value === previousValue)) {
    select.value = previousValue;
  }
}

function renderSelectFromCache(selectId, filterQuery = '') {
  const select = document.getElementById(selectId);
  const fullList = state.selectOptionsCache[selectId] || [];
  if (!select) return;

  const q = filterQuery.trim().toLowerCase();
  const filtered = fullList.filter((item) => item.value === '' || item.label.toLowerCase().includes(q));

  select.innerHTML = filtered
    .map((item) => `<option value="${item.value}">${escapeHtml(item.label)}</option>`)
    .join('');
}

function populateAllSelects() {
  const clubOptions = state.clubs.map((c) => ({
    value: String(c.id),
    label: `${c.name} (${c.country_code}) — ${c.short_name}`
  }));

  const playerOptions = state.players.map((p) => ({
    value: String(p.id),
    label: `${p.first_name} ${p.last_name} (${p.nationality} • ${p.position}) — ${p.total_goals} goles`
  }));

  const seasonOptions = state.seasons.map((s) => ({
    value: String(s.id),
    label: `${s.year_start}/${s.year_end} — ${s.format} (${s.teams_count} clubes)`
  }));

  const matchOptions = state.matches.map((m) => {
    const s = m.season ? `${m.season.year_start}/${m.season.year_end}` : '';
    const ph = m.phase ? m.phase.name : '';
    return {
      value: String(m.id),
      label: `[${s} - ${ph}] ${m.home_team?.name} ${m.home_score} - ${m.away_score} ${m.away_team?.name}`
    };
  });

  // Pestaña 1: Editar Club
  setSelectOptions('edit-club-select', clubOptions);
  syncEditClubFields();

  // Pestaña 2: Editar Jugador
  setSelectOptions('edit-player-select', playerOptions);
  syncEditPlayerFields();

  // Pestaña 3: Temporadas
  setSelectOptions('season-champion', clubOptions, '-- Por definir / Sin Campeón --');
  setSelectOptions('season-runner-up', clubOptions, '-- Por definir / Sin Subcampeón --');
  setSelectOptions('season-top-scorer', playerOptions, '-- Por definir / Sin Goleador --');

  setSelectOptions('edit-season-select', seasonOptions);
  setSelectOptions('edit-season-champion', clubOptions, '-- Por definir / Sin Campeón --');
  setSelectOptions('edit-season-runner-up', clubOptions, '-- Por definir / Sin Subcampeón --');
  setSelectOptions('edit-season-top-scorer', playerOptions, '-- Por definir / Sin Goleador --');
  syncEditSeasonFields();

  // Pestaña 4: Plantillas (Bloque A + Bloque B Explorador)
  setSelectOptions('squad-season', seasonOptions);
  setSelectOptions('squad-club', clubOptions);
  setSelectOptions('squad-player', playerOptions);
  setSelectOptions('explorer-squad-season', seasonOptions, '-- Todas las Temporadas --');
  setSelectOptions('explorer-squad-club', clubOptions, '-- Selecciona un Club --');

  // Si hay al menos 1 club y el explorador está vacío, preseleccionamos el primer club
  const explorerClubSel = document.getElementById('explorer-squad-club');
  if (explorerClubSel && !explorerClubSel.value && state.clubs.length > 0) {
    explorerClubSel.value = String(state.clubs[0].id);
  }
  const explorerSeasonSel = document.getElementById('explorer-squad-season');
  if (explorerSeasonSel && !explorerSeasonSel.value && state.seasons.length > 0) {
    explorerSeasonSel.value = String(state.seasons[0].id);
  }

  syncSquadAssignerPreviews();

  // Pestaña 5 Unificada: Partidos + Constructor de Incidencias + Agregar Evento a Partido Existente
  setSelectOptions('match-season', seasonOptions);
  setSelectOptions('match-home-team', clubOptions);
  setSelectOptions('match-away-team', clubOptions);
  setSelectOptions('draft-event-player', playerOptions);
  setSelectOptions('event-match', matchOptions);
  setSelectOptions('event-player', playerOptions);

  const homeSelect = document.getElementById('match-home-team');
  const awaySelect = document.getElementById('match-away-team');
  if (homeSelect && awaySelect && state.clubs.length >= 2 && homeSelect.value === awaySelect.value) {
    awaySelect.selectedIndex = 1;
  }

  autoFillHomeStadium();
  loadPhasesForSelectedMatchSeason();
}

// ==================== MÓDULO AVANZADO DE PLANTILLAS (BLOQUE A + BLOQUE B) ====================
function syncSquadAssignerPreviews() {
  const clubId = document.getElementById('squad-club')?.value;
  const playerId = document.getElementById('squad-player')?.value;

  const club = state.clubs.find((c) => String(c.id) === String(clubId));
  const clubImg = document.getElementById('squad-club-crest-preview');
  const clubTxt = document.getElementById('squad-club-name-preview');
  if (clubImg && clubTxt) {
    clubImg.src = club?.crest_url || DEFAULT_CREST_SVG;
    clubTxt.textContent = club ? `${club.name} (${club.country_code}) • ${club.stadium}` : 'Selecciona un club';
  }

  const player = state.players.find((p) => String(p.id) === String(playerId));
  const playerImg = document.getElementById('squad-player-photo-preview');
  const playerTxt = document.getElementById('squad-player-name-preview');
  if (playerImg && playerTxt) {
    playerImg.src = player?.photo_url || DEFAULT_PLAYER_SVG;
    playerTxt.textContent = player
      ? `${player.first_name} ${player.last_name} (${player.position} • ${player.nationality})`
      : 'Selecciona un jugador';
  }
}

async function loadSquadExplorerBoard() {
  const board = document.getElementById('squad-explorer-board');
  const seasonId = document.getElementById('explorer-squad-season')?.value || '';
  const clubId = document.getElementById('explorer-squad-club')?.value || '';
  if (!board) return;

  if (!clubId) {
    board.innerHTML = `
      <div class="helper-box" style="text-align:center;padding:24px;">
        Selecciona un <strong>Club</strong> (y opcionalmente una <strong>Temporada</strong>) arriba para visualizar su pizarra de Titulares, Suplentes y Reservas.
      </div>
    `;
    return;
  }

  try {
    const params = new URLSearchParams();
    if (seasonId) params.set('season_id', seasonId);
    if (clubId) params.set('club_id', clubId);

    const res = await apiFetch(`/api/v1/squads?${params.toString()}`);
    const club = res.club || state.clubs.find((c) => String(c.id) === String(clubId));
    const season = res.season;
    const members = res.data || [];

    const crestSrc = club?.crest_url || DEFAULT_CREST_SVG;
    const seasonBadge = season ? `Temporada ${season.year_start}/${season.year_end} (${season.format})` : 'Todas las Temporadas';

    const starters = members.filter((m) => m.role === 'STARTER');
    const bench = members.filter((m) => m.role === 'SUBSTITUTE' || m.role === 'RESERVE');

    const renderGroupByPosition = (list) => {
      if (list.length === 0) {
        return `<p style="color:#64748b;font-size:0.84rem;padding:8px 0;">No hay jugadores asignados en esta sección.</p>`;
      }

      const positionsOrder = [
        { key: 'Goalkeeper', title: '🧤 Porteros (Goalkeepers)' },
        { key: 'Defender', title: '🛡️ Defensas (Defenders)' },
        { key: 'Midfielder', title: '🎯 Mediocampistas (Midfielders)' },
        { key: 'Forward', title: '⚡ Delanteros (Forwards)' }
      ];

      let html = '';
      positionsOrder.forEach((posGroup) => {
        const groupMembers = list.filter((m) => m.player?.position === posGroup.key);
        if (groupMembers.length > 0) {
          html += `<div class="position-group-label">${posGroup.title} (${groupMembers.length})</div>`;
          html += `<div class="squad-cards-grid">`;
          groupMembers.forEach((m) => {
            html += renderSquadPlayerCard(m);
          });
          html += `</div>`;
        }
      });

      // Por si algún jugador tiene una posición personalizada
      const others = list.filter(
        (m) => !['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].includes(m.player?.position)
      );
      if (others.length > 0) {
        html += `<div class="position-group-label">📋 Otras Posiciones (${others.length})</div>`;
        html += `<div class="squad-cards-grid">`;
        others.forEach((m) => {
          html += renderSquadPlayerCard(m);
        });
        html += `</div>`;
      }

      return html;
    };

    board.innerHTML = `
      <div class="squad-club-banner">
        <div class="squad-club-banner-left">
          <img src="${escapeHtml(crestSrc)}" class="squad-club-crest-lg" alt="Escudo" onerror="this.src='${DEFAULT_CREST_SVG}'" />
          <div>
            <h3 style="font-size:1.25rem;color:#fff;">${escapeHtml(club?.name || 'Club')} (${escapeHtml(club?.short_name || '')})</h3>
            <p style="font-size:0.84rem;color:#94a3b8;">🏟️ ${escapeHtml(club?.stadium || '')} • 🏆 ${club?.titles_count ?? 0} títulos UCL</p>
            <span class="tag tag-swiss" style="margin-top:6px;">📅 ${escapeHtml(seasonBadge)}</span>
          </div>
        </div>
        <div style="text-align:right;">
          <span class="score-pill">${members.length} Jugadores en Plantilla</span>
        </div>
      </div>

      <div class="squad-section-title">
        <span>⭐ Equipo Titular (STARTER)</span>
        <span class="tag tag-active">${starters.length} Titulares</span>
      </div>
      ${renderGroupByPosition(starters)}

      <div class="squad-section-title" style="margin-top:26px;">
        <span>🔄 Suplentes y Reservas (SUBSTITUTE / RESERVE)</span>
        <span class="tag tag-classic">${bench.length} en Banquillo / Reserva</span>
      </div>
      ${renderGroupByPosition(bench)}
    `;

    // Conectar botones de cambio rápido de rol y eliminar de plantilla
    board.querySelectorAll('[data-action="toggle-role"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const sqId = btn.getAttribute('data-id');
        const nextRole = btn.getAttribute('data-next-role');
        try {
          const res = await apiFetch(`/api/v1/squads/${sqId}`, {
            method: 'PUT',
            body: JSON.stringify({ role: nextRole })
          });
          showToast(res.message || 'Rol actualizado', 'success');
          await loadSquadExplorerBoard();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });

    board.querySelectorAll('[data-action="remove-squad"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const sqId = btn.getAttribute('data-id');
        try {
          const res = await apiFetch(`/api/v1/squads/${sqId}`, {
            method: 'DELETE'
          });
          showToast(res.message || 'Jugador retirado de la plantilla', 'success');
          await loadAllData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderSquadPlayerCard(m) {
  const p = m.player || {};
  const photoSrc = p.photo_url || DEFAULT_PLAYER_SVG;
  const nextRole = m.role === 'STARTER' ? 'SUBSTITUTE' : 'STARTER';
  const nextRoleLabel = m.role === 'STARTER' ? '🔄 Pasar a Suplente' : '⭐ Pasar a Titular';
  const roleBadge =
    m.role === 'STARTER'
      ? '<span class="tag tag-active">⭐ Titular</span>'
      : m.role === 'SUBSTITUTE'
      ? '<span class="tag tag-classic">🔄 Suplente</span>'
      : '<span class="tag">📋 Reserva</span>';

  return `
    <div class="squad-player-card">
      <div class="squad-player-card-top">
        <img src="${escapeHtml(photoSrc)}" class="squad-player-photo" alt="Foto" onerror="this.src='${DEFAULT_PLAYER_SVG}'" />
        <div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="score-pill" style="padding:2px 7px;font-size:0.75rem;">#${m.shirt_number ?? '-'}</span>
            <strong>${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}</strong>
          </div>
          <div style="font-size:0.76rem;color:#94a3b8;margin-top:3px;">
            ${escapeHtml(p.nationality)} • ${escapeHtml(p.position)} • ⚽ ${p.total_goals ?? 0} goles
          </div>
          <div style="margin-top:4px;">${roleBadge}</div>
        </div>
      </div>
      <div class="squad-player-actions">
        <button type="button" class="btn btn-outline btn-sm" data-action="toggle-role" data-id="${m.id}" data-next-role="${nextRole}">
          ${nextRoleLabel}
        </button>
        <button type="button" class="btn btn-danger-outline btn-sm" data-action="remove-squad" data-id="${m.id}" title="Quitar de la plantilla">
          ✖
        </button>
      </div>
    </div>
  `;
}

// ==================== CONSTRUCTOR DE INCIDENCIAS EN EL MISMO FLUJO DE PARTIDO ====================
function renderDraftEventsList() {
  const container = document.getElementById('draft-events-list');
  const counter = document.getElementById('draft-events-counter');
  if (!container || !counter) return;

  counter.textContent = `${state.draftMatchEvents.length} añadida(s)`;

  if (state.draftMatchEvents.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = state.draftMatchEvents
    .map((ev, index) => {
      const minText = ev.extra_minute ? `${ev.minute}+${ev.extra_minute}'` : `${ev.minute}'`;
      const label = EVENT_LABELS[ev.type] || ev.type;
      return `
        <div class="draft-event-item">
          <div>
            <span class="tag">${minText}</span>
            <strong>${label}</strong> — ${escapeHtml(ev.playerName)}
            ${ev.detail ? `<em style="color:#94a3b8;"> (${escapeHtml(ev.detail)})</em>` : ''}
          </div>
          <button type="button" class="btn btn-danger-outline btn-sm" data-remove-draft="${index}">✖</button>
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('[data-remove-draft]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-remove-draft'));
      state.draftMatchEvents.splice(idx, 1);
      renderDraftEventsList();
    });
  });
}

function setupDraftEventsBuilder() {
  document.getElementById('btn-add-draft-event')?.addEventListener('click', () => {
    const playerSelect = document.getElementById('draft-event-player');
    const typeSelect = document.getElementById('draft-event-type');
    const minInput = document.getElementById('draft-event-minute');
    const extraInput = document.getElementById('draft-event-extra');
    const detailInput = document.getElementById('draft-event-detail');

    if (!playerSelect?.value) {
      showToast('Primero registra o selecciona un jugador para la incidencia', 'error');
      return;
    }

    const playerObj = state.players.find((p) => String(p.id) === String(playerSelect.value));
    const playerName = playerObj ? `${playerObj.first_name} ${playerObj.last_name}` : 'Jugador';

    state.draftMatchEvents.push({
      player_id: Number(playerSelect.value),
      playerName,
      type: typeSelect.value,
      minute: Number(minInput.value) || 45,
      extra_minute: extraInput.value ? Number(extraInput.value) : null,
      detail: detailInput.value.trim() || null
    });

    extraInput.value = '';
    detailInput.value = '';
    renderDraftEventsList();
  });

  // Mostrar/ocultar campos de suspensión según el estado del partido
  document.getElementById('match-status')?.addEventListener('change', (e) => {
    const panel = document.getElementById('suspension-fields-panel');
    if (!panel) return;
    if (e.target.value === 'FINISHED') {
      panel.classList.add('hidden');
    } else {
      panel.classList.remove('hidden');
    }
  });
}

// ==================== MODAL RÁPIDO PARA CREAR JUGADOR DESDE PLANTILLAS ====================
function setupQuickPlayerModal() {
  const modal = document.getElementById('quick-player-modal');
  document.getElementById('btn-open-quick-player-modal')?.addEventListener('click', () => {
    modal?.classList.remove('hidden');
  });
  document.getElementById('btn-close-quick-player-modal')?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });

  document.getElementById('form-quick-modal-player')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = {
        first_name: document.getElementById('modal-player-first').value.trim(),
        last_name: document.getElementById('modal-player-last').value.trim(),
        nationality: document.getElementById('modal-player-nat').value.trim().toUpperCase(),
        position: document.getElementById('modal-player-pos').value,
        photo_url: document.getElementById('modal-player-photo-url').value.trim() || null,
        active: true,
        total_goals: 0,
        total_appearances: 0
      };

      const res = await apiFetch('/api/v1/players', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(`Jugador ${res.data.first_name} ${res.data.last_name} creado y seleccionado`, 'success');
      e.target.reset();
      modal?.classList.add('hidden');

      await loadAllData();

      // Seleccionar automáticamente al jugador recién creado en el formulario de plantilla
      const squadPlayerSel = document.getElementById('squad-player');
      if (squadPlayerSel && res.data?.id) {
        squadPlayerSel.value = String(res.data.id);
        syncSquadAssignerPreviews();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ==================== BUSCADORES EN VIVO PARA <SELECT> Y TABLAS ====================
function setupSearchFilters() {
  document.querySelectorAll('.select-filter-input').forEach((input) => {
    input.addEventListener('input', () => {
      const targetId = input.getAttribute('data-target');
      if (input.classList.contains('uefa-country-filter')) {
        renderUefaCountrySelect(targetId, input.value);
        return;
      }

      renderSelectFromCache(targetId, input.value);

      if (targetId === 'match-home-team') autoFillHomeStadium();
      if (targetId === 'edit-player-select') syncEditPlayerFields();
      if (targetId === 'edit-club-select') syncEditClubFields();
      if (targetId === 'squad-club' || targetId === 'squad-player') syncSquadAssignerPreviews();
    });
  });

  document.getElementById('search-clubs-table')?.addEventListener('input', (e) => {
    renderClubsTable(e.target.value);
  });

  document.getElementById('search-players-table')?.addEventListener('input', (e) => {
    renderPlayersTable(e.target.value);
  });

  document.getElementById('filter-top-scorers-active')?.addEventListener('change', () => {
    loadAllData();
  });

  document.getElementById('search-matches-table')?.addEventListener('input', (e) => {
    renderMatchesTable(e.target.value);
  });

  document.getElementById('explorer-squad-season')?.addEventListener('change', loadSquadExplorerBoard);
  document.getElementById('explorer-squad-club')?.addEventListener('change', loadSquadExplorerBoard);
  document.getElementById('squad-club')?.addEventListener('change', syncSquadAssignerPreviews);
  document.getElementById('squad-player')?.addEventListener('change', syncSquadAssignerPreviews);
}

// ==================== LÓGICA INTELIGENTE DE TEMPORADAS ====================
function updateSmartSeasonRules() {
  const startInput = document.getElementById('season-year-start');
  const endInput = document.getElementById('season-year-end');
  const formatSelect = document.getElementById('season-format');
  const teamsInput = document.getElementById('season-teams-count');

  if (!startInput || !endInput || !formatSelect || !teamsInput) return;

  const yearStart = Number(startInput.value);
  if (yearStart) {
    endInput.value = yearStart + 1;

    if (yearStart < 2024) {
      formatSelect.value = 'CLASSIC_GROUPS';
      teamsInput.value = 32;
    } else {
      formatSelect.value = 'SWISS_LEAGUE';
      teamsInput.value = 36;
    }
  }

  updateSeasonPhasesPreviewText();
}

function updateSeasonPhasesPreviewText() {
  const formatSelect = document.getElementById('season-format');
  const teamsInput = document.getElementById('season-teams-count');
  const previewBox = document.getElementById('season-phases-preview');
  if (!formatSelect || !previewBox) return;

  if (formatSelect.value === 'SWISS_LEAGUE') {
    teamsInput.value = 36;
    previewBox.className = 'helper-box';
    previewBox.innerHTML = `
      ⚡ <strong>Automatización Prisma (SWISS_LEAGUE — 36 clubes):</strong> Se crearán automáticamente 6 fases:
      <em>Fase Liga - Sistema Suizo, Play-offs Eliminatorios, Octavos de Final, Cuartos de Final, Semifinales y Final</em>.
    `;
  } else {
    teamsInput.value = 32;
    previewBox.className = 'helper-box gold';
    previewBox.innerHTML = `
      🏆 <strong>Automatización Prisma (CLASSIC_GROUPS — 32 clubes):</strong> Se crearán automáticamente 5 fases:
      <em>Fase de Grupos, Octavos de Final, Cuartos de Final, Semifinales y Final</em>.
    `;
  }
}

// ==================== LÓGICA ADAPTATIVA DEL FORMULARIO DE PARTIDOS ====================
async function loadPhasesForSelectedMatchSeason() {
  const seasonSelect = document.getElementById('match-season');
  const phaseSelect = document.getElementById('match-phase');
  if (!seasonSelect || !phaseSelect || !seasonSelect.value) {
    if (phaseSelect) phaseSelect.innerHTML = '';
    return;
  }

  const seasonId = Number(seasonSelect.value);

  try {
    const res = await apiFetch(`/api/v1/seasons/${seasonId}/phases`);
    const phases = res.data || [];

    phaseSelect.innerHTML = phases
      .map((p) => `<option value="${p.id}" data-code="${p.code}">${escapeHtml(p.name)} (${p.code})</option>`)
      .join('');

    updateAdaptiveMatchFormRules();
  } catch (err) {
    showToast(`No se pudieron cargar las fases: ${err.message}`, 'error');
  }
}

function updateAdaptiveMatchFormRules() {
  const seasonSelect = document.getElementById('match-season');
  const phaseSelect = document.getElementById('match-phase');
  const groupWrapper = document.getElementById('group-field-wrapper');
  const groupSelect = document.getElementById('match-group');
  const matchdayInput = document.getElementById('match-matchday');
  const matchdayLabel = document.getElementById('label-matchday');
  const banner = document.getElementById('match-format-banner');

  if (!seasonSelect || !phaseSelect || !groupWrapper || !groupSelect || !matchdayInput) return;

  const selectedSeason = state.seasons.find((s) => String(s.id) === String(seasonSelect.value));
  const selectedPhaseOption = phaseSelect.options[phaseSelect.selectedIndex];
  const phaseCode = selectedPhaseOption ? selectedPhaseOption.getAttribute('data-code') : '';

  if (!selectedSeason) return;

  if (selectedSeason.format === 'SWISS_LEAGUE') {
    groupSelect.value = '';
    groupSelect.disabled = true;
    groupWrapper.classList.add('hidden');

    if (phaseCode === 'LEAGUE_PHASE') {
      matchdayInput.min = 1;
      matchdayInput.max = 8;
      if (!matchdayInput.value || Number(matchdayInput.value) > 8) matchdayInput.value = 1;
      matchdayLabel.textContent = 'Jornada Fase Liga (1 a 8)';
      banner.className = 'helper-box';
      banner.innerHTML = `⚡ <strong>Formato Suizo (${selectedSeason.year_start}/${selectedSeason.year_end}):</strong> Tabla única de 36 equipos sin grupos (Jornadas 1 a 8).`;
    } else {
      matchdayInput.min = 1;
      matchdayInput.max = 2;
      matchdayInput.value = '';
      matchdayLabel.textContent = 'Partido (1=Ida, 2=Vuelta o vacío)';
      banner.className = 'helper-box';
      banner.innerHTML = `⚡ <strong>Eliminatoria Directa (${selectedSeason.year_start}/${selectedSeason.year_end}):</strong> Sin fase de grupos.`;
    }
  } else {
    if (phaseCode === 'GROUP_STAGE') {
      groupWrapper.classList.remove('hidden');
      groupSelect.disabled = false;
      if (!groupSelect.value) groupSelect.value = 'Grupo A';

      matchdayInput.min = 1;
      matchdayInput.max = 6;
      if (!matchdayInput.value || Number(matchdayInput.value) > 6) matchdayInput.value = 1;
      matchdayLabel.textContent = 'Jornada de Grupo (1 a 6)';
      banner.className = 'helper-box gold';
      banner.innerHTML = `🏆 <strong>Fase de Grupos Clásica (${selectedSeason.year_start}/${selectedSeason.year_end}):</strong> Selecciona el Grupo (A - H) y la Jornada (1 a 6).`;
    } else {
      groupSelect.value = '';
      groupSelect.disabled = true;
      groupWrapper.classList.add('hidden');
      matchdayInput.min = 1;
      matchdayInput.max = 2;
      matchdayInput.value = '';
      matchdayLabel.textContent = 'Partido (1=Ida, 2=Vuelta o vacío)';
      banner.className = 'helper-box gold';
      banner.innerHTML = `🏆 <strong>Fase Eliminatoria (${selectedSeason.year_start}/${selectedSeason.year_end}):</strong> Ronda de eliminación directa sin grupo.`;
    }
  }
}

function autoFillHomeStadium() {
  const homeSelect = document.getElementById('match-home-team');
  const stadiumInput = document.getElementById('match-stadium');
  if (!homeSelect || !stadiumInput) return;

  const club = state.clubs.find((c) => String(c.id) === String(homeSelect.value));
  if (club) {
    stadiumInput.value = club.stadium;
  }
}

// ==================== SINCRONIZACIÓN DE FORMULARIOS DE EDICIÓN ====================
function syncEditClubFields() {
  const select = document.getElementById('edit-club-select');
  if (!select || !select.value) return;

  const club = state.clubs.find((c) => String(c.id) === String(select.value));
  if (!club) return;

  const nameInput = document.getElementById('edit-club-name');
  if (nameInput) nameInput.value = club.name || '';

  const shortInput = document.getElementById('edit-club-short');
  if (shortInput) shortInput.value = club.short_name || '';

  renderUefaCountrySelect('edit-club-country');
  const countrySelect = document.getElementById('edit-club-country');
  if (countrySelect && club.country_code) {
    countrySelect.value = club.country_code;
  }

  document.getElementById('edit-club-stadium').value = club.stadium || '';
  document.getElementById('edit-club-titles').value = club.titles_count ?? 0;
  document.getElementById('edit-club-crest-url').value = club.crest_url || '';
  document.getElementById('edit-club-crest-preview').src = club.crest_url || DEFAULT_CREST_SVG;
}

window.selectClubForEdit = function (clubId) {
  const select = document.getElementById('edit-club-select');
  if (!select) return;
  select.value = String(clubId);
  syncEditClubFields();
  select.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast('Club cargado en el formulario de edición', 'success');
};

window.deleteClubById = async function (clubId) {
  const club = state.clubs.find((c) => Number(c.id) === Number(clubId));
  const clubName = club ? club.name : `ID #${clubId}`;
  if (!window.confirm(`¿Estás seguro de eliminar al club "${clubName}" de la base de datos?`)) {
    return;
  }

  try {
    const res = await apiFetch(`/api/v1/clubs/${clubId}`, {
      method: 'DELETE'
    });
    showToast(res.message || `Club "${clubName}" eliminado`, 'success');
    await loadAllData();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

function syncEditPlayerFields() {
  const select = document.getElementById('edit-player-select');
  if (!select || !select.value) return;

  const player = state.players.find((p) => String(p.id) === String(select.value));
  if (!player) return;

  renderUefaCountrySelect('edit-player-nationality');
  const natSelect = document.getElementById('edit-player-nationality');
  if (natSelect && player.nationality) {
    natSelect.value = player.nationality;
  }

  const posSelect = document.getElementById('edit-player-position');
  if (posSelect && player.position) {
    posSelect.value = player.position;
  }

  document.getElementById('edit-player-goals').value = player.total_goals;
  document.getElementById('edit-player-apps').value = player.total_appearances;
  document.getElementById('edit-player-active').value = String(player.active);
  document.getElementById('edit-player-photo-url').value = player.photo_url || '';
  document.getElementById('edit-player-photo-preview').src = player.photo_url || DEFAULT_PLAYER_SVG;
}

window.selectPlayerForEdit = function (playerId) {
  const select = document.getElementById('edit-player-select');
  if (!select) return;
  select.value = String(playerId);
  syncEditPlayerFields();
  select.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast('Jugador cargado en el formulario de edición', 'success');
};

window.deletePlayerById = async function (playerId) {
  const player = state.players.find((p) => Number(p.id) === Number(playerId));
  const fullName = player ? `${player.first_name} ${player.last_name}` : `ID #${playerId}`;
  if (!window.confirm(`¿Estás seguro de eliminar al jugador "${fullName}" de la base de datos?`)) {
    return;
  }

  try {
    const res = await apiFetch(`/api/v1/players/${playerId}`, {
      method: 'DELETE'
    });
    showToast(res.message || `Jugador "${fullName}" eliminado`, 'success');
    await loadAllData();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

function syncEditSeasonFields() {
  const select = document.getElementById('edit-season-select');
  if (!select || !select.value) return;

  const season = state.seasons.find((s) => String(s.id) === String(select.value));
  if (!season) return;

  document.getElementById('edit-season-champion').value = season.champion_id ? String(season.champion_id) : '';
  document.getElementById('edit-season-runner-up').value = season.runner_up_id ? String(season.runner_up_id) : '';
  document.getElementById('edit-season-top-scorer').value = season.top_scorer_id ? String(season.top_scorer_id) : '';
}

// ==================== ENVÍO DE FORMULARIOS (POST / PUT) ====================
function setupFormSubmissions() {
  // 1. Crear Club
  document.getElementById('form-create-club')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: document.getElementById('club-name').value.trim(),
        short_name: document.getElementById('club-short').value.trim().toUpperCase(),
        country_code: document.getElementById('club-country').value.trim().toUpperCase(),
        stadium: document.getElementById('club-stadium').value.trim(),
        titles_count: Number(document.getElementById('club-titles').value) || 0,
        crest_url: document.getElementById('club-crest-url').value.trim() || null
      };

      const res = await apiFetch('/api/v1/clubs', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(res.message || 'Club creado con éxito', 'success');
      e.target.reset();
      document.getElementById('club-titles').value = '0';
      document.getElementById('club-crest-preview').src = DEFAULT_CREST_SVG;
      renderUefaCountrySelect('club-country');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 1.1 Actualizar o Eliminar Club Existente
  document.getElementById('edit-club-select')?.addEventListener('change', syncEditClubFields);
  document.getElementById('btn-delete-club')?.addEventListener('click', async () => {
    const clubId = document.getElementById('edit-club-select')?.value;
    if (!clubId) {
      showToast('Selecciona primero un club para eliminar', 'error');
      return;
    }
    await window.deleteClubById(Number(clubId));
  });
  document.getElementById('form-update-club')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const clubId = document.getElementById('edit-club-select').value;
    if (!clubId) return;

    try {
      const payload = {
        name: document.getElementById('edit-club-name').value.trim(),
        short_name: document.getElementById('edit-club-short').value.trim().toUpperCase(),
        country_code: document.getElementById('edit-club-country').value.trim().toUpperCase(),
        stadium: document.getElementById('edit-club-stadium').value.trim(),
        titles_count: Number(document.getElementById('edit-club-titles').value) || 0,
        crest_url: document.getElementById('edit-club-crest-url').value.trim() || null
      };

      const res = await apiFetch(`/api/v1/clubs/${clubId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      showToast(res.message || 'Club actualizado', 'success');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 2. Crear Jugador
  document.getElementById('form-create-player')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = {
        first_name: document.getElementById('player-first-name').value.trim(),
        last_name: document.getElementById('player-last-name').value.trim(),
        nationality: document.getElementById('player-nationality').value.trim().toUpperCase(),
        position: document.getElementById('player-position').value,
        total_goals: Number(document.getElementById('player-goals').value) || 0,
        total_appearances: Number(document.getElementById('player-apps').value) || 0,
        active: document.getElementById('player-active').value === 'true',
        photo_url: document.getElementById('player-photo-url').value.trim() || null
      };

      const res = await apiFetch('/api/v1/players', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(res.message || 'Jugador registrado con éxito', 'success');
      e.target.reset();
      document.getElementById('player-goals').value = '0';
      document.getElementById('player-apps').value = '0';
      document.getElementById('player-photo-preview').src = DEFAULT_PLAYER_SVG;
      renderUefaCountrySelect('player-nationality');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 2.1 Actualizar o Eliminar Jugador Existente
  document.getElementById('edit-player-select')?.addEventListener('change', syncEditPlayerFields);
  document.getElementById('btn-delete-player')?.addEventListener('click', async () => {
    const playerId = document.getElementById('edit-player-select')?.value;
    if (!playerId) {
      showToast('Selecciona primero un jugador para eliminar', 'error');
      return;
    }
    await window.deletePlayerById(Number(playerId));
  });
  document.getElementById('form-update-player')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const playerId = document.getElementById('edit-player-select').value;
    if (!playerId) return;

    try {
      const payload = {
        nationality: document.getElementById('edit-player-nationality').value.trim().toUpperCase(),
        position: document.getElementById('edit-player-position').value,
        total_goals: Number(document.getElementById('edit-player-goals').value),
        total_appearances: Number(document.getElementById('edit-player-apps').value),
        active: document.getElementById('edit-player-active').value === 'true',
        photo_url: document.getElementById('edit-player-photo-url').value.trim() || null
      };

      const res = await apiFetch(`/api/v1/players/${playerId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      showToast(res.message || 'Jugador actualizado', 'success');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 3. Crear Temporada
  document.getElementById('season-year-start')?.addEventListener('input', updateSmartSeasonRules);
  document.getElementById('season-format')?.addEventListener('change', updateSeasonPhasesPreviewText);

  document.getElementById('form-create-season')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const championVal = document.getElementById('season-champion').value;
      const runnerUpVal = document.getElementById('season-runner-up').value;
      const scorerVal = document.getElementById('season-top-scorer').value;

      const payload = {
        year_start: Number(document.getElementById('season-year-start').value),
        year_end: Number(document.getElementById('season-year-end').value),
        format: document.getElementById('season-format').value,
        teams_count: Number(document.getElementById('season-teams-count').value),
        champion_id: championVal ? Number(championVal) : null,
        runner_up_id: runnerUpVal ? Number(runnerUpVal) : null,
        top_scorer_id: scorerVal ? Number(scorerVal) : null
      };

      const res = await apiFetch('/api/v1/seasons', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(res.message || 'Temporada y fases creadas', 'success');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 3.1 Actualizar Cuadro de Honor de Temporada
  document.getElementById('edit-season-select')?.addEventListener('change', syncEditSeasonFields);
  document.getElementById('form-update-season')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const seasonId = document.getElementById('edit-season-select').value;
    if (!seasonId) return;

    try {
      const championVal = document.getElementById('edit-season-champion').value;
      const runnerUpVal = document.getElementById('edit-season-runner-up').value;
      const scorerVal = document.getElementById('edit-season-top-scorer').value;

      const payload = {
        champion_id: championVal ? Number(championVal) : null,
        runner_up_id: runnerUpVal ? Number(runnerUpVal) : null,
        top_scorer_id: scorerVal ? Number(scorerVal) : null
      };

      const res = await apiFetch(`/api/v1/seasons/${seasonId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      showToast(res.message || 'Cuadro de honor actualizado', 'success');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 4. Asignar Jugador a Plantilla (SquadMember)
  document.getElementById('form-create-squad')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const seasonId = Number(document.getElementById('squad-season').value);
      const clubId = Number(document.getElementById('squad-club').value);
      const playerId = Number(document.getElementById('squad-player').value);
      const shirtVal = document.getElementById('squad-shirt').value;
      const roleVal = document.getElementById('squad-role').value;

      const payload = {
        season_id: seasonId,
        club_id: clubId,
        player_id: playerId,
        shirt_number: shirtVal ? Number(shirtVal) : null,
        role: roleVal
      };

      const res = await apiFetch('/api/v1/squads', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(res.message || 'Jugador asignado a la plantilla', 'success');

      // Sincronizar los selectores del Explorador (Bloque B) con el club y temporada recién asignados
      const expSeason = document.getElementById('explorer-squad-season');
      const expClub = document.getElementById('explorer-squad-club');
      if (expSeason) expSeason.value = String(seasonId);
      if (expClub) expClub.value = String(clubId);

      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 5. Crear Partido + Estado de Suspensión + Incidencias en un solo flujo
  document.getElementById('match-season')?.addEventListener('change', loadPhasesForSelectedMatchSeason);
  document.getElementById('match-phase')?.addEventListener('change', updateAdaptiveMatchFormRules);
  document.getElementById('match-home-team')?.addEventListener('change', autoFillHomeStadium);

  document.getElementById('form-create-match')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const homeId = Number(document.getElementById('match-home-team').value);
      const awayId = Number(document.getElementById('match-away-team').value);

      if (homeId === awayId) {
        showToast('El club local y el visitante deben ser equipos distintos', 'error');
        return;
      }

      const groupSelect = document.getElementById('match-group');
      const matchdayVal = document.getElementById('match-matchday').value;
      const rawDate = document.getElementById('match-date').value;
      const statusVal = document.getElementById('match-status').value;

      const suspendedAtRaw = document.getElementById('match-suspended-at').value;
      const suspendedMinRaw = document.getElementById('match-suspended-minute').value;
      const resumedAtRaw = document.getElementById('match-resumed-at').value;
      const suspensionReasonRaw = document.getElementById('match-suspension-reason').value.trim();

      const payload = {
        season_id: Number(document.getElementById('match-season').value),
        phase_id: Number(document.getElementById('match-phase').value),
        matchday: matchdayVal ? Number(matchdayVal) : null,
        group_name: !groupSelect.disabled && groupSelect.value ? groupSelect.value : null,
        home_team_id: homeId,
        away_team_id: awayId,
        home_score: Number(document.getElementById('match-home-score').value) || 0,
        away_score: Number(document.getElementById('match-away-score').value) || 0,
        match_date: new Date(rawDate).toISOString(),
        stadium: document.getElementById('match-stadium').value.trim(),
        status: statusVal,
        suspended_at: statusVal !== 'FINISHED' && suspendedAtRaw ? new Date(suspendedAtRaw).toISOString() : null,
        suspended_minute: statusVal !== 'FINISHED' && suspendedMinRaw ? Number(suspendedMinRaw) : null,
        resumed_at: statusVal !== 'FINISHED' && resumedAtRaw ? new Date(resumedAtRaw).toISOString() : null,
        suspension_reason: statusVal !== 'FINISHED' && suspensionReasonRaw ? suspensionReasonRaw : null,
        events: state.draftMatchEvents
      };

      const res = await apiFetch('/api/v1/matches', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(res.message || 'Partido registrado exitosamente', 'success');
      state.draftMatchEvents = [];
      renderDraftEventsList();
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 5.1 Agregar Incidencia a Partido Ya Registrado
  document.getElementById('form-create-event')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const matchId = document.getElementById('event-match').value;
    if (!matchId) {
      showToast('Selecciona primero un partido', 'error');
      return;
    }

    try {
      const extraVal = document.getElementById('event-extra-minute').value;
      const detailVal = document.getElementById('event-detail').value.trim();

      const payload = {
        player_id: Number(document.getElementById('event-player').value),
        type: document.getElementById('event-type').value,
        minute: Number(document.getElementById('event-minute').value),
        extra_minute: extraVal ? Number(extraVal) : null,
        detail: detailVal || null
      };

      const res = await apiFetch(`/api/v1/matches/${matchId}/events`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(res.message || 'Incidencia registrada con éxito', 'success');
      document.getElementById('event-extra-minute').value = '';
      document.getElementById('event-detail').value = '';
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ==================== ESCAPE HTML SEGURO ====================
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==================== INICIALIZACIÓN AL CARGAR EL DOM ====================
document.addEventListener('DOMContentLoaded', async () => {
  const matchDateInput = document.getElementById('match-date');
  if (matchDateInput) {
    const now = new Date();
    now.setHours(20, 0, 0, 0);
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    matchDateInput.value = localIso;
  }

  renderUefaCountrySelect('club-country');
  renderUefaCountrySelect('edit-club-country');
  renderUefaCountrySelect('player-nationality');
  renderUefaCountrySelect('edit-player-nationality');
  renderUefaCountrySelect('modal-player-nat');

  setupTabs();
  setupAuthHandlers();
  setupImageUploaders();
  setupDraftEventsBuilder();
  setupQuickPlayerModal();
  setupSearchFilters();
  setupFormSubmissions();
  updateSmartSeasonRules();

  resetAuthForms();

  if (state.token) {
    await verifyAndUnlock(state.token, false);
  }
});
