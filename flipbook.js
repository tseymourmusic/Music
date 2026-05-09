// Configuration
const pdfUrl = '/pdfs/Tales_For_All_Time_Score.pdf'; // Path on your GitHub
let pdfDoc = null,
    pageNum = 1,
    pageRendering = false;

// Load PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

async function initFlipbook() {
    const container = document.getElementById('flipbook');
    
    try {
        pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
        document.getElementById('fb-page-num').textContent = `PAGE ${pageNum} / ${pdfDoc.numPages}`;
        renderSpread(pageNum);
    } catch (error) {
        console.error("Error loading PDF: ", error);
    }
}

async function renderSpread(num) {
    const container = document.getElementById('flipbook');
    container.innerHTML = ''; // Clear for new pages
    
    // In a 2-page spread, we render 'num' and 'num + 1'
    renderPage(num);
    if(window.innerWidth > 800 && num + 1 <= pdfDoc.numPages) {
        renderPage(num + 1);
    }
}

async function renderPage(num) {
    const page = await pdfDoc.getPage(num);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const viewport = page.getViewport({ scale: 2 }); // High Detail
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = { canvasContext: ctx, viewport: viewport };
    await page.render(renderContext).promise;

    const pageDiv = document.createElement('div');
    pageDiv.className = 'fb-page';
    pageDiv.appendChild(canvas);
    document.getElementById('flipbook').appendChild(pageDiv);
}

function fbNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum += (window.innerWidth > 800) ? 2 : 1;
    updateUI();
}

function fbPrevPage() {
    if (pageNum <= 1) return;
    pageNum -= (window.innerWidth > 800) ? 2 : 1;
    updateUI();
}

function updateUI() {
    document.getElementById('fb-page-num').textContent = `PAGE ${pageNum} / ${pdfDoc.numPages}`;
    renderSpread(pageNum);
}
