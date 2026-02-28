import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthChange } from './utils/firebase'
import useStore from './store/useStore'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'

const F = "'Inter', sans-serif"

function ProtectedRoute({ children }) {
  const isAuthenticated = useStore(s => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" />
  return children
}

function App() {
  const {isAuthenticated } = useStore()
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
  const unsubscribe = onAuthChange((firebaseUser) => {
    if (firebaseUser) {
      useStore.getState().setUser({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        email: firebaseUser.email,
        photo: firebaseUser.photoURL
      });
      useStore.getState().clearDocuments();
      useStore.getState().clearMessages();
    } else {
      useStore.getState().logout();
    }
    setAuthLoading(false);
  })
  return () => unsubscribe()
}, [])

  // Show nothing while Firebase checks auth state
  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: "#0a0a0f",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          fontFamily: F, fontSize: "0.875rem",
          color: "rgba(255,255,255,0.3)"
        }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0f", color: "white" }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/chat" /> : <LoginPage />
        } />
        <Route path="/chat" element={
          <ProtectedRoute><ChatPage /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><HistoryPage /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/profile" element={
  <ProtectedRoute><ProfilePage /></ProtectedRoute>
} />
      </Routes>
      
    </div>
  )
}

export default App