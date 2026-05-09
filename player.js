/* player.js - Independent Version */

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

    // Simplified Listeners: No more fighting iframes
    nextBtn.addEventListener('touchstart', (e) => onDown(e, 'next'), {passive: true});
    nextBtn.addEventListener('touchend', (e) => onUp(e, 'next'), {passive: true});
    prevBtn.addEventListener('touchstart', (e) => onDown(e, 'prev'), {passive: true});
    prevBtn.addEventListener('touchend', (e) => onUp(e, 'prev'), {passive: true});

    // Desktop Mouse support
    nextBtn.addEventListener('mousedown', (e) => onDown(e, 'next'));
    nextBtn.addEventListener('mouseup', (e) => onUp(e, 'next'));
    prevBtn.addEventListener('mousedown', (e) => onDown(e, 'prev'));
    prevBtn.addEventListener('mouseup', (e) => onUp(e, 'prev'));

    audio.addEventListener('ended', skipNext);

    refreshMenu();
}

function refreshMenu() {
    if (!trackTitleDisplay) return;
    trackTitleDisplay.innerHTML = '';
    
    // Sort active to top so it's visible in the collapsed state
    const sortedTracks = [...tracks].sort((a, b) => b.classList.contains('active') - a.classList.contains('active'));

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
    trackTitleDisplay.scrollTop = 0; // Reset scroll window
}

// ... skipNext and skipPrev functions stay the same ...

function onDown(e, direction) {
    // Only prevent default on non-touch to avoid breaking tap-interactions
    if (e.type !== 'touchstart') e.preventDefault();
    
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
    const duration = Date.now() - pressStartTime;
    if (duration < 250) {
        direction === 'next' ? skipNext() : skipPrev();
    }
}
