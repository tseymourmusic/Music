/* player.js */
const audio = document.getElementById('audio');
const source = document.getElementById('audio-source');
const tracks = Array.from(document.querySelectorAll('.track'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const trackTitleDisplay = document.getElementById('track-title');

let holdTimer, scrubInterval, isScrubbing = false, pressStartTime;

/**
 * NEW: Rebuilds the selectable menu inside the track-title div
 * Always puts the active track at the very top.
 */
function refreshMenu() {
    if (!trackTitleDisplay) return;
    
    // Clear the current display
    trackTitleDisplay.innerHTML = '';
    
    // Sort tracks: active one first, then others
    const sortedTracks = [...tracks].sort((a, b) => {
        return b.classList.contains('active') - a.classList.contains('active');
    });

    // Create the clickable items
    sortedTracks.forEach(track => {
        const item = document.createElement('div');
        item.className = 'menu-item' + (track.classList.contains('active') ? ' active-link' : '');
        item.textContent = track.textContent;
        
        // When a track is picked from the popup
        item.onclick = (e) => {
            e.stopPropagation(); // Prevents hover glitches
            playTrack(track);
        };
        
        trackTitleDisplay.appendChild(item);
    });
}

// Core function to change tracks
function playTrack(trackElement) {
    if (!trackElement) return;
    
    source.src = trackElement.getAttribute('data-src');
    audio.load();
    audio.play();

    tracks.forEach(t => t.classList.remove('active'));
    trackElement.classList.add('active');

    // Update the menu reorder immediately
    refreshMenu();
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

// Logic for Rewind/Fast-Forward on Hold
function onDown(e, direction) {
    e.preventDefault();
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

// Event Listeners for Buttons
nextBtn.addEventListener('mousedown', (e) => onDown(e, 'next'));
nextBtn.addEventListener('touchstart', (e) => onDown(e, 'next'), {passive: false});
nextBtn.addEventListener('mouseup', (e) => onUp(e, 'next'));
nextBtn.addEventListener('touchend', (e) => onUp(e, 'next'), {passive: false});

prevBtn.addEventListener('mousedown', (e) => onDown(e, 'prev'));
prevBtn.addEventListener('touchstart', (e) => onDown(e, 'prev'), {passive: false});
prevBtn.addEventListener('mouseup', (e) => onUp(e, 'prev'));
prevBtn.addEventListener('touchend', (e) => onUp(e, 'prev'), {passive: false});

window.addEventListener('mouseup', () => { clearTimeout(holdTimer); clearInterval(scrubInterval); });

// Handle track ended
audio.addEventListener('ended', skipNext);

// INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
    refreshMenu(); // Build the menu for the first time
    
    document.getElementById('track-title').addEventListener('touchmove', function(e) {
        // If the menu is expanded, don't let the touch move the background
        if (this.scrollHeight > this.offsetHeight) {
            e.stopPropagation();
        }
    }, { passive: false });
});
