// JARVIS HUD Web - Webcam HUD Overlay
const video = document.getElementById('webcam');
const canvas = document.getElementById('hud-canvas');
const ctx = canvas.getContext('2d');
const arcPower = document.getElementById('arc-power');
const systemMode = document.getElementById('system-mode');

// Set initial HUD state
let powerLevel = 87;
let mode = 'IDLE';

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Draw HUD overlay
function drawHUD() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Crosshair
  ctx.strokeStyle = 'yellow';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy);
  ctx.lineTo(cx + 30, cy);
  ctx.moveTo(cx, cy - 30);
  ctx.lineTo(cx, cy + 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, 2 * Math.PI);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Power bar
  ctx.fillStyle = '#ffc800';
  ctx.font = '20px Segoe UI, Arial';
  ctx.fillText(`ARC POWER: ${powerLevel}%`, 30, 40);
  ctx.strokeStyle = '#ffc800';
  ctx.strokeRect(30, 50, 200, 20);
  ctx.fillRect(30, 50, 2 * powerLevel, 20);

  // Status
  ctx.fillStyle = '#ffc800';
  ctx.font = '20px Segoe UI, Arial';
  ctx.fillText(`SYSTEM: ${mode}`, canvas.width - 250, 40);
}

// Webcam setup
async function setupWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      drawLoop();
    };
  } catch (e) {
    alert('Camera not available.');
  }
}

function drawLoop() {
  drawHUD();
  requestAnimationFrame(drawLoop);
}

setupWebcam();


// --- Voice Recognition and Synthesis ---
const synth = window.speechSynthesis;
let recognizing = false;
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    recognizing = true;
    systemMode.textContent = 'SYSTEM: LISTENING';
    mode = 'LISTENING';
  };
  recognition.onend = () => {
    recognizing = false;
    systemMode.textContent = `SYSTEM: ${mode}`;
    // Auto-restart for continuous listening
    setTimeout(() => recognition.start(), 500);
  };
  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        const command = event.results[i][0].transcript.trim().toLowerCase();
        handleVoiceCommand(command);
      }
    }
  };
  recognition.onerror = (e) => {
    systemMode.textContent = 'SYSTEM: ERROR';
    mode = 'ERROR';
  };
} else {
  alert('Voice recognition not supported in this browser.');
}

function speak(text) {
  if (!synth) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.05;
  utter.pitch = 1.1;
  synth.speak(utter);
}

function handleVoiceCommand(command) {
  if (command.includes('scan')) {
    mode = 'SCAN MODE';
    systemMode.textContent = 'SYSTEM: SCAN MODE';
    speak('Scanning environment.');
    // Visual effect can be triggered here
  } else if (command.includes('target')) {
    mode = 'TARGET MODE';
    systemMode.textContent = 'SYSTEM: TARGET MODE';
    speak('Targeting systems engaged.');
    // Play targeting sound effect (to be added)
  } else if (command.includes('fire')) {
    mode = 'FIRE';
    systemMode.textContent = 'SYSTEM: FIRE';
    speak('Target neutralized.');
    // Play fire sound effect (to be added)
  } else if (command.includes('shutdown') || command.includes('exit')) {
    mode = 'SHUTDOWN';
    systemMode.textContent = 'SYSTEM: SHUTDOWN';
    speak('Shutting down, sir.');
    if (recognition) recognition.stop();
  } else {
    speak('Command not recognized.');
  }
}

// Start voice recognition automatically
if (recognition) {
  setTimeout(() => recognition.start(), 1000);
}
