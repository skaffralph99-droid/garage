import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Wrench } from 'lucide-react'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const clean = phone.replace(/\D/g, '')
    if (clean.length < 8) { setError('أدخل رقم هاتف صحيح'); return }
    if (pass.length < 6) { setError('كلمة المرور ٦ أحرف على الأقل'); return }
    setLoading(true); setError('')
    const email = `${clean}@garageapp.lb`
    const { error: e } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (e) {
      if (e.message.includes('Invalid login')) {
        const { error: e2 } = await supabase.auth.signUp({ email, password: pass })
        if (e2) setError(e2.message)
      } else setError('رقم أو كلمة مرور خطأ')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-g-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 animate-fade-up">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-g-red to-red-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-g-red/20">
            <Wrench size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-g-red">GarageApp</h1>
          <p className="text-g-dim text-sm mt-1">إدارة الكراج</p>
        </div>
        <div className="card space-y-4">
          <div><label className="label-g">رقم الهاتف</label><input value={phone} onChange={e => setPhone(e.target.value)} className="input-g text-left" type="tel" inputMode="tel" placeholder="03 123 456" dir="ltr" autoFocus /></div>
          <div><label className="label-g">كلمة المرور</label><input value={pass} onChange={e => setPass(e.target.value)} className="input-g" type="password" placeholder="••••••" dir="ltr" onKeyDown={e => e.key === 'Enter' && submit()} /><p className="text-g-dim text-[10px] mt-1.5">أول مرة؟ سجّل رقمك مع كلمة مرور جديدة</p></div>
          {error && <p className="text-g-red text-sm font-bold animate-fade-in">{error}</p>}
          <button onClick={submit} disabled={loading || !phone || !pass} className="btn-red">{loading ? 'جاري...' : 'دخول 🔧'}</button>
        </div>
      </div>
    </div>
  )
}
