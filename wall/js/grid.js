// Contents of grid.js

const API_URL = 'http://localhost:3000';

// --- Dynamic Grid Size Setup ---
let maxGrid2Items;
let currentSizeParam = '5x6'; // Default size string
let sizeClassName = 'magic-wall-5x6'; // Default class name

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const sizeParam = getQueryParam('size');

switch (sizeParam) {
    case '2x3': maxGrid2Items = 6; sizeClassName = 'magic-wall-2x3'; currentSizeParam = '2x3'; break;
    case '3x3': maxGrid2Items = 9; sizeClassName = 'magic-wall-3x3'; currentSizeParam = '3x3'; break;
    case '3x4': maxGrid2Items = 12; sizeClassName = 'magic-wall-3x4'; currentSizeParam = '3x4'; break;
    case '4x3': maxGrid2Items = 12; sizeClassName = 'magic-wall-4x3'; currentSizeParam = '4x3'; break;
    case '4x4': maxGrid2Items = 16; sizeClassName = 'magic-wall-4x4'; currentSizeParam = '4x4'; break;
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
// --- End Dynamic Grid Size Setup ---


// --- Global Variables ---
let grid1, grid2; // Muuri instances
let itemIdCounter = 0; // Counter for unique item IDs during upload


// --- Functions ---

function applyBodyClassAndSizeDisplay() {
    const possibleClasses = [
        'magic-wall-2x3', 'magic-wall-3x3', 'magic-wall-3x4', 'magic-wall-4x3',
        'magic-wall-4x4', 'magic-wall-4x5', 'magic-wall-4x6', 'magic-wall-5x5',
        'magic-wall-5x6', 'magic-wall-6x6', 'magic-wall-7x7'
    ];
    document.body.classList.remove(...possibleClasses);
    if (sizeClassName) { document.body.classList.add(sizeClassName); }
    document.title = `JB Customizer (${currentSizeParam.replace(' (Default)', '')})`;
    const sizeDisplay = document.getElementById('current-grid-size-display');
    if (sizeDisplay) { sizeDisplay.textContent = `Grid Size: ${currentSizeParam.replace(' (Default)','')} - Max ${maxGrid2Items} Squares`; }
}

function initializeGrids() {
     const grid1Element = document.querySelector('.grid-1');
     const grid2Element = document.querySelector('.grid-2');
     if (!grid1Element || !grid2Element) { console.error("[Muuri] Grid elements not found!"); return; }
     try {
        grid1 = new Muuri(grid1Element, { dragEnabled: true, dragContainer: document.body, dragSort: () => [grid1, grid2] });
        grid2 = new Muuri(grid2Element, { dragEnabled: true, dragContainer: document.body, dragSort: () => [grid1, grid2] });
     } catch (muuriError) { console.error("[Muuri] Error initializing:", muuriError); }
}

function initializeColorPickers() {
    document.querySelectorAll('.color-options').forEach(group => {
        if (!group) return;
        group.addEventListener('click', function(e) {
            const swatchContainer = e.target.closest('.swatch-container');
            if (!swatchContainer) return;

            const swatch = swatchContainer.querySelector('.color-swatch');
            if (!swatch) return;

            const imgUrl = swatch.dataset.img;
            const target = group.dataset.target;

            group.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');

            const container = document.querySelector('.grid-container');
            const sashing = document.querySelector('.grid-2');

            if (target === "grid-container" && container) {
                container.style.backgroundImage = `url('${imgUrl}')`;
            } else if (target === "grid-2" && sashing) {
                sashing.style.backgroundImage = `url('${imgUrl}')`;
            } else if (target === "backing") {
                // Backing preview logic can be added here if needed in the future
            }
        });
    });
}

function initializeDefaults() {
    function applySwatchStyle(swatch) { if (!swatch) return; swatch.click(); }
    const panel = document.querySelector('.customization-panel'); if (!panel) return;
    const borderingGroup = panel.querySelector('.customization-group:nth-of-type(1) .color-options');
    const defaultBorderingSwatch = borderingGroup?.querySelector('.color-swatch[data-img="assets/jersey-blue.webp"]') || borderingGroup?.querySelector('.color-swatch');
    applySwatchStyle(defaultBorderingSwatch);

    const sashingGroup = panel.querySelector('.customization-group:nth-of-type(2) .color-options');
    const defaultSashingSwatch = sashingGroup?.querySelector('.color-swatch[data-img="assets/jersey-red.webp"]') || sashingGroup?.querySelector('.color-swatch');
    applySwatchStyle(defaultSashingSwatch);

    const backingGroup = panel.querySelector('.customization-group:nth-of-type(3) .color-options');
    const defaultBackingSwatch = backingGroup?.querySelector('.color-swatch');
    applySwatchStyle(defaultBackingSwatch);
}

function initializeUpload() {
    const uploadTriggerButton = document.getElementById('upload-trigger-btn');
    const fileInput = document.getElementById('image-upload');
    const availableSquaresGrid = document.querySelector('.grid-1');
    const uploadSection = document.querySelector('.upload-section');

    if (!uploadTriggerButton || !fileInput || !availableSquaresGrid || !uploadSection) {
        console.error("[Upload] Essential elements not found!");
        return;
    }

    const loadingWheel = uploadTriggerButton.querySelector('.loading-wheel');
    const btnText = uploadTriggerButton.querySelector('.btn-text');
    const originalBtnText = btnText?.textContent || 'Upload';

    const handleFiles = (files) => {
        if (files.length === 0) return;

        if (loadingWheel) loadingWheel.style.display = 'inline-block';
        if (btnText) btnText.textContent = `Processing ${files.length}...`;
        uploadTriggerButton.disabled = true;

        const uploadPromises = Array.from(files).map(file => {
            const formData = new FormData();
            formData.append('image', file);

            return fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Upload failed for ${file.name}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.filePath) {
                    const newItem = document.createElement('div');
                    newItem.classList.add('item', 'uploaded-item');
                    newItem.id = `muuri-item-upload-${Date.now()}-${itemIdCounter++}`;
                    newItem.innerHTML = `<div class="item-content" style="background-image: url('${API_URL}${data.filePath}');"></div>`;
                    grid1.add(newItem, { index: 0 });
                }
            });
        });

        Promise.all(uploadPromises)
            .catch(error => {
                console.error('Error uploading files:', error);
                alert('There was an error uploading one or more images. Please try again.');
            })
            .finally(() => {
                uploadTriggerButton.disabled = false;
                if (loadingWheel) loadingWheel.style.display = 'none';
                if (btnText) btnText.textContent = originalBtnText;
                fileInput.value = '';
            });
    };

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    uploadTriggerButton.addEventListener('click', () => fileInput.click());

    const dropZones = [availableSquaresGrid, uploadSection];
    dropZones.forEach(zone => {
        zone.addEventListener('dragenter', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', (e) => { e.preventDefault(); zone.classList.remove('drag-over'); });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });
    });
}

const saveDesign = async () => {
    const getImagePath = (style) => {
        const match = style.match(/url\("?(.*?)"?\)/);
        if (!match) return null;
        try {
            const url = new URL(match[1]);
            return url.pathname; // Should return /uploads/filename.ext
        } catch (e) {
            return match[1]; // Not a full URL, likely a local asset path
        }
    };

    const designData = {
        gridSize: currentSizeParam,
        bordering: document.querySelector('.customization-group:nth-of-type(1) .color-swatch.active')?.dataset.img,
        sashing: document.querySelector('.customization-group:nth-of-type(2) .color-swatch.active')?.dataset.img,
        backing: document.querySelector('.customization-group:nth-of-type(3) .color-swatch.active')?.dataset.img,
        grid1: grid1.getItems().map(item => getImagePath(item.getElement().querySelector('.item-content').style.backgroundImage)),
        grid2: grid2.getItems().map(item => getImagePath(item.getElement().querySelector('.item-content').style.backgroundImage)),
    };

    try {
        const response = await fetch(`${API_URL}/designs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(designData),
        });
        if (!response.ok) {
            throw new Error(`Failed to save design. Server responded with ${response.status}`);
        }
        const result = await response.json();
        const designUrl = `${window.location.origin}${window.location.pathname}?design_id=${result.id}`;
        alert(`Design saved! Your design ID is: ${result.id}\n\nYou can access it at: ${designUrl}`);
        // Optionally, update the URL in the browser bar
        // window.history.pushState({ path: designUrl }, '', designUrl);
    } catch (error) {
        console.error('Error saving design:', error);
        alert('Could not save your design. Please check the console for details.');
    }
};

const loadDesign = async (designId) => {
    try {
        const response = await fetch(`${API_URL}/designs/${designId}`);
        if (!response.ok) {
            throw new Error('Design not found');
        }
        const design = await response.json();

        grid1.remove(grid1.getItems(), { removeElements: true });
        grid2.remove(grid2.getItems(), { removeElements: true });

        const getFullUrl = (path) => path.startsWith('/uploads/') ? `${API_URL}${path}` : path;

        design.grid1.forEach(imgPath => {
            const newItem = document.createElement('div');
            newItem.classList.add('item', 'uploaded-item');
            newItem.innerHTML = `<div class="item-content" style="background-image: url('${getFullUrl(imgPath)}');"></div>`;
            grid1.add(newItem);
        });
        design.grid2.forEach(imgPath => {
            const newItem = document.createElement('div');
            newItem.classList.add('item', 'uploaded-item');
            newItem.innerHTML = `<div class="item-content" style="background-image: url('${getFullUrl(imgPath)}');"></div>`;
            grid2.add(newItem);
        });

        if (design.border_color) document.querySelector(`.color-swatch[data-img="${design.border_color}"]`)?.click();
        if (design.sashing_color) document.querySelector(`.color-swatch[data-img="${design.sashing_color}"]`)?.click();
        if (design.backing_color) document.querySelector(`.color-swatch[data-img="${design.backing_color}"]`)?.click();

    } catch (error) {
        console.error('Error loading design:', error);
        alert('Could not load the specified design.');
        initializeDefaults();
    }
};


 // --- Initialize everything after DOM is loaded ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        applyBodyClassAndSizeDisplay();
        initializeGrids();
        initializeColorPickers();
        initializeUpload();

        document.getElementById('save-btn').addEventListener('click', saveDesign);

        const designId = getQueryParam('design_id');
        if (designId) {
            loadDesign(designId);
        } else {
            initializeDefaults();
        }

        console.log("Initialization calls complete.");
    } catch (initError) {
         console.error("Initialization Error:", initError);
         alert("Error initializing the customizer page. Some features might not work correctly.");
    }
});
