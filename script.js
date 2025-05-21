const bar = document.getElementById('monster-bar');
const sensitivityInput = document.getElementById('sensitivity');
const pandaImage = document.querySelector('.monster-img');

// Timer elements
const timerInput = document.getElementById('timer-input');
const timerDisplay = document.getElementById('timer-display');
const timerToggle = document.getElementById('timer-toggle');
const timerReset = document.getElementById('timer-reset');

// Timer variables
let timerInterval = null;
let timeRemaining = 0;
let timerRunning = false;

// Initialize timer display
updateTimerFromInput();

// Timer event listeners
timerInput.addEventListener('change', updateTimerFromInput);
timerToggle.addEventListener('click', toggleTimer);
timerReset.addEventListener('click', resetTimer);

// Timer functions
function updateTimerFromInput() {
  const minutes = parseInt(timerInput.value) || 10;
  timeRemaining = minutes * 60;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function toggleTimer() {
  if (timerRunning) {
    // Pause timer
    clearInterval(timerInterval);
    timerToggle.textContent = 'Start';
  } else {
    // Start timer
    if (timeRemaining <= 0) {
      updateTimerFromInput();
    }
    timerInterval = setInterval(decrementTimer, 1000);
    timerToggle.textContent = 'Pause';
  }
  timerRunning = !timerRunning;
}

function decrementTimer() {
  if (timeRemaining > 0) {
    timeRemaining--;
    updateTimerDisplay();
  } else {
    clearInterval(timerInterval);
    timerRunning = false;
    timerToggle.textContent = 'Start';
    // Alert when timer is done
    alert('Time is up!');
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerToggle.textContent = 'Start';
  updateTimerFromInput();
}

// Audio processing
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const context = new AudioContext();
    const mic = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    mic.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);

    function update() {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        let deviation = data[i] - 128;
        sum += deviation * deviation;
      }
      let volume = Math.sqrt(sum / data.length);
      let sensitivity = parseInt(sensitivityInput.value, 10);
      let adjustedVolume = Math.min(100, volume * sensitivity);

      bar.style.height = `${adjustedVolume}%`;
      
      // Update bar color based on noise level
      bar.style.backgroundColor =
        adjustedVolume < 40 ? 'green' :
        adjustedVolume < 70 ? 'yellow' : 'red';
      
      // Update panda image based on noise level
      if (adjustedVolume < 40) {
        pandaImage.src = 'images/happy.png';
      } else if (adjustedVolume < 70) {
        pandaImage.src = 'images/sad.png';
      } else {
        pandaImage.src = 'images/scared.png';
      }

      requestAnimationFrame(update);
    }

    // Set initial image
    pandaImage.src = 'images/happy.png';
    
    update();
  })
  .catch(err => alert("Microphone access is required."));
