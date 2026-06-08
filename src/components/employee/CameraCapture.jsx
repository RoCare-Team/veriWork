import { useEffect, useCallback, useState, useRef } from 'react'

import { useCamera } from '../../hooks/useCamera'



const LIVENESS_PHASES = ['scanning', 'detected', 'left', 'right', 'done']



function getLivenessMessage(phase, name) {

  const n = name || 'there'

  switch (phase) {

    case 'scanning':

      return 'Looking for your face...'

    case 'detected':

      return `${n}, face detected!`

    case 'left':

      return `${n}, please move your face to the left`

    case 'right':

      return `${n}, now move your face to the right`

    case 'done':

      return `Perfect, ${n}! Hold still...`

    default:

      return 'Align your face within the oval'

  }

}



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



function FaceGuide({ detected }) {

  return (

    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

      <div

        className={`h-[72%] w-[58%] rounded-[50%] border-[3px] shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] transition-colors duration-300 ${

          detected

            ? 'border-green-400 border-solid shadow-[0_0_20px_rgba(74,222,128,0.5),0_0_0_9999px_rgba(15,23,42,0.45)]'

            : 'border-dashed border-white/80'

        }`}

        aria-hidden="true"

      />

      {detected && (

        <div className="absolute top-[12%] flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">

          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />

          Face detected

        </div>

      )}

    </div>

  )

}



function CameraCapture({ onCapture, autoStart = true, liveness = false, userName = '' }) {

  const {

    videoRef,

    status,

    error,

    capturedImage,

    startCamera,

    capturePhoto,

    retake,

    isLive,

    isCaptured,

  } = useCamera()



  const [phase, setPhase] = useState('scanning')

  const timersRef = useRef([])

  const captureRef = useRef(capturePhoto)

  const onCaptureRef = useRef(onCapture)

  captureRef.current = capturePhoto

  onCaptureRef.current = onCapture



  const clearTimers = useCallback(() => {

    timersRef.current.forEach(clearTimeout)

    timersRef.current = []

  }, [])



  useEffect(() => {

    if (autoStart) startCamera()

  }, [autoStart, startCamera])



  useEffect(() => {

    if (!liveness || !isLive) {

      setPhase('scanning')

      clearTimers()

      return

    }



    setPhase('scanning')

    const schedule = (fn, ms) => {

      const id = setTimeout(fn, ms)

      timersRef.current.push(id)

    }



    schedule(() => setPhase('detected'), 1200)

    schedule(() => setPhase('left'), 2800)

    schedule(() => setPhase('right'), 5000)

    schedule(() => setPhase('done'), 7200)

    schedule(() => {

      const image = captureRef.current()

      if (image) onCaptureRef.current?.(image)

    }, 8200)



    return clearTimers

  }, [liveness, isLive, clearTimers])



  const handleCapture = useCallback(() => {

    const image = capturePhoto()

    if (image && onCapture) onCapture(image)

  }, [capturePhoto, onCapture])



  const handleRetake = useCallback(() => {

    if (onCapture) onCapture(null)

    setPhase('scanning')

    retake()

  }, [onCapture, retake])



  const faceDetected = liveness && phase !== 'scanning'

  const hint = liveness ? getLivenessMessage(phase, userName) : 'Align your face within the oval'



  return (

    <div className="flex flex-col gap-4">

      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-slate-900 shadow-lg md:aspect-[4/5] lg:aspect-[3/4] lg:max-h-[520px]">

        {isCaptured && capturedImage ? (

          <img src={capturedImage} alt="Captured face" className="h-full w-full object-cover" />

        ) : (

          <>

            <video

              ref={videoRef}

              playsInline

              muted

              className={`h-full w-full object-cover ${isLive ? 'block' : 'hidden'}`}

            />

            {isLive && <FaceGuide detected={faceDetected} />}



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

                faceDetected

                  ? 'bg-green-500/90 text-white'

                  : 'bg-black/50 text-white'

              }`}

            >

              {hint}

            </span>

          </div>

        )}



        {isCaptured && (

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

                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1a3a8f] text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#152b6e] disabled:cursor-not-allowed disabled:opacity-50"

              >

                <CameraIcon className="h-5 w-5" />

                Capture Photo

              </button>

            )}

          </div>

        </>

      )}



      {liveness && isLive && (

        <div className="flex justify-center gap-2">

          {LIVENESS_PHASES.map((step) => (

            <span

              key={step}

              className={`h-2 w-2 rounded-full transition-colors ${

                LIVENESS_PHASES.indexOf(phase) >= LIVENESS_PHASES.indexOf(step)

                  ? 'bg-green-500'

                  : 'bg-slate-200'

              }`}

            />

          ))}

        </div>

      )}



      {liveness && isCaptured && (

        <button

          type="button"

          onClick={handleRetake}

          className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"

        >

          Retake & Scan Again

        </button>

      )}

    </div>

  )

}



export default CameraCapture

