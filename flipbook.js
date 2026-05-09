pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false;

/**
 * 1. REUSABLE NAVIGATION FUNCTIONS
 */
function nextPage() {
    if (pageRendering || !pdfDoc || pageNum + 2 > pdfDoc.numPages) return;
    pageNum += 2;
    renderSpread();
}

function prevPage() {
    if (pageRendering || !pdfDoc || pageNum <= 1) return;
    pageNum -= 2;
    if (pageNum < 1) pageNum = 1;
    renderSpread();
}

/**
 * 2. INITIALIZATION & INTERACTION LOGIC
 */
function initFlipbook(pdfPath) {
    pdfjsLib.getDocument(pdfPath).promise.then(doc => {
        pdfDoc = doc;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        renderSpread();
    }).catch(err => console.error("Error loading PDF:", err));

    const viewport = document.getElementById('flipbook-viewport');

    // --- A. Swipe Functionality for Mobile ---
    let touchstartX = 0;
    let touchendX = 0;

    viewport.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    }, {passive: true});

    viewport.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        const swipeDistance = touchendX - touchstartX;
        if (swipeDistance < -50) nextPage();
        if (swipeDistance > 50) prevPage();
    }, {passive: true});

    // --- B. Mouse Wheel Flipping (Desktop) ---
    viewport.addEventListener('wheel', (e) => {
        // Only trigger on horizontal scroll or Shift + Scroll
        if (Math.abs(e.deltaX) > 40 || (e.shiftKey && Math.abs(e.deltaY) > 40)) {
            e.preventDefault();
            if (e.deltaX > 0 || e.deltaY > 0) nextPage();
            else prevPage();
        }
    }, { passive: false });

    // --- C. Grab & Drag Flipping (Desktop) ---
    let isDragging = false;
    let startX = 0;
    viewport.style.cursor = 'grab';

    viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX;
        viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        viewport.style.cursor = 'grab';
    });

    viewport.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const x = e.pageX;
        const walk = x - startX;

        // 100px drag threshold to flip
        if (Math.abs(walk) > 100) {
            if (walk > 0) prevPage();
            else nextPage();
            isDragging = false; // Reset to prevent multi-page skips
        }
    });
}

/**
 * 3. RENDERING LOGIC
 */
async function renderSpread() {
    pageRendering = true;
    
    // Render Left Page
    await renderPage(pageNum, 'canvas-left');
    
    // Render Right Page
    if (pageNum + 1 <= pdfDoc.numPages) {
        await renderPage(pageNum + 1, 'canvas-right');
        document.getElementById('page-num').textContent = `${pageNum}-${pageNum + 1}`;
    } else {
        const canvas = document.getElementById('canvas-right');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('page-num').textContent = pageNum;
    }
    
    pageRendering = false;
}

async function renderPage(num, canvasId) {
    const page = await pdfDoc.getPage(num);
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    const viewport = page.getViewport({ scale: 1.0 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = { canvasContext: ctx, viewport: viewport };
    await page.render(renderContext).promise;
}

/**
 * 4. EVENT LISTENERS
 */
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.flip-btn');
    if (!btn) return;

    if (btn.id === 'prev-page') {
        prevPage();
    } else if (btn.id === 'next-page') {
        nextPage();
    }
});
