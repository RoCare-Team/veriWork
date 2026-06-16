import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useMutation } from '@tanstack/react-query'
import { loginEmployeeGoogle } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Loader from '../common/Loader'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function GoogleSignInButton() {
  const containerRef = useRef(null)
  const [buttonWidth, setButtonWidth] = useState(320)
  const navigate = useNavigate()
  const { loginEmployee } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined
    const update = () => setButtonWidth(Math.floor(el.offsetWidth))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const mutation = useMutation({
    mutationFn: (idToken) => loginEmployeeGoogle(idToken),
    onSuccess: (data) => {
      loginEmployee(data)
      toast('Signed in with Google', 'success')
      navigate(data.homeRoute || '/employee/profile-setup')
    },
    onError: (err) => toast(err.message || 'Google sign-in failed', 'error'),
  })

  if (!CLIENT_ID) {
    return (
      <p className="m-0 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Google sign-in is not configured. Add <code className="text-xs">VITE_GOOGLE_CLIENT_ID</code> to your .env file.
      </p>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <GoogleLogin
        onSuccess={(res) => {
          if (res.credential) mutation.mutate(res.credential)
        }}
        onError={() => toast('Google sign-in was cancelled or failed', 'error')}
        theme="outline"
        size="large"
        width={buttonWidth}
        text="continue_with"
        shape="rectangular"
      />
      {mutation.isPending && <Loader variant="overlay" label="Signing in with Google..." />}
    </div>
  )
}

export default GoogleSignInButton
