"use strict";
import { render } from "/render.js"

function loadImage(dir, callback) {
  var image = new Image();
  image.crossOrigin = "anonymous";
  image.src = dir;
  image.onload = callback;
  return image;
}

function click(url, callback, i) {
  const image_input = document.getElementById(`img${i}`);
  var image = new Image();
  image.onload = callback;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const uploaded_image = reader.result;
    image.src = uploaded_image;
  });

  try {
    reader.readAsDataURL(image_input.files[0]);
  } catch (error) {
    image.src = "resources/leaves.png";
  }
  console.log(image);

  return image;
}

function loadImages(dirs, callback) {
  var images = [];
  var imagesToLoad = dirs.length;

  // Called each time an image finished
  // loading.
  var onImageLoad = function () {
    --imagesToLoad;
    // If all the images are loaded call the callback.
    if (imagesToLoad === 0) {
      callback(images);
    }
  };

  for (var i = 0; i < imagesToLoad; ++i) {
    var image = click(dirs[i], onImageLoad, i);
    images.push(image);
  }
}

function main() {

  var images = []

  for (var i = 1; i <= 6; i++) {
    var img = document.getElementById(`img${i}`).value;
    images.push(img)
  }

  loadImages(
    images,
    render
  )
}

var changeTextureButton = document.getElementById("change-texture");
changeTextureButton.onclick = main;

main();