import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/i18n'
import { Plus, ChevronLeft, Wrench, LogOut, Car, Search, X } from 'lucide-react'
import { format } from 'date-fns'

function money(n: any) { return '$' + Math.round(Number(n) || 0).toLocaleString('en-US') }

export default function Jobs() {
  const { t, toggle } = useLang()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[] | null>(null)

  useEffect(() => {
    supabase.rpc('garage_claim').then(() => {
      supabase.from('garage_jobs').select('*, garage_clients(name, phone)').order('date_in', { ascending: false }).then(({ data }) => {
        setJobs(data ?? []); setLoading(false)
      })
    })
  }, [])

  // Live search by plate number
  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); return }
    const q = search.trim()
    const results = jobs.filter(j =>
      j.plate_number.toLowerCase().includes(q.toLowerCase()) ||
      j.garage_clients?.name?.toLowerCase().includes(q.toLowerCase()) ||
      j.car_model?.toLowerCase().includes(q.toLowerCase())
    )
    setSearchResults(results)
  }, [search, jobs])

  if (loading) return <div className="flex items-center justify-center h-[80vh]"><p className="text-2xl">🔧</p></div>

  const open = jobs.filter(j => j.status === 'open')
  const completed = jobs.filter(j => j.status === 'completed')
  const totalRevenue = completed.reduce((s, j) => s + Number(j.total), 0)
  const totalCosts = completed.reduce((s, j) => s + Number(j.parts_cost), 0)
  const totalProfit = totalRevenue - totalCosts

  const isSearching = searchResults !== null

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-2">
          <Wrench size={20} className="text-g-red" />
          <h1 className="text-g-steel text-2xl font-black">{t.appName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="w-9 h-9 rounded-full bg-g-card border border-g-border flex items-center justify-center text-g-dim hover:text-g-red transition-colors text-xs font-black">{t.lang}</button>
          <button onClick={() => supabase.auth.signOut()} className="w-9 h-9 rounded-full bg-g-card border border-g-border flex items-center justify-center text-g-dim"><LogOut size={14} /></button>
        </div>
      </div>

      {/* 🔍 PLATE SEARCH — the killer feature */}
      <div className="relative animate-fade-up delay-1">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-g-dim pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-g pr-10 pl-10 text-base font-bold"
          placeholder={t.lang === 'ع' ? 'Search plate, name, or car...' : 'ابحث برقم اللوحة، الاسم، أو السيارة...'}
          dir="ltr"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-g-dim hover:text-g-red">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search results */}
      {isSearching && (
        <div className="animate-fade-in">
          {searchResults.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-g-dim text-sm">{t.lang === 'ع' ? 'No results for' : 'لا نتائج لـ'} "{search}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-g-dim text-[11px] font-bold tracking-widest">🔍 {searchResults.length} {t.lang === 'ع' ? 'results' : 'نتيجة'}</p>
              {searchResults.map(j => {
                const profit = Number(j.total) - Number(j.parts_cost)
                const isOpen = j.status === 'open'
                return (
                  <Link key={j.id} to={`/job/${j.id}`} className={`card flex items-center gap-3 transition-all ${isOpen ? 'border-g-red/20' : ''}`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isOpen ? 'bg-g-red/15' : 'bg-green-500/10'}`}>
                      <Car size={20} className={isOpen ? 'text-g-red' : 'text-green-400'} />
                    </div>
                    <div className={`w-1 self-stretch rounded-full shrink-0 ${isOpen ? 'bg-g-red' : 'bg-green-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-g-steel font-bold text-sm truncate">{j.garage_clients?.name} — {j.plate_number}</p>
                      <p className="text-g-dim text-[10px] truncate">{j.car_model} · {j.description}</p>
                      <p className="text-g-dim text-[10px]">{format(new Date(j.date_in), 'dd/MM/yyyy')} · {isOpen ? (t.lang === 'ع' ? 'Active' : 'شغل حالي') : (t.lang === 'ع' ? 'Done' : 'مكتمل')}</p>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="text-g-steel font-black text-sm">{money(j.total)}</p>
                      <p className="text-green-400 text-[10px] font-bold">+{money(profit)}</p>
                    </div>
                    <ChevronLeft size={14} className="text-g-dim shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Normal view — only show when NOT searching */}
      {!isSearching && (
        <>
          <div className="flex gap-2 animate-fade-up delay-2">
            <div className="flex-1 bg-g-card border border-g-border rounded-xl p-3 text-center">
              <p className="text-g-steel font-black text-xl">{money(totalRevenue)}</p>
              <p className="text-g-dim text-[10px]">{t.revenue}</p>
            </div>
            <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <p className="text-g-red font-black text-xl">{money(totalCosts)}</p>
              <p className="text-g-dim text-[10px]">{t.costs}</p>
            </div>
            <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
              <p className="text-green-400 font-black text-xl">{money(totalProfit)}</p>
              <p className="text-g-dim text-[10px]">{t.profit} 💰</p>
            </div>
          </div>

          <Link to="/new" className="block animate-fade-up delay-3">
            <div className="relative overflow-hidden rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444, #F87171)' }}>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Plus size={24} className="text-white" /></div>
                <div><p className="text-white font-black text-base">{t.newCar}</p><p className="text-white/70 text-xs">{t.newCarSub}</p></div>
              </div>
              <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
            </div>
          </Link>

          {open.length > 0 && (
            <div className="animate-fade-up delay-4">
              <p className="text-g-red text-[11px] font-bold tracking-widest mb-3">{t.currentJobs}</p>
              <div className="space-y-2">
                {open.map((j, i) => {
                  const profit = Number(j.total) - Number(j.parts_cost)
                  return (
                    <Link key={j.id} to={`/job/${j.id}`} className={`card flex items-center gap-3 border-g-red/20 hover:-translate-y-0.5 transition-all animate-fade-up delay-${Math.min(i + 4, 6)}`}>
                      <div className="w-11 h-11 rounded-xl bg-g-red/15 flex items-center justify-center shrink-0"><Car size={20} className="text-g-red" /></div>
                      <div className="w-1 self-stretch rounded-full bg-g-red shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-g-steel font-bold text-sm truncate">{j.garage_clients?.name} — {j.plate_number}</p>
                        <p className="text-g-dim text-[10px] truncate">{j.car_model} · {j.description}</p>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-g-steel font-black text-sm">{money(j.total)}</p>
                        <p className="text-green-400 text-[10px] font-bold">+{money(profit)}</p>
                      </div>
                      <ChevronLeft size={14} className="text-g-dim shrink-0" />
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div className="animate-fade-up delay-5">
              <p className="text-green-400 text-[11px] font-bold tracking-widest mb-3">{t.completed}</p>
              <div className="space-y-2">
                {completed.map((j, i) => {
                  const profit = Number(j.total) - Number(j.parts_cost)
                  return (
                    <Link key={j.id} to={`/job/${j.id}`} className={`card flex items-center gap-3 opacity-70 hover:opacity-100 transition-all animate-fade-up delay-${Math.min(i + 5, 6)}`}>
                      <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0"><Car size={20} className="text-green-400" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-g-steel font-bold text-sm truncate">{j.garage_clients?.name} — {j.plate_number}</p>
                        <p className="text-g-dim text-[10px] truncate">{j.car_model}</p>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-g-steel font-black text-sm">{money(j.total)}</p>
                        <p className="text-green-400 text-[10px] font-bold">+{money(profit)}</p>
                      </div>
                      <ChevronLeft size={14} className="text-g-dim shrink-0" />
                    </Link>
                  )
                })}
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
        </>
      )}
    </div>
  )
}
