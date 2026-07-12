// Banco de Preguntas - Jóvenes y Adultos (15 Preguntas)
const questionsAdults = [
    { question: "1. Cuando estás armando un mueble nuevo o configurando un aparato, tú prefieres:", options: [ { text: "Mirar las instrucciones y los diagramas antes de empezar.", style: "V" }, { text: "Pedirle a alguien que te lea las instrucciones o te explique cómo hacerlo.", style: "A" }, { text: "Empezar a armarlo directamente, probando las piezas a ver cómo encajan.", style: "K" } ] },
    { question: "2. Si necesitas recordar cómo llegar a un lugar nuevo, tú:", options: [ { text: "Te imaginas un mapa en tu cabeza o buscas puntos de referencia visuales.", style: "V" }, { text: "Repites las indicaciones en voz alta o recuerdas a alguien explicándotelas.", style: "A" }, { text: "Dejas que tu intuición te guíe porque tu cuerpo 'recuerda' el camino.", style: "K" } ] },
    { question: "3. En tu tiempo libre, ¿qué actividad disfrutas más?", options: [ { text: "Ver una buena película, leer un libro o mirar fotografías.", style: "V" }, { text: "Escuchar música, un podcast o charlar largo rato con amigos.", style: "A" }, { text: "Hacer deporte, salir a caminar o armar cosas con las manos.", style: "K" } ] },
    { question: "4. Cuando estás en una clase aburrida, sueles:", options: [ { text: "Ponerme a dibujar, hacer garabatos o mirar fijamente a la nada.", style: "V" }, { text: "Canturrear para mí mismo o empezar a hablar con el compañero de al lado.", style: "A" }, { text: "Mover los pies, balancearme en la silla o jugar con el bolígrafo.", style: "K" } ] },
    { question: "5. Cuando intentas estudiar o concentrarte para un examen, te ayuda mucho:", options: [ { text: "Usar muchos colores, subrayar y hacer mapas mentales.", style: "V" }, { text: "Estudiar en voz alta o debatir los temas con un compañero.", style: "A" }, { text: "Caminar por la habitación mientras repasas o reescribir todo varias veces.", style: "K" } ] },
    { question: "6. Para recordar un número de teléfono que acabas de escuchar, tú:", options: [ { text: "Te imaginas los números escritos en un papel.", style: "V" }, { text: "Lo repites en voz alta varias veces por su 'ritmo' o sonido.", style: "A" }, { text: "Haces el gesto de marcarlo con los dedos en el aire o en el celular.", style: "K" } ] },
    { question: "7. Si estás viendo una obra de teatro o una película, lo que más te llama la atención es:", options: [ { text: "La escenografía, la iluminación, el vestuario y los efectos especiales.", style: "V" }, { text: "Los diálogos, la música de fondo y los efectos de sonido.", style: "A" }, { text: "Las escenas de acción, el movimiento y sentir la emoción físicamente.", style: "K" } ] },
    { question: "8. Al momento de conocer a una persona nueva, sueles recordar mejor:", options: [ { text: "Su cara, pero te olvidas de su nombre.", style: "V" }, { text: "Su nombre o su tono de voz, pero te cuesta recordar su cara.", style: "A" }, { text: "Lo que hicieron juntos o la impresión general que te dejó esa situación.", style: "K" } ] },
    { question: "9. Si tienes que presentar un trabajo final frente a una clase, tú prefieres:", options: [ { text: "Hacer una presentación de diapositivas muy bonita con muchos gráficos.", style: "V" }, { text: "Preparar un buen discurso y tener clara la historia que vas a contar.", style: "A" }, { text: "Llevar objetos físicos, maquetas o invitar al público a hacer un ejercicio.", style: "K" } ] },
    { question: "10. Cuando sientes que te distraes fácilmente, usualmente es porque:", options: [ { text: "Hay mucho desorden visual a mi alrededor o la pantalla está muy brillante.", style: "V" }, { text: "Hay ruidos de fondo, música fuerte o gente hablando cerca.", style: "A" }, { text: "Hace rato que estoy sentado o la silla es incómoda.", style: "K" } ] },
    { question: "11. Cuando estás enojado o feliz, tu forma principal de expresarlo es:", options: [ { text: "A través de mis expresiones faciales; se me nota en la cara.", style: "V" }, { text: "Por el tono de mi voz, hablando más fuerte o más rápido.", style: "A" }, { text: "Con el lenguaje corporal: gesticulo mucho o abrazo fuerte.", style: "K" } ] },
    { question: "12. A la hora de comprar ropa, tu proceso de elección se basa en:", options: [ { text: "Cómo se ve el color y cómo combina con lo que ya tengo.", style: "V" }, { text: "Lo que me dicen el vendedor o mis amigos sobre cómo me queda.", style: "A" }, { text: "Cómo se siente la tela al tocarla y si estoy cómodo al moverme.", style: "K" } ] },
    { question: "13. Al explicarle una idea compleja a otra persona, tiendes a:", options: [ { text: "Agarrar un papel y hacer un dibujo o esquema rápido.", style: "V" }, { text: "Hablar despacio, dando muchos ejemplos verbales y detalles sonoros.", style: "A" }, { text: "Usar muchos gestos con las manos o mostrarle cómo se hace con un ejemplo físico.", style: "K" } ] },
    { question: "14. Imagina que vas a aprender un nuevo idioma. Lo que más te sirve es:", options: [ { text: "Ver programas con subtítulos y leer carteles o tarjetas de vocabulario.", style: "V" }, { text: "Escuchar canciones, repetir audios o conversar con hablantes nativos.", style: "A" }, { text: "Hacer juegos de rol donde actuemos situaciones de la vida real.", style: "K" } ] },
    { question: "15. De estas tres descripciones de un momento de relax, ¿cuál prefieres?", options: [ { text: "Disfrutar de un hermoso paisaje o ver arte.", style: "V" }, { text: "Acostarte en silencio o escuchar música relajante.", style: "A" }, { text: "Recibir un masaje, tomar un baño caliente o hacer estiramientos.", style: "K" } ] }
];

// Banco de Preguntas - Niños (10 Preguntas)
const questionsKids = [
    { question: "1. ¿Qué prefieres hacer en el recreo o en tu tiempo libre?", options: [ { text: "Leer un libro de cuentos con muchos dibujos o ver dibujitos.", style: "V" }, { text: "Cantar, escuchar música o quedarme charlando con mis amigos.", style: "A" }, { text: "Correr, jugar a la pelota, saltar o trepar juegos.", style: "K" } ] },
    { question: "2. Si la maestra está contando un cuento nuevo, te gusta más cuando:", options: [ { text: "Muestra las imágenes del libro en grande.", style: "V" }, { text: "Hace voces diferentes para cada personaje.", style: "A" }, { text: "Pide que nos levantemos y actuemos la historia con el cuerpo.", style: "K" } ] },
    { question: "3. ¿Cuál es tu juguete o pasatiempo favorito?", options: [ { text: "Los rompecabezas, los bloques de colores o los libros para pintar.", style: "V" }, { text: "Los instrumentos musicales, micrófonos o juguetes que hacen sonidos.", style: "A" }, { text: "La plastilina, los legos, las pelotas o andar en bici.", style: "K" } ] },
    { question: "4. Cuando tienes que estudiar o aprender algo nuevo para la escuela, tú prefieres:", options: [ { text: "Mirar los dibujos y usar marcadores de muchos colores.", style: "V" }, { text: "Que alguien me lo lea en voz alta o repetirlo yo hablando.", style: "A" }, { text: "Hacer algún experimento, tocar las cosas o caminar mientras aprendo.", style: "K" } ] },
    { question: "5. Cuando estás muy feliz y contento, ¿cómo se lo demuestras a tus papás?", options: [ { text: "Les hago un dibujo muy bonito o una carta decorada.", style: "V" }, { text: "Se los digo fuerte, cantando o gritando de emoción.", style: "A" }, { text: "Les doy muchos abrazos, saltos y besos.", style: "K" } ] },
    { question: "6. Si quieres acordarte de algo importante (como llevar un juguete a la escuela), ¿qué haces?", options: [ { text: "Lo dejo en un lugar donde lo pueda ver apenas me despierte.", style: "V" }, { text: "Me lo repito a mí mismo muchas veces antes de dormir.", style: "A" }, { text: "Me lo meto en la mochila enseguida con mis propias manos.", style: "K" } ] },
    { question: "7. ¿Qué materia o clase te parece más divertida?", options: [ { text: "Artes plásticas (dibujar, pintar, ver videos).", style: "V" }, { text: "Música (cantar, escuchar instrumentos).", style: "A" }, { text: "Educación Física (correr, jugar juegos).", style: "K" } ] },
    { question: "8. Cuando compras o te regalan ropa nueva, ¿qué te importa más?", options: [ { text: "Que tenga mi color favorito o un dibujo bonito.", style: "V" }, { text: "Lo que dicen mis amigos o mis papás cuando me la ven puesta.", style: "A" }, { text: "Que sea súper cómoda para poder jugar y correr libremente.", style: "K" } ] },
    { question: "9. Cuando tienes que seguir las reglas de un juego nuevo, tú prefieres:", options: [ { text: "Mirar primero cómo juegan los demás para entender.", style: "V" }, { text: "Que alguien me explique las reglas en voz alta antes de empezar.", style: "A" }, { text: "Empezar a jugar de una vez y aprender mientras juego.", style: "K" } ] },
    { question: "10. ¿Qué te molesta más cuando estás intentando hacer tu tarea?", options: [ { text: "Que la mesa esté muy desordenada o la luz me dé en la cara.", style: "V" }, { text: "Que haya ruido, televisión prendida o gente hablando cerca.", style: "A" }, { text: "Tener que estar mucho tiempo sentado en la misma silla sin moverme.", style: "K" } ] }
];

// Estado global
let currentUser = { name: "", group: "", gender: "" };
let currentQuestionIndex = 0;
let currentQuestions = [];
let answers = [];

// --- NAVEGACIÓN TABS ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        const targetTab = document.getElementById(tabId);
        targetTab.classList.remove('hidden');
        targetTab.classList.add('active');

        if (tabId === 'tab-stats') loadStats();
        if (tabId === 'tab-comments') loadComments();
    });
});

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

// 1. Validar Usuario y Grupo
document.getElementById('continue-btn').addEventListener('click', () => {
    const nameVal = document.getElementById('user-name').value.trim();
    const groupVal = document.getElementById('user-group').value.trim().toUpperCase();
    const genderVal = document.getElementById('user-gender').value;
    const errorMsg = document.getElementById('group-error');
    
    // Regex: exactly 3 letters + 3 numbers
    const regex = /^[A-Z]{3}[0-9]{3}$/;
    
    if (!nameVal || !groupVal || !genderVal) {
        alert("Por favor ingresa tu nombre, grupo y género para continuar.");
        return;
    }
    
    if (!regex.test(groupVal)) {
        errorMsg.classList.remove('hidden');
        return;
    }
    
    errorMsg.classList.add('hidden');
    currentUser.name = nameVal;
    currentUser.group = groupVal;
    currentUser.gender = genderVal;
    
    document.getElementById('display-name').innerText = nameVal;
    showScreen('start');
});

// 2. Iniciar Test
document.getElementById('start-kids-btn').addEventListener('click', () => startTest('kids'));
document.getElementById('start-adults-btn').addEventListener('click', () => startTest('adults'));

function startTest(mode) {
    currentQuestions = mode === 'kids' ? questionsKids : questionsAdults;
    currentQuestionIndex = 0;
    answers = new Array(currentQuestions.length).fill(null);
    showScreen('question');
    renderQuestion();
}

function renderQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    document.getElementById('progress-text').innerText = `Pregunta ${currentQuestionIndex + 1} de ${currentQuestions.length}`;
    document.getElementById('progress-fill').style.width = `${((currentQuestionIndex) / currentQuestions.length) * 100}%`;
    document.getElementById('question-title').innerText = question.question;

    const optContainer = document.getElementById('options-container');
    optContainer.innerHTML = '';
    
    question.options.forEach((opt) => {
        const div = document.createElement('div');
        div.className = 'option-card';
        div.innerText = opt.text;
        if (answers[currentQuestionIndex] === opt.style) div.classList.add('selected');
        
        div.addEventListener('click', (e) => {
            optContainer.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            e.target.classList.add('selected');
            answers[currentQuestionIndex] = opt.style;
            setTimeout(nextQuestion, 300);
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
    const total = currentQuestions.length;
    
    const pV = Math.round((counts.V / total) * 100);
    const pA = Math.round((counts.A / total) * 100);
    const pK = Math.round((counts.K / total) * 100);

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

    // GUARDAR EN LOCALSTORAGE
    saveResultToDB(currentUser.name, currentUser.group, currentUser.gender, pV, pA, pK, dominants[0]);
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
    showScreen('welcome');
});

// --- LOCALSTORAGE DATABASE ---
function getDB() {
    const data = localStorage.getItem('vak_db');
    return data ? JSON.parse(data) : [];
}

function saveResultToDB(name, group, gender, v, a, k, mainStyle) {
    const db = getDB();
    db.push({
        id: Date.now(),
        name: name,
        group: group,
        gender: gender,
        v: v, a: a, k: k,
        mainStyle: mainStyle
    });
    localStorage.setItem('vak_db', JSON.stringify(db));
}

// --- ESTADÍSTICAS GRUPALES (CHART.JS) ---
let chartPieInstance = null;
let chartBarInstance = null;
let chartPartInstance = null;

function loadStats() {
    const db = getDB();
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

    // Calc Pie (Dominants)
    let countV = 0, countA = 0, countK = 0;
    // Calc Averages
    let sumV = 0, sumA = 0, sumK = 0;

    data.forEach(item => {
        if (item.mainStyle === "Visual") countV++;
        else if (item.mainStyle === "Auditivo") countA++;
        else if (item.mainStyle === "Kinestésico") countK++;

        sumV += item.v; sumA += item.a; sumK += item.k;
    });

    const avgV = (sumV / data.length).toFixed(1);
    const avgA = (sumA / data.length).toFixed(1);
    const avgK = (sumK / data.length).toFixed(1);

    // Calc Participation by Group for global
    const groupCounts = {};
    db.forEach(item => { groupCounts[item.group] = (groupCounts[item.group] || 0) + 1; });

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

    // 2. BAR CHART (Averages)
    const ctxBar = document.getElementById('chart-bar').getContext('2d');
    if (chartBarInstance) chartBarInstance.destroy();
    chartBarInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Visual %', 'Auditivo %', 'Kinestésico %'],
            datasets: [{
                label: 'Promedio del Grupo',
                data: [avgV, avgA, avgK],
                backgroundColor: ['rgba(236, 72, 153, 0.6)', 'rgba(139, 92, 246, 0.6)', 'rgba(20, 184, 166, 0.6)'],
                borderColor: ['#ec4899', '#8b5cf6', '#14b8a6'],
                borderWidth: 1
            }]
        },
        options: { scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } }
    });

    // 3. PARTICIPATION CHART
    const ctxPart = document.getElementById('chart-participation').getContext('2d');
    if (chartPartInstance) chartPartInstance.destroy();
    
    // Only show participation logic makes sense if global, but we show it anyway
    chartPartInstance = new Chart(ctxPart, {
        type: 'bar',
        data: {
            labels: Object.keys(groupCounts),
            datasets: [{
                label: 'Cantidad de Alumnos',
                data: Object.values(groupCounts),
                backgroundColor: 'rgba(59, 130, 246, 0.7)'
            }]
        },
        options: { indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
}

// --- COMENTARIOS ---
document.getElementById('submit-comment-btn').addEventListener('click', () => {
    const name = document.getElementById('comment-name').value.trim();
    const text = document.getElementById('comment-text').value.trim();
    if (!name || !text) return alert("Completa nombre y comentario.");

    const comments = getComments();
    comments.push({
        name: name,
        text: text,
        date: new Date().toLocaleString()
    });
    localStorage.setItem('vak_comments', JSON.stringify(comments));
    
    document.getElementById('comment-name').value = '';
    document.getElementById('comment-text').value = '';
    loadComments();
});

function getComments() {
    const data = localStorage.getItem('vak_comments');
    return data ? JSON.parse(data) : [];
}

function loadComments() {
    const list = document.getElementById('comments-list');
    list.innerHTML = '';
    const comments = getComments().reverse(); // Nuevos primero

    if (comments.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:gray;">Sé el primero en comentar.</p>';
        return;
    }

    comments.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment-box';
        div.innerHTML = `
            <div class="comment-author">${c.name} <span class="comment-date">${c.date}</span></div>
            <div class="comment-body">${c.text}</div>
        `;
        list.appendChild(div);
    });
}
