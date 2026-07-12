// Estado global
let currentUser = { name: "", group: "", gender: "", age: "", country: "" };
let currentQuestionIndex = 0;
let currentQuestions = [];
let answers = [];
let currentMode = 'adults';
let currentLang = 'es';

// Constante en la nube para persistencia global
const CLOUD_API_URL = "https://jsonblob.com/api/jsonBlob/019f56c1-ff28-78c0-96e4-7b245e1c6524";

document.addEventListener('DOMContentLoaded', async () => {
    // Detectar idioma
    let langToSet = localStorage.getItem('vak_lang');
    if (!langToSet) {
        langToSet = 'es';
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('en')) langToSet = 'en';
        else if (browserLang.startsWith('pt')) langToSet = 'pt';
        else if (browserLang.startsWith('zh')) langToSet = 'zh';
        else if (browserLang.startsWith('ru')) langToSet = 'ru';
    }

    changeLang(langToSet);
    await loadCountries();
    initWizard();
});

// --- NAVEGACIÓN POR PESTAÑAS ---
window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (!btn.classList.contains('lang-btn') && !btn.hasAttribute('href')) {
            btn.classList.remove('active');
        }
    });
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.remove('hidden');
        targetTab.classList.add('active');
    }
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (tabId === 'tab-stats' && typeof loadStats === 'function') loadStats();
    if (tabId === 'tab-comments' && typeof loadComments === 'function') loadComments();
};

// Dropdown Logic
function toggleLangMenu() {
    const menu = document.getElementById('lang-menu');
    menu.classList.toggle('hidden');
    const btn = document.getElementById('lang-btn');
    if (btn) btn.setAttribute('aria-expanded', !menu.classList.contains('hidden'));
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.lang-switcher')) {
        document.getElementById('lang-menu')?.classList.add('hidden');
        document.getElementById('lang-btn')?.setAttribute('aria-expanded', 'false');
    }
});

function changeLang(lang) {
    if (!window.i18n[lang]) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    
    // Save preference
    localStorage.setItem('vak_lang', lang);
    
    // Update button text
    const btn = document.getElementById('lang-btn');
    if (btn) btn.innerHTML = `${lang.toUpperCase()} ▾`;
    
    // Close menu
    document.getElementById('lang-menu')?.classList.add('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'false');

    // Actualizar todos los elementos con data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (window.i18n[lang].ui[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = window.i18n[lang].ui[key];
            } else if (el.tagName === 'OPTION') {
                el.innerText = window.i18n[lang].ui[key];
            } else {
                el.innerHTML = window.i18n[lang].ui[key];
            }
        }
    });

    // Si estamos en plena prueba, actualizar los textos de la pregunta actual
    if (document.getElementById('question-screen') && document.getElementById('question-screen').classList.contains('active')) {
        currentQuestions = currentMode === 'kids' ? window.i18n[currentLang].questionsKids : window.i18n[currentLang].questionsAdults;
        renderQuestion();
    }
}

async function loadCountries() {
    const select = document.getElementById('user-country');
    const defaultOpt = document.createElement('option');
    defaultOpt.value = "";
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    defaultOpt.setAttribute('data-i18n', 'selectCountryDef');
    defaultOpt.innerText = window.i18n[currentLang].ui.selectCountryDef;
    select.innerHTML = '';
    select.appendChild(defaultOpt);

    let countriesLoaded = false;
    try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name');
        const data = await res.json();
        
        if (Array.isArray(data)) {
            data.sort((a, b) => a.name.common.localeCompare(b.name.common));
            data.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.name.common;
                opt.innerText = c.name.common; 
                select.appendChild(opt);
            });
            countriesLoaded = true;
        }
    } catch (e) {
        console.error("Error cargando países", e);
    }
    
    // Lista de respaldo en caso de que la API falle
    if (!countriesLoaded) {
        const fallback = ["Argentina", "Bolivia", "Brasil", "Canadá", "Chile", "Colombia", "Costa Rica", "Cuba", "Ecuador", "El Salvador", "España", "Estados Unidos", "Guatemala", "Honduras", "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "Puerto Rico", "República Dominicana", "Uruguay", "Venezuela", "Otro"];
        fallback.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c; opt.innerText = c;
            select.appendChild(opt);
        });
    }

    // Populate link-country-select (Teacher generator) by cloning the options from user-country
    const linkSelect = document.getElementById('link-country-select');
    linkSelect.innerHTML = '<option value="" disabled selected>-- Detectando País... --</option>';
    for (let i = 1; i < select.options.length; i++) { // Skip index 0 ("Cargando países")
        const opt = document.createElement('option');
        opt.value = select.options[i].value;
        opt.innerText = select.options[i].innerText;
        linkSelect.appendChild(opt);
    }

    // Auto-detectar país por IP y seleccionarlo en ambos formularios
    try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        
        // Re-establecer default en caso de que falle
        linkSelect.options[0].innerText = "-- Elige tu país --";
        
        if (ipData && ipData.country_name) {
            let found = false;
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === ipData.country_name || select.options[i].value.includes(ipData.country_name)) {
                    select.selectedIndex = i;
                    linkSelect.selectedIndex = i; // Seleccionar también en Docente
                    found = true;
                    break;
                }
            }
            if (!found) {
                const opt = document.createElement('option');
                opt.value = ipData.country_name;
                opt.innerText = ipData.country_name;
                select.appendChild(opt);
                select.selectedIndex = select.options.length - 1;
                
                const optLink = document.createElement('option');
                optLink.value = ipData.country_name;
                optLink.innerText = ipData.country_name;
                linkSelect.appendChild(optLink);
                linkSelect.selectedIndex = linkSelect.options.length - 1;
            }
        }
    } catch (e) {
        linkSelect.options[0].innerText = "-- Elige tu país --";
        console.error("Error detectando IP", e);
    }
}

// Inicializar idioma y países
// Inicializar idioma
changeLang('es');


// --- LÓGICA DEL GENERADOR DE ENLACES (DOCENTES) ---
document.getElementById('generate-link-btn').addEventListener('click', async () => {
    const groupInput = document.getElementById('link-group');
    const group = groupInput.value.trim().toUpperCase();
    const country = document.getElementById('link-country-select').value;
    const errorMsg = document.getElementById('link-group-error');
    
    const regex = /^[A-Z]{3}[0-9]{3}$/;
    if (!regex.test(group)) {
        errorMsg.classList.remove('hidden');
        groupInput.focus();
        return;
    } else {
        errorMsg.classList.add('hidden');
    }
    
    if (!country) return alert("Por favor selecciona un país para el grupo.");

    document.getElementById('generate-link-btn').innerText = "Validando...";
    
    // Verificar si el grupo ya existe
    try {
        const db = await getDB();
        const existingGroups = [...new Set(db.map(item => item.group))];
        if (existingGroups.includes(group)) {
            const confirmAdd = confirm("⚠️ ATENCIÓN: Ya existen resultados guardados bajo el grupo '" + group + "'.\n\nSi creas este enlace, los nuevos alumnos se sumarán al grupo existente.\n\n¿Deseas continuar?");
            if (!confirmAdd) {
                document.getElementById('generate-link-btn').innerText = "Generar Enlace Seguro";
                return;
            }
        }
    } catch (e) {
        console.error("No se pudo validar el grupo, procediendo de todos modos.");
    }
    
    document.getElementById('generate-link-btn').innerText = "Generar enlace";
    
    let url = window.location.origin + window.location.pathname + "?group=" + encodeURIComponent(group);
    if (country) url += "&country=" + encodeURIComponent(country);
    
    document.getElementById('generated-link').value = url;
    document.getElementById('link-result-container').classList.remove('hidden');
    document.getElementById('copy-success-msg').style.display = 'none'; // reset
    
    // Guardar para futuros usos
    localStorage.setItem('vak_last_group', group);
    localStorage.setItem('vak_last_country', country);
    checkLastGroupLink();
});

document.getElementById('copy-link-btn').addEventListener('click', () => {
    const linkInput = document.getElementById('generated-link');
    linkInput.select();
    document.execCommand('copy'); // Legacy fallback
    if (navigator.clipboard) navigator.clipboard.writeText(linkInput.value);
    
    const btn = document.getElementById('copy-link-btn');
    btn.innerText = "✅ Copiado";
    document.getElementById('copy-success-msg').style.display = 'block';
    
    setTimeout(() => {
        btn.innerText = "📋 Copiar";
        document.getElementById('copy-success-msg').style.display = 'none';
    }, 4000);
});

document.getElementById('whatsapp-link-btn').addEventListener('click', () => {
    const url = document.getElementById('generated-link').value;
    const text = `¡Hola! Por favor completa tu Test de Estilos de Aprendizaje VAK ingresando a este enlace (ya tiene nuestro código de grupo configurado):\n\n${url}`;
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
});

// Chequear si hay un grupo previo guardado
function checkLastGroupLink() {
    const lastGroup = localStorage.getItem('vak_last_group');
    const linkEl = document.getElementById('use-last-code-link');
    if (lastGroup) {
        document.getElementById('last-code-val').innerText = lastGroup;
        linkEl.style.display = 'inline-block';
        linkEl.onclick = (e) => {
            e.preventDefault();
            document.getElementById('link-group').value = lastGroup;
            const lastCountry = localStorage.getItem('vak_last_country');
            if (lastCountry) {
                const select = document.getElementById('link-country-select');
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].value === lastCountry) {
                        select.selectedIndex = i;
                        break;
                    }
                }
            }
        };
    } else {
        linkEl.style.display = 'none';
    }
}
checkLastGroupLink();

// --- PANTALLAS DEL TEST ---
const screens = {
    welcome: document.getElementById('welcome-screen'),
    start: document.getElementById('start-screen'),
    question: document.getElementById('question-screen'),
    result: document.getElementById('result-screen')
};

function showScreen(screenName) {
    Object.values(screens).forEach(s => { s.classList.remove('active'); s.classList.add('hidden'); });
    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('active');
}

// Wizard en 2 pasos para onboarding
function initWizard() {
    const params = new URLSearchParams(window.location.search);
    const groupParam = params.get('group');
    const countryParam = params.get('country');

    if (groupParam) {
        document.getElementById('user-group').value = groupParam.toUpperCase();
        if (countryParam) {
            const countrySelect = document.getElementById('user-country');
            if (countrySelect) countrySelect.value = countryParam;
        }
        advanceToStep2(groupParam.toUpperCase(), countryParam || "Paraguay");
    }
}

function advanceToStep2(groupVal, countryVal) {
    const step2 = document.getElementById('wizard-step-2');
    const summaryTag = document.getElementById('step-1-summary');
    const intro = document.getElementById('welcome-intro');

    if (summaryTag) summaryTag.innerText = `✅ ${groupVal} – ${countryVal}`;
    if (step2) step2.classList.remove('hidden-step');
    if (intro) intro.style.display = 'none';

    setTimeout(() => {
        document.getElementById('user-name')?.focus();
    }, 100);
}

document.getElementById('step-1-btn')?.addEventListener('click', () => {
    const groupVal = document.getElementById('user-group').value.trim().toUpperCase();
    const countryVal = document.getElementById('user-country').value || "No especificado";
    const errorMsg = document.getElementById('group-error');
    const regex = /^[a-zA-Z]{3}[0-9]{3}$/;

    if (!regex.test(groupVal)) {
        errorMsg.classList.remove('hidden');
        document.getElementById('user-group').focus();
        return;
    }
    errorMsg.classList.add('hidden');
    advanceToStep2(groupVal, countryVal);
});

document.getElementById('step-2-back')?.addEventListener('click', () => {
    document.getElementById('user-group')?.focus();
});

// 1. Validar Usuario y Grupo
document.getElementById('continue-btn').addEventListener('click', () => {
    const nameVal = document.getElementById('user-name').value.trim();
    const groupVal = document.getElementById('user-group').value.trim().toUpperCase();
    const genderVal = document.getElementById('user-gender').value;
    const ageVal = document.getElementById('user-age').value;
    const countryVal = document.getElementById('user-country').value || "No especificado";
    const errorMsg = document.getElementById('group-error');
    
    // Regex: exactly 3 letters + 3 numbers
    const regex = /^[a-zA-Z]{3}[0-9]{3}$/;
    
    if (!nameVal || !groupVal || !ageVal) {
        alert(currentLang === 'es' ? "Por favor completa Nombre, Grupo y Edad." : "Please fill out Name, Group, and Age.");
        return;
    }
    
    if (!regex.test(groupVal)) {
        errorMsg.classList.remove('hidden');
        return;
    } else {
        errorMsg.classList.add('hidden');
    }
    
    const ageNum = parseInt(ageVal);
    if (isNaN(ageNum) || ageNum < 6 || ageNum > 99) {
        document.getElementById('age-error').classList.remove('hidden');
        return;
    } else {
        document.getElementById('age-error').classList.add('hidden');
    }
    
    currentUser.name = nameVal;
    currentUser.group = groupVal.toUpperCase();
    currentUser.gender = genderVal; // This string depends on the language! Let's standardize it.
    // Estandarizar el género internamente en español:
    if (!genderVal) {
        currentUser.gender = "Otro"; // Default for optional
    } else if (genderVal.includes("Masculino") || genderVal.includes("Male") || genderVal.includes("男") || genderVal.includes("Мужской") || genderVal.includes("Kuimba'e")) {
        currentUser.gender = "Masculino";
    } else if (genderVal.includes("Femenino") || genderVal.includes("Female") || genderVal.includes("女") || genderVal.includes("Женский") || genderVal.includes("Kuña")) {
        currentUser.gender = "Femenino";
    } else {
        currentUser.gender = "Otro";
    }

    currentUser.age = parseInt(ageVal);
    currentUser.country = countryVal;
    
    document.getElementById('display-name').innerText = nameVal;
    
    // Iniciar directamente el cuestionario según la edad ingresada (sin clic intermedio redundante)
    const mode = ageNum <= 12 ? 'kids' : 'adults';
    startTest(mode);
});

// 2. Iniciar Test
document.getElementById('start-kids-btn').addEventListener('click', () => startTest('kids'));
document.getElementById('start-adults-btn').addEventListener('click', () => startTest('adults'));

function startTest(mode) {
    currentMode = mode;
    currentQuestions = mode === 'kids' ? window.i18n[currentLang].questionsKids : window.i18n[currentLang].questionsAdults;
    currentQuestionIndex = 0;
    answers = new Array(currentQuestions.length).fill(null);
    showScreen('question');
    renderQuestion();
}

function renderQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    document.getElementById('progress-text').innerText = `${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    document.getElementById('progress-fill').style.width = `${((currentQuestionIndex) / currentQuestions.length) * 100}%`;
    document.getElementById('question-title').innerText = question.q;

    const optContainer = document.getElementById('options-container');
    optContainer.innerHTML = '';
    
    let transitionTimeout = null;
    
    question.options.forEach((opt) => {
        const div = document.createElement('div');
        div.className = 'option-card';
        div.innerText = opt.t;
        if (answers[currentQuestionIndex] === opt.s) div.classList.add('selected');
        
        div.addEventListener('click', (e) => {
            if (transitionTimeout) return; // Evitar doble clic
            
            optContainer.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            e.target.classList.add('selected');
            answers[currentQuestionIndex] = opt.s;
            
            transitionTimeout = setTimeout(() => {
                transitionTimeout = null;
                nextQuestion();
            }, 350);
        });
        optContainer.appendChild(div);
    });

    const prevBtn = document.getElementById('prev-btn');
    if (currentQuestionIndex === 0) prevBtn.classList.add('hidden');
    else prevBtn.classList.remove('hidden');
}

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentQuestionIndex > 0) { currentQuestionIndex--; renderQuestion(); }
});

function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++; renderQuestion();
    } else {
        calculateResults();
    }
}

function calculateResults() {
    const counts = { V: 0, A: 0, K: 0 };
    answers.forEach(ans => { if (ans) counts[ans]++; });
    
    // Base math on actual answers to avoid < 100% if someone skips via bugs
    const answeredTotal = counts.V + counts.A + counts.K;
    const total = answeredTotal > 0 ? answeredTotal : 1; 
    
    let pV = Math.round((counts.V / total) * 100);
    let pA = Math.round((counts.A / total) * 100);
    let pK = Math.round((counts.K / total) * 100);

    // Forzar que la sumatoria sea exactamente 100% corrigiendo desfases de redondeo
    const sum = pV + pA + pK;
    if (sum > 0 && sum !== 100) {
        const diff = 100 - sum;
        if (pV >= pA && pV >= pK) pV += diff;
        else if (pA >= pV && pA >= pK) pA += diff;
        else pK += diff;
    }

    let max = Math.max(pV, pA, pK);
    const dominants = [];
    if (pV === max) dominants.push("Visual");
    if (pA === max) dominants.push("Auditivo");
    if (pK === max) dominants.push("Kinestésico");
    
    let dominantName = dominants.length > 1 ? "Multimodal (" + dominants.join(" - ") + ")" : dominants[0];

    // Mostrar UI
    document.getElementById('res-name').innerText = currentUser.name;
    document.getElementById('res-group').innerText = currentUser.group;
    document.getElementById('res-gender').innerText = currentUser.gender;
    document.getElementById('dominant-style').innerText = dominantName;
    document.getElementById('pct-v').innerText = `${pV}%`;
    document.getElementById('pct-a').innerText = `${pA}%`;
    document.getElementById('pct-k').innerText = `${pK}%`;

    document.getElementById('bar-v').style.width = '0%';
    document.getElementById('bar-a').style.width = '0%';
    document.getElementById('bar-k').style.width = '0%';

    showScreen('result');
    setTimeout(() => {
        document.getElementById('bar-v').style.width = `${pV}%`;
        document.getElementById('bar-a').style.width = `${pA}%`;
        document.getElementById('bar-k').style.width = `${pK}%`;
    }, 100);

    const descEl = document.getElementById('result-description');
    if (dominants.length > 1) {
        descEl.innerHTML = "<strong>¡Tienes un estilo equilibrado!</strong> Tu cerebro es muy flexible y procesa de múltiples formas.";
    } else {
        if (dominantName === "Visual") descEl.innerHTML = "<strong>Tu punto fuerte es la visión.</strong> Procesas muy bien las imágenes, mapas y esquemas.";
        else if (dominantName === "Auditivo") descEl.innerHTML = "<strong>Tu punto fuerte es la escucha.</strong> Entiendes genial a través de explicaciones orales y debates.";
        else if (dominantName === "Kinestésico") descEl.innerHTML = "<strong>Tu punto fuerte es el hacer.</strong> Tu cuerpo necesita involucrarse física y espacialmente.";
    }

    // GUARDAR EN LOCAL Y NUBE
    saveResultToDB(currentUser.name, currentUser.group, currentUser.gender, currentUser.age, currentUser.country, pV, pA, pK, dominants[0]);
}

document.getElementById('download-btn').addEventListener('click', () => {
    const captureArea = document.getElementById('capture-area');
    html2canvas(captureArea, { backgroundColor: '#1e293b' }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Resultado_VAK_${currentUser.name}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('user-name').value = '';
    document.getElementById('user-group').value = '';
    document.getElementById('user-gender').value = '';
    document.getElementById('user-age').value = '';
    document.getElementById('user-country').value = '';
    showScreen('welcome');
});

// --- CLOUD DATABASE (JSONBlob) ---
async function getDB() {
    try {
        const res = await fetch(CLOUD_API_URL);
        const data = await res.json();
        // Fallback al formato antiguo si el servidor devuelve arreglo, pero ahora será objeto
        if (Array.isArray(data)) return data; 
        if (data && data.results) return data.results;
        return [];
    } catch (e) {
        console.error("Error leyendo de la nube, usando local", e);
        const local = localStorage.getItem('vak_db');
        return local ? JSON.parse(local) : [];
    }
}

async function saveResultToDB(name, group, gender, age, country, v, a, k, mainStyle) {
    let currentData = { results: [], comments: [] };
    try {
        const res = await fetch(CLOUD_API_URL);
        currentData = await res.json();
        if (Array.isArray(currentData)) currentData = { results: currentData, comments: [] }; // Migración
    } catch (e) {}

    if (!currentData.results) currentData.results = [];

    currentData.results.push({
        id: Date.now().toString(),
        name: name,
        group: group,
        gender: gender,
        age: age,
        country: country,
        v: v, a: a, k: k,
        mainStyle: mainStyle
    });
    
    // Backup local
    localStorage.setItem('vak_db', JSON.stringify(currentData.results));

    // Guardar en la nube
    try {
        await fetch(CLOUD_API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentData)
        });
    } catch (e) {
        console.error("Error guardando en la nube", e);
    }
}

// --- ESTADÍSTICAS GRUPALES (CHART.JS) ---
let chartPieInstance = null;
let chartBarInstance = null;
let chartCountriesInstance = null;
let chartGenderInstance = null;
let chartAgeStyleInstance = null;
let chartAgeDistInstance = null;

// Impresión del Reporte
document.getElementById('print-stats-btn').addEventListener('click', () => {
    window.print();
});

async function loadStats() {
    // Se muestra estado de carga si lo deseas, acá bloquea hasta descargar
    document.getElementById('no-data-msg').innerText = "Cargando datos de la nube...";
    document.getElementById('no-data-msg').classList.remove('hidden');
    document.getElementById('stats-container').classList.add('hidden');

    const db = await getDB();
    const selector = document.getElementById('group-selector');
    const container = document.getElementById('stats-container');
    const noData = document.getElementById('no-data-msg');

    // Extraer grupos únicos
    const groups = [...new Set(db.map(item => item.group))].sort();
    
    // Rellenar selector (manteniendo opción por defecto)
    selector.innerHTML = '<option value="TODOS">Todos los Grupos (Global)</option>';
    groups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g; opt.innerText = `Grupo: ${g}`;
        selector.appendChild(opt);
    });

    if (db.length === 0) {
        container.classList.add('hidden');
        noData.innerText = "Aún no hay datos para mostrar en la nube.";
        noData.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    noData.classList.add('hidden');

    // Trigger gráfico inicial
    selector.onchange = () => drawCharts(selector.value, db);
    drawCharts('TODOS', db);
}

function drawCharts(selectedGroup, db) {
    const data = selectedGroup === 'TODOS' ? db : db.filter(item => item.group === selectedGroup);
    
    if (data.length === 0) return;

    // --- CALCULAR KPIs ---
    let countV = 0, countA = 0, countK = 0;
    let sumV = 0, sumA = 0, sumK = 0;
    let countM = 0, countF = 0, countO = 0;
    let sumAge = 0;
    let countKids = 0; // <= 12
    let countAdults = 0; // 13+
    
    // Variables for advanced charts
    const countriesCount = {};
    const genderStyles = { M: {V:0, A:0, K:0}, F: {V:0, A:0, K:0}, O: {V:0, A:0, K:0} };
    const ageGroupsStyles = { Kids: {V:0, A:0, K:0}, Adults: {V:0, A:0, K:0} };
    const ageDist = {};

    data.forEach(item => {
        if (item.mainStyle === "Visual") countV++;
        else if (item.mainStyle === "Auditivo") countA++;
        else if (item.mainStyle === "Kinestésico") countK++;

        sumV += item.v; sumA += item.a; sumK += item.k;
        
        let gKey = 'O';
        if (item.gender === "Masculino") { countM++; gKey = 'M'; }
        else if (item.gender === "Femenino") { countF++; gKey = 'F'; }
        else countO++;

        // Advanced: Gender vs Style
        if (item.mainStyle === "Visual") genderStyles[gKey].V++;
        else if (item.mainStyle === "Auditivo") genderStyles[gKey].A++;
        else if (item.mainStyle === "Kinestésico") genderStyles[gKey].K++;

        // Advanced: Countries
        let c = item.country || "Desconocido";
        countriesCount[c] = (countriesCount[c] || 0) + 1;

        if (item.age) {
            sumAge += item.age;
            let aKey = 'Adults';
            if (item.age <= 12) { countKids++; aKey = 'Kids'; }
            else { countAdults++; }
            
            // Advanced: Age distribution
            ageDist[item.age] = (ageDist[item.age] || 0) + 1;
            
            // Advanced: Age vs Style
            if (item.mainStyle === "Visual") ageGroupsStyles[aKey].V++;
            else if (item.mainStyle === "Auditivo") ageGroupsStyles[aKey].A++;
            else if (item.mainStyle === "Kinestésico") ageGroupsStyles[aKey].K++;
        }
    });

    const total = data.length;
    const avgV = (sumV / total).toFixed(1);
    const avgA = (sumA / total).toFixed(1);
    const avgK = (sumK / total).toFixed(1);
    const avgAge = sumAge > 0 ? (sumAge / total).toFixed(1) : 0;

    // Update KPI Cards
    document.getElementById('kpi-total').innerText = total;
    
    const pctM = total > 0 ? (countM/total*100).toFixed(1) : 0;
    const pctF = total > 0 ? (countF/total*100).toFixed(1) : 0;
    const pctO = total > 0 ? (countO/total*100).toFixed(1) : 0;
    document.getElementById('kpi-gender-visual').innerHTML = `
        <div style="width: ${pctM}%; background: #3b82f6;" title="Masculino: ${countM}"></div>
        <div style="width: ${pctF}%; background: #ec4899;" title="Femenino: ${countF}"></div>
        <div style="width: ${pctO}%; background: #a8a29e;" title="Otro: ${countO}"></div>
    `;

    document.getElementById('kpi-age-badges').innerHTML = `
        <span class="kpi-badge badge-kids">🧒 ≤12 <span class="badge-label-small">(${countKids})</span></span>
        <span class="kpi-badge badge-adults">🧑 13+ <span class="badge-label-small">(${countAdults})</span></span>
    `;
    
    document.getElementById('kpi-avg-age').innerText = avgAge > 0 ? `Promedio: ${avgAge} años` : '';

    // --- POBLAR LISTA DE ALUMNOS (CHIPS) ---
    const listEl = document.getElementById('students-chips-list');
    listEl.innerHTML = '';
    
    // Add "Promedio General" as first option
    const avgItem = document.createElement('div');
    avgItem.className = 'student-chip selected';
    avgItem.innerHTML = `<span class="chip-icon">🏆</span> Promedio Global`;
    avgItem.onclick = () => {
        document.querySelectorAll('.student-chip').forEach(el => el.classList.remove('selected'));
        avgItem.classList.add('selected');
        renderStudentComparison(null, avgV, avgA, avgK);
        renderBarChart(avgV, avgA, avgK, null, null);
    };
    listEl.appendChild(avgItem);

    // Add each student
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'student-chip';
        let icon = item.mainStyle === 'Visual' ? '👁️' : (item.mainStyle === 'Auditivo' ? '👂' : '✋');
        if (item.mainStyle && item.mainStyle.includes("Multimodal")) icon = '🧠';
        const shortName = item.name.split(' ')[0] + (item.name.split(' ').length > 1 ? ' ' + item.name.split(' ')[1][0] + '.' : '');
        
        div.innerHTML = `<span class="chip-icon">${icon}</span> ${shortName}`;
        div.onclick = () => {
            document.querySelectorAll('.student-chip').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            renderStudentComparison(item, avgV, avgA, avgK);
            renderBarChart(avgV, avgA, avgK, item, shortName);
        };
        listEl.appendChild(div);
    });
    
    // Reseteamos el panel al promedio inicialmente
    renderStudentComparison(null, avgV, avgA, avgK);

    Chart.defaults.color = '#f8fafc';
    Chart.defaults.font.family = 'Inter';

    // 1. PIE CHART
    const ctxPie = document.getElementById('chart-pie').getContext('2d');
    if (chartPieInstance) chartPieInstance.destroy();
    chartPieInstance = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Visual', 'Auditivo', 'Kinestésico'],
            datasets: [{
                data: [countV, countA, countK],
                backgroundColor: ['#ec4899', '#8b5cf6', '#14b8a6'],
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });

    // 2. BAR CHART (Avg VAK)
    renderBarChart(avgV, avgA, avgK, null, null);

    // 3. COUNTRIES (Pie)
    const ctxCountries = document.getElementById('chart-countries').getContext('2d');
    if (chartCountriesInstance) chartCountriesInstance.destroy();
    chartCountriesInstance = new Chart(ctxCountries, {
        type: 'pie',
        data: {
            labels: Object.keys(countriesCount),
            datasets: [{
                data: Object.values(countriesCount),
                backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#64748b'],
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });

    // 4. GENDER vs STYLE (Stacked Bar)
    const ctxGender = document.getElementById('chart-gender').getContext('2d');
    if (chartGenderInstance) chartGenderInstance.destroy();
    chartGenderInstance = new Chart(ctxGender, {
        type: 'bar',
        data: {
            labels: ['Visual', 'Auditivo', 'Kinestésico'],
            datasets: [
                { label: 'Femenino', data: [genderStyles.F.V, genderStyles.F.A, genderStyles.F.K], backgroundColor: '#ec4899' },
                { label: 'Masculino', data: [genderStyles.M.V, genderStyles.M.A, genderStyles.M.K], backgroundColor: '#3b82f6' },
                { label: 'Otro', data: [genderStyles.O.V, genderStyles.O.A, genderStyles.O.K], backgroundColor: '#a8a29e' }
            ]
        },
        options: { scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }, plugins: { legend: { position: 'bottom' } } }
    });

    // 5. AGE RANGE vs STYLE (Bar)
    const ctxAgeStyle = document.getElementById('chart-age-style').getContext('2d');
    if (chartAgeStyleInstance) chartAgeStyleInstance.destroy();
    chartAgeStyleInstance = new Chart(ctxAgeStyle, {
        type: 'bar',
        data: {
            labels: ['Visual', 'Auditivo', 'Kinestésico'],
            datasets: [
                { label: 'Niños (≤12)', data: [ageGroupsStyles.Kids.V, ageGroupsStyles.Kids.A, ageGroupsStyles.Kids.K], backgroundColor: '#14b8a6' },
                { label: 'Adultos (13+)', data: [ageGroupsStyles.Adults.V, ageGroupsStyles.Adults.A, ageGroupsStyles.Adults.K], backgroundColor: '#f59e0b' }
            ]
        },
        options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { position: 'bottom' } } }
    });

    // 6. EXACT AGE DIST (Line/Bar)
    const ctxAgeDist = document.getElementById('chart-age-dist').getContext('2d');
    if (chartAgeDistInstance) chartAgeDistInstance.destroy();
    const sortedAges = Object.keys(ageDist).sort((a,b)=>parseInt(a)-parseInt(b));
    chartAgeDistInstance = new Chart(ctxAgeDist, {
        type: 'bar',
        data: {
            labels: sortedAges,
            datasets: [{
                label: 'Cant. de Alumnos',
                data: sortedAges.map(age => ageDist[age]),
                backgroundColor: 'rgba(139, 92, 246, 0.6)',
                borderColor: '#8b5cf6',
                borderWidth: 1
            }]
        },
        options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } }
    });
}

function renderBarChart(avgV, avgA, avgK, studentObj, studentName) {
    const ctxBar = document.getElementById('chart-bar').getContext('2d');
    if (chartBarInstance) chartBarInstance.destroy();

    const datasets = [
        {
            label: 'Promedio del Grupo',
            data: [avgV, avgA, avgK],
            backgroundColor: 'rgba(59, 130, 246, 0.4)', // Blueish
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
        }
    ];

    if (studentObj) {
        datasets.push({
            label: studentName,
            data: [studentObj.v, studentObj.a, studentObj.k],
            backgroundColor: 'rgba(250, 204, 21, 0.8)', // Gold/Yellow highlight
            borderColor: 'rgba(250, 204, 21, 1)',
            borderWidth: 2
        });
    }

    chartBarInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Visual %', 'Auditivo %', 'Kinestésico %'],
            datasets: datasets
        },
        options: { 
            scales: { y: { beginAtZero: true, max: 100 } }, 
            plugins: { 
                legend: { display: studentObj ? true : false, position: 'bottom' } 
            } 
        }
    });
}

function renderStudentComparison(studentObj, avgV, avgA, avgK) {
    const panel = document.getElementById('student-comparison-panel');
    if (!studentObj) {
        panel.innerHTML = `<div class="comparison-empty"><p>👆 Selecciona un alumno de la lista para ver su perfil comparativo con el grupo.</p></div>`;
        return;
    }
    let icon = studentObj.mainStyle === 'Visual' ? '👁️' : (studentObj.mainStyle === 'Auditivo' ? '👂' : '✋');
    if (studentObj.mainStyle && studentObj.mainStyle.includes("Multimodal")) icon = '🧠';
    
    panel.innerHTML = `
        <div class="comparison-title">
            <h3>${studentObj.name}</h3>
            <span class="comparison-badge">${icon} ${studentObj.mainStyle}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap: 15px;">
            <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.85rem;">
                    <span><strong style="color:var(--color-v)">Visual</strong>: ${studentObj.v}%</span> 
                    <span style="opacity:0.6; font-size:0.75rem;">(Grupo: ${avgV}%)</span>
                </div>
                <div class="progress-bar" style="background: rgba(255,255,255,0.05);"><div class="progress-fill fill-v" style="width: ${studentObj.v}%; border-radius: 4px;"></div></div>
            </div>
            <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.85rem;">
                    <span><strong style="color:var(--color-a)">Auditivo</strong>: ${studentObj.a}%</span> 
                    <span style="opacity:0.6; font-size:0.75rem;">(Grupo: ${avgA}%)</span>
                </div>
                <div class="progress-bar" style="background: rgba(255,255,255,0.05);"><div class="progress-fill fill-a" style="width: ${studentObj.a}%; border-radius: 4px;"></div></div>
            </div>
            <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.85rem;">
                    <span><strong style="color:var(--color-k)">Kinestésico</strong>: ${studentObj.k}%</span> 
                    <span style="opacity:0.6; font-size:0.75rem;">(Grupo: ${avgK}%)</span>
                </div>
                <div class="progress-bar" style="background: rgba(255,255,255,0.05);"><div class="progress-fill fill-k" style="width: ${studentObj.k}%; border-radius: 4px;"></div></div>
            </div>
        </div>
    `;
}

// --- COMENTARIOS ---
document.getElementById('submit-comment-btn').addEventListener('click', async () => {
    const name = document.getElementById('comment-name').value.trim();
    const text = document.getElementById('comment-text').value.trim();
    const errorEl = document.getElementById('comment-error');
    
    if (!name || !text) {
        errorEl.classList.remove('hidden');
        return;
    }
    errorEl.classList.add('hidden');
    
    document.getElementById('submit-comment-btn').innerText = "Guardando...";

    let currentData = { results: [], comments: [] };
    try {
        const res = await fetch(CLOUD_API_URL);
        currentData = await res.json();
        if (Array.isArray(currentData)) currentData = { results: currentData, comments: [] };
    } catch (e) {}

    if (!currentData.comments) currentData.comments = [];

    currentData.comments.push({
        name: name,
        text: text,
        date: new Date().toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    });
    
    // Backup local
    localStorage.setItem('vak_comments', JSON.stringify(currentData.comments));
    
    try {
        await fetch(CLOUD_API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentData)
        });
    } catch (e) {}

    document.getElementById('comment-name').value = '';
    document.getElementById('comment-text').value = '';
    document.getElementById('submit-comment-btn').innerText = "Publicar Comentario";
    loadComments();
});

async function getComments() {
    try {
        const res = await fetch(CLOUD_API_URL);
        const data = await res.json();
        if (data && data.comments) return data.comments;
        return [];
    } catch (e) {
        const local = localStorage.getItem('vak_comments');
        return local ? JSON.parse(local) : [];
    }
}

async function loadComments() {
    const listEl = document.getElementById('comments-list');
    listEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Cargando opiniones...</p>';
    
    const comments = await getComments();
    
    if (comments.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">Aún no hay comentarios. ¡Sé el primero en opinar!</p>';
        return;
    }
    
    listEl.innerHTML = '';
    
    // Reverse array to show newest first
    const reversed = [...comments].reverse();
    
    reversed.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment-box';
        
        const safeName = c.name || "Anónimo";
        
        div.innerHTML = `
            <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                <span style="font-weight: bold; color: white; margin-right: 8px;">${safeName}</span>
                <span style="font-size: 0.8rem; color: var(--text-secondary); opacity: 0.8;">· ${c.date}</span>
            </div>
            <div class="comment-body" style="color: rgba(255,255,255,0.95); font-style: italic; line-height: 1.6;">"${c.text}"</div>
        `;
        listEl.appendChild(div);
    });
}
