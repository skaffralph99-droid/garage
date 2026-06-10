import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Jobs from './pages/Jobs'
import NewJob from './pages/NewJob'
import JobDetail from './pages/JobDetail'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => l.subscription.unsubscribe()
  }, [])
  if (loading) return <div className="min-h-screen bg-g-bg flex flex-col items-center justify-center"><p className="text-2xl">🔧</p><p className="text-g-red font-black text-lg mt-2">GarageApp</p></div>
  if (!session) return <Login />
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
