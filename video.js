let vVideo, vSource, vTracks, vPrevBtn, vNextBtn, vTitleDisplay, vPlayBtn, vTimeline, vProgressBar, vOverlayPlay;

// Accepts the host page's custom playlist data directly
function initVideoPlayer(incomingTracks = []) {
    vVideo = document.getElementById('main-video');
    vSource = document.getElementById('video-source');
    vPrevBtn = document.getElementById('vPrevBtn');
    vNextBtn = document.getElementById('vNextBtn');
    vTitleDisplay = document.getElementById('video-title');
    vPlayBtn = document.getElementById('vPlayBtn');
    vTimeline = document.getElementById('vTimeline');
    vProgressBar = document.getElementById('vProgressBar');
    vOverlayPlay = document.getElementById('videoOverlayPlay');

    // Assign the captured tracks directly to our state tracker
    vTracks = incomingTracks;

    if (!vVideo || !vPlayBtn || !vTimeline || vTracks.length === 0) return;

    // Primary Control Map
    vPlayBtn.addEventListener('click', toggleVideoPlayback);
    vVideo.addEventListener('click', toggleVideoPlayback);
    
    // Timeline Monitoring
    vVideo.addEventListener('timeupdate', updateVideoProgress);
    vTimeline.addEventListener('click', seekVideoTime);
    
    // Skip Logic
    vNextBtn.addEventListener('click', skipNextVideo);
    vPrevBtn.addEventListener('click', skipPrevVideo);
    vVideo.addEventListener('ended', skipNextVideo);

    refreshVideoMenu();
    
    // Core Initialization Load (Look at our active track choice)
    const initialActive = vTracks.find(t => t.classList.contains('active')) || vTracks[0];
    if (initialActive) {
        setVideoTrack(initialActive, false);
    }
}

function toggleVideoPlayback() {
    if (vVideo.paused) {
        vVideo.play();
        vPlayBtn.textContent = '║';
        vOverlayPlay.style.opacity = '0';
    } else {
        vVideo.pause();
        vPlayBtn.textContent = '▶';
        vOverlayPlay.style.opacity = '1';
    }
}

function updateVideoProgress() {
    if (vVideo.duration) {
        const percentage = (vVideo.currentTime / vVideo.duration) * 100;
        vProgressBar.style.width = `${percentage}%`;
    }
}

function seekVideoTime(e) {
    const rect = vTimeline.getBoundingClientRect();
    const clickPositionX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const seekPercentage = clickPositionX / timelineWidth;
    vVideo.currentTime = seekPercentage * vVideo.duration;
}

function refreshVideoMenu() {
    if (!vTitleDisplay) return;
    vTitleDisplay.innerHTML = '';

    const sorted = [...vTracks].sort((a, b) => b.classList.contains('active') - a.classList.contains('active'));

    sorted.forEach(track => {
        const item = document.createElement('div');
        item.className = 'v-menu-item' + (track.classList.contains('active') ? ' v-active-link' : '');
        item.textContent = track.textContent;
        item.onclick = (e) => {
            e.stopPropagation();
            setVideoTrack(track, true);
        };
        vTitleDisplay.appendChild(item);
    });
}

function setVideoTrack(trackElement, autoPlay = true) {
    if (!trackElement) return;
    vSource.src = trackElement.getAttribute('data-src');
    vVideo.load();
    
    vTracks.forEach(t => t.classList.remove('active'));
    trackElement.classList.add('active');
    refreshVideoMenu();
    
    vTitleDisplay.scrollTop = 0;
    
    if (autoPlay) {
        vVideo.play();
        vPlayBtn.textContent = '║';
        vOverlayPlay.style.opacity = '0';
    } else {
        vPlayBtn.textContent = '▶';
        vOverlayPlay.style.opacity = '1';
    }
}

function skipNextVideo() {
    let currentIdx = vTracks.findIndex(t => t.classList.contains('active'));
    let nextIdx = (currentIdx + 1) % vTracks.length;
    setVideoTrack(vTracks[nextIdx], true);
}

function skipPrevVideo() {
    let currentIdx = vTracks.findIndex(t => t.classList.contains('active'));
    let prevIdx = (currentIdx - 1 + vTracks.length) % vTracks.length;
    setVideoTrack(vTracks[prevIdx], true);
}
