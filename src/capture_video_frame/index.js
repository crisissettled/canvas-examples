const oFileSelector = document.querySelector("#upFileSelector");
const videoLengthRange = document.querySelector("#value");
const oTimeSlotInput = document.querySelector("#timeSlotInput");
let video = null;
let videoFile = null;

value.textContent = oTimeSlotInput.value;
oTimeSlotInput.addEventListener("input", (event) => {
  videoLengthRange.textContent = event.target.value;
  captureFrame(videoFile, oTimeSlotInput.value);
});

oFileSelector.addEventListener("change", (e) => {
  videoFile = e.target.files[0];
  captureFrame(videoFile, oTimeSlotInput.value);
  oFileSelector.value = "";
});

async function drawImage(video) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      resolve({
        blob,
        url: URL.createObjectURL(blob),
      });
    });
  });
}

function captureFrame(videoFile, time) {
  video = document.createElement("video");
  video.src = URL.createObjectURL(videoFile);
  video.currentTime = time;
  video.muted = true;
  video.autoplay = true;
  video.oncanplay = async () => {
    if (time > video.duration) {
      throw new Error("video max length :" + video.duration);
    }

    oTimeSlotInput.max = video.duration;

    const { url } = await drawImage(video);
    const img = document.querySelector("img");
    img.src = url;
  };
}
