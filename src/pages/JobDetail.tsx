import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/i18n'
import { ArrowRight, Check, Trash2, Phone, Car, Edit3 } from 'lucide-react'
import { format } from 'date-fns'

function money(n: any) { return '$' + Math.round(Number(n) || 0).toLocaleString('en-US') }

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

  const markComplete = async () => {
    if (!confirm(t.confirmDone)) return
    await supabase.from('garage_jobs').update({ status: 'completed', date_out: format(new Date(), 'yyyy-MM-dd') }).eq('id', id)
    load()
  }

  const saveEdit = async () => {
    setSaving(true)
    await supabase.from('garage_jobs').update({ parts_cost: parseFloat(partsCost) || 0, total: parseFloat(charged) || 0, description: desc.trim() || null }).eq('id', id)
    setSaving(false); setEditing(false); load()
  }

  const deleteJob = async () => {
    if (!confirm(t.confirmDelete)) return
    await supabase.from('garage_jobs').delete().eq('id', id)
    nav('/')
  }

  const waMsg = () => {
    const msg = `Hi ${job.garage_clients?.name || ''}, your car ${job.car_model || ''} (${job.plate_number}) is ready.\n\nWork: ${job.description || '—'}\nTotal: $${job.total}\n\n_GarageApp 🔧_`
    return `https://wa.me/${(job.garage_clients?.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
  }

  const editProfit = (parseFloat(charged) || 0) - (parseFloat(partsCost) || 0)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 animate-fade-up">
        <button onClick={() => nav('/')} className="w-9 h-9 rounded-xl bg-g-elevated flex items-center justify-center"><ArrowRight size={18} className="text-g-red" /></button>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold ${isOpen ? 'text-g-red' : 'text-green-400'}`}>{isOpen ? t.currentJobs : t.completed}</p>
          <h1 className="text-g-steel text-lg font-black truncate">{job.plate_number}</h1>
        </div>
        <button onClick={deleteJob} className="w-9 h-9 rounded-xl bg-g-elevated flex items-center justify-center text-g-dim hover:text-g-red transition-colors"><Trash2 size={16} /></button>
      </div>

      {/* Car & Client */}
      <div className="card animate-fade-up delay-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-g-red/15 flex items-center justify-center"><Car size={20} className="text-g-red" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-g-steel font-bold">{job.garage_clients?.name}</p>
            <p className="text-g-dim text-xs">{job.car_model || '—'} · {job.plate_number}</p>
          </div>
          {job.garage_clients?.phone && (
            <a href={`https://wa.me/${job.garage_clients.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 active:scale-90 transition-all"><Phone size={18} /></a>
          )}
        </div>
        <p className="text-g-dim text-xs">{t.enteredOn}: {format(new Date(job.date_in), 'dd/MM/yyyy')}{job.date_out ? ` · ${t.exitedOn}: ` + format(new Date(job.date_out), 'dd/MM/yyyy') : ''}</p>
      </div>

      {/* Work + Money */}
      {editing ? (
        <div className="card space-y-3 animate-scale-in">
          <div><label className="label-g">{t.whatWork}</label><textarea value={desc} onChange={e => setDesc(e.target.value)} className="input-g h-20 resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label-g">🔴 {t.partsCost} ($)</label><input value={partsCost} onChange={e => setPartsCost(e.target.value)} className="input-g text-center text-xl font-black" type="number" inputMode="decimal" /></div>
            <div><label className="label-g">🟢 {t.chargedPrice} ($)</label><input value={charged} onChange={e => setCharged(e.target.value)} className="input-g text-center text-xl font-black" type="number" inputMode="decimal" /></div>
          </div>
          <div className={`rounded-xl p-3 text-center ${editProfit >= 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <p className="text-g-dim text-[10px]">{t.profit}</p>
            <p className={`text-2xl font-black ${editProfit >= 0 ? 'text-green-400' : 'text-g-red'}`}>{editProfit >= 0 ? '+' : ''}{money(editProfit)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} disabled={saving} className="btn-red flex-1">{saving ? '...' : t.save}</button>
            <button onClick={() => setEditing(false)} className="flex-1 py-3 text-g-dim font-bold text-sm rounded-xl bg-g-elevated">{t.cancel}</button>
          </div>
        </div>
      ) : (
        <div className="card animate-fade-up delay-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-g-dim text-xs font-bold">{t.workDetails}</p>
            <button onClick={() => setEditing(true)} className="text-g-dim hover:text-g-red transition-colors"><Edit3 size={14} /></button>
          </div>
          <p className="text-g-steel text-sm mb-4">{job.description || t.noDesc}</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <p className="text-g-dim text-[10px]">{t.partsCost}</p>
              <p className="text-g-red font-black text-lg">{money(job.parts_cost)}</p>
            </div>
            <div className="flex-1 bg-g-elevated rounded-xl p-3 text-center">
              <p className="text-g-dim text-[10px]">{t.chargedPrice}</p>
              <p className="text-g-steel font-black text-lg">{money(job.total)}</p>
            </div>
            <div className={`flex-1 rounded-xl p-3 text-center ${profit >= 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <p className="text-g-dim text-[10px]">{t.profit}</p>
              <p className={`font-black text-lg ${profit >= 0 ? 'text-green-400' : 'text-g-red'}`}>{profit >= 0 ? '+' : ''}{money(profit)}</p>
            </div>
          </div>
        </div>
      )}

      {isOpen && !editing && (
        <div className="flex gap-2 animate-fade-up delay-3">
          <button onClick={markComplete} className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-green-500/15 border border-green-500/30 text-green-400 active:scale-95 transition-all"><Check size={18} /> {t.markDone}</button>
          {job.garage_clients?.phone && (
            <a href={waMsg()} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 active:scale-95 transition-all"><Phone size={16} /> {t.notifyClient}</a>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="animate-fade-up delay-4">
          <p className="text-g-dim text-[11px] font-bold tracking-widest mb-3">📋 {t.clientHistory} ({history.length})</p>
          <div className="space-y-2">
            {history.map(h => {
              const hp = Number(h.total) - Number(h.parts_cost)
              return (
                <div key={h.id} className="card py-3 flex items-center gap-3 opacity-60">
                  <div className="flex-1 min-w-0">
                    <p className="text-g-steel text-sm font-bold truncate">{h.plate_number} · {h.car_model || '—'}</p>
                    <p className="text-g-dim text-[10px] truncate">{h.description || '—'} · {format(new Date(h.date_in), 'dd/MM/yyyy')}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-g-steel font-black text-sm">{money(h.total)}</p>
                    <p className="text-green-400 text-[10px] font-bold">+{money(hp)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="h-6" />
    </div>
  )
}
