import Cropper from "./Cropper.js";
const fileInput = document.querySelector(".fileInput");
const cropper = new Cropper();
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    cropper.handleGetFile(file);
    fileInput.classList.toggle("hide");
});
