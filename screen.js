const startButton = document.getElementById('startButton')
const stopButton = document.getElementById('stopButton')
const video = document.querySelector('video')

const vwidth = 32
const vheight = 24

startButton.addEventListener('click', () => {
  navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: {
      width: vwidth,
      height: vheight,
      frameRate: 60
    }
  }).then(stream => {
    video.srcObject = stream
    video.onloadedmetadata = (e) => video.play()
  }).catch(e => console.log(e))
})

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// set canvas size = video size when known
video.addEventListener('loadedmetadata', function() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
});

video.addEventListener('play', function() {
  var $this = this; //cache
  (function loop() {
    var imgd = ctx.getImageData(0, 0, vwidth, vheight);
    var pix = imgd.data
    let combinePixel = 0

    for (var i = 0, n = pix.length; i < n; i += 4) {
        combinePixel += pix[i]
    }

    let resultPixel = Math.abs( ((combinePixel/pix.length) / 10)-1)

    

    window.electronAPI.setOpacity((resultPixel))

    if (!$this.paused && !$this.ended) {
      ctx.drawImage($this, 0, 0);
      setTimeout(loop, 1000 / 30); // drawing at 30fps
    }
  })();
}, 0);

stopButton.addEventListener('click', () => {
  video.pause()
})