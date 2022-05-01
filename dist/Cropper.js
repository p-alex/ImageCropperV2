var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Cropper {
    constructor() {
        this.allowedAspectRatios = ["1 / 1", "4 / 5", "16 / 9"];
        this.aspectRatio = 1 / 1;
        this.originalImageWidth = 0;
        this.originalImageHeight = 0;
        this.xPos = 0;
        this.yPos = 0;
        this.newXPos = 0;
        this.newYPos = 0;
        this.maxMoveX = 0;
        this.maxMoveY = 0;
        this.initialMousePosX = 0;
        this.initialMousePosY = 0;
        this.canMove = false;
        this.imageQuality = 0.8;
    }
    handleSetAspectRatio(aspectRatio) {
        this.aspectRatio = aspectRatio;
        this.handleCalculateCropSize();
        this.handleCalculateMaxMove();
        this.handleCenterImage();
    }
    handleGetFile(files) {
        const file = new FileReader();
        file.readAsDataURL(files);
        file.addEventListener("load", () => __awaiter(this, void 0, void 0, function* () {
            const { optimizedImageUrl, imgWidth, imgHeight } = yield this.handleOptimizeImage(file.result);
            this.originalImageWidth = imgWidth;
            this.originalImageHeight = imgHeight;
            this.handleDisplayCropper(optimizedImageUrl, imgWidth, imgHeight);
            this.handleCalculateCropSize();
            window.addEventListener("resize", () => this.handleCalculateCropSize());
        }));
    }
    handleOptimizeImage(imageUrl, maxImageWidth = 1500, maxImageHeight = 1500) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield new Promise((resolve) => {
                if (typeof imageUrl === "string") {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    const img = document.createElement("img");
                    img.src = imageUrl;
                    img.addEventListener("load", () => {
                        let imgWidth = img.width;
                        let imgHeight = img.height;
                        if (imgWidth > imgHeight) {
                            if (imgWidth > maxImageWidth) {
                                imgHeight *= maxImageWidth / imgWidth;
                                imgWidth = maxImageWidth;
                            }
                        }
                        else {
                            if (imgHeight > maxImageHeight) {
                                imgWidth *= maxImageHeight / imgHeight;
                                imgHeight = maxImageHeight;
                            }
                        }
                        canvas.width = imgWidth;
                        canvas.height = imgHeight;
                        ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
                        const resultUrl = canvas.toDataURL("image/jpeg", this.imageQuality);
                        const result = {
                            optimizedImageUrl: resultUrl,
                            imgWidth,
                            imgHeight,
                        };
                        resolve(result);
                    });
                }
            });
            return result;
        });
    }
    handleCreateCropper(imageUrl, imgWidth, imgHeight) {
        const cropper = document.createElement("div");
        const cropperContainer = document.createElement("div");
        const cropArea = document.createElement("div");
        const image = document.createElement("img");
        const cropBtn = document.createElement("button");
        let aspectRatioBtns = [];
        aspectRatioBtns = this.allowedAspectRatios.map((ratio) => {
            const button = document.createElement("button");
            button.innerText = ratio;
            button.classList.add("cropper__aspectRatioBtn");
            button.addEventListener("click", () => this.handleSetAspectRatio(eval(ratio)));
            return button;
        });
        cropBtn.innerText = "Crop";
        cropper.classList.add("cropper");
        cropperContainer.classList.add("cropper__container");
        cropArea.classList.add("cropper__cropArea");
        image.classList.add("cropper__image");
        cropBtn.classList.add("cropper__cropBtn");
        cropper.addEventListener("mousedown", (event) => this.onMouseDown(event));
        cropper.addEventListener("mousemove", (event) => this.onMouseMove(event));
        cropper.addEventListener("mouseup", () => this.onMouseUp());
        cropBtn.addEventListener("click", () => this.handleCropImage());
        if (imgWidth > imgHeight) {
            image.classList.add("maxHeight");
        }
        else {
            image.classList.add("maxWidth");
        }
        image.src = imageUrl;
        image.onload = () => {
            this.handleCalculateMaxMove();
            this.xPos = this.maxMoveX / 2;
            this.yPos = this.maxMoveY / 2;
            this.newXPos = this.maxMoveX / 2;
            this.newYPos = this.maxMoveY / 2;
            image.style.left = `${-this.xPos}px`;
            image.style.top = `${-this.yPos}px`;
            console.log(this);
            window.addEventListener("resize", () => this.handleCalculateMaxMove());
        };
        cropArea.appendChild(image);
        cropperContainer.appendChild(cropArea);
        cropper.appendChild(cropperContainer);
        cropper.appendChild(cropBtn);
        aspectRatioBtns.forEach((button) => cropper.appendChild(button));
        return cropper;
    }
    handleDisplayCropper(optimizedImageUrl, imgWidth, imgHeight) {
        const container = document.querySelector(".container");
        const cropper = this.handleCreateCropper(optimizedImageUrl, imgWidth, imgHeight);
        container.appendChild(cropper);
    }
    handleCalculateCropSize() {
        const cropper = document.querySelector(".cropper");
        const cropArea = document.querySelector(".cropper__cropArea");
        const cropperWidth = cropper.offsetWidth;
        const cropperHeight = cropper.offsetHeight;
        if (this.aspectRatio === 16 / 9) {
            cropArea.style.width = `${cropperWidth}px`;
            cropArea.style.height = `${cropperHeight / this.aspectRatio}px`;
        }
        else if (this.aspectRatio === 4 / 5) {
            cropArea.style.width = `${cropperWidth * this.aspectRatio}px`;
            cropArea.style.height = `${cropperHeight}px`;
        }
        else {
            cropArea.style.width = `${cropperHeight}px`;
            cropArea.style.height = `${cropperHeight}px`;
        }
    }
    handleCalculateMaxMove() {
        const cropArea = document.querySelector(".cropper__cropArea");
        const image = document.querySelector(".cropper__image");
        let maxMoveX = image.offsetWidth - cropArea.offsetWidth;
        let maxMoveY = image.offsetHeight - cropArea.offsetHeight;
        if (maxMoveX < 5)
            maxMoveX = 0;
        if (maxMoveY < 5)
            maxMoveY = 0;
        this.maxMoveX = maxMoveX;
        this.maxMoveY = maxMoveY;
    }
    onMouseDown(event) {
        this.initialMousePosX = event.x;
        this.initialMousePosY = event.y;
        this.canMove = true;
    }
    onMouseMove(event) {
        event.preventDefault();
        if (this.canMove) {
            const image = document.querySelector(".cropper__image");
            let newXPos = this.xPos + (this.initialMousePosX - event.x);
            let newYPos = this.yPos + (this.initialMousePosY - event.y);
            if (newXPos > this.maxMoveX) {
                this.newXPos = this.maxMoveX;
            }
            else if (newXPos < -this.maxMoveX) {
                this.newXPos = -this.maxMoveX;
            }
            else {
                this.newXPos = newXPos;
            }
            if (newYPos > this.maxMoveY) {
                this.newYPos = this.maxMoveY;
            }
            else if (newYPos < 0) {
                this.newYPos = 0;
            }
            else {
                this.newYPos = newYPos;
            }
            image.style.left = `-${this.newXPos}px`;
            image.style.top = `-${this.newYPos}px`;
        }
    }
    onMouseUp() {
        this.initialMousePosX = 0;
        this.initialMousePosY = 0;
        this.canMove = false;
        this.xPos = this.newXPos;
        this.yPos = this.newYPos;
    }
    handleCropImage() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const cropArea = document.querySelector(".cropper__cropArea");
        const image = document.querySelector(".cropper__image");
        const cropAreaPercentageX = cropArea.offsetWidth / image.offsetWidth;
        const cropAreaPercentageY = cropArea.offsetHeight / image.offsetHeight;
        const percentageMoveX = this.xPos / image.offsetWidth;
        const percentageMoveY = this.yPos / image.offsetHeight;
        const canvasWidth = this.originalImageWidth * cropAreaPercentageX;
        const canvasHeight = this.originalImageHeight * cropAreaPercentageY;
        const movedX = -this.originalImageWidth * percentageMoveX;
        const movedY = -this.originalImageHeight * percentageMoveY;
        canvas.width = Math.floor(canvasWidth);
        canvas.height = Math.floor(canvasHeight);
        ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(image, movedX, movedY, this.originalImageWidth, this.originalImageHeight);
        const croppedUrl = canvas.toDataURL("image/jpeg", this.imageQuality);
        this.handleShowCroppedImage(croppedUrl);
    }
    handleShowCroppedImage(imageUrl) {
        const croppedImage = document.querySelector(".croppedImage");
        if (!croppedImage) {
            const container = document.querySelector(".container");
            const img = document.createElement("img");
            img.classList.add("croppedImage");
            img.src = imageUrl;
            container.appendChild(img);
            return;
        }
        croppedImage.src = imageUrl;
    }
    handleCenterImage() {
        const image = document.querySelector(".cropper__image");
        this.xPos = this.maxMoveX / 2;
        this.yPos = this.maxMoveY / 2;
        this.newXPos = this.maxMoveX / 2;
        this.newYPos = this.maxMoveY / 2;
        image.style.left = `${-this.xPos}px`;
        image.style.top = `${-this.yPos}px`;
    }
}
export default Cropper;
