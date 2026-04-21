let db = [];
let compitiUsati = [];
let numGiocatori = 0;
let gradoAttuale = 1;
let compitiCompletatiGrado = 0;
let taskCorrente = null;

// Caricamento Dati
fetch('data.json')
    .then(r => r.json())
    .then(data => {
        db = data;
        console.log("Database caricato con successo:", db.length, "compiti trovati.");
    })
    .catch(err => console.error("Errore caricamento database:", err));

function updatePlayerValue(val) {
    document.getElementById('playerValue').innerText = val;
}

function startGame() {
    numGiocatori = parseInt(document.getElementById('playerCount').value);
    document.getElementById('display-target').innerText = numGiocatori * 3;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    nuovoCompito();
}

function nuovoCompito() {
    // Reset UI
    document.getElementById('actions').classList.remove('hidden');
    document.getElementById('btn-done').classList.add('hidden');
    document.getElementById('timer-display').classList.add('hidden');
    document.getElementById('timer-display').innerText = "";
    
    // FILTRO ROBUSTO: Converte tutto in Number per evitare errori di tipo stringa/numero
    let disponibili = db.filter(t => {
        return Number(t.grado) === Number(gradoAttuale) && !compitiUsati.includes(t.compito);
    });
    
    // Se non ci sono più compiti per questo grado, prova ad avanzare automaticamente
    if (disponibili.length === 0) {
        console.log(`Finiti i compiti per il grado ${gradoAttuale}. Cerco nel grado successivo...`);
        avanzaGrado();
        return;
    }

    taskCorrente = disponibili[Math.floor(Math.random() * disponibili.length)];
    compitiUsati.push(taskCorrente.compito);
    
    document.getElementById('task-text').innerText = taskCorrente.compito;
    document.getElementById('display-grado').innerText = gradoAttuale;
    document.getElementById('display-count').innerText = compitiCompletatiGrado;
}

document.getElementById('btn-skip').onclick = () => nuovoCompito();

document.getElementById('btn-accept').onclick = function() {
    document.getElementById('actions').classList.add('hidden');
    // Assicuriamoci che tempo sia trattato come numero
    const tempo = Number(taskCorrente.tempo);
    if (tempo > 0) {
        avviaTimer(tempo);
    } else {
        document.getElementById('btn-done').classList.remove('hidden');
    }
};

document.getElementById('btn-done').onclick = () => {
    compitiCompletatiGrado++;
    const target = numGiocatori * 3;

    if (compitiCompletatiGrado >= target) {
        avanzaGrado();
    } else {
        nuovoCompito();
    }
};

function avviaTimer(minuti) {
    const display = document.getElementById('timer-display');
    display.classList.remove('hidden');
    let prep = 10;

    let timerPrep = setInterval(() => {
        display.innerHTML = `<span style="color:#ff00ff">PRONTI?</span><br>${prep}`;
        prep--;
        if(prep < 0) {
            clearInterval(timerPrep);
            let sec = minuti * 60;
            let timerTask = setInterval(() => {
                let m = Math.floor(sec / 60);
                let s = sec % 60;
                display.innerHTML = `<span style="color:#00f2ff">VIA!</span><br>${m}:${s < 10 ? '0' : ''}${s}`;
                sec--;
                if(sec < 0) {
                    clearInterval(timerTask);
                    display.innerHTML = `<span style="color:#00ff00">FINE!</span>`;
                    document.getElementById('btn-done').classList.remove('hidden');
                }
            }, 1000);
        }
    }, 1000);
}

function avanzaGrado() {
    gradoAttuale++;
    compitiCompletatiGrado = 0;
    
    console.log("Tentativo di passaggio al grado:", gradoAttuale);

    // Se abbiamo superato il grado 5, fine gioco
    if (gradoAttuale > 5) {
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('end-screen').classList.remove('hidden');
    } else {
        // Verifica se esistono compiti per il nuovo grado prima di procedere
        let verificaProssimoGrado = db.some(t => Number(t.grado) === Number(gradoAttuale));
        
        if (verificaProssimoGrado) {
            nuovoCompito();
        } else if (gradoAttuale <= 5) {
            // Se non ci sono compiti nel grado attuale ma non siamo al 5, salta al successivo
            console.log(`Nessun compito per il grado ${gradoAttuale}, salto oltre...`);
            avanzaGrado();
        } else {
            // Se non c'è più nulla in nessun grado superiore
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('end-screen').classList.remove('hidden');
        }
    }
}