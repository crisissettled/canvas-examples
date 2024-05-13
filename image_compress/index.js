const oImgFileSelector = document.querySelector("#imgFileSelector");
const oOriginImgPreview = document.querySelector("#originImgPreview");
const oCompressedImgPreview = document.querySelector("#compressedImgPreview");
const reader = new FileReader();

let imgFile = null;
let quality = 90;

const IMG_TYPES = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/gif": "image/gif",
};

const init = () => {
  BindEvent();
};

function BindEvent() {
  oImgFileSelector.addEventListener("change", handleImgFileSelectorChange);
}

function handleImgFileSelectorChange(e) {
  imgFile = e.target.files[0];

  if (!imgFile || !IMG_TYPES[imgFile.type]) {
    alert("please select proper image!");
    setImgFileSelectorEmpty();
    return;
  }

  setImgPreview(imgFile);
}

function setImgFileSelectorEmpty() {
  imgFile = null;
  oImgFileSelector.value = "";
  setPreviewImgVisible(oOriginImgPreview, false);
  setPreviewImgVisible(oCompressedImgPreview, false);
}

function setImgPreview(imgFile) {
  if (imgFile instanceof File) {
    reader.onload = async () => {
      const originImgSrc = reader.result;
      const compressedImgSrc = await createCompressedImage({
        imgSrc: originImgSrc,
        quality,
        type: imgFile.type,
      });

      oOriginImgPreview.src = originImgSrc;
      oCompressedImgPreview.src = compressedImgSrc;
      setPreviewImgVisible(oOriginImgPreview, true);
      setPreviewImgVisible(oCompressedImgPreview, true);
    };
    reader.readAsDataURL(imgFile);
  }
}

function createCompressedImage({ imgSrc, quality, type }) {
  const oCan = document.createElement("canvas");
  const oImg = document.createElement("img");
  const ctx = oCan.getContext("2d");

  oImg.src = imgSrc;

  return new Promise((resolve) => {
    oImg.onload = () => {
      const imgWidth = oImg.width;
      const imgHeight = oImg.height;

      oCan.width = imgWidth;
      oCan.height = imgHeight;
      ctx.drawImage(oImg, 0, 0, imgWidth, imgHeight);

      const compressedImgSrc = oCan.toDataURL(type, quality / 100);

      resolve(compressedImgSrc);
    };
  });
}

function setPreviewImgVisible(element, visible) {
  switch (visible) {
    case true:
      element.classList.remove("hide");
      element.classList.add("show");
      break;
    case false:
      element.classList.remove("show");
      element.classList.add("hide");
      break;
    default:
      break;
  }
}

init();
