const starterPhotos = [
  { src: "assets/photos/DSCF7994.jpg", title: "Skyline Study 01" },
  { src: "assets/photos/DSCF8005.jpg", title: "Skyline Study 02" },
  { src: "assets/photos/DSCF8006.jpg", title: "Skyline Study 03" },
  { src: "assets/photos/DSCF8013.jpg", title: "Skyline Study 04" },
  { src: "assets/photos/DSCF8061.jpg", title: "Skyline Study 05" },
  { src: "assets/photos/DSCF8189.jpg", title: "Skyline Study 06" },
  { src: "assets/photos/DSCF8201.jpg", title: "Skyline Study 07" },
  { src: "assets/photos/DSCF8221.jpg", title: "Skyline Study 08" },
  { src: "assets/photos/DSCF8250.jpg", title: "Skyline Study 09" },
  { src: "assets/photos/DSCF8278.jpg", title: "Skyline Study 10" },
  { src: "assets/photos/DSCF8319.jpg", title: "Skyline Study 11" },
  { src: "assets/photos/DSCF8324.jpg", title: "Skyline Study 12" },
  { src: "assets/photos/DSCF8484.jpg", title: "Skyline Study 13" },
  { src: "assets/photos/DSCF8487.jpg", title: "Skyline Study 14" },
  { src: "assets/photos/DSCF8579.jpg", title: "Skyline Study 15" },
  { src: "assets/photos/DSCF8597.jpg", title: "Skyline Study 16" },
  { src: "assets/photos/DSCF8671.jpg", title: "Skyline Study 17" },
  { src: "assets/photos/DSCF8695.jpg", title: "Skyline Study 18" },
  { src: "assets/photos/DSCF8703.jpg", title: "Skyline Study 19" },
  { src: "assets/photos/DSCF8738.jpg", title: "Skyline Study 20" },
  { src: "assets/photos/DSCF8752.jpg", title: "Skyline Study 21" },
  { src: "assets/photos/DSCF8762.jpg", title: "Skyline Study 22" },
  { src: "assets/photos/DSCF8768.jpg", title: "Skyline Study 23" },
  { src: "assets/photos/DSCF8776.jpg", title: "Skyline Study 24" },
  { src: "assets/photos/DSCF8783.jpg", title: "Skyline Study 25" },
  { src: "assets/photos/DSCF8785.jpg", title: "Skyline Study 26" },
  { src: "assets/photos/DSCF8786.jpg", title: "Skyline Study 27" }
];

const track = document.querySelector("#photo-track");
const dots = document.querySelector("#dots");
const photoInput = document.querySelector("#photo-input");
const photoCount = document.querySelector("#photo-count");
const playToggle = document.querySelector("#play-toggle");
const speedSlider = document.querySelector("#speed-slider");
const speedValue = document.querySelector("#speed-value");
const previousButton = document.querySelector(".nav-button--previous");
const nextButton = document.querySelector(".nav-button--next");

let photos = [...starterPhotos];
let currentIndex = 0;
let isPlaying = true;
let timerId;
let transitionDelay = Number(speedSlider.value) * 1000;

function renderGallery() {
  track.innerHTML = "";
  dots.innerHTML = "";

  photos.forEach((photo, index) => {
    const slide = document.createElement("article");
    slide.className = "slide";
    slide.setAttribute("aria-label", photo.title);

    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.title;

    const caption = document.createElement("p");
    caption.className = "slide-caption";
    caption.textContent = `${String(index + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")} - ${photo.title}`;

    slide.append(image, caption);
    track.append(slide);

    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show ${photo.title}`);
    dot.addEventListener("click", () => goToSlide(index));
    dots.append(dot);
  });

  goToSlide(0);
  updatePhotoCount();
}

function updatePhotoCount() {
  const label = photos.length === 1 ? "photo" : "photos";
  photoCount.textContent = `Showing ${photos.length} ${label} in a 2:3 portrait frame. Choose files to preview a different sequence.`;
}

function goToSlide(index) {
  currentIndex = (index + photos.length) % photos.length;

  [...track.children].forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentIndex);
    slide.setAttribute("aria-hidden", String(slideIndex !== currentIndex));
  });

  [...dots.children].forEach((dot, dotIndex) => {
    dot.setAttribute("aria-current", String(dotIndex === currentIndex));
  });
}

function goNext() {
  goToSlide(currentIndex + 1);
}

function goPrevious() {
  goToSlide(currentIndex - 1);
}

function startAutoplay() {
  clearInterval(timerId);
  timerId = setInterval(goNext, transitionDelay);
}

function stopAutoplay() {
  clearInterval(timerId);
}

function syncAutoplay() {
  if (isPlaying) {
    playToggle.textContent = "Pause";
    startAutoplay();
  } else {
    playToggle.textContent = "Play";
    stopAutoplay();
  }
}

function updateSpeed() {
  transitionDelay = Number(speedSlider.value) * 1000;
  speedValue.textContent = `${Number(speedSlider.value).toFixed(1)}s`;

  if (isPlaying) {
    startAutoplay();
  }
}

photoInput.addEventListener("change", (event) => {
  const files = [...event.target.files].filter((file) => file.type.startsWith("image/"));

  if (!files.length) {
    return;
  }

  photos = files.map((file, index) => ({
    src: URL.createObjectURL(file),
    title: file.name.replace(/\.[^/.]+$/, "") || `Uploaded Skyline ${index + 1}`
  }));

  renderGallery();
  syncAutoplay();
});

previousButton.addEventListener("click", () => {
  goPrevious();
  syncAutoplay();
});

nextButton.addEventListener("click", () => {
  goNext();
  syncAutoplay();
});

playToggle.addEventListener("click", () => {
  isPlaying = !isPlaying;
  syncAutoplay();
});

speedSlider.addEventListener("input", updateSpeed);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    goNext();
  }

  if (event.key === "ArrowLeft") {
    goPrevious();
  }
});

renderGallery();
updateSpeed();
syncAutoplay();
