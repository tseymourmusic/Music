/* player.js */
const audio = document.getElementById('audio');
const source = document.getElementById('audio-source');
const tracks = Array.from(document.querySelectorAll('.track'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let holdTimer, scrubInterval, isScrubbing = false, pressStartTime;

function playTrack(trackElement) {
    if (!trackElement) return;
    source.src = trackElement.getAttribute('data-src');
    audio.load();
    audio.play();
    tracks.forEach(t => t.classList.remove('active'));
    trackElement.classList.add('active');
}

function skipNext() {
    let currentIdx = tracks.findIndex(t => t.classList.contains('active'));
    let nextIdx = (currentIdx + 1) % tracks.length;
    playTrack(tracks[nextIdx]);
}

function skipPrev() {
    let currentIdx = tracks.findIndex(t => t.classList.contains('active'));
    let prevIdx = (currentIdx - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIdx]);
}

function onDown(e, direction) {
    e.preventDefault();
    pressStartTime = Date.now();
    isScrubbing = false;
    holdTimer = setTimeout(() => {
        isScrubbing = true;
        scrubInterval = setInterval(() => {
            audio.currentTime += (direction === 'next' ? 5 : -5);
        }, 100);
    }, 250);
}

function onUp(e, direction) {
    clearTimeout(holdTimer);
    clearInterval(scrubInterval);
    if (!pressStartTime) return;
    const pressDuration = Date.now() - pressStartTime;
    pressStartTime = null;
    if (pressDuration < 250 && !isScrubbing) {
        direction === 'next' ? skipNext() : skipPrev();
    }
    isScrubbing = false;
}

// Controls Listeners
nextBtn.addEventListener('mousedown', (e) => onDown(e, 'next'));
nextBtn.addEventListener('touchstart', (e) => onDown(e, 'next'), {passive: false});
nextBtn.addEventListener('mouseup', (e) => onUp(e, 'next'));
nextBtn.addEventListener('touchend', (e) => onUp(e, 'next'), {passive: false});

prevBtn.addEventListener('mousedown', (e) => onDown(e, 'prev'));
prevBtn.addEventListener('touchstart', (e) => onDown(e, 'prev'), {passive: false});
prevBtn.addEventListener('mouseup', (e) => onUp(e, 'prev'));
prevBtn.addEventListener('touchend', (e) => onUp(e, 'prev'), {passive: false});

window.addEventListener('mouseup', () => { clearTimeout(holdTimer); clearInterval(scrubInterval); });

tracks.forEach(track => {
    track.addEventListener('click', function() { playTrack(this); });
});

audio.addEventListener('ended', skipNext);
