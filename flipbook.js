pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false;

function initFlipbook(pdfPath) {
    pdfjsLib.getDocument(pdfPath).promise.then(doc => {
        pdfDoc = doc;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        renderSpread();
    }).catch(err => console.error("Error loading PDF:", err));
}

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
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('page-num').textContent = pageNum;
    }
    
    pageRendering = false;
}

async function renderPage(num, canvasId) {
    const page = await pdfDoc.getPage(num);
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    // Use a scale of 1.0 to keep it smaller on desktop
    const viewport = page.getViewport({ scale: 1.0 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = { canvasContext: ctx, viewport: viewport };
    await page.render(renderContext).promise;
}

// Navigation
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.flip-btn');
    if (!btn || pageRendering) return;

    if (btn.id === 'prev-page') {
        if (pageNum <= 1) return;
        pageNum -= 2;
        if (pageNum < 1) pageNum = 1;
        renderSpread();
    } else if (btn.id === 'next-page') {
        if (pageNum + 2 > pdfDoc.numPages) return;
        pageNum += 2;
        renderSpread();
    }
});
