import React from "react"
import { verifyEmail } from "../auth"

export function VerificationPending({ email }) {
  return (
    <main className="auth-page">
      <section className="auth-card verification-card">
        <p className="panel-eyebrow">One last step</p>
        <h2>Verify your email</h2>
        <p>We sent a verification link to <strong>{email}</strong>. Open it to activate your Chef AI account, then return here to sign in.</p>
        <a className="auth-link-button" href="/">Back to sign in</a>
      </section>
    </main>
  )
}

export default function VerificationScreen({ token }) {
  const [status, setStatus] = React.useState("loading")
  const [error, setError] = React.useState("")
  const verificationPromise = React.useRef(null)

  React.useEffect(() => {
    let isCurrent = true
    if (!verificationPromise.current) verificationPromise.current = verifyEmail(token)

    verificationPromise.current
      .then(() => isCurrent && setStatus("success"))
      .catch((err) => {
        if (!isCurrent) return
        setError(err.message || "We could not verify this email address.")
        setStatus("error")
      })

    return () => { isCurrent = false }
  }, [token])

  return (
    <main className="auth-page">
      <section className="auth-card verification-card" aria-live="polite">
        <p className="panel-eyebrow">Email verification</p>
        {status === "loading" && <><h2>Verifying your email…</h2><p>Please wait while we activate your account.</p></>}
        {status === "success" && <><h2>Your email is verified</h2><p>Your Chef AI account is ready. You can now sign in.</p><a className="auth-link-button" href="/">Go to sign in</a></>}
        {status === "error" && <><h2>We couldn’t verify that email</h2><p className="auth-error">{error}</p><a className="auth-link-button" href="/">Back to sign in</a></>}
      </section>
    </main>
  )
}
