#!/usr/bin/env python3
"""
Align skyline photos to a single reference image with OpenCV.

The script detects shared visual features, estimates a homography for each
image, warps it to match the reference frame, then exports web-sized JPEGs.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Align a folder of photos to one reference image.")
    parser.add_argument("--input", default="assets/photos", help="Folder containing source photos.")
    parser.add_argument("--output", default="assets/aligned-photos", help="Folder for aligned output photos.")
    parser.add_argument("--reference", help="Reference image filename or path. Defaults to the first JPG.")
    parser.add_argument("--max-output-width", type=int, default=1800, help="Resize aligned exports to this width.")
    parser.add_argument("--quality", type=int, default=88, help="JPEG quality, 1-100.")
    parser.add_argument("--min-matches", type=int, default=30, help="Minimum feature matches needed to align.")
    parser.add_argument(
        "--strategy",
        choices=["direct", "neighbor"],
        default="neighbor",
        help="Direct aligns every image to the reference. Neighbor also tries adjacent photos.",
    )
    return parser.parse_args()


def read_image(path: Path) -> np.ndarray:
    image = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if image is None:
      raise ValueError(f"Could not read image: {path}")
    return image


def resize_for_features(image: np.ndarray, max_width: int = 1400) -> tuple[np.ndarray, float]:
    height, width = image.shape[:2]
    if width <= max_width:
        return image, 1.0

    scale = max_width / width
    resized = cv2.resize(image, (max_width, round(height * scale)), interpolation=cv2.INTER_AREA)
    return resized, scale


def build_detector() -> cv2.Feature2D:
    if hasattr(cv2, "SIFT_create"):
        return cv2.SIFT_create(nfeatures=6000)

    return cv2.ORB_create(nfeatures=8000, fastThreshold=7)


def find_feature_matches(
    detector: cv2.Feature2D,
    target_gray: np.ndarray,
    reference_gray: np.ndarray,
) -> tuple[list[cv2.KeyPoint], list[cv2.KeyPoint], list[cv2.DMatch]]:
    ref_keypoints, ref_descriptors = detector.detectAndCompute(reference_gray, None)
    target_keypoints, target_descriptors = detector.detectAndCompute(target_gray, None)

    if ref_descriptors is None or target_descriptors is None:
        return [], [], []

    if ref_descriptors.dtype == np.float32:
        matcher = cv2.BFMatcher(cv2.NORM_L2)
    else:
        matcher = cv2.BFMatcher(cv2.NORM_HAMMING)

    raw_matches = matcher.knnMatch(target_descriptors, ref_descriptors, k=2)
    good_matches = []

    for match_pair in raw_matches:
        if len(match_pair) < 2:
            continue

        best, second_best = match_pair
        if best.distance < 0.72 * second_best.distance:
            good_matches.append(best)

    return target_keypoints, ref_keypoints, good_matches


def estimate_scaled_homography(
    target_keypoints: list[cv2.KeyPoint],
    reference_keypoints: list[cv2.KeyPoint],
    matches: list[cv2.DMatch],
    target_scale: float,
    reference_scale: float,
    min_matches: int,
) -> tuple[np.ndarray | None, int]:
    if len(matches) < min_matches:
        return None, 0

    target_points = np.float32([target_keypoints[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
    reference_points = np.float32([reference_keypoints[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

    homography, mask = cv2.findHomography(target_points, reference_points, cv2.RANSAC, 4.0)
    if homography is None or mask is None:
        return None, 0

    inliers = int(mask.sum())
    if inliers < min_matches:
        return None, inliers

    target_scale_matrix = np.array(
        [
            [target_scale, 0, 0],
            [0, target_scale, 0],
            [0, 0, 1],
        ],
        dtype=np.float64,
    )
    reference_scale_matrix = np.array(
        [
            [reference_scale, 0, 0],
            [0, reference_scale, 0],
            [0, 0, 1],
        ],
        dtype=np.float64,
    )
    return np.linalg.inv(reference_scale_matrix) @ homography @ target_scale_matrix, inliers


def find_homography_between(
    detector: cv2.Feature2D,
    target: np.ndarray,
    reference: np.ndarray,
    min_matches: int,
) -> tuple[np.ndarray | None, int, int]:
    target_feature_image, target_scale = resize_for_features(target)
    reference_feature_image, reference_scale = resize_for_features(reference)
    target_gray = cv2.cvtColor(target_feature_image, cv2.COLOR_BGR2GRAY)
    reference_gray = cv2.cvtColor(reference_feature_image, cv2.COLOR_BGR2GRAY)
    target_keypoints, reference_keypoints, matches = find_feature_matches(
        detector,
        target_gray,
        reference_gray,
    )
    homography, inliers = estimate_scaled_homography(
        target_keypoints,
        reference_keypoints,
        matches,
        target_scale,
        reference_scale,
        min_matches,
    )
    return homography, len(matches), inliers


def resize_for_web(image: np.ndarray, max_width: int) -> np.ndarray:
    height, width = image.shape[:2]
    if width <= max_width:
        return image

    scale = max_width / width
    return cv2.resize(image, (max_width, round(height * scale)), interpolation=cv2.INTER_AREA)


def save_jpeg(path: Path, image: np.ndarray, quality: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(path), image, [cv2.IMWRITE_JPEG_QUALITY, quality])


def main() -> None:
    args = parse_args()
    input_dir = Path(args.input)
    output_dir = Path(args.output)
    image_paths = sorted(input_dir.glob("*.jpg"))

    if not image_paths:
        raise SystemExit(f"No .jpg files found in {input_dir}")

    reference_path = Path(args.reference) if args.reference else image_paths[0]
    if not reference_path.is_absolute() and not reference_path.exists():
        reference_path = input_dir / reference_path

    if reference_path not in image_paths:
        image_paths = [reference_path, *image_paths]

    images = {image_path: read_image(image_path) for image_path in image_paths}
    reference = images[reference_path]
    output_size = (reference.shape[1], reference.shape[0])
    detector = build_detector()
    reference_index = image_paths.index(reference_path)
    homographies = {reference_path: np.eye(3, dtype=np.float64)}

    print(f"Reference: {reference_path}")
    print(f"Output:    {output_dir}")
    print(f"Strategy:  {args.strategy}")
    print()

    def align_one(image_path: Path, anchor_path: Path) -> bool:
        if image_path == reference_path:
            homographies[image_path] = np.eye(3, dtype=np.float64)
            return True

        target_to_anchor, matches, inliers = find_homography_between(
            detector,
            images[image_path],
            images[anchor_path],
            args.min_matches,
        )

        if target_to_anchor is None:
            print(f"SKIP {image_path.name}: {matches} matches, {inliers} inliers against {anchor_path.name}")
            return False

        homographies[image_path] = homographies[anchor_path] @ target_to_anchor
        print(f"OK   {image_path.name}: {matches} matches, {inliers} inliers against {anchor_path.name}")
        return True

    if args.strategy == "direct":
        for image_path in image_paths:
            align_one(image_path, reference_path)
    else:
        for index in range(reference_index - 1, -1, -1):
            anchor_path = next(
                (image_paths[anchor_index] for anchor_index in range(index + 1, len(image_paths)) if image_paths[anchor_index] in homographies),
                reference_path,
            )
            align_one(image_paths[index], anchor_path)

        for index in range(reference_index + 1, len(image_paths)):
            anchor_path = next(
                (image_paths[anchor_index] for anchor_index in range(index - 1, -1, -1) if image_paths[anchor_index] in homographies),
                reference_path,
            )
            align_one(image_paths[index], anchor_path)

    print()

    for image_path in image_paths:
        if image_path not in homographies:
            continue

        if image_path == reference_path:
            aligned = reference
            status = "reference"
        else:
            aligned = cv2.warpPerspective(
                images[image_path],
                homographies[image_path],
                output_size,
                flags=cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_REPLICATE,
            )
            status = "aligned"

        web_image = resize_for_web(aligned, args.max_output_width)
        output_path = output_dir / image_path.name
        save_jpeg(output_path, web_image, args.quality)
        print(f"OK   {image_path.name}: {status}")


if __name__ == "__main__":
    main()
