const oContainer = document.querySelector(".canvas-container");
const oContainer2 = document.querySelector(".canvas2-container");
const oImgeFile = document.getElementById("imageFile");
const oCan = document.getElementById("can");
const oCan2 = document.getElementById("can2");
const ctx = oCan.getContext("2d", { willReadFrequently: true });
const ctx2 = oCan2.getContext("2d", { willReadFrequently: true });

const oImage = new Image();
let initPos = [];
let screenShotData = [];
const MASK_OPACITY = 0.5;

const init = () => {
  bindEvent();
};

function bindEvent() {
  oImgeFile.addEventListener("change", handleFileChange, false);
  oCan.addEventListener("mousedown", handleCanvasMouseDown, false);

  // oCan.addEventListener("click", handleCanvasClick, false);
}

function handleFileChange(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (e) {
    const data = e.target.result;
    oImage.src = data;
    oImage.onload = function () {
      const { width, height } = this;
      // console.log(width, height)
      generateCanvas(oContainer, oCan, width, height);
      ctx.drawImage(oImage, 0, 0, width, height);
      drawImageMask(0, 0, width, height, MASK_OPACITY);
    };
  };
}

function handleCanvasClick() {
  const { width, height } = oCan;
  console.log(oCan, "oCan");
  ctx.clearRect(0, 0, width, height);
  // ctx.drawImage(oImage, 0, 0, width, height);
  //drawImageMask(0, 0, width, height, MASK_OPACITY);
}

function handleCanvasMouseDown(e) {
  initPos = [e.offsetX, e.offsetY];

  oCan.addEventListener("mousemove", handleCanvasMouseMove, false);
  oCan.addEventListener("mouseup", handleCanvasMouseUp, false);
}

function handleCanvasMouseMove(e) {
  const endX = e.offsetX;
  const endY = e.offsetY;
  const [startX, startY] = initPos;
  const rectWidth = endX - startX;
  const rectHeight = endY - startY;

  const { width, height } = oCan;

  screenShotData = [startX, startY, rectWidth, rectHeight];

  // console.log(rectHeight, rectWidth)

  ctx.clearRect(0, 0, width, height);
  drawImageMask(0, 0, width, height, MASK_OPACITY);
  drawScreenShot(width, height, rectWidth, rectHeight);
}

function drawScreenShot(canWidth, canHeight, rectWidth, rectHeight) {
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#000";
  ctx.fillRect(...initPos, rectWidth, rectHeight);

  ctx.globalCompositeOperation = "destination-over";
  ctx.drawImage(oImage, 0, 0, canWidth, canHeight, 0, 0, canWidth, canHeight);
}

function handleCanvasMouseUp(e) {
  oCan.removeEventListener("mousemove", handleCanvasMouseMove, false);
  oCan.removeEventListener("mouseup", handleCanvasMouseUp, false);
  drawScreenShotImage(screenShotData);
}

function generateCanvas(container, canvas, width, height) {
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  canvas.width = width;
  canvas.height = height;
  container.style.display = "block";
}

function drawImageMask(x, y, width, height, opacity) {
  ctx.fillStyle = `rgba(0,0,0,${opacity})`;
  ctx.fillRect(x, y, width, height);
}

function drawScreenShotImage(screenShotData) {
  const data = ctx.getImageData(...screenShotData);
  generateCanvas(oContainer2, oCan2, screenShotData[2], screenShotData[3]);
  ctx2.clearRect(...screenShotData);
  ctx2.putImageData(data, 0, 0);
}

init();
