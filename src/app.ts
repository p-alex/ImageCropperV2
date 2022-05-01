import Cropper from "./Cropper.js";

const fileInput = document.querySelector(".fileInput") as HTMLInputElement;

const cropper = new Cropper();

fileInput.addEventListener("change", (event: any) => {
  const file = event.target.files[0];

  cropper.handleGetFile(file);

  fileInput.classList.toggle("hide");
});
