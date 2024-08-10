const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const video = document.querySelector("video");

const vwidth = 32;
const vheight = 24;

startButton.addEventListener("click", () => {
  document.getElementById("startButtonTitle").innerHTML = "ON!";
  navigator.mediaDevices
    .getDisplayMedia({
      audio: true,
      video: {
        width: vwidth,
        height: vheight,
        frameRate: 120,
      },
    })
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = (e) => video.play();
    })
    .catch((e) => console.log(e));
});

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

video.addEventListener("loadedmetadata", function () {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
});

let isEnableOpacity = true;
let fixedOpacity = false;
let whiteRate = 0;

video.addEventListener(
  "play",
  function () {
    var $this = this;
    (function loop() {
      var imgd = ctx.getImageData(0, 0, vwidth, vheight);
      var pix = imgd.data;
      let combinePixel = 0;
      let total = 0;
      let whiteTotal = 0;

      for (var i = 0, n = pix.length; i < n; i += 1) {
        if (i % 1 == 0) {
          combinePixel += pix[i];
        }

        // if (i % 3 == 0) {
        //   total += 1;
        //   if (isEnableOpacity) {
        //     let orgR = pix[i - 2] / (1 - 0.77);
        //     let orgG = pix[i - 1] / (1 - 0.77);
        //     let orgB = pix[i] / (1 - 0.77);
        //     if (orgR + orgG + orgB > 740) {
        //       whiteTotal += 1;
        //     }
        //   } else {
        //     if (pix[i] + pix[i - 1] + pix[i - 2] > 740) {
        //       whiteTotal += 1;
        //     }
        //   }
        // }
      }

      let resultPixel = Math.abs(combinePixel / (pix.length * 0.75));

      console.log(whiteRate);

      // if (whiteRate > 15) {
      //   isEnableOpacity = true;
      // }

      let lastValue = "0";

      if (isEnableOpacity) {
        if (resultPixel > 120) {
          lastValue = "0.5";
          if (!fixedOpacity) {
            fixedOpacity = true;
          }
        } else {
          lastValue = "0";
          isEnableOpacity = false;
        }
      } else {
        if (resultPixel > 200) {
          isEnableOpacity = true;
        } else {
          lastValue = "0";
        }
      }

      if (fixedOpacity) {
        lastValue = "0.5";
        setTimeout(() => {
          fixedOpacity = false;
        }, 1000);
      }

      window.electronAPI.setOpacity(lastValue);

      //window.electronAPI.setOpacity((resultPixel))

      if (!$this.paused && !$this.ended) {
        ctx.drawImage($this, 0, 0);
        setTimeout(loop, 1000 / 120);
      }
    })();
  },
  0
);

stopButton.addEventListener("click", () => {
  video.pause();
});
