import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/i18n'
import { ArrowRight, UserPlus, TrendingUp, TrendingDown } from 'lucide-react'

const $ = (n: any) => '$' + Math.round(Number(n) || 0).toLocaleString('en-US')

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
    <div className="p-4 space-y-5 animate-fade-up pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => nav('/')} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"><ArrowRight size={16} className="text-g-red" /></button>
        <h1 className="text-g-steel text-lg font-black">🚗 {t.newCar}</h1>
      </div>

      <div className="animate-fade-up delay-1">
        <label className="label-g">{t.customer}</label>
        <div className="flex gap-2 flex-wrap">
          {clients.map(c => (
            <button key={c.id} onClick={() => setClientId(c.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${clientId === c.id ? 'text-white' : 'bg-white/[0.03] border border-white/[0.06] text-g-dim hover:text-g-steel'}`}
              style={clientId === c.id ? { background: 'linear-gradient(135deg, #C62828, #E53935)', boxShadow: '0 4px 12px rgba(229,57,53,0.25)' } : {}}>
              {c.name}
            </button>
          ))}
          <button onClick={() => setShowNew(true)} className="px-4 py-2.5 rounded-xl text-sm font-bold border border-dashed border-white/10 text-g-dim flex items-center gap-1.5 hover:border-g-red/40 hover:text-g-red transition-all">
            <UserPlus size={13} /> {t.newCustomer}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-2">
        <div><label className="label-g">{t.plate}</label><input value={plate} onChange={e => setPlate(e.target.value)} className="input-g text-center plate text-lg" placeholder="B 123456" dir="ltr" /></div>
        <div><label className="label-g">{t.carModel}</label><input value={carModel} onChange={e => setCarModel(e.target.value)} className="input-g text-sm" placeholder="BMW 320i" dir="ltr" /></div>
      </div>

      <div className="animate-fade-up delay-3">
        <label className="label-g">{t.whatWork}</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} className="input-g h-20 resize-none" placeholder={t.whatWorkHint} />
      </div>

      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-4">
        <div>
          <label className="label-g text-g-red/60">{t.partsCost} ($)</label>
          <input value={partsCost} onChange={e => setPartsCost(e.target.value)} className="input-g text-center money text-2xl" type="number" inputMode="decimal" placeholder="0" />
        </div>
        <div>
          <label className="label-g text-g-green/60">{t.chargedPrice} ($)</label>
          <input value={charged} onChange={e => setCharged(e.target.value)} className="input-g text-center money text-2xl" type="number" inputMode="decimal" placeholder="0" />
        </div>
      </div>

      {price > 0 && (
        <div className="card animate-scale-in" style={profit >= 0 ? { background: 'linear-gradient(165deg, rgba(74,222,128,0.06), rgba(0,0,0,0))' , borderColor: 'rgba(74,222,128,0.15)' } : { borderColor: 'rgba(229,57,53,0.15)' }}>
          <div className="flex items-center justify-center gap-2">
            {profit >= 0 ? <TrendingUp size={18} className="text-g-green" /> : <TrendingDown size={18} className="text-g-red" />}
            <span className={`money text-3xl font-black ${profit >= 0 ? 'text-g-green' : 'text-g-red'}`}>{profit >= 0 ? '+' : ''}{$(profit)}</span>
          </div>
          <p className="text-center text-g-dim/40 text-[10px] mt-1">{t.profit}</p>
        </div>
      )}

      {error && <p className="text-g-red text-sm font-bold animate-fade-in">{error}</p>}
      <button onClick={submit} disabled={saving} className="btn-red text-base animate-fade-up delay-5">{saving ? '...' : t.registerCar}</button>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setShowNew(false)}>
          <div className="card w-full max-w-sm space-y-4 animate-scale-in rounded-b-none sm:rounded-b-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-g-steel font-black text-lg">👤 {t.newCustomer}</h2>
            <div><label className="label-g">{t.name}</label><input value={newName} onChange={e => setNewName(e.target.value)} className="input-g text-lg" autoFocus /></div>
            <div><label className="label-g">{t.phone}</label><input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="input-g" type="tel" inputMode="tel" dir="ltr" /></div>
            <button onClick={addClient} disabled={savingC || !newName.trim()} className="btn-red">{savingC ? '...' : t.add}</button>
            <button onClick={() => setShowNew(false)} className="w-full py-2 text-g-dim text-sm font-bold">{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  )
}
