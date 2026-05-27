# NYC Skyline Scroller

A small static landing page for fading through NYC skyline photos.

## Open Locally

Open `index.html` in your browser, or open this folder in VS Code and use the Live Server extension.

## Edit in VS Code

```bash
code /Users/glebgladki/Documents/Codex/nyc-skyline-scroller
```

## Add Your Photos

For the version you will publish to GitHub/Vercel, copy images into:

```text
assets/photos/
```

Then add them to the `starterPhotos` array in `script.js` with local file paths like:

```js
const starterPhotos = [
  { src: "assets/photos/skyline-01.jpg", title: "Winter Morning" },
  { src: "assets/photos/skyline-02.jpg", title: "Summer Sunset" }
];
```

Keep filenames simple, such as `skyline-01.jpg`, `skyline-02.jpg`, and so on.

The gallery frame is set to a `2 / 3` aspect ratio to match the current portrait skyline photos.

## Align Photos With OpenCV

Install OpenCV:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Generate aligned web images:

```bash
python scripts/align_photos.py --reference DSCF8484.jpg
```

Aligned files are written to:

```text
assets/aligned-photos/
```

After reviewing the results, update `script.js` so each image path uses `assets/aligned-photos/` instead of `assets/photos/`.
