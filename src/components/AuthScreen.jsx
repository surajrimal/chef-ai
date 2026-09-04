import React from "react"

const EMPTY_LOGIN = { email: "", password: "" }
const EMPTY_REGISTER = { firstname: "", lastname: "", email: "", password: "", confirmPassword: "" }

export default function AuthScreen({ onLogin, onRegister }) {
  const [mode, setMode] = React.useState("login")
  const [loginForm, setLoginForm] = React.useState(EMPTY_LOGIN)
  const [registerForm, setRegisterForm] = React.useState(EMPTY_REGISTER)
  const [error, setError] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const form = mode === "login" ? loginForm : registerForm
  const setForm = mode === "login" ? setLoginForm : setRegisterForm

  function switchMode(nextMode) {
    setMode(nextMode)
    setError("")
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError("")

    if (mode === "register" && form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === "login") await onLogin(loginForm)
      else {
        const registration = {
          firstname: registerForm.firstname,
          lastname: registerForm.lastname,
          email: registerForm.email,
          password: registerForm.password,
        }
        await onRegister(registration)
      }
    } catch (err) {
      setError(err.message || "Unable to complete authentication.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-intro">
          <p className="panel-eyebrow">Your kitchen companion</p>
          <h2 id="auth-title">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p>{mode === "login" ? "Sign in to continue creating recipes with Chef AI." : "Save your place and start cooking with Chef AI."}</p>
        </div>
        <div className="auth-tabs" role="tablist" aria-label="Authentication options">
          <button className={mode === "login" ? "auth-tab auth-tab-active" : "auth-tab"} type="button" onClick={() => switchMode("login")}>Sign in</button>
          <button className={mode === "register" ? "auth-tab auth-tab-active" : "auth-tab"} type="button" onClick={() => switchMode("register")}>Register</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && <div className="auth-name-fields">
            <label>First name<input name="firstname" value={form.firstname} onChange={updateField} autoComplete="given-name" required /></label>
            <label>Last name<input name="lastname" value={form.lastname} onChange={updateField} autoComplete="family-name" required /></label>
          </div>}
          <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={updateField} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength="6" required /></label>
          {mode === "register" && <label>Confirm password<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} autoComplete="new-password" minLength="6" required /></label>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
      </section>
    </main>
  )
}
