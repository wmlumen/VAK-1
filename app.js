// Estado global
let currentUser = { name: "", group: "", gender: "", age: "", country: "" };
let currentQuestionIndex = 0;
let currentQuestions = [];
let answers = [];
let currentMode = 'adults';
let currentLang = 'es';
const QUESTION_VERSION = '1.0.1';

// Persistencia local segura (sin nube pública insegura)
const DB_KEY = 'vak_results';
const COMMENTS_KEY = 'vak_comments';
const CONSENT_KEY = 'vak_consent';

document.addEventListener('DOMContentLoaded', async () => {
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
    loadComments();
});

// --- UTILIDADES ---
function shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}

function t(key) {
    return window.i18n[currentLang]?.ui?.[key] || key;
}

function getStyleLabel(key) {
    const map = {
        'V': window.i18n[currentLang]?.ui?.styleVisual || 'Visual',
        'A': window.i18n[currentLang]?.ui?.styleAuditory || 'Auditivo',
        'K': window.i18n[currentLang]?.ui?.styleKinesthetic || 'Kinestésico'
    };
    if (key && key.startsWith('Multimodal')) return window.i18n[currentLang]?.ui?.styleMultimodal || 'Multimodal';
    return map[key] || key || '—';
}

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

    localStorage.setItem('vak_lang', lang);

    const btn = document.getElementById('lang-btn');
    if (btn) btn.innerHTML = `${lang.toUpperCase()} ▾`;

    document.getElementById('lang-menu')?.classList.add('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'false');

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

    if (document.getElementById('question-screen') && document.getElementById('question-screen').classList.contains('active')) {
        currentQuestions = currentMode === 'kids' ? window.i18n[currentLang].questionsKids : window.i18n[currentLang].questionsAdults;
        renderQuestion();
    }

    if (document.getElementById('tab-stats') && document.getElementById('tab-stats').classList.contains('active')) {
        loadStats();
    }
}

// --- IDIOMA Y PAÍSES ---
async function loadCountries() {
    const select = document.getElementById('user-country');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Cargando países...</option>';

    let countriesLoaded = false;

    const fetchWithTimeout = (url, timeoutMs = 5000) => {
        return Promise.race([
            fetch(url),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
        ]);
    };

    try {
        const res = await fetchWithTimeout('https://restcountries.com/v3.1/all?fields=name');
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
            const sorted = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
            select.innerHTML = '';
            const defaultOpt = document.createElement('option');
            defaultOpt.value = "";
            defaultOpt.disabled = true;
            defaultOpt.selected = true;
            defaultOpt.setAttribute('data-i18n', 'selectCountryDef');
            defaultOpt.innerText = window.i18n[currentLang].ui.selectCountryDef || '-- Elige tu país --';
            select.appendChild(defaultOpt);

            sorted.forEach(c => {
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

    if (!countriesLoaded) {
        select.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = "";
        defaultOpt.disabled = true;
        defaultOpt.selected = true;
        defaultOpt.innerText = '-- Elige tu país --';
        select.appendChild(defaultOpt);

        const fallback = ["Argentina", "Bolivia", "Brasil", "Canadá", "Chile", "Colombia", "Costa Rica", "Cuba", "Ecuador", "El Salvador", "España", "Estados Unidos", "Guatemala", "Honduras", "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "Puerto Rico", "República Dominicana", "Uruguay", "Venezuela", "Otro"];
        fallback.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c; opt.innerText = c;
            select.appendChild(opt);
        });
    }

    const linkSelect = document.getElementById('link-country-select');
    if (linkSelect) {
        linkSelect.innerHTML = '<option value="" disabled selected>-- Elige tu país --</option>';
        for (let i = 1; i < select.options.length; i++) {
            const opt = document.createElement('option');
            opt.value = select.options[i].value;
            opt.innerText = select.options[i].innerText;
            linkSelect.appendChild(opt);
        }
    }

    try {
        const ipRes = await fetchWithTimeout('https://ipapi.co/json/', 4000);
        const ipData = await ipRes.json();

        if (ipData && ipData.country_name && linkSelect) {
            linkSelect.options[0].innerText = "-- Elige tu país --";
            let found = false;
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === ipData.country_name || select.options[i].value.includes(ipData.country_name)) {
                    select.selectedIndex = i;
                    linkSelect.selectedIndex = i;
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
        if (linkSelect && linkSelect.options[0]) linkSelect.options[0].innerText = "-- Elige tu país --";
        console.error("Error detectando IP", e);
    }
}

// --- LÓGICA DEL GENERADOR DE ENLACES (DOCENTES) ---
document.getElementById('generate-link-btn')?.addEventListener('click', async () => {
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

    try {
        const db = getAllResults();
        const existingGroups = [...new Set(db.map(item => item.group))];
        if (existingGroups.includes(group)) {
            const confirmAdd = confirm(`ATENCIÓN: Ya existen resultados guardados bajo el grupo '${group}'.\n\nSi creas este enlace, los nuevos alumnos se sumarán al grupo existente en este dispositivo.\n\n¿Deseas continuar?`);
            if (!confirmAdd) {
                document.getElementById('generate-link-btn').innerText = "Generar Enlace Seguro";
                return;
            }
        }
    } catch (e) {
        console.error("No se pudo validar el grupo, procediendo de todos modos.", e);
    }

    document.getElementById('generate-link-btn').innerText = "Generar enlace";

    let url = window.location.origin + window.location.pathname + "?group=" + encodeURIComponent(group);
    if (country) url += "&country=" + encodeURIComponent(country);

    document.getElementById('generated-link').value = url;
    document.getElementById('link-result-container').classList.remove('hidden');
    document.getElementById('copy-success-msg').style.display = 'none';

    localStorage.setItem('vak_last_group', group);
    localStorage.setItem('vak_last_country', country);
    checkLastGroupLink();
});

document.getElementById('copy-link-btn')?.addEventListener('click', () => {
    const linkInput = document.getElementById('generated-link');
    linkInput.select();
    document.execCommand('copy');
    if (navigator.clipboard) navigator.clipboard.writeText(linkInput.value);

    const btn = document.getElementById('copy-link-btn');
    btn.innerText = "✅ Copiado";
    document.getElementById('copy-success-msg').style.display = 'block';

    setTimeout(() => {
        btn.innerText = "📋 Copiar";
        document.getElementById('copy-success-msg').style.display = 'none';
    }, 4000);
});

document.getElementById('whatsapp-link-btn')?.addEventListener('click', () => {
    const url = document.getElementById('generated-link').value;
    const text = `¡Hola! Por favor completa tu Test de Estilos de Aprendizaje VAK ingresando a este enlace:\n\n${url}`;
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
});

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

    if (localStorage.getItem(CONSENT_KEY)) {
        const checkbox = document.getElementById('consent-checkbox');
        if (checkbox) checkbox.checked = true;
        updateContinueBtn();
    }
}

function advanceToStep2(groupVal, countryVal) {
    const step1 = document.getElementById('wizard-step-1');
    const step2 = document.getElementById('wizard-step-2');
    const summaryTag = document.getElementById('step-1-summary');
    const intro = document.getElementById('welcome-intro');

    if (step1) step1.classList.add('hidden-step');
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

function updateContinueBtn() {
    const checkbox = document.getElementById('consent-checkbox');
    const btn = document.getElementById('continue-btn');
    if (checkbox && btn) {
        btn.disabled = !checkbox.checked;
        btn.style.opacity = checkbox.checked ? '1' : '0.5';
        btn.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
    }
}

document.getElementById('consent-checkbox')?.addEventListener('change', updateContinueBtn);

document.getElementById('continue-btn').addEventListener('click', () => {
    const checkbox = document.getElementById('consent-checkbox');
    if (!checkbox || !checkbox.checked) {
        alert("Debes aceptar el aviso de privacidad para continuar.");
        return;
    }

    localStorage.setItem(CONSENT_KEY, 'true');

    const nameVal = document.getElementById('user-name').value.trim();
    const groupVal = document.getElementById('user-group').value.trim().toUpperCase();
    const genderVal = document.getElementById('user-gender').value;
    const ageVal = document.getElementById('user-age').value;
    const countryVal = document.getElementById('user-country').value || "No especificado";
    const errorMsg = document.getElementById('group-error');

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

    if (!genderVal) {
        currentUser.gender = "Otro";
    } else if (genderVal.includes("Masculino") || genderVal.includes("Male") || genderVal.includes("男") || genderVal.includes("Мужской") || genderVal.includes("Kuimba'e")) {
        currentUser.gender = "Masculino";
    } else if (genderVal.includes("Femenino") || genderVal.includes("Female") || genderVal.includes("女") || genderVal.includes("Женский") || genderVal.includes("Kuña")) {
        currentUser.gender = "Femenino";
    } else {
        currentUser.gender = "Otro";
    }

    currentUser.age = parseInt(ageNum);
    currentUser.country = countryVal;

    document.getElementById('display-name').innerText = nameVal;

    showScreen('start');
});

document.getElementById('start-kids-btn')?.addEventListener('click', () => startTest('kids'));
document.getElementById('start-adults-btn')?.addEventListener('click', () => startTest('adults'));

function startTest(mode) {
    currentMode = mode;
    const source = mode === 'kids' ? window.i18n[currentLang].questionsKids : window.i18n[currentLang].questionsAdults;
    currentQuestions = shuffle(source);
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

    question.o.forEach((opt) => {
        const div = document.createElement('div');
        div.className = 'option-card';
        div.innerText = opt.t;
        if (answers[currentQuestionIndex] === opt.s) div.classList.add('selected');

        div.addEventListener('click', (e) => {
            if (transitionTimeout) return;

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

document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (currentQuestionIndex > 0) { currentQuestionIndex--; renderQuestion(); }
});

function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++; renderQuestion();
    } else {
        calculateResults();
    }
}

// --- CÁLCULO DE RESULTADOS ROBUSTO ---
function calculateResults() {
    const counts = { V: 0, A: 0, K: 0 };
    answers.forEach(ans => { if (ans) counts[ans]++; });

    const answeredTotal = counts.V + counts.A + counts.K;

    if (answeredTotal === 0) {
        alert("No has seleccionado ninguna respuesta. Por favor vuelve a intentarlo.");
        currentQuestionIndex = 0;
        renderQuestion();
        return;
    }

    const total = answeredTotal;

    let pV = Math.round((counts.V / total) * 100);
    let pA = Math.round((counts.A / total) * 100);
    let pK = Math.round((counts.K / total) * 100);

    const sum = pV + pA + pK;
    if (sum > 0 && sum !== 100) {
        const diff = 100 - sum;
        if (pV >= pA && pV >= pK) pV += diff;
        else if (pA >= pV && pA >= pK) pA += diff;
        else pK += diff;
    }

    let max = Math.max(pV, pA, pK);
    const dominants = [];
    if (pV === max) dominants.push("V");
    if (pA === max) dominants.push("A");
    if (pK === max) dominants.push("K");

    const dominantKey = dominants.length > 1 ? 'Multimodal' : dominants[0];
    const dominantName = getStyleLabel(dominantKey);

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
        descEl.innerHTML = `<strong>${t('resBalanced') || '¡Tienes un estilo equilibrado!'}</strong> Tu cerebro procesa de múltiples formas.`;
    } else {
        if (dominantKey === "V") descEl.innerHTML = `<strong>${t('resVisual') || 'Tu punto fuerte es la visión.'}</strong> Procesas muy bien las imágenes, mapas y esquemas.`;
        else if (dominantKey === "A") descEl.innerHTML = `<strong>${t('resAuditory') || 'Tu punto fuerte es la escucha.'}</strong> Entiendes genial a través de explicaciones orales y debates.`;
        else if (dominantKey === "K") descEl.innerHTML = `<strong>${t('resKinesthetic') || 'Tu punto fuerte es el hacer.'}</strong> Tu cuerpo necesita involucrarse física y espacialmente.`;
    }

    saveResultToDB(currentUser.name, currentUser.group, currentUser.gender, currentUser.age, currentUser.country, pV, pA, pK, dominantKey, QUESTION_VERSION);
}

document.getElementById('download-btn')?.addEventListener('click', () => {
    const captureArea = document.getElementById('capture-area');
    if (typeof html2canvas !== 'undefined') {
        html2canvas(captureArea, { backgroundColor: '#1e293b' }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Resultado_VAK_${currentUser.name.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error("Error generando imagen", err);
            alert("No se pudo generar la imagen. Por favor usa la opción de impresión del navegador.");
        });
    } else {
        alert("Librería de exportación no cargada.");
    }
});

document.getElementById('restart-btn')?.addEventListener('click', () => {
    document.getElementById('user-name').value = '';
    document.getElementById('user-group').value = '';
    document.getElementById('user-gender').value = '';
    document.getElementById('user-age').value = '';
    document.getElementById('user-country').value = '';
    document.getElementById('consent-checkbox').checked = false;
    updateContinueBtn();
    showScreen('welcome');
});

// --- PERSISTENCIA LOCAL SEGURA ---
function getAllResults() {
    try {
        const raw = localStorage.getItem(DB_KEY);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Error leyendo resultados locales", e);
        return [];
    }
}

function saveResultToDB(name, group, gender, age, country, v, a, k, dominantKey, questionVersion) {
    const results = getAllResults();
    results.push({
        id: generateId(),
        name,
        group,
        gender,
        age,
        country,
        v, a, k,
        dominantKey,
        questionVersion,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem(DB_KEY, JSON.stringify(results));
}

function exportData() {
    const results = getAllResults();
    const comments = getCommentsData();
    const payload = {
        version: QUESTION_VERSION,
        exportedAt: new Date().toISOString(),
        results,
        comments
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vak_export_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const payload = JSON.parse(e.target.result);
            if (!payload.results || !Array.isArray(payload.results)) {
                throw new Error("Formato inválido: se requiere 'results' como array.");
            }
            const existing = getAllResults();
            const merged = [...existing, ...payload.results];
            localStorage.setItem(DB_KEY, JSON.stringify(merged));

            if (payload.comments && Array.isArray(payload.comments)) {
                const currentComments = getCommentsData();
                const mergedComments = [...currentComments, ...payload.comments];
                localStorage.setItem(COMMENTS_KEY, JSON.stringify(mergedComments));
            }

            alert(`Importados ${payload.results.length} resultados correctamente.`);
            loadStats();
        } catch (err) {
            alert("Error al importar: " + err.message);
        }
    };
    reader.readAsText(file);
}

// --- ESTADÍSTICAS GRUPALES (CHART.JS) ---
let chartPieInstance = null;
let chartBarInstance = null;
let chartCountriesInstance = null;
let chartGenderInstance = null;
let chartAgeStyleInstance = null;
let chartAgeDistInstance = null;

document.getElementById('print-stats-btn')?.addEventListener('click', () => {
    window.print();
});

document.getElementById('export-data-btn')?.addEventListener('click', exportData);
document.getElementById('import-data-btn')?.addEventListener('click', () => {
    const input = document.getElementById('import-file-input');
    if (input && input.files && input.files[0]) {
        importData(input.files[0]);
    } else {
        alert("Selecciona un archivo JSON para importar.");
    }
});

async function loadStats() {
    const db = getAllResults();
    const selector = document.getElementById('group-selector');
    const container = document.getElementById('stats-container');
    const noData = document.getElementById('no-data-msg');

    const groups = [...new Set(db.map(item => item.group))].sort();

    selector.innerHTML = '<option value="TODOS">Todos los Grupos (Global)</option>';
    groups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g; opt.innerText = `Grupo: ${g}`;
        selector.appendChild(opt);
    });

    if (db.length === 0) {
        container.classList.add('hidden');
        if (noData) {
            noData.innerText = "Aún no hay datos locales. Usa 'Exportar' para compartir datos entre dispositivos.";
            noData.classList.remove('hidden');
        }
        return;
    }

    container.classList.remove('hidden');
    if (noData) noData.classList.add('hidden');

    selector.onchange = () => drawCharts(selector.value, db);
    drawCharts('TODOS', db);
}

function drawCharts(selectedGroup, db) {
    const data = selectedGroup === 'TODOS' ? db : db.filter(item => item.group === selectedGroup);

    if (data.length === 0) return;

    let countV = 0, countA = 0, countK = 0;
    let sumV = 0, sumA = 0, sumK = 0;
    let countM = 0, countF = 0, countO = 0;
    let sumAge = 0;
    let countKids = 0;
    let countAdults = 0;

    const countriesCount = {};
    const genderStyles = { M: {V:0, A:0, K:0}, F: {V:0, A:0, K:0}, O: {V:0, A:0, K:0} };
    const ageGroupsStyles = { Kids: {V:0, A:0, K:0}, Adults: {V:0, A:0, K:0} };
    const ageDist = {};
    let multiCount = 0;

    data.forEach(item => {
        const styleKey = item.dominantKey || 'O';
        if (styleKey === 'V') countV++;
        else if (styleKey === 'A') countA++;
        else if (styleKey === 'K') countK++;
        else multiCount++;

        sumV += item.v || 0; sumA += item.a || 0; sumK += item.k || 0;

        let gKey = 'O';
        if (item.gender === "Masculino") { countM++; gKey = 'M'; }
        else if (item.gender === "Femenino") { countF++; gKey = 'F'; }
        else countO++;

        if (item.dominantKey === 'V') genderStyles[gKey].V++;
        else if (item.dominantKey === 'A') genderStyles[gKey].A++;
        else if (item.dominantKey === 'K') genderStyles[gKey].K++;

        let c = item.country || "Desconocido";
        countriesCount[c] = (countriesCount[c] || 0) + 1;

        if (item.age) {
            sumAge += item.age;
            let aKey = 'Adults';
            if (item.age <= 12) { countKids++; aKey = 'Kids'; }
            else { countAdults++; }

            ageDist[item.age] = (ageDist[item.age] || 0) + 1;

            if (item.dominantKey === 'V') ageGroupsStyles[aKey].V++;
            else if (item.dominantKey === 'A') ageGroupsStyles[aKey].A++;
            else if (item.dominantKey === 'K') ageGroupsStyles[aKey].K++;
        }
    });

    const total = data.length;
    const avgV = total > 0 ? (sumV / total).toFixed(1) : 0;
    const avgA = total > 0 ? (sumA / total).toFixed(1) : 0;
    const avgK = total > 0 ? (sumK / total).toFixed(1) : 0;
    const avgAge = sumAge > 0 ? (sumAge / total).toFixed(1) : 0;

    document.getElementById('kpi-total').innerText = total;

    const pctM = total > 0 ? (countM/total*100).toFixed(1) : 0;
    const pctF = total > 0 ? (countF/total*100).toFixed(1) : 0;
    const pctO = total > 0 ? (countO/total*100).toFixed(1) : 0;
    const genderVis = document.getElementById('kpi-gender-visual');
    if (genderVis) genderVis.innerHTML = `
        <div style="width: ${pctM}%; background: #3b82f6;" title="Masculino: ${countM}"></div>
        <div style="width: ${pctF}%; background: #ec4899;" title="Femenino: ${countF}"></div>
        <div style="width: ${pctO}%; background: #a8a29e;" title="Otro: ${countO}"></div>
    `;

    document.getElementById('kpi-age-badges').innerHTML = `
        <span class="kpi-badge badge-kids">🧒 ≤12 <span class="badge-label-small">(${countKids})</span></span>
        <span class="kpi-badge badge-adults">🧑 13+ <span class="badge-label-small">(${countAdults})</span></span>
    `;

    document.getElementById('kpi-avg-age').innerText = avgAge > 0 ? `Promedio: ${avgAge} años` : '';

    const listEl = document.getElementById('students-chips-list');
    if (listEl) {
        listEl.innerHTML = '';

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

        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'student-chip';
            const iconMap = { 'V': '👁️', 'A': '👂', 'K': '✋' };
            let icon = iconMap[item.dominantKey] || '🧠';
            if (item.dominantKey && item.dominantKey.includes("Multimodal")) icon = '🧠';
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

        renderStudentComparison(null, avgV, avgA, avgK);
    }

    Chart.defaults.color = '#f8fafc';
    Chart.defaults.font.family = 'Inter';

    const ctxPie = document.getElementById('chart-pie');
    if (ctxPie) {
        if (chartPieInstance) chartPieInstance.destroy();
        const pieLabels = [t('styleVisual'), t('styleAuditory'), t('styleKinesthetic')];
        const pieData = [countV, countA, countK];
        const pieColors = ['#ec4899', '#8b5cf6', '#14b8a6'];

        if (multiCount > 0) {
            pieLabels.push(t('styleMultimodal'));
            pieData.push(multiCount);
            pieColors.push('#f59e0b');
        }

        chartPieInstance = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: pieLabels,
                datasets: [{ data: pieData, backgroundColor: pieColors, borderWidth: 0 }]
            },
            options: { plugins: { legend: { position: 'bottom' } } }
        });
    }

    renderBarChart(avgV, avgA, avgK, null, null);

    const ctxCountries = document.getElementById('chart-countries');
    if (ctxCountries) {
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
    }

    const ctxGender = document.getElementById('chart-gender');
    if (ctxGender) {
        if (chartGenderInstance) chartGenderInstance.destroy();
        chartGenderInstance = new Chart(ctxGender, {
            type: 'bar',
            data: {
                labels: [t('styleVisual'), t('styleAuditory'), t('styleKinesthetic')],
                datasets: [
                    { label: t('genderFemale') || 'Femenino', data: [genderStyles.F.V, genderStyles.F.A, genderStyles.F.K], backgroundColor: '#ec4899' },
                    { label: t('genderMale') || 'Masculino', data: [genderStyles.M.V, genderStyles.M.A, genderStyles.M.K], backgroundColor: '#3b82f6' },
                    { label: t('genderOther') || 'Otro', data: [genderStyles.O.V, genderStyles.O.A, genderStyles.O.K], backgroundColor: '#a8a29e' }
                ]
            },
            options: { scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }, plugins: { legend: { position: 'bottom' } } }
        });
    }

    const ctxAgeStyle = document.getElementById('chart-age-style');
    if (ctxAgeStyle) {
        if (chartAgeStyleInstance) chartAgeStyleInstance.destroy();
        chartAgeStyleInstance = new Chart(ctxAgeStyle, {
            type: 'bar',
            data: {
                labels: [t('styleVisual'), t('styleAuditory'), t('styleKinesthetic')],
                datasets: [
                    { label: t('ageKids') || 'Niños (≤12)', data: [ageGroupsStyles.Kids.V, ageGroupsStyles.Kids.A, ageGroupsStyles.Kids.K], backgroundColor: '#14b8a6' },
                    { label: t('ageAdults') || 'Adultos (13+)', data: [ageGroupsStyles.Adults.V, ageGroupsStyles.Adults.A, ageGroupsStyles.Adults.K], backgroundColor: '#f59e0b' }
                ]
            },
            options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { position: 'bottom' } } }
        });
    }

    const ctxAgeDist = document.getElementById('chart-age-dist');
    if (ctxAgeDist) {
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
}

function renderBarChart(avgV, avgA, avgK, studentObj, studentName) {
    const ctxBar = document.getElementById('chart-bar');
    if (!ctxBar) return;
    if (chartBarInstance) chartBarInstance.destroy();

    const datasets = [
        {
            label: 'Promedio del Grupo',
            data: [avgV, avgA, avgK],
            backgroundColor: 'rgba(59, 130, 246, 0.4)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
        }
    ];

    if (studentObj) {
        datasets.push({
            label: studentName,
            data: [studentObj.v, studentObj.a, studentObj.k],
            backgroundColor: 'rgba(250, 204, 21, 0.8)',
            borderColor: 'rgba(250, 204, 21, 1)',
            borderWidth: 2
        });
    }

    chartBarInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: [t('styleVisual'), t('styleAuditory'), t('styleKinesthetic')],
            datasets: datasets
        },
        options: {
            scales: { y: { beginAtZero: true, max: 100 } },
            plugins: { legend: { display: !!studentObj, position: 'bottom' } }
        }
    });
}

function renderStudentComparison(studentObj, avgV, avgA, avgK) {
    const panel = document.getElementById('student-comparison-panel');
    if (!panel) return;

    if (!studentObj) {
        panel.innerHTML = `<div class="comparison-empty"><p>👆 Selecciona un alumno de la lista para ver su perfil comparativo.</p></div>`;
        return;
    }
    const iconMap = { 'V': '👁️', 'A': '👂', 'K': '✋' };
    let icon = iconMap[studentObj.dominantKey] || '🧠';
    if (studentObj.dominantKey && studentObj.dominantKey.includes("Multimodal")) icon = '🧠';

    panel.innerHTML = `
        <div class="comparison-title">
            <h3>${studentObj.name}</h3>
            <span class="comparison-badge">${icon} ${getStyleLabel(studentObj.dominantKey)}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap: 15px;">
            <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.85rem;">
                    <span><strong style="color:var(--color-v)">${t('styleVisual')}</strong>: ${studentObj.v}%</span>
                    <span style="opacity:0.6; font-size:0.75rem;">(Grupo: ${avgV}%)</span>
                </div>
                <div class="progress-bar" style="background: rgba(255,255,255,0.05);"><div class="progress-fill fill-v" style="width: ${studentObj.v}%; border-radius: 4px;"></div></div>
            </div>
            <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.85rem;">
                    <span><strong style="color:var(--color-a)">${t('styleAuditory')}</strong>: ${studentObj.a}%</span>
                    <span style="opacity:0.6; font-size:0.75rem;">(Grupo: ${avgA}%)</span>
                </div>
                <div class="progress-bar" style="background: rgba(255,255,255,0.05);"><div class="progress-fill fill-a" style="width: ${studentObj.a}%; border-radius: 4px;"></div></div>
            </div>
            <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.85rem;">
                    <span><strong style="color:var(--color-k)">${t('styleKinesthetic')}</strong>: ${studentObj.k}%</span>
                    <span style="opacity:0.6; font-size:0.75rem;">(Grupo: ${avgK}%)</span>
                </div>
                <div class="progress-bar" style="background: rgba(255,255,255,0.05);"><div class="progress-fill fill-k" style="width: ${studentObj.k}%; border-radius: 4px;"></div></div>
            </div>
        </div>
    `;
}

// --- COMENTARIOS ---
document.getElementById('submit-comment-btn')?.addEventListener('click', async () => {
    const name = document.getElementById('comment-name').value.trim();
    const text = document.getElementById('comment-text').value.trim();
    const errorEl = document.getElementById('comment-error');

    if (!name || !text) {
        errorEl.classList.remove('hidden');
        return;
    }
    errorEl.classList.add('hidden');

    document.getElementById('submit-comment-btn').innerText = "Guardando...";

    let currentComments = getCommentsData();
    currentComments.push({
        id: generateId(),
        name: name,
        text: text,
        date: new Date().toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    });

    localStorage.setItem(COMMENTS_KEY, JSON.stringify(currentComments));

    document.getElementById('comment-name').value = '';
    document.getElementById('comment-text').value = '';
    document.getElementById('submit-comment-btn').innerText = "Publicar Comentario";
    loadComments();
});

function getCommentsData() {
    try {
        const raw = localStorage.getItem(COMMENTS_KEY);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

function loadComments() {
    const listEl = document.getElementById('comments-list');
    if (!listEl) return;

    listEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Cargando opiniones...</p>';

    const comments = getCommentsData();

    if (comments.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">Aún no hay comentarios. ¡Sé el primero en opinar!</p>';
        return;
    }

    listEl.innerHTML = '';

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