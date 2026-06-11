import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/i18n'
import { Plus, ChevronLeft, Wrench, LogOut, Car, Search, X, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

const $ = (n: any) => '$' + Math.round(Number(n) || 0).toLocaleString('en-US')

export default function Jobs() {
  const { t, toggle } = useLang()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[] | null>(null)

  useEffect(() => {
    supabase.rpc('garage_claim').then(() => {
      supabase.from('garage_jobs').select('*, garage_clients(name, phone)').order('date_in', { ascending: false }).then(({ data }) => {
        setJobs(data ?? []); setLoading(false)
      })
    })
  }, [])

  useEffect(() => {
    if (!search.trim()) { setResults(null); return }
    const q = search.trim().toLowerCase()
    setResults(jobs.filter(j => j.plate_number?.toLowerCase().includes(q) || j.garage_clients?.name?.toLowerCase().includes(q) || j.car_model?.toLowerCase().includes(q)))
  }, [search, jobs])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #C62828, #E53935)' }}>
        <Wrench size={30} className="text-white" />
      </div>
      <p className="text-g-red font-black text-lg tracking-wider">GarageApp</p>
    </div>
  )

  const open = jobs.filter(j => j.status === 'open')
  const completed = jobs.filter(j => j.status === 'completed')
  const totalRev = completed.reduce((s, j) => s + Number(j.total), 0)
  const totalCost = completed.reduce((s, j) => s + Number(j.parts_cost), 0)
  const totalProfit = totalRev - totalCost
  const isSearching = results !== null

  const JobCard = ({ j, i, ghost }: { j: any; i: number; ghost?: boolean }) => {
    const profit = Number(j.total) - Number(j.parts_cost)
    const isOpen = j.status === 'open'
    return (
      <Link to={`/job/${j.id}`} className={`card flex items-center gap-3 animate-slide-in delay-${Math.min(i + 2, 7)} ${ghost ? 'opacity-60 hover:opacity-100' : 'hover:-translate-y-0.5'} ${isOpen ? '' : ''}`} style={isOpen ? { borderColor: 'rgba(229,57,53,0.15)' } : {}}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isOpen ? 'bg-g-red/10' : 'bg-g-green/10'}`}>
          <Car size={18} className={isOpen ? 'text-g-red' : 'text-g-green'} />
        </div>
        <div className={`w-0.5 self-stretch rounded-full shrink-0 ${isOpen ? 'bg-g-red/60' : 'bg-g-green/40'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-g-steel font-bold text-sm truncate">{j.garage_clients?.name}</p>
          <p className="plate text-g-dim text-[11px]">{j.plate_number}</p>
          <p className="text-g-dim/40 text-[10px] truncate">{j.car_model}{j.description ? ' · ' + j.description : ''}</p>
        </div>
        <div className="text-left shrink-0">
          <p className="money text-g-steel text-sm">{$(j.total)}</p>
          <p className={`money text-[10px] ${profit >= 0 ? 'text-g-green' : 'text-g-red'}`}>{profit >= 0 ? '+' : ''}{$(profit)}</p>
        </div>
        <ChevronLeft size={12} className="text-g-dim/30 shrink-0" />
      </Link>
    )
  }

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C62828, #E53935)' }}>
            <Wrench size={16} className="text-white" />
          </div>
          <h1 className="text-g-steel text-xl font-black tracking-wide">GarageApp</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={toggle} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-g-dim text-[10px] font-black hover:text-g-red transition-colors">{t.lang}</button>
          <button onClick={() => supabase.auth.signOut()} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-g-dim hover:text-g-red transition-colors"><LogOut size={13} /></button>
        </div>
      </div>

      {/* Profit bar */}
      <div className="animate-fade-up delay-1">
        <div className="card p-0 overflow-hidden">
          <div className="flex">
            <div className="flex-1 p-3.5 text-center border-r border-white/[0.04]">
              <p className="text-g-dim/50 text-[9px] font-bold tracking-wider uppercase">{t.revenue}</p>
              <p className="money text-g-steel text-lg mt-1">{$(totalRev)}</p>
            </div>
            <div className="flex-1 p-3.5 text-center border-r border-white/[0.04]">
              <p className="text-g-dim/50 text-[9px] font-bold tracking-wider uppercase">{t.costs}</p>
              <p className="money text-g-red text-lg mt-1">{$(totalCost)}</p>
            </div>
            <div className="flex-1 p-3.5 text-center" style={{ background: 'rgba(74,222,128,0.04)' }}>
              <p className="text-g-green/50 text-[9px] font-bold tracking-wider uppercase flex items-center justify-center gap-1"><TrendingUp size={10} />{t.profit}</p>
              <p className="money text-g-green text-lg mt-1">{$(totalProfit)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative animate-fade-up delay-2">
        <div className={`relative transition-all duration-300 ${isSearching ? 'animate-glow rounded-xl' : ''}`}>
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-g pr-10 pl-10 font-bold plate"
            placeholder={t.lang === 'ع' ? 'Search plate, name, car...' : 'بحث — لوحة، اسم، سيارة...'}
            dir="ltr" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-g-red transition-colors"><X size={14} /></button>
          )}
        </div>
      </div>

      {/* Search results */}
      {isSearching && (
        <div className="animate-fade-in">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl mb-2 opacity-30">🔍</p>
              <p className="text-g-dim text-sm">No results for "<span className="plate">{search}</span>"</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="section-label">🔍 {results.length} {t.lang === 'ع' ? 'results' : 'نتيجة'}</p>
              {results.map((j, i) => <JobCard key={j.id} j={j} i={i} />)}
            </div>
          )}
        </div>
      )}

      {/* Normal view */}
      {!isSearching && (
        <>
          {/* New car CTA */}
          <Link to="/new" className="block animate-fade-up delay-3">
            <div className="relative overflow-hidden rounded-2xl p-4 transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #B71C1C 0%, #E53935 50%, #FF5252 100%)' }}>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Plus size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-base">{t.newCar}</p>
                  <p className="text-white/50 text-xs">{t.newCarSub}</p>
                </div>
              </div>
              <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-white/[0.06]" />
              <div className="absolute right-8 -top-4 w-16 h-16 rounded-full bg-white/[0.04]" />
            </div>
          </Link>

          {/* Active */}
          {open.length > 0 && (
            <div className="animate-fade-up delay-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-g-red animate-pulse" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                <p className="section-label mb-0">{t.currentJobs} ({open.length})</p>
              </div>
              <div className="space-y-2.5">
                {open.map((j, i) => <JobCard key={j.id} j={j} i={i} />)}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="animate-fade-up delay-5">
              <p className="section-label">{t.completed} ({completed.length})</p>
              <div className="space-y-2.5">
                {completed.map((j, i) => <JobCard key={j.id} j={j} i={i} ghost />)}
              </div>
            </div>
          )}

          {jobs.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
              <p className="text-4xl mb-3 opacity-30">🚗</p>
              <p className="text-g-dim text-sm">{t.noCars}</p>
              <Link to="/new" className="text-g-red text-sm font-bold mt-3 inline-block">{t.addFirst}</Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
