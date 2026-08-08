import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Live face detection for the camera preview.
 *
 * Uses the browser's native Shape Detection `FaceDetector` where it exists
 * (Chrome/Edge on Android and desktop behind the same origin trial-free API).
 * Everywhere else it degrades to `supported: false` — the UI then guides the
 * user through the poses on a timer instead of pretending to see a face.
 *
 * This is a UX aid only. The authoritative detection, liveness and identity
 * match all happen server-side on the captured frames.
 */
const DETECT_INTERVAL_MS = 250

export function isFaceDetectionSupported() {
  return typeof window !== 'undefined' && typeof window.FaceDetector === 'function'
}

export function useFaceDetection(videoRef, { enabled = true } = {}) {
  const supported = isFaceDetectionSupported()
  const detectorRef = useRef(null)
  const timerRef = useRef(null)
  const runningRef = useRef(false)

  const [face, setFace] = useState(null)
  const [faceCount, setFaceCount] = useState(0)

  const detectOnce = useCallback(async () => {
    const video = videoRef.current
    if (!video || video.readyState < 2 || !detectorRef.current) return

    // Skip if a previous detect is still in flight — on slower devices the
    // detector can take longer than the polling interval.
    if (runningRef.current) return
    runningRef.current = true

    try {
      const faces = await detectorRef.current.detect(video)
      setFaceCount(faces.length)

      if (faces.length !== 1) {
        setFace(null)
        return
      }

      const box = faces[0].boundingBox
      const width = video.videoWidth || 1
      const height = video.videoHeight || 1
      const centerX = (box.x + box.width / 2) / width
      const centerY = (box.y + box.height / 2) / height

      setFace({
        // Normalised 0..1 so callers don't have to know the video resolution.
        centerX,
        centerY,
        // Rough share of the frame the head fills — used to nudge the user
        // closer or further from the camera.
        coverage: (box.width * box.height) / (width * height),
        // Where the head sits from the *user's* point of view:
        // -1 = their own left, 0 = centred, +1 = their own right.
        // The raw camera frame is not mirrored, so the user's left is the
        // right-hand side of the image — hence the inversion.
        offset: Math.max(-1, Math.min(1, (0.5 - centerX) * 4)),
      })
    } catch {
      // A single failed frame is not worth surfacing — the next tick retries.
      setFace(null)
    } finally {
      runningRef.current = false
    }
  }, [videoRef])

  useEffect(() => {
    if (!supported || !enabled) {
      setFace(null)
      setFaceCount(0)
      return undefined
    }

    if (!detectorRef.current) {
      try {
        detectorRef.current = new window.FaceDetector({ maxDetectedFaces: 3, fastMode: true })
      } catch {
        detectorRef.current = null
        return undefined
      }
    }

    timerRef.current = setInterval(detectOnce, DETECT_INTERVAL_MS)
    return () => {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [supported, enabled, detectOnce])

  return {
    supported,
    face,
    faceCount,
    detected: Boolean(face),
    multipleFaces: faceCount > 1,
  }
}
