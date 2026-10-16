import { useCallback, useEffect, useRef, useState } from 'react'

export function useCamera({ facingMode = 'user' } = {}) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    setCapturedImage(null)
    setStatus('starting')

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported on this device.')
      }

      stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setStatus('live')
    } catch (err) {
      const message =
        err.name === 'NotAllowedError'
          ? 'Camera access was denied. Please allow camera permission and try again.'
          : err.message || 'Unable to access camera.'
      setError(message)
      setStatus('error')
      stopCamera()
    }
  }, [facingMode, stopCamera])

  /**
   * Grab a still off the live stream without ending the session — used to
   * collect the several pose frames the liveness check needs.
   */
  const grabFrame = useCallback(() => {
    const video = videoRef.current
    if (!video || video.readyState < 2 || !video.videoWidth) return null

    // Downscale to at most 640px on the long side — plenty for face matching,
    // and keeps each frame around 40-80 KB instead of a full-res camera still.
    const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg', 0.85)
  }, [])

  const capturePhoto = useCallback(() => {
    if (status !== 'live') return null

    const dataUrl = grabFrame()
    if (!dataUrl) return null

    setCapturedImage(dataUrl)
    setStatus('captured')
    stopCamera()
    return dataUrl
  }, [status, grabFrame, stopCamera])

  const retake = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  useEffect(() => () => stopCamera(), [stopCamera])

  return {
    videoRef,
    status,
    error,
    capturedImage,
    startCamera,
    stopCamera,
    capturePhoto,
    grabFrame,
    retake,
    isLive: status === 'live',
    isCaptured: status === 'captured',
  }
}
