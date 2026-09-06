import React from "react"
import Header from "./Header"
import Main from "./Main"
import AuthScreen from "./components/AuthScreen"
import VerificationScreen, { VerificationPending } from "./components/VerificationScreen"
import AccountPage from "./components/AccountPage"
import ResetPasswordScreen from "./components/ResetPasswordScreen"
import { changePassword, clearSession, deleteAccount, loadSession, login, logout as endServerSession, register, requestPasswordReset, resetPassword, saveSession, updateProfile } from "./auth"

export default function App() {
  const [session, setSession] = React.useState(loadSession)
  const [verificationEmail, setVerificationEmail] = React.useState("")
  const [accountOpen, setAccountOpen] = React.useState(false)
  const verificationToken = new URLSearchParams(window.location.search).get("token")
  const isVerificationPage = window.location.pathname === "/verify-email"
  const resetToken = new URLSearchParams(window.location.search).get("token")
  const isResetPasswordPage = window.location.pathname === "/reset-password"

  async function completeAuthentication(action, details) {
    const nextSession = await action(details)
    saveSession(nextSession)
    setSession(nextSession)
  }

  const logout = React.useCallback(async () => {
    try {
      await endServerSession(session)
    } catch {
      // Always complete local sign-out, even if the backend is unavailable.
    } finally {
      clearSession()
      setSession(null)
    }
  }, [session])

  async function registerAccount(details) {
    await register(details)
    setVerificationEmail(details.email)
  }

  function updateLocalProfile(profile) {
    const name = [profile.firstname, profile.lastname].filter(Boolean).join(" ")
    const currentSession = loadSession() || session
    const nextSession = { ...currentSession, user: { ...currentSession.user, ...profile, name } }
    saveSession(nextSession)
    setSession(nextSession)
  }

  async function removeAccount() {
    await deleteAccount()
    clearSession()
    setSession(null)
    setAccountOpen(false)
  }

  return (
    <>
      <Header user={session?.user} onLogout={logout} onAccount={() => setAccountOpen(true)} />
      {isVerificationPage ? <VerificationScreen token={verificationToken} /> : isResetPasswordPage ? <ResetPasswordScreen token={resetToken} onResetPassword={resetPassword} /> : session ? (accountOpen ? <AccountPage user={session.user} onClose={() => setAccountOpen(false)} onUpdateProfile={async profile => { await updateProfile(profile); updateLocalProfile(profile) }} onChangePassword={changePassword} onDeleteAccount={removeAccount} /> : <Main onSessionExpired={logout} />) : verificationEmail ? <VerificationPending email={verificationEmail} /> : <AuthScreen onLogin={(details) => completeAuthentication(login, details)} onRegister={registerAccount} onForgotPassword={requestPasswordReset} />}
    </>
  )
}
