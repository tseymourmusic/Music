pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false;

/**
 * 1. REUSABLE NAVIGATION FUNCTIONS
 * These are called by both clicks and swipes
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
 * 2. INITIALIZATION
 */
function initFlipbook(pdfPath) {
    pdfjsLib.getDocument(pdfPath).promise.then(doc => {
        pdfDoc = doc;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        renderSpread();
    }).catch(err => console.error("Error loading PDF:", err));

    // --- Swipe Functionality for Mobile ---
    const viewport = document.getElementById('flipbook-viewport');
    let touchstartX = 0;
    let touchendX = 0;

    viewport.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    }, {passive: true});

    viewport.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        const swipeDistance = touchendX - touchstartX;
        
        // Threshold of 50px to prevent accidental flips
        if (swipeDistance < -50) nextPage();
        if (swipeDistance > 50) prevPage();
    }, {passive: true});
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
        // Clear right canvas if no page exists
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
    
    // Use a scale of 1.0 for standard display
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
