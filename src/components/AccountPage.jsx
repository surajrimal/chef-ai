import React from "react"

export default function AccountPage({ user, onClose, onUpdateProfile, onChangePassword, onDeleteAccount }) {
  const [profile, setProfile] = React.useState({
    firstname: user.firstname || user.name || "",
    lastname: user.lastname || "",
  })
  const [passwords, setPasswords] = React.useState({ currentPassword: "", newPassword: "", confirmationPassword: "" })
  const [profileState, setProfileState] = React.useState({ status: "idle", message: "" })
  const [passwordState, setPasswordState] = React.useState({ status: "idle", message: "" })
  const [deleteText, setDeleteText] = React.useState("")
  const [deleteState, setDeleteState] = React.useState({ status: "idle", message: "" })

  function updateProfileField(event) {
    const { name, value } = event.target
    setProfile(current => ({ ...current, [name]: value }))
  }

  function updatePasswordField(event) {
    const { name, value } = event.target
    setPasswords(current => ({ ...current, [name]: value }))
  }

  async function saveProfile(event) {
    event.preventDefault()
    setProfileState({ status: "saving", message: "Saving profile..." })
    try {
      await onUpdateProfile(profile)
      setProfileState({ status: "success", message: "Profile updated." })
    } catch (error) {
      setProfileState({ status: "error", message: error.message || "Profile could not be updated." })
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    if (passwords.newPassword !== passwords.confirmationPassword) {
      setPasswordState({ status: "error", message: "New passwords do not match." })
      return
    }

    setPasswordState({ status: "saving", message: "Changing password..." })
    try {
      await onChangePassword(passwords)
      setPasswords({ currentPassword: "", newPassword: "", confirmationPassword: "" })
      setPasswordState({ status: "success", message: "Password changed." })
    } catch (error) {
      setPasswordState({ status: "error", message: error.message || "Password could not be changed." })
    }
  }

  async function removeAccount() {
    if (deleteText !== "DELETE") return
    setDeleteState({ status: "deleting", message: "Deleting account..." })
    try {
      await onDeleteAccount()
    } catch (error) {
      setDeleteState({ status: "error", message: error.message || "Account could not be deleted." })
    }
  }

  return (
    <main className="account-page">
      <div className="account-page-header">
        <div>
          <p className="panel-eyebrow">Personal settings</p>
          <h2>Your account</h2>
          <p className="account-email">{user.email}</p>
        </div>
        <button className="hide-recipe-button" type="button" onClick={onClose}>Back to kitchen</button>
      </div>

      <section className="account-section">
        <div className="panel-heading"><p className="panel-eyebrow">Profile</p><h3>Personal details</h3></div>
        <form className="auth-form account-form" onSubmit={saveProfile}>
          <div className="auth-name-fields">
            <label>First name<input name="firstname" value={profile.firstname} onChange={updateProfileField} required /></label>
            <label>Last name<input name="lastname" value={profile.lastname} onChange={updateProfileField} required /></label>
          </div>
          {profileState.message && <p className={`account-status account-status-${profileState.status}`} role="status">{profileState.message}</p>}
          <button className="auth-submit" disabled={profileState.status === "saving"}>{profileState.status === "saving" ? "Saving..." : "Save profile"}</button>
        </form>
      </section>

      <section className="account-section">
        <div className="panel-heading"><p className="panel-eyebrow">Security</p><h3>Change password</h3></div>
        <form className="auth-form account-form" onSubmit={savePassword}>
          <label>Current password<input name="currentPassword" type="password" value={passwords.currentPassword} onChange={updatePasswordField} autoComplete="current-password" required /></label>
          <label>New password<input name="newPassword" type="password" value={passwords.newPassword} onChange={updatePasswordField} autoComplete="new-password" minLength="6" required /></label>
          <label>Confirm new password<input name="confirmationPassword" type="password" value={passwords.confirmationPassword} onChange={updatePasswordField} autoComplete="new-password" minLength="6" required /></label>
          {passwordState.message && <p className={`account-status account-status-${passwordState.status}`} role="status">{passwordState.message}</p>}
          <button className="auth-submit" disabled={passwordState.status === "saving"}>{passwordState.status === "saving" ? "Changing..." : "Change password"}</button>
        </form>
      </section>

      <section className="account-section account-danger-zone">
        <div className="panel-heading"><p className="panel-eyebrow">Danger zone</p><h3>Delete your account</h3></div>
        <p>This permanently removes your account, saved recipes, tokens, and associated data. Type DELETE to confirm.</p>
        <input className="delete-confirmation-input" value={deleteText} onChange={event => setDeleteText(event.target.value)} placeholder="DELETE" aria-label="Type DELETE to confirm account deletion" />
        {deleteState.message && <p className="account-status account-status-error" role="alert">{deleteState.message}</p>}
        <button className="delete-account-button" type="button" disabled={deleteText !== "DELETE" || deleteState.status === "deleting"} onClick={removeAccount}>{deleteState.status === "deleting" ? "Deleting..." : "Permanently delete account"}</button>
      </section>
    </main>
  )
}
