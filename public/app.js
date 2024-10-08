const canvas = document.getElementById('drawingBoard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBtn');
const brushSize = document.getElementById('brushSize');
const eraserBtn = document.getElementById('eraserBtn');
const colorPalette = document.getElementById('colorPalette');
const brushPreview = document.getElementById('brushPreview');

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 800;
const ERASER_SIZE_MULTIPLIER = 8;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let drawing = false;
let lastX = 0;
let lastY = 0;
let isErasing = false;

const ws = new WebSocket(`wss://${window.location.host}`);

const colors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];

colors.forEach(color => {
    const colorOption = document.createElement('div');
    colorOption.className = 'color-option';
    colorOption.style.backgroundColor = color;
    colorOption.addEventListener('click', () => {
        colorPicker.value = color;
        if (isErasing) toggleEraser();
    });
    colorPalette.appendChild(colorOption);
});

function updateBrushPreview() {
    const size = parseInt(brushSize.value);
    const color = isErasing ? 'white' : colorPicker.value;
    brushPreview.innerHTML = '';
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = 50;
    previewCanvas.height = 50;
    const previewCtx = previewCanvas.getContext('2d');
    previewCtx.fillStyle = isErasing ? '#f0f0f0' : 'white';
    previewCtx.fillRect(0, 0, 50, 50);
    previewCtx.fillStyle = color;
    previewCtx.beginPath();
    previewCtx.arc(25, 25, size / 2, 0, Math.PI * 2);
    previewCtx.fill();
    brushPreview.appendChild(previewCanvas);
}

function scaleCoordinates(x, y) {
    const scaleX = CANVAS_WIDTH / canvas.offsetWidth;
    const scaleY = CANVAS_HEIGHT / canvas.offsetHeight;
    return [x * scaleX, y * scaleY];
}

function startDrawing(e) {
    drawing = true;
    [lastX, lastY] = getMousePos(canvas, e);
}

function stopDrawing() {
    drawing = false;
}

function draw(e) {
    if (!drawing) return;

    const [x, y] = getMousePos(canvas, e);
    const baseSize = parseInt(brushSize.value);
    const size = isErasing ? baseSize * ERASER_SIZE_MULTIPLIER : baseSize;
    const color = isErasing ? 'white' : colorPicker.value;
    drawLine(lastX, lastY, x, y, color, size);
    
    ws.send(JSON.stringify({ x1: lastX, y1: lastY, x2: x, y2: y, color: color, size: size }));

    [lastX, lastY] = [x, y];
}

function drawLine(x1, y1, x2, y2, color, size) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const x = (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.offsetWidth;
    const y = (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.offsetHeight;
    return scaleCoordinates(x, y);
}

function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fetch('/api/drawings', { method: 'DELETE' });
}

function toggleEraser() {
    isErasing = !isErasing;
    eraserBtn.textContent = isErasing ? 'Draw' : 'Eraser';
    if (isErasing) {
        const cursorSize = parseInt(brushSize.value) * ERASER_SIZE_MULTIPLIER * 3;
        const halfSize = cursorSize / 2;
        canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 ${cursorSize} ${cursorSize}"><circle cx="${halfSize}" cy="${halfSize}" r="${halfSize}" fill="rgba(255,255,255,0.5)" stroke="black" stroke-width="2"/></svg>') ${halfSize} ${halfSize}, auto`;
    } else {
        canvas.style.cursor = 'default';
    }
    eraserBtn.classList.toggle('active', isErasing);
    updateBrushPreview();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e.touches[0]);
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e.touches[0]);
});
canvas.addEventListener('touchend', stopDrawing);

clearBtn.addEventListener('click', clearBoard);
eraserBtn.addEventListener('click', toggleEraser);
colorPicker.addEventListener('change', updateBrushPreview);
brushSize.addEventListener('change', updateBrushPreview);

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
        drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
    }
};

fetch('/api/drawings')
    .then(response => response.json())
    .then(drawings => {
        for (let key in drawings) {
            const point = drawings[key];
            drawLine(point.x1, point.y1, point.x2, point.y2, point.color, point.size || 2);
        }
    });

updateBrushPreview();
