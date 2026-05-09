pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false;

const scale = 1.0; // Lower scale for spreads to keep quality high but size manageable

function initFlipbook(pdfPath) {
    pdfjsLib.getDocument(pdfPath).promise.then(pdfDoc_ => {
        pdfDoc = pdfDoc_;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        renderSpread(pageNum);
    });
}

function renderSpread(num) {
    pageIsRendering = true;
    
    // Render Left Page
    renderSinglePage(num, 'canvas-left');
    
    // Render Right Page (if it exists)
    if (num + 1 <= pdfDoc.numPages) {
        renderSinglePage(num + 1, 'canvas-right');
        document.getElementById('page-num').textContent = `${num}-${num+1}`;
    } else {
        // Clear right canvas if at the very end of a book with odd pages
        const canvasR = document.getElementById('canvas-right');
        canvasR.getContext('2d').clearRect(0, 0, canvasR.width, canvasR.height);
        document.getElementById('page-num').textContent = num;
    }
}

function renderSinglePage(num, canvasId) {
    pdfDoc.getPage(num).then(page => {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({ scale });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = { canvasContext: ctx, viewport: viewport };
        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
        });
    });
}

// Navigation Events - Jump by 2 for spreads
document.addEventListener('click', (e) => {
    if (e.target.id === 'prev-page' || e.target.closest('#prev-page')) {
        if (pageNum <= 1) return;
        pageNum -= 2;
        if (pageNum < 1) pageNum = 1;
        renderSpread(pageNum);
    }
    if (e.target.id === 'next-page' || e.target.closest('#next-page')) {
        if (pageNum + 2 > pdfDoc.numPages) return;
        pageNum += 2;
        renderSpread(pageNum);
    }
});
