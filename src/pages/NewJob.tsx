import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/i18n'
import { ArrowRight, UserPlus } from 'lucide-react'

function money(n: any) { return '$' + Math.round(Number(n) || 0).toLocaleString('en-US') }

export default function NewJob() {
  const { t } = useLang()
  const nav = useNavigate()
  const [clients, setClients] = useState<any[]>([])
  const [clientId, setClientId] = useState('')
  const [plate, setPlate] = useState('')
  const [carModel, setCarModel] = useState('')
  const [desc, setDesc] = useState('')
  const [partsCost, setPartsCost] = useState('')
  const [charged, setCharged] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [savingC, setSavingC] = useState(false)

  useEffect(() => { supabase.from('garage_clients').select('*').order('name').then(({ data }) => setClients(data ?? [])) }, [])

  const addClient = async () => {
    if (!newName.trim()) return
    setSavingC(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    const { data } = await supabase.from('garage_clients').insert({ name: newName.trim(), phone: newPhone.trim() || null, owner_id: uid }).select('id').single()
    if (data) { setClientId(data.id); setClients(p => [...p, { id: data.id, name: newName.trim() }]) }
    setSavingC(false); setShowNew(false); setNewName(''); setNewPhone('')
  }

  const submit = async () => {
    if (!clientId) { setError(t.pickCustomer); return }
    if (!plate.trim()) { setError(t.enterPlate); return }
    setError(''); setSaving(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    await supabase.from('garage_jobs').insert({ owner_id: uid, client_id: clientId, plate_number: plate.trim(), car_model: carModel.trim() || null, description: desc.trim() || null, parts_cost: parseFloat(partsCost) || 0, total: parseFloat(charged) || 0 })
    setSaving(false); nav('/')
  }

  const cost = parseFloat(partsCost) || 0
  const price = parseFloat(charged) || 0
  const profit = price - cost

  return (
    <div className="p-4 space-y-4 animate-fade-up">
      <div className="flex items-center gap-3">
        <button onClick={() => nav('/')} className="w-9 h-9 rounded-xl bg-g-elevated flex items-center justify-center"><ArrowRight size={18} className="text-g-red" /></button>
        <h1 className="text-g-steel text-xl font-black">🚗 {t.newCar}</h1>
      </div>

      <div className="animate-fade-up delay-1">
        <label className="label-g">{t.customer} *</label>
        <div className="flex gap-2 flex-wrap">
          {clients.map(c => (
            <button key={c.id} onClick={() => setClientId(c.id)} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${clientId === c.id ? 'bg-g-red border-g-red text-white' : 'bg-g-card border-g-border text-g-dim'}`}>{c.name}</button>
          ))}
          <button onClick={() => setShowNew(true)} className="px-4 py-2.5 rounded-xl text-sm font-bold border border-dashed border-g-border text-g-dim flex items-center gap-1 hover:border-g-red hover:text-g-red transition-all"><UserPlus size={14} /> {t.newCustomer}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-2">
        <div><label className="label-g">{t.plate} *</label><input value={plate} onChange={e => setPlate(e.target.value)} className="input-g text-center font-bold text-lg" placeholder="B 123456" dir="ltr" /></div>
        <div><label className="label-g">{t.carModel}</label><input value={carModel} onChange={e => setCarModel(e.target.value)} className="input-g" placeholder="BMW 320i" dir="ltr" /></div>
      </div>

      <div className="animate-fade-up delay-3">
        <label className="label-g">{t.whatWork}</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} className="input-g h-20 resize-none" placeholder={t.whatWorkHint} />
      </div>

      {/* Two price fields side by side */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-4">
        <div>
          <label className="label-g">🔴 {t.partsCost} ($)</label>
          <input value={partsCost} onChange={e => setPartsCost(e.target.value)} className="input-g text-center text-2xl font-black" type="number" inputMode="decimal" placeholder="0" />
        </div>
        <div>
          <label className="label-g">🟢 {t.chargedPrice} ($)</label>
          <input value={charged} onChange={e => setCharged(e.target.value)} className="input-g text-center text-2xl font-black" type="number" inputMode="decimal" placeholder="0" />
        </div>
      </div>

      {/* Profit preview */}
      {price > 0 && (
        <div className={`rounded-xl p-4 text-center animate-scale-in ${profit >= 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          <p className="text-g-dim text-xs">{t.profit}</p>
          <p className={`text-3xl font-black ${profit >= 0 ? 'text-green-400' : 'text-g-red'}`}>{profit >= 0 ? '+' : ''}{money(profit)}</p>
        </div>
      )}

      {error && <p className="text-g-red text-sm font-bold animate-fade-in">{error}</p>}
      <button onClick={submit} disabled={saving} className="btn-red text-base animate-fade-up delay-5">{saving ? '...' : t.registerCar}</button>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setShowNew(false)}>
          <div className="card w-full max-w-sm space-y-4 animate-scale-in rounded-b-none sm:rounded-b-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-g-steel font-black text-lg">👤 {t.newCustomer}</h2>
            <div><label className="label-g">{t.name} *</label><input value={newName} onChange={e => setNewName(e.target.value)} className="input-g text-lg" autoFocus /></div>
            <div><label className="label-g">{t.phone}</label><input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="input-g" type="tel" inputMode="tel" dir="ltr" /></div>
            <button onClick={addClient} disabled={savingC || !newName.trim()} className="btn-red">{savingC ? '...' : t.add}</button>
            <button onClick={() => setShowNew(false)} className="w-full py-2 text-g-dim text-sm font-bold">{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  )
}
