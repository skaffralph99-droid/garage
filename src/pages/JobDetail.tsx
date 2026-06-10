import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, Check, Trash2, Phone, Car, Edit3 } from 'lucide-react'
import { format } from 'date-fns'

function money(n: any) { return '$' + Math.round(Number(n) || 0).toLocaleString('en-US') }

export default function JobDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [parts, setParts] = useState('')
  const [labor, setLabor] = useState('')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    if (!id) return
    supabase.from('garage_jobs').select('*, garage_clients(name, phone)').eq('id', id).single().then(({ data }) => {
      if (data) {
        setJob(data); setParts(String(data.parts_cost)); setLabor(String(data.labor_cost)); setDesc(data.description || '')
        // Get client history
        supabase.from('garage_jobs').select('*').eq('client_id', data.client_id).neq('id', id).order('date_in', { ascending: false }).then(({ data: h }) => setHistory(h ?? []))
      }
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [id])

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-g-dim">🔧</div>
  if (!job) return <div className="p-4 text-center py-20"><p className="text-g-dim">غير موجود</p></div>

  const isOpen = job.status === 'open'

  const markComplete = async () => {
    if (!confirm('تأكيد إتمام الشغل؟')) return
    await supabase.from('garage_jobs').update({ status: 'completed', date_out: format(new Date(), 'yyyy-MM-dd') }).eq('id', id)
    load()
  }

  const saveEdit = async () => {
    setSaving(true)
    await supabase.from('garage_jobs').update({
      parts_cost: parseFloat(parts) || 0, labor_cost: parseFloat(labor) || 0,
      description: desc.trim() || null,
    }).eq('id', id)
    setSaving(false); setEditing(false); load()
  }

  const deleteJob = async () => {
    if (!confirm('حذف هذه السيارة نهائياً؟')) return
    await supabase.from('garage_jobs').delete().eq('id', id)
    nav('/')
  }

  const waMsg = () => {
    const msg = `مرحبا ${job.garage_clients?.name || ''}، سيارتك ${job.car_model || ''} (${job.plate_number}) جاهزة.\n\nالشغل: ${job.description || '—'}\nالإجمالي: $${job.total}\n\n_GarageApp 🔧_`
    return `https://wa.me/${(job.garage_clients?.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 animate-fade-up">
        <button onClick={() => nav('/')} className="w-9 h-9 rounded-xl bg-g-elevated flex items-center justify-center"><ArrowRight size={18} className="text-g-red" /></button>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold ${isOpen ? 'text-g-red' : 'text-green-400'}`}>{isOpen ? '🔴 شغل حالي' : '✅ مكتمل'}</p>
          <h1 className="text-g-steel text-lg font-black truncate">{job.plate_number}</h1>
        </div>
        <button onClick={deleteJob} className="w-9 h-9 rounded-xl bg-g-elevated flex items-center justify-center text-g-dim hover:text-g-red transition-colors"><Trash2 size={16} /></button>
      </div>

      {/* Car & Client info */}
      <div className="card animate-fade-up delay-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-g-red/15 flex items-center justify-center"><Car size={20} className="text-g-red" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-g-steel font-bold">{job.garage_clients?.name}</p>
            <p className="text-g-dim text-xs">{job.car_model || '—'} · {job.plate_number}</p>
          </div>
          {job.garage_clients?.phone && (
            <a href={`https://wa.me/${job.garage_clients.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 active:scale-90 transition-all">
              <Phone size={18} />
            </a>
          )}
        </div>
        <p className="text-g-dim text-xs">دخلت: {format(new Date(job.date_in), 'dd/MM/yyyy')}{job.date_out ? ' · خرجت: ' + format(new Date(job.date_out), 'dd/MM/yyyy') : ''}</p>
      </div>

      {/* Work & Costs */}
      {editing ? (
        <div className="card space-y-3 animate-scale-in">
          <div><label className="label-g">شو الشغل؟</label><textarea value={desc} onChange={e => setDesc(e.target.value)} className="input-g h-20 resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label-g">كلفة القطع ($)</label><input value={parts} onChange={e => setParts(e.target.value)} className="input-g text-center text-lg font-bold" type="number" inputMode="decimal" /></div>
            <div><label className="label-g">أجرة الشغل ($)</label><input value={labor} onChange={e => setLabor(e.target.value)} className="input-g text-center text-lg font-bold" type="number" inputMode="decimal" /></div>
          </div>
          <div className="bg-g-red/10 border border-g-red/20 rounded-xl p-3 text-center">
            <p className="text-g-dim text-[10px]">الإجمالي</p>
            <p className="text-g-red text-2xl font-black">${((parseFloat(parts) || 0) + (parseFloat(labor) || 0)).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} disabled={saving} className="btn-red flex-1">{saving ? 'جاري...' : 'حفظ'}</button>
            <button onClick={() => setEditing(false)} className="flex-1 py-3 text-g-dim font-bold text-sm rounded-xl bg-g-elevated">إلغاء</button>
          </div>
        </div>
      ) : (
        <div className="card animate-fade-up delay-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-g-dim text-xs font-bold">تفاصيل الشغل</p>
            <button onClick={() => setEditing(true)} className="text-g-dim hover:text-g-red transition-colors"><Edit3 size={14} /></button>
          </div>
          <p className="text-g-steel text-sm mb-4">{job.description || 'بدون وصف'}</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-g-elevated rounded-xl p-3 text-center">
              <p className="text-g-dim text-[10px]">القطع</p>
              <p className="text-g-steel font-black text-lg">{money(job.parts_cost)}</p>
            </div>
            <div className="flex-1 bg-g-elevated rounded-xl p-3 text-center">
              <p className="text-g-dim text-[10px]">الأجرة</p>
              <p className="text-g-steel font-black text-lg">{money(job.labor_cost)}</p>
            </div>
            <div className="flex-1 bg-g-red/10 border border-g-red/20 rounded-xl p-3 text-center">
              <p className="text-g-dim text-[10px]">الإجمالي</p>
              <p className="text-g-red font-black text-lg">{money(job.total)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {isOpen && !editing && (
        <div className="flex gap-2 animate-fade-up delay-3">
          <button onClick={markComplete} className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-green-500/15 border border-green-500/30 text-green-400 active:scale-95 transition-all">
            <Check size={18} /> تم الشغل ✓
          </button>
          {job.garage_clients?.phone && (
            <a href={waMsg()} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 active:scale-95 transition-all">
              <Phone size={16} /> بلّغ الزبون
            </a>
          )}
        </div>
      )}

      {/* Client history */}
      {history.length > 0 && (
        <div className="animate-fade-up delay-4">
          <p className="text-g-dim text-[11px] font-bold tracking-widest mb-3">📋 سجل الزبون ({history.length})</p>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="card py-3 flex items-center gap-3 opacity-60">
                <div className="flex-1 min-w-0">
                  <p className="text-g-steel text-sm font-bold truncate">{h.plate_number} · {h.car_model || '—'}</p>
                  <p className="text-g-dim text-[10px] truncate">{h.description || '—'} · {format(new Date(h.date_in), 'dd/MM/yyyy')}</p>
                </div>
                <p className="text-g-steel font-black text-sm shrink-0">{money(h.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-6" />
    </div>
  )
}
