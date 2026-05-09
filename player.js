/* player.js */

let audio, source, tracks, prevBtn, nextBtn, trackTitleDisplay;
let holdTimer, scrubInterval, isScrubbing = false, pressStartTime;

function initPlayer() {
    audio = document.getElementById('audio');
    source = document.getElementById('audio-source');
    tracks = Array.from(document.querySelectorAll('.track'));
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    trackTitleDisplay = document.getElementById('track-title');

    if (!audio || !prevBtn || !nextBtn) return;

    nextBtn.addEventListener('mousedown', (e) => onDown(e, 'next'));
    nextBtn.addEventListener('touchstart', (e) => onDown(e, 'next'), {passive: false});
    nextBtn.addEventListener('mouseup', (e) => onUp(e, 'next'));
    nextBtn.addEventListener('touchend', (e) => onUp(e, 'next'), {passive: false});

    prevBtn.addEventListener('mousedown', (e) => onDown(e, 'prev'));
    prevBtn.addEventListener('touchstart', (e) => onDown(e, 'prev'), {passive: false});
    prevBtn.addEventListener('mouseup', (e) => onUp(e, 'prev'));
    prevBtn.addEventListener('touchend', (e) => onUp(e, 'prev'), {passive: false});

    audio.addEventListener('ended', skipNext);

    refreshMenu();

    // MOBILE SCROLL FIX:
    // We removed e.preventDefault() to allow the browser to handle 
    // the internal scrolling of the track list.
    trackTitleDisplay.addEventListener('touchmove', function(e) {
        if (this.scrollHeight > this.offsetHeight) {
            e.stopPropagation(); // Only stop the page from scrolling, let the div scroll
        }
    }, { passive: true });
}

function refreshMenu() {
    if (!trackTitleDisplay) return;
    trackTitleDisplay.innerHTML = '';
    
    // Keep active track at the top of the "window"
    const sortedTracks = [...tracks].sort((a, b) => {
        return b.classList.contains('active') - a.classList.contains('active');
    });

    sortedTracks.forEach(track => {
        const item = document.createElement('div');
        item.className = 'menu-item' + (track.classList.contains('active') ? ' active-link' : '');
        item.textContent = track.textContent;
        item.onclick = (e) => {
            e.stopPropagation();
            playTrack(track);
        };
        trackTitleDisplay.appendChild(item);
    });
}

function playTrack(trackElement) {
    if (!trackElement) return;
    source.src = trackElement.getAttribute('data-src');
    audio.load();
    audio.play();
    tracks.forEach(t => t.classList.remove('active'));
    trackElement.classList.add('active');
    refreshMenu();
    
    // Reset scroll to top when a track is picked
    trackTitleDisplay.scrollTop = 0;
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
    if (e.type === 'touchstart') {
        // Don't prevent default on touchstart to allow tap-to-open menu
    } else {
        e.preventDefault();
    }
    e.stopPropagation();
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

window.addEventListener('mouseup', () => { 
    clearTimeout(holdTimer); 
    clearInterval(scrubInterval); 
});
