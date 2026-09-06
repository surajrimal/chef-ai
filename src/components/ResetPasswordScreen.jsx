import React from "react"

export default function ResetPasswordScreen({ token, onResetPassword }) {
  const [passwords, setPasswords] = React.useState({ newPassword: "", confirmationPassword: "" })
  const [status, setStatus] = React.useState("idle")
  const [message, setMessage] = React.useState("")

  function updateField(event) {
    const { name, value } = event.target
    setPasswords(current => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (!token) {
      setStatus("error")
      setMessage("This password reset link is missing its token.")
      return
    }
    if (passwords.newPassword !== passwords.confirmationPassword) {
      setStatus("error")
      setMessage("Passwords do not match.")
      return
    }

    setStatus("saving")
    setMessage("")
    try {
      await onResetPassword({ token, ...passwords })
      setStatus("success")
      setMessage("Your password has been reset. You can now sign in.")
    } catch (error) {
      setStatus("error")
      setMessage(error.message || "This reset link is invalid or expired.")
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="reset-password-title">
        <div className="auth-intro">
          <p className="panel-eyebrow">Secure account recovery</p>
          <h2 id="reset-password-title">Choose a new password</h2>
          <p>This link expires after 30 minutes and can only be used once.</p>
        </div>
        {status === "success" ? (
          <a className="auth-link-button" href="/">Return to sign in</a>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <label>New password<input name="newPassword" type="password" value={passwords.newPassword} onChange={updateField} autoComplete="new-password" minLength="6" required /></label>
            <label>Confirm new password<input name="confirmationPassword" type="password" value={passwords.confirmationPassword} onChange={updateField} autoComplete="new-password" minLength="6" required /></label>
            {message && <p className={`auth-error${status === "success" ? " account-status-success" : ""}`} role={status === "error" ? "alert" : "status"}>{message}</p>}
            <button className="auth-submit" disabled={status === "saving"}>{status === "saving" ? "Resetting..." : "Reset password"}</button>
          </form>
        )}
      </section>
    </main>
  )
}
