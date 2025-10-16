const btn = document.getElementById("click-btn");
const message = document.getElementById("message");
const scoresList = document.getElementById("scores");
let clickTimes = [];
let clicks = 0;
let gameActive = false;
let timerInterval;
let startTime;

btn.addEventListener("click", () => {
    if (!gameActive) {
        // začetek igre
        clicks = 0;
        clickTimes = [];
        message.textContent = "Čas: 0.000 s";
        btn.textContent = "Klikni!";
        gameActive = true;
        btn.style.backgroundColor = "rgb(0,255,0)"; // začetek = zelena


        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 50);

        moveButton();
        return;
    }

    const now = Date.now();

    if (clicks > 0) {
        clickTimes.push(now);
    } else {
        clickTimes.push(now);
    }

    clicks++;
    const c = 4;
    //pok gumba
    btn.classList.add("pop");
    setTimeout(() => btn.classList.remove("pop"), 200);
    //pok ozadja
    document.body.classList.add("bg-pop");
    setTimeout(() => document.body.classList.remove("bg-pop"), 300);

    if (gameActive){  
        let factor = clicks / c*1.25;  // 0.0 → 1.0
        btn.style.backgroundColor = interpolateColor([0, 255, 0], [255, 0, 0], factor);
    }


    if (clicks >= c) {
        btn.style.backgroundColor = "blue"; // ponastavi (brez barve, uporablja default)

        clearInterval(timerInterval);
    
        const intervals = [];
        for (let i = 1; i < clickTimes.length; i++) {
            intervals.push((clickTimes[i] - clickTimes[i - 1]) / 1000);
        }
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const total = (clickTimes[clickTimes.length - 1] - clickTimes[0]) / 1000;
    
        message.textContent = `Povprečni čas: ${avg.toFixed(3)} s | Skupni čas: ${total.toFixed(3)} s`;
        btn.textContent = "Začni znova";
        resetButton();
        gameActive = false;
    
        // shrani na server
        fetch("/save_score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avg_time: avg, total_time: total })
        })
        .then(res => res.json())
        .then(data => {
            scoresList.innerHTML = "";
            data.scores.forEach(s => {
                let li = document.createElement("li");
                li.textContent = `${s.avg.toFixed(3)} s, ${s.total.toFixed(3)} s`;
                scoresList.appendChild(li);
            });
        });
    } 
    else {
        moveButton();
    }
    
});

function moveButton() {
    const gameArea = document.getElementById("game-area");
    const maxX = gameArea.clientWidth - btn.offsetWidth;
    const maxY = gameArea.clientHeight - btn.offsetHeight;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
}

function resetButton() {
    btn.style.left = "50%";
    btn.style.top = "50%";
}

function updateTimer() {
    const elapsed = (Date.now() - startTime) / 1000;
    message.textContent = `Čas: ${elapsed.toFixed(3)} s`;
}

function interpolateColor(startColor, endColor, factor) {
    const result = startColor.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (endColor[i] - startColor[i]));
    }
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

document.addEventListener("mousemove", (e) => {
    const { innerWidth, innerHeight } = window;

    // izračun premika glede na pozicijo miške (od -0.5 do +0.5)
    const offsetX = (e.clientX / innerWidth - 0.5) * 50;  // obrnemo smer
    const offsetY = (e.clientY / innerHeight - 0.5) * 50;

    document.body.style.backgroundPosition = `${50 + offsetX}% ${50 + offsetY}%`;
});

