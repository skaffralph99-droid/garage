import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, Check, UserPlus } from 'lucide-react'

export default function NewJob() {
  const nav = useNavigate()
  const [clients, setClients] = useState<any[]>([])
  const [clientId, setClientId] = useState('')
  const [plate, setPlate] = useState('')
  const [carModel, setCarModel] = useState('')
  const [desc, setDesc] = useState('')
  const [parts, setParts] = useState('')
  const [labor, setLabor] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // New client modal
  const [showNewClient, setShowNewClient] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [savingClient, setSavingClient] = useState(false)

  useEffect(() => {
    supabase.from('garage_clients').select('*').order('name').then(({ data }) => setClients(data ?? []))
  }, [])

  const addClient = async () => {
    if (!newName.trim()) return
    setSavingClient(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    const { data } = await supabase.from('garage_clients').insert({ name: newName.trim(), phone: newPhone.trim() || null, owner_id: uid }).select('id').single()
    if (data) {
      setClientId(data.id)
      setClients(prev => [...prev, { id: data.id, name: newName.trim(), phone: newPhone.trim() || null }])
    }
    setSavingClient(false); setShowNewClient(false); setNewName(''); setNewPhone('')
  }

  const submit = async () => {
    if (!clientId) { setError('اختر الزبون'); return }
    if (!plate.trim()) { setError('أدخل رقم اللوحة'); return }
    setError(''); setSaving(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    const { error: e } = await supabase.from('garage_jobs').insert({
      owner_id: uid, client_id: clientId, plate_number: plate.trim(),
      car_model: carModel.trim() || null, description: desc.trim() || null,
      parts_cost: parseFloat(parts) || 0, labor_cost: parseFloat(labor) || 0,
    })
    setSaving(false)
    if (e) { setError(e.message); return }
    nav('/')
  }

  const total = (parseFloat(parts) || 0) + (parseFloat(labor) || 0)
  const selectedClient = clients.find(c => c.id === clientId)

  return (
    <div className="p-4 space-y-4 animate-fade-up">
      <div className="flex items-center gap-3">
        <button onClick={() => nav('/')} className="w-9 h-9 rounded-xl bg-g-elevated flex items-center justify-center"><ArrowRight size={18} className="text-g-red" /></button>
        <h1 className="text-g-steel text-xl font-black">🚗 سيارة جديدة</h1>
      </div>

      {/* Client picker */}
      <div className="animate-fade-up delay-1">
        <label className="label-g">الزبون *</label>
        <div className="flex gap-2 flex-wrap">
          {clients.map(c => (
            <button key={c.id} onClick={() => setClientId(c.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${clientId === c.id ? 'bg-g-red border-g-red text-white' : 'bg-g-card border-g-border text-g-dim'}`}>
              {c.name}
            </button>
          ))}
          <button onClick={() => setShowNewClient(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-bold border border-dashed border-g-border text-g-dim flex items-center gap-1 hover:border-g-red hover:text-g-red transition-all">
            <UserPlus size={14} /> زبون جديد
          </button>
        </div>
      </div>

      {/* Car info */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-2">
        <div><label className="label-g">رقم اللوحة *</label><input value={plate} onChange={e => setPlate(e.target.value)} className="input-g text-center font-bold text-lg" placeholder="B 123456" dir="ltr" /></div>
        <div><label className="label-g">نوع السيارة</label><input value={carModel} onChange={e => setCarModel(e.target.value)} className="input-g" placeholder="BMW 320i" dir="ltr" /></div>
      </div>

      {/* Work description */}
      <div className="animate-fade-up delay-3">
        <label className="label-g">شو الشغل؟</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} className="input-g h-20 resize-none" placeholder="تغيير زيت + فلتر + فحص فرامل..." />
      </div>

      {/* Costs */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-4">
        <div><label className="label-g">كلفة القطع ($)</label><input value={parts} onChange={e => setParts(e.target.value)} className="input-g text-center text-lg font-bold" type="number" inputMode="decimal" placeholder="0" /></div>
        <div><label className="label-g">أجرة الشغل ($)</label><input value={labor} onChange={e => setLabor(e.target.value)} className="input-g text-center text-lg font-bold" type="number" inputMode="decimal" placeholder="0" /></div>
      </div>

      {/* Total preview */}
      {total > 0 && (
        <div className="bg-g-red/10 border border-g-red/20 rounded-xl p-4 text-center animate-scale-in">
          <p className="text-g-dim text-xs">الإجمالي</p>
          <p className="text-g-red text-3xl font-black">${total.toLocaleString()}</p>
          {selectedClient && <p className="text-g-dim text-xs mt-1">{selectedClient.name} · {plate}</p>}
        </div>
      )}

      {error && <p className="text-g-red text-sm font-bold animate-fade-in">{error}</p>}
      <button onClick={submit} disabled={saving} className="btn-red text-base animate-fade-up delay-5">
        {saving ? 'جاري...' : '+ سجّل السيارة'}
      </button>

      {/* New client modal */}
      {showNewClient && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setShowNewClient(false)}>
          <div className="card w-full max-w-sm space-y-4 animate-scale-in rounded-b-none sm:rounded-b-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-g-steel font-black text-lg">👤 زبون جديد</h2>
            <div><label className="label-g">الاسم *</label><input value={newName} onChange={e => setNewName(e.target.value)} className="input-g text-lg" placeholder="أحمد" autoFocus /></div>
            <div><label className="label-g">رقم الهاتف</label><input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="input-g" type="tel" inputMode="tel" placeholder="96171234567" dir="ltr" /></div>
            <button onClick={addClient} disabled={savingClient || !newName.trim()} className="btn-red">{savingClient ? 'جاري...' : '+ إضافة'}</button>
            <button onClick={() => setShowNewClient(false)} className="w-full py-2 text-g-dim text-sm font-bold">إلغاء</button>
          </div>
        </div>
      )}
    </div>
  )
}
