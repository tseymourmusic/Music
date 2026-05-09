// Configuration
let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
    canvas = document.getElementById('flipbook-canvas'),
    ctx = canvas?.getContext('2d');

function initFlipbook(pdfPath) {
    if (!pdfPath) return;

    // Initialize PDF.js
    pdfjsLib.getDocument(pdfPath).promise.then(pdfDoc_ => {
        pdfDoc = pdfDoc_;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        renderPage(pageNum);
    });
}

function renderPage(num) {
    pageIsRendering = true;

    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport: viewport
        };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        document.getElementById('page-num').textContent = num;
    });
}

function queueRenderPage(num) {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
}

// Navigation Events
document.addEventListener('click', (e) => {
    if (e.target.id === 'prev-page' || e.target.closest('#prev-page')) {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    }
    if (e.target.id === 'next-page' || e.target.closest('#next-page')) {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
    }
});
