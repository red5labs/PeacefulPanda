const bar = document.getElementById('monster-bar');
const sensitivityInput = document.getElementById('sensitivity');

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
      bar.style.backgroundColor =
        adjustedVolume < 40 ? 'green' :
        adjustedVolume < 70 ? 'yellow' : 'red';

      requestAnimationFrame(update);
    }

    update();
  })
  .catch(err => alert("Microphone access is required."));
