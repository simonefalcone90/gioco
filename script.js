let db = [];
let compitiUsati = [];
let numGiocatori = 0;
let gradoAttuale = 1;
let compitiCompletatiGrado = 0;
let taskCorrente = null;

// Caricamento Dati
fetch('data.json')
    .then(r => r.json())
    .then(data => db = data)
    .catch(err => console.error("Errore database:", err));

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
    
    // Filtro compiti non usati per grado
    let disponibili = db.filter(t => parseInt(t.grado) === gradoAttuale && !compitiUsati.includes(t.compito));
    
    // Se finiscono i compiti per questo grado nel database prima del target, avanza
    if (disponibili.length === 0) {
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
    const tempo = parseInt(taskCorrente.tempo);
    if (tempo > 0) {
        avviaTimer(tempo);
    } else {
        document.getElementById('btn-done').classList.remove('hidden');
    }
};

document.getElementById('btn-done').onclick = () => {
    compitiCompletatiGrado++;
    if (compitiCompletatiGrado >= (numGiocatori * 3)) {
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
    
    // Se abbiamo superato il grado 5, fine gioco
    if (gradoAttuale > 5) {
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('end-screen').classList.remove('hidden');
    } else {
        // Passaggio automatico al compito del nuovo grado
        nuovoCompito();
    }
}