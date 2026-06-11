import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/i18n'
import { ArrowRight, Check, Trash2, Phone, Car, Edit3, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

const $ = (n: any) => '$' + Math.round(Number(n) || 0).toLocaleString('en-US')

export default function JobDetail() {
  const { t } = useLang()
  const { id } = useParams()
  const nav = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [partsCost, setPartsCost] = useState('')
  const [charged, setCharged] = useState('')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    if (!id) return
    supabase.from('garage_jobs').select('*, garage_clients(name, phone)').eq('id', id).single().then(({ data }) => {
      if (data) {
        setJob(data); setPartsCost(String(data.parts_cost)); setCharged(String(data.total)); setDesc(data.description || '')
        supabase.from('garage_jobs').select('*').eq('client_id', data.client_id).neq('id', id).order('date_in', { ascending: false }).then(({ data: h }) => setHistory(h ?? []))
      }
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [id])

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-g-dim">🔧</div>
  if (!job) return <div className="p-4 text-center py-20"><p className="text-g-dim">{t.notFound}</p></div>

  const isOpen = job.status === 'open'
  const profit = Number(job.total) - Number(job.parts_cost)
  const editProfit = (parseFloat(charged) || 0) - (parseFloat(partsCost) || 0)

  const markComplete = async () => { if (!confirm(t.confirmDone)) return; await supabase.from('garage_jobs').update({ status: 'completed', date_out: format(new Date(), 'yyyy-MM-dd') }).eq('id', id); load() }
  const saveEdit = async () => { setSaving(true); await supabase.from('garage_jobs').update({ parts_cost: parseFloat(partsCost) || 0, total: parseFloat(charged) || 0, description: desc.trim() || null }).eq('id', id); setSaving(false); setEditing(false); load() }
  const deleteJob = async () => { if (!confirm(t.confirmDelete)) return; await supabase.from('garage_jobs').delete().eq('id', id); nav('/') }
  const waMsg = () => { const msg = `Hi ${job.garage_clients?.name || ''}, your car ${job.car_model || ''} (${job.plate_number}) is ready.\n\nWork: ${job.description || '—'}\nTotal: $${job.total}\n\n_GarageApp 🔧_`; return `https://wa.me/${(job.garage_clients?.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}` }

  return (
    <div className="p-4 space-y-4 pb-8">
      <div className="flex items-center gap-3 animate-fade-up">
        <button onClick={() => nav('/')} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"><ArrowRight size={16} className="text-g-red" /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-g-red' : 'bg-g-green'}`} style={isOpen ? { animation: 'pulse 2s ease-in-out infinite' } : {}} />
            <p className="text-g-dim text-[10px] font-bold tracking-wider uppercase">{isOpen ? t.current : t.done}</p>
          </div>
          <h1 className="plate text-g-steel text-lg font-black">{job.plate_number}</h1>
        </div>
        <button onClick={deleteJob} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-g-dim hover:text-g-red transition-colors"><Trash2 size={14} /></button>
      </div>

      {/* Client card */}
      <div className="card animate-fade-up delay-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-g-red/8 flex items-center justify-center"><Car size={18} className="text-g-red" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-g-steel font-bold text-base">{job.garage_clients?.name}</p>
            <p className="text-g-dim/40 text-xs">{job.car_model || '—'} · {format(new Date(job.date_in), 'dd/MM/yyyy')}{job.date_out ? ' → ' + format(new Date(job.date_out), 'dd/MM') : ''}</p>
          </div>
          {job.garage_clients?.phone && (
            <a href={`https://wa.me/${job.garage_clients.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-g-green/8 flex items-center justify-center text-g-green active:scale-90 transition-all"><Phone size={16} /></a>
          )}
        </div>
      </div>

      {/* Money breakdown */}
      {editing ? (
        <div className="card space-y-4 animate-scale-in">
          <div><label className="label-g">{t.whatWork}</label><textarea value={desc} onChange={e => setDesc(e.target.value)} className="input-g h-20 resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label-g text-g-red/60">{t.partsCost}</label><input value={partsCost} onChange={e => setPartsCost(e.target.value)} className="input-g text-center money text-xl" type="number" inputMode="decimal" /></div>
            <div><label className="label-g text-g-green/60">{t.chargedPrice}</label><input value={charged} onChange={e => setCharged(e.target.value)} className="input-g text-center money text-xl" type="number" inputMode="decimal" /></div>
          </div>
          <div className="card p-3 text-center" style={editProfit >= 0 ? { borderColor: 'rgba(74,222,128,0.15)', background: 'rgba(74,222,128,0.04)' } : { borderColor: 'rgba(229,57,53,0.15)' }}>
            <p className={`money text-2xl font-black ${editProfit >= 0 ? 'text-g-green' : 'text-g-red'}`}>{editProfit >= 0 ? '+' : ''}{$(editProfit)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} disabled={saving} className="btn-red flex-1">{saving ? '...' : t.save}</button>
            <button onClick={() => setEditing(false)} className="flex-1 py-3 text-g-dim font-bold text-sm rounded-xl bg-white/[0.03] border border-white/[0.06]">{t.cancel}</button>
          </div>
        </div>
      ) : (
        <div className="card animate-fade-up delay-2">
          <div className="flex items-center justify-between mb-3">
            <p className="label-g mb-0">{t.workDetails}</p>
            <button onClick={() => setEditing(true)} className="text-g-dim/40 hover:text-g-red transition-colors"><Edit3 size={13} /></button>
          </div>
          <p className="text-g-steel text-sm mb-4">{job.description || t.noDesc}</p>
          <div className="card p-0 overflow-hidden">
            <div className="flex">
              <div className="flex-1 p-3 text-center border-r border-white/[0.04]">
                <p className="text-g-dim/40 text-[9px] font-bold tracking-wider uppercase">{t.partsCost}</p>
                <p className="money text-g-red text-lg mt-1">{$(job.parts_cost)}</p>
              </div>
              <div className="flex-1 p-3 text-center border-r border-white/[0.04]">
                <p className="text-g-dim/40 text-[9px] font-bold tracking-wider uppercase">{t.chargedPrice}</p>
                <p className="money text-g-steel text-lg mt-1">{$(job.total)}</p>
              </div>
              <div className="flex-1 p-3 text-center" style={{ background: 'rgba(74,222,128,0.04)' }}>
                <p className="text-g-green/50 text-[9px] font-bold tracking-wider uppercase flex items-center justify-center gap-1"><TrendingUp size={9} />{t.profit}</p>
                <p className={`money text-lg mt-1 ${profit >= 0 ? 'text-g-green' : 'text-g-red'}`}>{profit >= 0 ? '+' : ''}{$(profit)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && !editing && (
        <div className="flex gap-2 animate-fade-up delay-3">
          <button onClick={markComplete} className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 text-g-green" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <Check size={16} /> {t.markDone}
          </button>
          {job.garage_clients?.phone && (
            <a href={waMsg()} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 text-g-green" style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)' }}>
              <Phone size={14} /> {t.notifyClient}
            </a>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="animate-fade-up delay-4">
          <p className="section-label">📋 {t.clientHistory} ({history.length})</p>
          <div className="space-y-2">
            {history.map(h => {
              const hp = Number(h.total) - Number(h.parts_cost)
              return (
                <div key={h.id} className="card py-3 flex items-center gap-3 opacity-50 hover:opacity-80 transition-opacity">
                  <div className="flex-1 min-w-0">
                    <p className="plate text-g-steel text-sm font-bold">{h.plate_number} · <span className="text-g-dim/40 font-normal">{h.car_model || '—'}</span></p>
                    <p className="text-g-dim/30 text-[10px]">{h.description || '—'} · {format(new Date(h.date_in), 'dd/MM/yyyy')}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="money text-g-steel text-sm">{$(h.total)}</p>
                    <p className="money text-g-green text-[10px]">+{$(hp)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  )
}
