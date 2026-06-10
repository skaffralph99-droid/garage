import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/i18n'
import { Plus, ChevronLeft, Wrench, LogOut, Car, Globe } from 'lucide-react'
import { format } from 'date-fns'

function money(n: any) { return '$' + Math.round(Number(n) || 0).toLocaleString('en-US') }

export default function Jobs() {
  const { t, toggle } = useLang()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('garage_claim').then(() => {
      supabase.from('garage_jobs').select('*, garage_clients(name, phone)').order('date_in', { ascending: false }).then(({ data }) => {
        setJobs(data ?? []); setLoading(false)
      })
    })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-[80vh]"><p className="text-2xl">🔧</p></div>

  const open = jobs.filter(j => j.status === 'open')
  const completed = jobs.filter(j => j.status === 'completed')
  const totalEarned = completed.reduce((s, j) => s + Number(j.total), 0)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-2">
          <Wrench size={20} className="text-g-red" />
          <h1 className="text-g-steel text-2xl font-black">{t.appName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="w-9 h-9 rounded-full bg-g-card border border-g-border flex items-center justify-center text-g-dim hover:text-g-red transition-colors text-xs font-black">
            {t.lang}
          </button>
          <button onClick={() => supabase.auth.signOut()} className="w-9 h-9 rounded-full bg-g-card border border-g-border flex items-center justify-center text-g-dim"><LogOut size={14} /></button>
        </div>
      </div>

      <div className="flex gap-2 animate-fade-up delay-1">
        <div className="flex-1 bg-g-red/10 border border-g-red/20 rounded-xl p-3 text-center">
          <p className="text-g-red font-black text-2xl">{open.length}</p>
          <p className="text-g-dim text-[10px]">{t.current}</p>
        </div>
        <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
          <p className="text-green-400 font-black text-2xl">{completed.length}</p>
          <p className="text-g-dim text-[10px]">{t.done}</p>
        </div>
        <div className="flex-1 bg-g-card border border-g-border rounded-xl p-3 text-center">
          <p className="text-g-steel font-black text-2xl">{money(totalEarned)}</p>
          <p className="text-g-dim text-[10px]">{t.totalEarned}</p>
        </div>
      </div>

      <Link to="/new" className="block animate-fade-up delay-2">
        <div className="relative overflow-hidden rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444, #F87171)' }}>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Plus size={24} className="text-white" /></div>
            <div>
              <p className="text-white font-black text-base">{t.newCar}</p>
              <p className="text-white/70 text-xs">{t.newCarSub}</p>
            </div>
          </div>
          <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>
      </Link>

      {open.length > 0 && (
        <div className="animate-fade-up delay-3">
          <p className="text-g-red text-[11px] font-bold tracking-widest mb-3">{t.currentJobs}</p>
          <div className="space-y-2">
            {open.map((j, i) => (
              <Link key={j.id} to={`/job/${j.id}`} className={`card flex items-center gap-3 border-g-red/20 hover:-translate-y-0.5 transition-all animate-fade-up delay-${Math.min(i + 3, 6)}`}>
                <div className="w-11 h-11 rounded-xl bg-g-red/15 flex items-center justify-center shrink-0"><Car size={20} className="text-g-red" /></div>
                <div className="w-1 self-stretch rounded-full bg-g-red shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-g-steel font-bold text-sm truncate">{j.garage_clients?.name} — {j.plate_number}</p>
                  <p className="text-g-dim text-[10px] truncate">{j.car_model} · {j.description}</p>
                  <p className="text-g-dim text-[10px]">{format(new Date(j.date_in), 'dd/MM/yyyy')}</p>
                </div>
                <p className="text-g-steel font-black text-sm shrink-0">{money(j.total)}</p>
                <ChevronLeft size={14} className="text-g-dim shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="animate-fade-up delay-4">
          <p className="text-green-400 text-[11px] font-bold tracking-widest mb-3">{t.completed}</p>
          <div className="space-y-2">
            {completed.map((j, i) => (
              <Link key={j.id} to={`/job/${j.id}`} className={`card flex items-center gap-3 opacity-70 hover:opacity-100 transition-all animate-fade-up delay-${Math.min(i + 4, 6)}`}>
                <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0"><Car size={20} className="text-green-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-g-steel font-bold text-sm truncate">{j.garage_clients?.name} — {j.plate_number}</p>
                  <p className="text-g-dim text-[10px] truncate">{j.car_model} · {j.description}</p>
                  <p className="text-g-dim text-[10px]">{format(new Date(j.date_in), 'dd/MM')} → {j.date_out ? format(new Date(j.date_out), 'dd/MM') : '—'}</p>
                </div>
                <p className="text-green-400 font-black text-sm shrink-0">{money(j.total)}</p>
                <ChevronLeft size={14} className="text-g-dim shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {jobs.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <p className="text-4xl mb-3">🚗</p>
          <p className="text-g-dim text-sm">{t.noCars}</p>
          <Link to="/new" className="text-g-red text-sm font-bold mt-2 inline-block">{t.addFirst}</Link>
        </div>
      )}
    </div>
  )
}
