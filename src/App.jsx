import React from "react"
import Header from "./Header"
import Main from "./Main"
import AuthScreen from "./components/AuthScreen"
import VerificationScreen, { VerificationPending } from "./components/VerificationScreen"
import { clearSession, loadSession, login, logout as endServerSession, register, saveSession } from "./auth"

export default function App() {
  const [session, setSession] = React.useState(loadSession)
  const [verificationEmail, setVerificationEmail] = React.useState("")
  const verificationToken = new URLSearchParams(window.location.search).get("token")
  const isVerificationPage = window.location.pathname === "/verify-email"

  async function completeAuthentication(action, details) {
    const nextSession = await action(details)
    saveSession(nextSession)
    setSession(nextSession)
  }

  async function logout() {
    try {
      await endServerSession(session)
    } catch {
      // Always complete local sign-out, even if the backend is unavailable.
    } finally {
      clearSession()
      setSession(null)
    }
  }

  async function registerAccount(details) {
    await register(details)
    setVerificationEmail(details.email)
  }

  return (
    <>
      <Header user={session?.user} onLogout={logout} />
      {isVerificationPage ? <VerificationScreen token={verificationToken} /> : session ? <Main /> : verificationEmail ? <VerificationPending email={verificationEmail} /> : <AuthScreen onLogin={(details) => completeAuthentication(login, details)} onRegister={registerAccount} />}
    </>
  )
}
