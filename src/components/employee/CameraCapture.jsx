import { useCallback, useEffect, useRef, useState } from 'react'

import { useCamera } from '../../hooks/useCamera'
import { useFaceDetection } from '../../hooks/useFaceDetection'

/**
 * Liveness script. Each step captures one frame; together they prove the head
 * actually moved, which a printed photo held to the lens cannot fake. The
 * `center` frame is the one matched against the Aadhaar photo server-side.
 */
const LIVENESS_STEPS = [
  {
    id: 'center',
    prompt: (n) => `${n}, look straight at the camera`,
    // Face must be near the middle of the frame.
    satisfied: (face) => Math.abs(face.offset) < 0.35,
    fallbackHint: 'Hold still, facing the camera',
  },
  {
    id: 'left',
    prompt: (n) => `${n}, slowly turn your head to the LEFT`,
    satisfied: (face) => face.offset < -0.45,
    fallbackHint: 'Turn your head to the left',
  },
  {
    id: 'right',
    prompt: (n) => `${n}, now turn your head to the RIGHT`,
    satisfied: (face) => face.offset > 0.45,
    fallbackHint: 'Turn your head to the right',
  },
]

// How long the pose must hold before we take the shot, and the per-step ceiling
// used when the browser has no face detector to tell us when we are ready.
const HOLD_TICKS = 3
const TICK_MS = 250
const FALLBACK_STEP_MS = 3500

function CameraIcon({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-2.2l-1.2-1.6A2 2 0 0 0 14.4 4H9.6a2 2 0 0 0-1.6.9L6.8 6.5H4a2 2 0 0 0-2 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function FaceGuide({ detected, warning }) {
  const border = warning
    ? 'border-amber-400 border-solid shadow-[0_0_20px_rgba(251,191,36,0.5),0_0_0_9999px_rgba(15,23,42,0.45)]'
    : detected
      ? 'border-green-400 border-solid shadow-[0_0_20px_rgba(74,222,128,0.5),0_0_0_9999px_rgba(15,23,42,0.45)]'
      : 'border-dashed border-white/80'

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className={`h-[72%] w-[58%] rounded-[50%] border-[3px] shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] transition-colors duration-300 ${border}`}
        aria-hidden="true"
      />
      {detected && !warning && (
        <div className="absolute top-[12%] flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          Face detected
        </div>
      )}
      {warning && (
        <div className="absolute top-[12%] rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
          {warning}
        </div>
      )}
    </div>
  )
}

/**
 * @param {(frames: {center: string, poses: string[]}) => void} onCapture
 *   Called once the full liveness sequence completes. Passing `null` clears it.
 */
function CameraCapture({ onCapture, autoStart = true, liveness = false, userName = '' }) {
  const {
    videoRef,
    status,
    error,
    capturedImage,
    startCamera,
    capturePhoto,
    grabFrame,
    retake,
    stopCamera,
    isLive,
    isCaptured,
  } = useCamera()

  const name = userName || 'there'

  const [stepIndex, setStepIndex] = useState(0)
  const [complete, setComplete] = useState(false)
  const [preview, setPreview] = useState(null)

  const framesRef = useRef({})
  const holdRef = useRef(0)
  const elapsedRef = useRef(0)
  const onCaptureRef = useRef(onCapture)
  onCaptureRef.current = onCapture

  const detection = useFaceDetection(videoRef, { enabled: liveness && isLive && !complete })
  const { supported: detectionSupported, face, multipleFaces } = detection

  const step = LIVENESS_STEPS[stepIndex]

  const resetSequence = useCallback(() => {
    framesRef.current = {}
    holdRef.current = 0
    elapsedRef.current = 0
    setStepIndex(0)
    setComplete(false)
    setPreview(null)
  }, [])

  useEffect(() => {
    if (autoStart) startCamera()
  }, [autoStart, startCamera])

  // Restart the sequence whenever the stream comes back (first start or retake).
  useEffect(() => {
    if (liveness && isLive) resetSequence()
  }, [liveness, isLive, resetSequence])

  // Drive the liveness sequence. With a real detector each step advances only
  // once the pose is actually held; without one it advances on a timer and the
  // server-side check does the real work.
  useEffect(() => {
    if (!liveness || !isLive || complete) return undefined

    const tick = () => {
      const current = LIVENESS_STEPS[stepIndex]
      if (!current) return

      elapsedRef.current += TICK_MS

      let ready
      if (detectionSupported) {
        ready = Boolean(face) && !multipleFaces && current.satisfied(face)
      } else {
        ready = elapsedRef.current >= FALLBACK_STEP_MS
      }

      if (!ready) {
        holdRef.current = 0
        return
      }

      holdRef.current += 1
      if (holdRef.current < (detectionSupported ? HOLD_TICKS : 1)) return

      const frame = grabFrame()
      if (!frame) return

      framesRef.current[current.id] = frame
      holdRef.current = 0
      elapsedRef.current = 0

      if (stepIndex < LIVENESS_STEPS.length - 1) {
        setStepIndex(stepIndex + 1)
        return
      }

      // Sequence done — hand the caller the match frame plus the pose frames.
      const { center, ...poses } = framesRef.current
      setPreview(center)
      setComplete(true)
      stopCamera()
      onCaptureRef.current?.({ center, poses: Object.values(poses).filter(Boolean) })
    }

    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [
    liveness,
    isLive,
    complete,
    stepIndex,
    detectionSupported,
    face,
    multipleFaces,
    grabFrame,
    stopCamera,
  ])

  const handleCapture = useCallback(() => {
    const image = capturePhoto()
    if (image && onCapture) onCapture(image)
  }, [capturePhoto, onCapture])

  const handleRetake = useCallback(() => {
    onCaptureRef.current?.(null)
    resetSequence()
    retake()
  }, [resetSequence, retake])

  const warning = multipleFaces ? 'More than one face in frame' : ''
  const poseHeld = detectionSupported && face && step ? step.satisfied(face) : false
  const faceDetected = liveness
    ? detectionSupported
      ? Boolean(face)
      : isLive
    : false

  let hint = 'Align your face within the oval'
  if (liveness && step && !complete) {
    if (detectionSupported && multipleFaces) hint = 'Make sure you are alone in frame'
    else if (detectionSupported && !face) hint = 'Looking for your face...'
    else hint = step.prompt(name)
  } else if (liveness && complete) {
    hint = `Perfect, ${name}! Scan complete`
  }

  const showImage = liveness ? complete && preview : isCaptured && capturedImage

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-slate-900 shadow-lg md:aspect-[4/5] lg:aspect-[3/4] lg:max-h-[520px]">
        {showImage ? (
          <img src={showImage} alt="Captured face" className="h-full w-full -scale-x-100 object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              // Mirrored so turning your head left moves the preview the way a
              // mirror would — matches the instruction the user is following.
              className={`h-full w-full -scale-x-100 object-cover ${isLive ? 'block' : 'hidden'}`}
            />
            {isLive && <FaceGuide detected={faceDetected && poseHeld} warning={warning} />}

            {(status === 'idle' || status === 'starting') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-800 text-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <p className="m-0 text-sm text-white/80">Starting camera...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-800 px-6 text-center text-white">
                <CameraIcon className="h-10 w-10 text-white/60" />
                <p className="m-0 text-sm leading-relaxed text-white/80">{error}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                >
                  Try Again
                </button>
              </div>
            )}
          </>
        )}

        {isLive && (
          <div className="absolute bottom-4 left-3 right-3 text-center">
            <span
              className={`inline-block rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-sm md:text-sm ${
                warning
                  ? 'bg-amber-500/90 text-white'
                  : poseHeld || (!detectionSupported && liveness)
                    ? 'bg-green-500/90 text-white'
                    : 'bg-black/50 text-white'
              }`}
            >
              {hint}
            </span>
          </div>
        )}

        {(isCaptured || complete) && (
          <div className="absolute inset-x-0 top-4 flex justify-center">
            <span className="rounded-full bg-green-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
              ✓ Face captured
            </span>
          </div>
        )}
      </div>

      {!liveness && (
        <>
          <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 text-center">
            {['Good lighting', 'Face forward', 'No glasses'].map((tip) => (
              <li
                key={tip}
                className="rounded-xl border border-slate-100 bg-white px-2 py-2.5 text-[11px] font-medium text-slate-500"
              >
                {tip}
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            {isCaptured ? (
              <button
                type="button"
                onClick={handleRetake}
                className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Retake Photo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isLive}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1e3a8a] text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#172554] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CameraIcon className="h-5 w-5" />
                Capture Photo
              </button>
            )}
          </div>
        </>
      )}

      {liveness && (isLive || complete) && (
        <div className="flex justify-center gap-2">
          {LIVENESS_STEPS.map((s, index) => (
            <span
              key={s.id}
              className={`h-2 w-8 rounded-full transition-colors ${
                complete || index < stepIndex ? 'bg-green-500' : index === stepIndex ? 'bg-[#1e3a8a]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      )}

      {liveness && !detectionSupported && isLive && (
        <p className="m-0 text-center text-xs text-slate-400">
          Live face detection is not available in this browser — follow the prompts and we will
          verify the captured frames on our servers.
        </p>
      )}

      {liveness && complete && (
        <button
          type="button"
          onClick={handleRetake}
          className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Retake &amp; Scan Again
        </button>
      )}
    </div>
  )
}

export default CameraCapture
