import { createContext, useContext, useState, ReactNode } from 'react'

const ar: Record<string, string> = {
  appName: 'GarageApp',
  currentJobs: '🔴 شغل حالي',
  completed: '✅ مكتمل',
  newCar: 'سيارة جديدة',
  newCarSub: 'سجّل سيارة دخلت الكراج',
  noCars: 'لا توجد سيارات بعد',
  addFirst: '+ سجّل أول سيارة',
  current: 'شغل حالي',
  done: 'مكتمل',
  totalEarned: 'إجمالي الأرباح',
  customer: 'الزبون',
  newCustomer: 'زبون جديد',
  plate: 'رقم اللوحة',
  carModel: 'نوع السيارة',
  whatWork: 'شو الشغل؟',
  whatWorkHint: 'تغيير زيت + فلتر + فحص فرامل...',
  price: 'السعر ($)',
  total: 'الإجمالي',
  registerCar: '+ سجّل السيارة',
  name: 'الاسم',
  phone: 'رقم الهاتف',
  add: '+ إضافة',
  cancel: 'إلغاء',
  workDetails: 'تفاصيل الشغل',
  noDesc: 'بدون وصف',
  markDone: 'تم الشغل ✓',
  notifyClient: 'بلّغ الزبون',
  clientHistory: 'سجل الزبون',
  save: 'حفظ',
  enteredOn: 'دخلت',
  exitedOn: 'خرجت',
  confirmDone: 'تأكيد إتمام الشغل؟',
  confirmDelete: 'حذف هذه السيارة نهائياً؟',
  notFound: 'غير موجود',
  pickCustomer: 'اختر الزبون',
  enterPlate: 'أدخل رقم اللوحة',
  lang: 'EN',
}

const en: Record<string, string> = {
  appName: 'GarageApp',
  currentJobs: '🔴 Active Jobs',
  completed: '✅ Completed',
  newCar: 'New Car',
  newCarSub: 'Register a car entering the garage',
  noCars: 'No cars yet',
  addFirst: '+ Add first car',
  current: 'Active',
  done: 'Completed',
  totalEarned: 'Total Earned',
  customer: 'Customer',
  newCustomer: 'New Customer',
  plate: 'Plate Number',
  carModel: 'Car Model',
  whatWork: 'Work Description',
  whatWorkHint: 'Oil change + filter + brake check...',
  price: 'Price ($)',
  total: 'Total',
  registerCar: '+ Register Car',
  name: 'Name',
  phone: 'Phone Number',
  add: '+ Add',
  cancel: 'Cancel',
  workDetails: 'Work Details',
  noDesc: 'No description',
  markDone: 'Mark Done ✓',
  notifyClient: 'Notify Client',
  clientHistory: 'Client History',
  save: 'Save',
  enteredOn: 'In',
  exitedOn: 'Out',
  confirmDone: 'Confirm job is complete?',
  confirmDelete: 'Delete this job permanently?',
  notFound: 'Not found',
  pickCustomer: 'Pick a customer',
  enterPlate: 'Enter plate number',
  lang: 'ع',
}

type Lang = 'ar' | 'en'
const LangCtx = createContext<{ t: Record<string, string>; lang: Lang; toggle: () => void }>({ t: ar, lang: 'ar', toggle: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar')
  const toggle = () => setLang(l => l === 'ar' ? 'en' : 'ar')
  const t = lang === 'ar' ? ar : en
  return <LangCtx.Provider value={{ t, lang, toggle }}><div dir={lang === 'ar' ? 'rtl' : 'ltr'}>{children}</div></LangCtx.Provider>
}

export function useLang() { return useContext(LangCtx) }
