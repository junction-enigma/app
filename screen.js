$("#menus #menu").on("click", (e) => {
  const $this = $(e.currentTarget);

  if ($this.hasClass("selected")) {
    $this.removeClass("selected");
  } else {
    $this.addClass("selected");
  }
})

const start = () => {
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
};
const stop = () => {
  video.pause();
};

$("#togglePower").on("click", () => {
  if ($("#toggle").hasClass("on")) {
    $("#toggle").removeClass("on");
    $("#toggle .title").text("OFF");

    stop();
  } else {
    $("#toggle").addClass("on");
    $("#toggle .title").text("ON!");

    start();
  }
});

const video = document.querySelector("video");

const vwidth = 32;
const vheight = 24;

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

      for (var i = 0, n = pix.length; i < n; i += 1) {
        if (i % 1 == 0) {
          combinePixel += pix[i];
        }
      }

      let resultPixel = Math.abs(combinePixel / (pix.length * 0.75));

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

      if (!$this.paused && !$this.ended) {
        ctx.drawImage($this, 0, 0);
        setTimeout(loop, 1000 / 120);
      }
    })();
  },
  0
);
