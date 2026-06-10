import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Jobs from './pages/Jobs'
import NewJob from './pages/NewJob'
import JobDetail from './pages/JobDetail'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Auto-login as guest — no login screen, instant access
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { setReady(true); return }
      // Try login
      const { error } = await supabase.auth.signInWithPassword({ email: 'guest@garageapp.lb', password: 'guest123456' })
      if (error) {
        // First time — create guest account
        await supabase.auth.signUp({ email: 'guest@garageapp.lb', password: 'guest123456' })
      }
      setReady(true)
    }
    init()
  }, [])

  if (!ready) return (
    <div className="min-h-screen bg-g-bg flex flex-col items-center justify-center">
      <p className="text-3xl">🔧</p>
      <p className="text-g-red font-black text-lg mt-3">GarageApp</p>
      <p className="text-g-dim text-xs mt-2">جاري التحميل...</p>
    </div>
  )

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-g-bg max-w-lg mx-auto">
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/new" element={<NewJob />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
