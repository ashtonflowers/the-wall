// Contents of grid.js
// Includes download layout change (V13 - Category Text Labels, No Swatches)
// Includes addition of 4x4 size (V14)

// --- Dynamic Grid Size Setup ---
let maxGrid2Items;
let currentSizeParam = '5x6'; // Default size string
let sizeClassName = 'magic-wall-5x6'; // Default class name

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const sizeParam = getQueryParam('size');
// console.log(`[Init] Size parameter from URL: ${sizeParam}`);

// **** ADDED 4x4 CASE ****
switch (sizeParam) {
    case '2x3': maxGrid2Items = 6; sizeClassName = 'magic-wall-2x3'; currentSizeParam = '2x3'; break;
    case '3x3': maxGrid2Items = 9; sizeClassName = 'magic-wall-3x3'; currentSizeParam = '3x3'; break;
    case '3x4': maxGrid2Items = 12; sizeClassName = 'magic-wall-3x4'; currentSizeParam = '3x4'; break;
    case '4x3': maxGrid2Items = 12; sizeClassName = 'magic-wall-4x3'; currentSizeParam = '4x3'; break;
    case '4x4': maxGrid2Items = 16; sizeClassName = 'magic-wall-4x4'; currentSizeParam = '4x4'; break; // <-- New Case
    case '4x5': maxGrid2Items = 20; sizeClassName = 'magic-wall-4x5'; currentSizeParam = '4x5'; break;
    case '4x6': maxGrid2Items = 24; sizeClassName = 'magic-wall-4x6'; currentSizeParam = '4x6'; break;
    case '5x5': maxGrid2Items = 25; sizeClassName = 'magic-wall-5x5'; currentSizeParam = '5x5'; break;
    case '5x6': maxGrid2Items = 30; sizeClassName = 'magic-wall-5x6'; currentSizeParam = '5x6'; break;
    case '6x6': maxGrid2Items = 36; sizeClassName = 'magic-wall-6x6'; currentSizeParam = '6x6'; break;
    case '7x7': maxGrid2Items = 49; sizeClassName = 'magic-wall-7x7'; currentSizeParam = '7x7'; break;
    default:
        console.warn(`[Init] Invalid/missing size parameter. Defaulting to 30 (5x6).`);
        maxGrid2Items = 30; sizeClassName = 'magic-wall-5x6'; currentSizeParam = '5x6 (Default)'; break;
}
// ***********************
// console.log(`[Init] Max grid items set to: ${maxGrid2Items}`);
// console.log(`[Init] Determined body class: ${sizeClassName}`);
// --- End Dynamic Grid Size Setup ---


// --- Global Variables ---
let grid1, grid2; // Muuri instances
let itemIdCounter = 0; // Counter for unique item IDs during upload


// --- Functions ---

function applyBodyClassAndSizeDisplay() {
    // console.log(`[Body Class] Applying class: ${sizeClassName}`);
    // **** ADDED magic-wall-4x4 TO possibleClasses ****
    const possibleClasses = [
        'magic-wall-2x3', 'magic-wall-3x3', 'magic-wall-3x4', 'magic-wall-4x3',
        'magic-wall-4x4', // <-- New class added
        'magic-wall-4x5', 'magic-wall-4x6', 'magic-wall-5x5', 'magic-wall-5x6',
        'magic-wall-6x6', 'magic-wall-7x7'
    ];
    // **********************************************
    document.body.classList.remove(...possibleClasses);
    if (sizeClassName) { document.body.classList.add(sizeClassName); }
    document.title = `JB Customizer (${currentSizeParam.replace(' (Default)', '')})`;
    const sizeDisplay = document.getElementById('current-grid-size-display');
    if (sizeDisplay) { sizeDisplay.textContent = `Grid Size: ${currentSizeParam.replace(' (Default)','')} - Max ${maxGrid2Items} Squares`; }
}

function initializeGrids() {
     // console.log("[Muuri] Initializing...");
     const grid1Element = document.querySelector('.grid-1');
     const grid2Element = document.querySelector('.grid-2');
     if (!grid1Element || !grid2Element) { console.error("[Muuri] Grid elements not found!"); return; }
     try {
        grid1 = new Muuri(grid1Element, { dragEnabled: true, dragContainer: document.body, dragSort: () => [grid1, grid2] });
        grid2 = new Muuri(grid2Element, { dragEnabled: true, dragContainer: document.body, dragSort: () => [grid1, grid2] });
        grid2.on('dragReleaseEnd', function (item) { /* ... Limit logic ... */
            const finalItemsInGrid2 = grid2.getItems().length;
            if (finalItemsInGrid2 > maxGrid2Items) {
                if (item.getGrid() === grid2) {
                    try { grid2.send(item, grid1, -1, { layoutSender: false }); grid1.layout(); }
                    catch (e) { console.error("[Muuri] Error sending item back:", e); grid1.layout(); grid2.layout(); }
                } else { console.warn("[Muuri] Item not in grid2 on check."); grid1.layout(); grid2.layout(); }
            }
        });
         // console.log("[Muuri] Initialized.");
     } catch (muuriError) { console.error("[Muuri] Error initializing:", muuriError); }
}

function initializeColorPickers() {
    // console.log("[Color Picker] Initializing...");
    document.querySelectorAll('.color-options').forEach(group => {
        if (!group) return;
        group.addEventListener('click', function (e) { /* ... Color picker logic ... */
            if (!e.target.classList.contains('color-swatch')) return;
            const swatch = e.target; const imgUrl = swatch.dataset.img; const target = group.dataset.target; const colorName = swatch.dataset.name || '?';
            group.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active')); swatch.classList.add('active'); // Adds .active class
            const container = document.querySelector('.grid-container'); const sashing = document.querySelector('.grid-2'); const previewImg = document.querySelector('#backing-preview img');
            const borderingLabel = document.getElementById('bordering-color-name'); const sashingLabel = document.getElementById('sashing-color-name'); const backingLabel = document.getElementById('backing-color-name');
            // Update HTML text content (this text is NOT used directly in download V13+)
            if (target === "grid-container" && container) { container.style.backgroundImage = `url('${imgUrl}')`; if (borderingLabel) borderingLabel.textContent = `Selected: ${colorName}`; }
            else if (target === "grid-2" && sashing) { sashing.style.backgroundImage = `url('${imgUrl}')`; if(sashingLabel) sashingLabel.textContent = `Selected: ${colorName}`; }
            else if (target === "backing" && previewImg) { previewImg.src = imgUrl; previewImg.style.display = 'block'; if(backingLabel) backingLabel.textContent = `Selected: ${colorName}`; }
       });
    });
    // console.log("[Color Picker] Initialized.");
}

function initializeDefaults() {
    // console.log("[Defaults] Initializing...");
    function applySwatchStyle(swatch, target) { if (!swatch) return; swatch.click(); } // .click() should trigger the 'active' class addition
    const panel = document.querySelector('.customization-panel'); if (!panel) return;
    const borderingGroup = panel.querySelector('.customization-group:nth-of-type(1) .color-options'); const defaultBorderingSwatch = borderingGroup?.querySelector('.color-swatch[data-img="assets/jersey-blue.webp"]') || borderingGroup?.querySelector('.color-swatch'); applySwatchStyle(defaultBorderingSwatch, "grid-container");
    const sashingGroup = panel.querySelector('.customization-group:nth-of-type(2) .color-options'); const defaultSashingSwatch = sashingGroup?.querySelector('.color-swatch[data-img="assets/jersey-red.webp"]') || sashingGroup?.querySelector('.color-swatch'); applySwatchStyle(defaultSashingSwatch, "grid-2");
    const backingGroup = panel.querySelector('.customization-group:nth-of-type(3) .color-options'); const defaultBackingSwatch = backingGroup?.querySelector('.color-swatch'); applySwatchStyle(defaultBackingSwatch, "backing");
    // console.log("[Defaults] Initialized.");
}

function initializeUpload() {
    // console.log("[Upload] Initializing...");
     const uploadTriggerButton = document.getElementById('upload-trigger-btn'); const fileInput = document.getElementById('image-upload');
     if (!uploadTriggerButton || !fileInput) { console.error("[Upload] Elements not found!"); return; }
     const loadingWheel = uploadTriggerButton.querySelector('.loading-wheel'); const btnText = uploadTriggerButton.querySelector('.btn-text'); const originalBtnText = btnText?.textContent || 'Upload';
     uploadTriggerButton.addEventListener('click', () => { fileInput.click(); });
     fileInput.addEventListener('change', function (e) { /* ... Upload change handler ... */
         const files = e.target.files; if (files.length === 0) return;
         if(loadingWheel) loadingWheel.style.display = 'inline-block'; if(btnText) btnText.textContent = `Processing ${files.length}...`; uploadTriggerButton.disabled = true;
         let processedCount = 0; const totalFiles = files.length;
         function checkCompletion() {
             processedCount++; if (processedCount === totalFiles) { if(loadingWheel) loadingWheel.style.display = 'none'; if(btnText) btnText.textContent = originalBtnText; uploadTriggerButton.disabled = false; fileInput.value = ''; } else { if(btnText) btnText.textContent = `Processing ${processedCount + 1}/${totalFiles}...`; }
         }
         Array.from(files).forEach((file) => { // Removed index as it wasn't used here
             if (!file.type.match('image.*')) { console.warn(`[Upload] Skipping non-image: ${file.name}`); checkCompletion(); return; }
             compressImageFile(file).then(compressedImageUrl => {
                 const newItem = document.createElement('div'); newItem.classList.add('item', 'uploaded-item'); newItem.id = `muuri-item-upload-${Date.now()}-${itemIdCounter++}`; newItem.innerHTML = `<div class="item-content" style="background-image: url('${compressedImageUrl}');"></div>`;
                 if(grid1?.add) { try { grid1.add(newItem, { index: 0 }); } catch (addError) { console.error("[Upload] grid1.add Error:", addError); } } else { console.error("[Upload] Grid1 invalid."); } checkCompletion();
             }).catch(error => { console.error(`[Upload] Error processing ${file.name}:`, error); checkCompletion(); });
         });
     });
     // console.log("[Upload] Initialized.");
}

function compressImageFile(file, quality = 0.7, maxWidth = 800, maxHeight = 800) { /* ... Keep compress logic ... */
      return new Promise((resolve, reject) => { const r=new FileReader();r.onload=(e)=>{const i=new Image();i.src=e.target.result;i.onload=()=>{const c=document.createElement('canvas'),x=c.getContext('2d');let w=i.width,h=i.height;if(w>maxWidth||h>maxHeight){const rt=Math.min(maxWidth/w,maxHeight/h);w=Math.round(w*rt);h=Math.round(h*rt);}c.width=w;c.height=h;x.drawImage(i,0,0,w,h);let d;try{d=c.toDataURL('image/webp',quality);if(!d||d.length<100)throw 0;}catch(e){d=c.toDataURL('image/jpeg',quality);}resolve(d);};i.onerror=()=>reject(new Error("Img load fail"));};r.onerror=()=>reject(new Error("File read fail"));r.readAsDataURL(file);});
}


// --- Download Button Logic ---

// Helper function to load images
function loadImage(url, context = "Unknown") {
    return new Promise((resolve) => { // Always resolve null on error
        const logPrefix = `[loadImage/${context}]`;
        if (!url || typeof url !== 'string' || url.toLowerCase() === 'none') { resolve(null); return; }
        const match = url.match(/url\((['"])?(.*?)\1\)/); // Handles optional quotes
        let imgSrc = match ? match[2] : url; // Use extracted URL or original string
        if (!imgSrc) { /* console.warn(`${logPrefix} Could not extract valid URL or source from: ${url}`); */ resolve(null); return; }
        const img = new Image(); img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => { console.error(`${logPrefix} Failed: ${imgSrc}`, err); resolve(null); } // Log errors here!
        try { img.src = imgSrc; } catch (e) { console.error(`${logPrefix} Error setting src for ${imgSrc}:`, e); resolve(null); }
    });
}

// Function to draw the grid accurately onto a provided canvas context
async function renderCorrectGridToCanvas(ctx, gridContainerElement, gridElement, itemsToDraw, targetWidth, targetHeight, scale) {
    const logPrefix = "[Manual Grid Render]";
    if (!ctx || !gridContainerElement || !gridElement || targetWidth <= 0 || targetHeight <= 0) { throw new Error("Invalid args"); }
    try {
        ctx.save(); ctx.scale(scale, scale);
        const containerStyle = window.getComputedStyle(gridContainerElement); const containerBGImage = containerStyle.backgroundImage; const containerBGColor = containerStyle.backgroundColor; if (containerBGImage !== 'none') { const img = await loadImage(containerBGImage, "ContainerBG"); if(img) ctx.drawImage(img, 0, 0, targetWidth, targetHeight); } else if (containerBGColor && containerBGColor !== 'rgba(0, 0, 0, 0)') { ctx.fillStyle = containerBGColor; ctx.fillRect(0, 0, targetWidth, targetHeight); }
        const gridStyle = window.getComputedStyle(gridElement); const gridBGImage = gridStyle.backgroundImage; const gridBGColor = gridStyle.backgroundColor; const containerRect = gridContainerElement.getBoundingClientRect(); const gridRect = gridElement.getBoundingClientRect(); const gridX = gridRect.left - containerRect.left; const gridY = gridRect.top - containerRect.top; const gridWidth = gridElement.offsetWidth; const gridHeight = gridElement.offsetHeight; if (gridBGImage !== 'none') { const img = await loadImage(gridBGImage, "GridBG"); if(img) ctx.drawImage(img, gridX, gridY, gridWidth, gridHeight); } else if (gridBGColor && gridBGColor !== 'rgba(0, 0, 0, 0)') { ctx.fillStyle = gridBGColor; ctx.fillRect(gridX, gridY, gridWidth, gridHeight); }
        const itemDrawPromises = itemsToDraw.map(item => new Promise(async (res) => { try { const el=item.getElement(), ct=el?.querySelector('.item-content'); if(!el||!ct) return res(); const bg=window.getComputedStyle(ct).backgroundImage, r=el.getBoundingClientRect(), x=r.left-containerRect.left, y=r.top-containerRect.top, w=el.offsetWidth, h=el.offsetHeight, img=await loadImage(bg,`Item`); if(img)ctx.drawImage(img,x,y,w,h); res(); }catch(e){console.error("Item draw error",e);res();} }));
        await Promise.all(itemDrawPromises);
        ctx.restore(); return true;
    } catch (error) { if(ctx) ctx.restore(); console.error(`${logPrefix} FATAL ERROR:`, error); return false; }
}

// **** START initializeDownload FUNCTION (V13 - Category Text Labels, No Swatches) ****
function initializeDownload() {
    console.log("[Download] Initializing (Manual + Text Only Labels - V13)..."); // Version marker
    const downloadBtn = document.getElementById('download-btn');
    if (!downloadBtn) { console.error("[Download] Button not found!"); return; }

    downloadBtn.addEventListener('click', async function () {
        console.log("[Download] ========== BUTTON CLICKED (V13 Category Text Labels) ==========");
        const gridContainerElement = document.querySelector('.grid-container');
        const gridElement = document.querySelector('.grid-2');
        const panelElement = document.querySelector('.customization-panel');
        if (!gridContainerElement || !gridElement || !grid2 || !panelElement) {
             console.error("Missing required elements."); alert("Error: Could not find elements."); return;
        }

        const btnTextEl = downloadBtn.querySelector('.btn-text');
        const originalBtnText = btnTextEl?.textContent || 'Download Design';
        downloadBtn.disabled = true; if(btnTextEl) btnTextEl.textContent = 'Generating...'; else downloadBtn.textContent = 'Generating...';

        try {
            // --- Step 1: Render Correct Grid Manually ---
            console.log("[Download] STEP 1: Calling renderCorrectGridToCanvas...");
            const itemsToDraw = grid2.getItems();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Failed context for download canvas.");

            const gridContainerWidth = gridContainerElement.offsetWidth;
            const gridContainerHeight = gridContainerElement.offsetHeight;
            const renderScale = 1.5;

            // *** Declare constants for layout ***
            const textLineHeightEst = 22; // Estimated height per text line
            const spacingBelowGrid = 25; // Space below grid before text
            const spacingBelowText = Math.round(15 * renderScale); // Space below last text line
            const bottomPadding = 20;  // Padding at the very bottom

            // *** Adjust extraHeight calculation for text only ***
            const extraHeight = Math.round((spacingBelowGrid + (textLineHeightEst * 3) + spacingBelowText + bottomPadding) * renderScale);

            if(gridContainerWidth <= 0 || gridContainerHeight <= 0) throw new Error("Grid container has zero dimensions.");
            canvas.width = Math.round(gridContainerWidth * renderScale);
            canvas.height = Math.round(gridContainerHeight * renderScale) + extraHeight; // Set canvas height

            ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            const gridRenderSuccess = await renderCorrectGridToCanvas(ctx, gridContainerElement, gridElement, itemsToDraw, gridContainerWidth, gridContainerHeight, renderScale);
            if (!gridRenderSuccess) throw new Error("Manual grid rendering failed.");
            console.log("[Download] STEP 1 Complete: Grid rendered.");

            // --- Step 2: Add Text Info Below Grid ---
            console.log("[Download] STEP 2: Adding text info only...");

            // Find active swatches to get their data-name attributes
            const activeBorderSwatch = panelElement.querySelector('.customization-group:nth-of-type(1) .color-swatch.active');
            const activeSashingSwatch = panelElement.querySelector('.customization-group:nth-of-type(2) .color-swatch.active');
            const activeBackingSwatch = panelElement.querySelector('.customization-group:nth-of-type(3) .color-swatch.active');

            // *** Get color names directly from swatch data-name attribute ***
            const borderName = activeBorderSwatch?.dataset.name ?? 'N/A';
            const sashingName = activeSashingSwatch?.dataset.name ?? 'N/A';
            const backingName = activeBackingSwatch?.dataset.name ?? 'N/A';

            // Get Image URLs (Optional: only needed if keeping loadImage calls for timing/future use)
            const borderSwatchUrlMatch = activeBorderSwatch?.style.backgroundImage.match(/url\((['"])?(.*?)\1\)/);
            const borderSwatchImgUrl = borderSwatchUrlMatch ? borderSwatchUrlMatch[2] : activeBorderSwatch?.dataset.img;
            const sashingSwatchUrlMatch = activeSashingSwatch?.style.backgroundImage.match(/url\((['"])?(.*?)\1\)/);
            const sashingSwatchImgUrl = sashingSwatchUrlMatch ? sashingSwatchUrlMatch[2] : activeSashingSwatch?.dataset.img;
            const backingSwatchUrlMatch = activeBackingSwatch?.style.backgroundImage.match(/url\((['"])?(.*?)\1\)/);
            const backingSwatchImgUrl = backingSwatchUrlMatch ? backingSwatchUrlMatch[2] : activeBackingSwatch?.dataset.img;


            // Calculate common positions
            const textStartY = Math.round(gridContainerHeight * renderScale) + Math.round(spacingBelowGrid * renderScale);
            const textStartX = Math.round(20 * renderScale); // Text starts near left edge
            const lineSpacing = Math.round(textLineHeightEst * renderScale); // Scaled line height

            // Font settings
            ctx.fillStyle = '#000000';
            ctx.font = `bold ${Math.round(14 * renderScale)}px Montserrat, sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle'; // Align text vertically

            // --- Load images (optional) and draw text lines ---
            const drawingPromises = []; // Keep for timing if loadImage calls are kept
            let currentY = textStartY + lineSpacing / 2; // Adjust Y for chosen baseline ('middle')

             // --- Bordering Line (Text Only) ---
            if (borderSwatchImgUrl) { // Keep check if depending on URL for logic later
                console.log(`[Download] Found Border Swatch URL: ${borderSwatchImgUrl}`); // Log URL found
                 drawingPromises.push(loadImage(borderSwatchImgUrl, "BorderSwatch").then(img => {
                     if (!img) { console.warn("[Download] Border Swatch image failed to load."); }
                     // *** NO SWATCH DRAWING HERE ***
                 }));
            } else { console.warn("[Download] Border Swatch URL not found."); }
            // *** Draw text using data-name ***
            ctx.fillText(`Bordering: ${borderName}`, textStartX, currentY);
            currentY += lineSpacing; // Move to next line

            // --- Sashing Line (Text Only) ---
            if (sashingSwatchImgUrl) {
                 console.log(`[Download] Found Sashing Swatch URL: ${sashingSwatchImgUrl}`);
                drawingPromises.push(
                    loadImage(sashingSwatchImgUrl, "SashingSwatch").then(img => {
                        if (!img) { console.warn("[Download] Sashing Swatch image failed to load."); }
                         // *** NO SWATCH DRAWING HERE ***
                    })
                );
            } else { console.warn("[Download] Sashing Swatch URL not found."); }
             // *** Draw text using data-name ***
            ctx.fillText(`Sashing: ${sashingName}`, textStartX, currentY);
            currentY += lineSpacing; // Move to next line

            // --- Backing Line (Text Only) ---
            if (backingSwatchImgUrl) {
                console.log(`[Download] Found Backing Swatch URL: ${backingSwatchImgUrl}`);
                drawingPromises.push(loadImage(backingSwatchImgUrl, "BackingSwatch").then(img => {
                    if (!img) { console.warn("[Download] Backing Swatch image failed to load."); }
                     // *** NO SWATCH DRAWING HERE ***
                }));
            } else { console.warn("[Download] Backing Swatch URL not found."); }
            // *** Draw text using data-name ***
            ctx.fillText(`Backing: ${backingName}`, textStartX, currentY);

            // Wait for optional image loading attempts to complete
            await Promise.all(drawingPromises);
            console.log("[Download] STEP 2 Complete: Text drawn.");


            // --- Step 3: Download the modified canvas ---
            console.log("[Download] STEP 3: Generating link...");
            const link = document.createElement('a');
            const sizeSuffix = currentSizeParam?.replace(' (Default)', '') || 'custom';
            link.download = `jb-design-${sizeSuffix}-layout_v13_text_only.png`; // Updated filename version
            let dataUrl;
            try { dataUrl = canvas.toDataURL('image/png'); }
            catch (e) { throw new Error(`toDataURL failed: ${e.message}. Is the canvas tainted?`); }
            if (!dataUrl || dataUrl.length < 100) throw new Error("Generated Data URL is empty or invalid.");
            link.href = dataUrl;
            link.click();
            console.log("[Download] STEP 3 Complete.");

        } catch (error) {
             console.error("------------------- DOWNLOAD ERROR (V13) --------------------");
             console.error("[Download] ERROR CAUGHT:", error.message); console.error(error);
             console.error("--------------------------------------------------");
             alert("An error occurred generating the download. Check console. Error: " + error.message);
        } finally {
             // Re-enable button
             downloadBtn.disabled = false; if(btnTextEl) { btnTextEl.textContent = originalBtnText; } else { downloadBtn.textContent = originalBtnText; }
             console.log("[Download] ========== PROCESS FINISHED (V13) ==========");
        }
    });
    console.log("[Download] Initialized (Manual + Text Only Labels - V13)."); // Version marker
}
// **** END initializeDownload FUNCTION (V13) ****

// --- End Download ---


 // --- Initialize everything after DOM is loaded ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired...");
    try {
        // Basic checks for essential elements
        if (!document.querySelector('.grid-1') || !document.querySelector('.grid-2')) { throw new Error("Muuri grid elements (.grid-1 or .grid-2) not found!"); }
        if (!document.querySelector('.customization-panel')) { throw new Error("Customization panel (.customization-panel) not found!"); }
        if (!document.getElementById('upload-trigger-btn') || !document.getElementById('download-btn')) { throw new Error("Action buttons (#upload-trigger-btn or #download-btn) not found!"); }
        if (!document.getElementById('bordering-color-name') || !document.getElementById('sashing-color-name') || !document.getElementById('backing-color-name')) { console.warn("One or more color name labels not found (bordering-color-name, sashing-color-name, backing-color-name). Text might be missing in download."); }

        // Initialize components
        applyBodyClassAndSizeDisplay();
        initializeGrids();
        initializeColorPickers();
        initializeDefaults();
        initializeUpload();
        initializeDownload(); // Call the final correct download init (V13)

        console.log("Initialization calls complete.");
    } catch (initError) {
         console.error("Initialization Error:", initError);
         // Display a user-friendly message if initialization fails critically
         alert("Error initializing the customizer page. Some features might not work correctly. Please check the console for details.");
    }
});
// --- End Initialization ---