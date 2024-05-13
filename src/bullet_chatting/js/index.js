import BChatVideo from "./bchatvideo/bchatvideo.js";
import { bChatData } from "./data";

const oBChatVideo = document.getElementById("bChatVideo");
const oBChatCan = document.getElementById("bChatCan");
const oBChatInput = document.querySelector(".bchat-input");
const oBChatBtn = document.querySelector(".bchat-btn");
const oBChatColorInput = document.querySelector(".color-input");
const oBChatSpeed = document.querySelector("#speed");

const bChatVideo = new BChatVideo({
  video: oBChatVideo,
  canvas: oBChatCan,
  options: { bChatData },
});

const init = () => {
  bindEvent();
};

const bindEvent = () => {
  oBChatVideo.addEventListener("play", handleVideoPlay, false);
  oBChatVideo.addEventListener("pause", handleVideoPause, false);
  oBChatVideo.addEventListener("seeked", handleVideoSeek, false);
  oBChatBtn.addEventListener("click", handleBChatBtnClick, false);
  oBChatInput.addEventListener("keyup", handleBChatInputClick, false);
};

function handleVideoPlay() {
  bChatVideo.bChatPaused = false;
  bChatVideo.render();
}

function handleVideoPause() {
  bChatVideo.bChatPaused = true;
}

function handleVideoSeek() {
  bChatVideo.reset();
}

function handleBChatBtnClick() {
  _sendBulletChat();
}

function handleBChatInputClick(e) {
  if (e.keyCode === 13) {
    _sendBulletChat();
  }
}

function _sendBulletChat() {
  if (bChatVideo.bChatPaused === true) return;

  const content = oBChatInput.value.trim();
  if (!content) return;

  const color = oBChatColorInput.value;
  const runTime = oBChatVideo.currentTime;
  const speed = oBChatSpeed.value;

  const _data = {
    content,
    color,
    runTime,
    speed,
  };

  bChatVideo.addBChatData(_data);
  oBChatInput.value = "";
}

init();
