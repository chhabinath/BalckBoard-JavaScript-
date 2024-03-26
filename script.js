const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let painting = false;
let color = '#ffffff';
let brushSize = 5;
let isEraser = false;
let previousColor = '#ffffff';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', stopPainting);
canvas.addEventListener('mousemove', draw);

document.getElementById('colorPicker').addEventListener('change', function(event) {
    if (!isEraser) {
        color = event.target.value;
    }
});

document.getElementById('brushSizeSlider').addEventListener('input', function(event) {
    brushSize = event.target.value;
});

function startPainting(event) {
    painting = true;
    draw(event);
}

function stopPainting() {
    painting = false;
    ctx.beginPath();
}

function draw(event) {
    if (!painting) return;

    ctx.strokeStyle = isEraser ? 'black' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';

    ctx.lineTo(event.clientX, event.clientY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.clientX, event.clientY);
}

function useEraser() {
    isEraser = true;
    previousColor = document.getElementById('colorPicker').value;
    document.getElementById('colorPicker').value = '#000000';
}

function usePencil() {
    isEraser = false;
    document.getElementById('colorPicker').value = previousColor;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isEraser = false;
    document.getElementById('colorPicker').value = '#ffffff';
}

function saveSignature() {
    const image = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = image;
    link.download = 'signature.png';
    link.click();
}

let mediaRecorder;
let videoTrack;
let video;

async function startScreenSharing() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: 'always'
        },
        audio: false
    });

    videoTrack = stream.getVideoTracks()[0];
    video = document.createElement('video');
    video.srcObject = new MediaStream([videoTrack]);
    video.play();

    const videoStream = canvas.captureStream();
    videoStream.addTrack(videoTrack);

    mediaRecorder = new MediaRecorder(videoStream);
    const chunks = [];

    mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
            chunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'screen-share.webm';
        link.click();

        chunks.length = 0;
    };

    mediaRecorder.start();
}

function stopScreenSharing() {
    if (mediaRecorder && videoTrack && video) {
        mediaRecorder.stop();
        videoTrack.stop();
        video.remove();
    }
}