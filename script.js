const starterPhotos = [
  { src: "assets/aligned-photos/DSCF7994.jpg", date: "Nov 26, 2025", time: "4:07 PM", iso: "ISO 250", aperture: "f/3.6", shutter: "1/640s" },
  { src: "assets/aligned-photos/DSCF8006.jpg", date: "Dec 3, 2025", time: "3:41 PM", iso: "ISO 250", aperture: "f/4.5", shutter: "1/850s" },
  { src: "assets/aligned-photos/DSCF8013.jpg", date: "Dec 4, 2025", time: "4:20 PM", iso: "ISO 250", aperture: "f/2.8", shutter: "1/340s" },
  { src: "assets/aligned-photos/DSCF8061.jpg", date: "Dec 10, 2025", time: "4:13 PM", iso: "ISO 125", aperture: "f/2.2", shutter: "1/75s" },
  { src: "assets/aligned-photos/DSCF8189.jpg", date: "Jan 7, 2026", time: "4:42 PM", iso: "ISO 400", aperture: "f/2", shutter: "1/200s" },
  { src: "assets/aligned-photos/DSCF8201.jpg", date: "Jan 13, 2026", time: "4:40 PM", iso: "ISO 250", aperture: "f/2.5", shutter: "1/280s" },
  { src: "assets/aligned-photos/DSCF8221.jpg", date: "Jan 17, 2026", time: "2:25 PM", iso: "ISO 125", aperture: "f/3.2", shutter: "1/420s" },
  { src: "assets/aligned-photos/DSCF8250.jpg", date: "Jan 25, 2026", time: "5:05 PM", iso: "ISO 500", aperture: "f/2.5", shutter: "1/90s" },
  { src: "assets/aligned-photos/DSCF8278.jpg", date: "Jan 27, 2026", time: "5:27 PM", iso: "ISO 1250", aperture: "f/2", shutter: "1/200s" },
  { src: "assets/aligned-photos/DSCF8319.jpg", date: "Feb 1, 2026", time: "5:27 PM", iso: "ISO 640", aperture: "f/2", shutter: "1/200s" },
  { src: "assets/aligned-photos/DSCF8484.jpg", date: "Feb 23, 2026", time: "11:19 AM", iso: "ISO 125", aperture: "f/3.6", shutter: "1/600s" },
  { src: "assets/aligned-photos/DSCF8487.jpg", date: "Feb 23, 2026", time: "3:42 PM", iso: "ISO 125", aperture: "f/3.6", shutter: "1/750s" },
  { src: "assets/aligned-photos/DSCF8579.jpg", date: "Feb 24, 2026", time: "8:18 AM", iso: "ISO 250", aperture: "f/4.5", shutter: "1/1100s" },
  { src: "assets/aligned-photos/DSCF8597.jpg", date: "Feb 28, 2026", time: "9:06 AM", iso: "ISO 250", aperture: "f/5", shutter: "1/1250s" },
  { src: "assets/aligned-photos/DSCF8671.jpg", date: "Mar 8, 2026", time: "5:40 PM", iso: "ISO 500", aperture: "f/3.2", shutter: "1/420s" },
  { src: "assets/aligned-photos/DSCF8695.jpg", date: "Mar 8, 2026", time: "6:01 PM", iso: "ISO 640", aperture: "f/2", shutter: "1/200s" },
  { src: "assets/aligned-photos/DSCF8703.jpg", date: "Mar 12, 2026", time: "7:23 AM", iso: "ISO 250", aperture: "f/2.2", shutter: "1/240s" },
  { src: "assets/aligned-photos/DSCF8738.jpg", date: "Mar 16, 2026", time: "6:11 PM", iso: "ISO 500", aperture: "f/2.5", shutter: "1/340s" },
  { src: "assets/aligned-photos/DSCF8752.jpg", date: "Mar 27, 2026", time: "7:13 PM", iso: "ISO 500", aperture: "f/2.2", shutter: "1/200s" },
  { src: "assets/aligned-photos/DSCF8762.jpg", date: "Apr 1, 2026", time: "8:52 AM", iso: "ISO 500", aperture: "f/6.4", shutter: "1/1500s" },
  { src: "assets/aligned-photos/DSCF8768.jpg", date: "Apr 1, 2026", time: "4:09 PM", iso: "ISO 500", aperture: "f/5", shutter: "1/1000s" },
  { src: "assets/aligned-photos/DSCF8776.jpg", date: "Apr 5, 2026", time: "12:10 PM", iso: "ISO 500", aperture: "f/4", shutter: "1/750s" },
  { src: "assets/aligned-photos/DSCF8783.jpg", date: "Apr 5, 2026", time: "7:08 PM", iso: "ISO 500", aperture: "f/4", shutter: "1/750s" },
  { src: "assets/aligned-photos/DSCF8785.jpg", date: "Apr 5, 2026", time: "7:28 PM", iso: "ISO 1250", aperture: "f/2", shutter: "1/200s" },
  { src: "assets/aligned-photos/DSCF8786.jpg", date: "Apr 9, 2026", time: "10:06 PM", iso: "ISO 6400", aperture: "f/2", shutter: "1/80s" }
];

const track = document.querySelector("#photo-track");
const dots = document.querySelector("#dots");
const playToggle = document.querySelector("#play-toggle");
const speedSlider = document.querySelector("#speed-slider");
const speedValue = document.querySelector("#speed-value");
const previousButton = document.querySelector(".nav-button--previous");
const nextButton = document.querySelector(".nav-button--next");
const colorCanvas = document.createElement("canvas");
const colorContext = colorCanvas.getContext("2d", { willReadFrequently: true });

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
    slide.setAttribute("aria-label", `NYC skyline on ${photo.date} at ${photo.time}`);

    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = `NYC skyline on ${photo.date} at ${photo.time}`;
    image.addEventListener("load", () => {
      if (index === currentIndex) {
        updateBackgroundFromImage(image);
      }
    });

    const caption = document.createElement("p");
    caption.className = "slide-caption";
    caption.innerHTML = `
      <span class="caption-primary">${photo.date} · ${photo.time}</span>
      <span class="caption-settings">${photo.iso} · ${photo.aperture} · ${photo.shutter}</span>
    `;

    slide.append(image, caption);
    track.append(slide);

    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show ${photo.date} at ${photo.time}`);
    dot.addEventListener("click", () => goToSlide(index));
    dots.append(dot);
  });

  goToSlide(0);
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

  const activeImage = track.children[currentIndex]?.querySelector("img");
  if (activeImage?.complete) {
    updateBackgroundFromImage(activeImage);
  }
}

function updateBackgroundFromImage(image) {
  if (!colorContext) {
    return;
  }

  const sampleSize = 28;
  colorCanvas.width = sampleSize;
  colorCanvas.height = sampleSize;
  let pixels;

  try {
    colorContext.drawImage(image, 0, 0, sampleSize, sampleSize);
    pixels = colorContext.getImageData(0, 0, sampleSize, sampleSize).data;
  } catch {
    return;
  }

  let red = 0;
  let green = 0;
  let blue = 0;
  let samples = 0;

  for (let y = 5; y < sampleSize - 5; y += 1) {
    for (let x = 5; x < sampleSize - 5; x += 1) {
      const index = (y * sampleSize + x) * 4;
      red += pixels[index];
      green += pixels[index + 1];
      blue += pixels[index + 2];
      samples += 1;
    }
  }

  const color = balanceBackgroundColor({
    red: Math.round(red / samples),
    green: Math.round(green / samples),
    blue: Math.round(blue / samples)
  });

  document.documentElement.style.setProperty("--photo-rgb", `${color.red} ${color.green} ${color.blue}`);
  document.documentElement.style.setProperty("--photo-deep-rgb", `${color.deepRed} ${color.deepGreen} ${color.deepBlue}`);
}

function balanceBackgroundColor({ red, green, blue }) {
  const saturationBoost = 1.18;
  const darken = 0.58;
  const maxChannel = Math.max(red, green, blue);
  const minChannel = Math.min(red, green, blue);
  const range = maxChannel - minChannel;
  const average = (red + green + blue) / 3;

  const boosted = [red, green, blue].map((channel) => {
    const saturated = average + (channel - average) * saturationBoost;
    return Math.max(22, Math.min(148, Math.round(saturated * darken + range * 0.08)));
  });

  return {
    red: boosted[0],
    green: boosted[1],
    blue: boosted[2],
    deepRed: Math.round(boosted[0] * 0.22),
    deepGreen: Math.round(boosted[1] * 0.22),
    deepBlue: Math.round(boosted[2] * 0.22)
  };
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
