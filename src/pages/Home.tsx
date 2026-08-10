import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, NotebookText, ScanLine } from 'lucide-react'
import Loader from '../components/Loader'

export default function Home() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [activeField, setActiveField] = useState<'address' | 'amount'>('amount')
  const [showLoader, setShowLoader] = useState(false)
  const [currency, setCurrency] = useState<'BNB' | 'USD'>('BNB')

  const fullAddress = '0x32D35Edd6B3A9De3D63b7592446B199ac5877d1D'
  const isAmountValid = amount && parseFloat(amount) > 0

  const BNB_PRICE = 568.05

  const conversionText = () => {
    const val = parseFloat(amount)
    if (!amount || isNaN(val)) return '≈ $0.00'
    if (currency === 'BNB') {
      return '≈ $' + (val * BNB_PRICE).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    } else {
      return '≈ ' + (val / BNB_PRICE).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }) + ' BNB'
    }
  }

  const handleNext = () => {
    if (!isAmountValid) return
    setShowLoader(true)
    setTimeout(() => {
      setShowLoader(false)
      navigate('/confirm', { state: { amount, currency } })
    }, 1500)
  }

  return (
    <>
      <Loader isOpen={showLoader} title="Confirming" />
      
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-neutral-900 flex justify-center items-start"
      >
        <div className="w-full max-w-[100vw] min-h-screen bg-app-bg relative shadow-mobile">
          <div className="h-3 w-full" />
          <header className="flex items-center justify-center px-4 h-10">
            <h1 className="text-lg font-bold text-white">Send BNB</h1>
          </header>
          
          <div className="px-4 pt-4">
            <div className="mb-5">
              <label className="block text-sm font-medium text-app-gray mb-2">Address or Domain Name</label>
              <div onClick={() => setActiveField('address')} className={`h-14 rounded-xl flex items-center px-4 gap-2 transition-all duration-150 cursor-pointer ${activeField === 'address' ? 'bg-transparent border-2 border-[#03FC8F]' : 'bg-app-input border border-app-border'}`}>
                <span className="flex-1 text-base text-white font-bold select-none whitespace-nowrap overflow-hidden text-left pr-2" style={{ direction: 'rtl' }}>{fullAddress}</span>
                <button onClick={(e) => e.stopPropagation()} className="w-6 h-6 rounded-full bg-app-icon-gray flex items-center justify-center flex-shrink-0"><X className="w-3.5 h-3.5 text-black" strokeWidth={2.5} /></button>
                <button onClick={(e) => e.stopPropagation()} className="text-[15px] font-semibold text-[#03FC8F] flex-shrink-0">Paste</button>
                <button onClick={(e) => e.stopPropagation()} className="flex-shrink-0 ml-1"><NotebookText className="w-[22px] h-[22px] text-[#03FC8F]" strokeWidth={2.5} /></button>
                <button onClick={(e) => e.stopPropagation()} className="flex-shrink-0 ml-1"><ScanLine className="w-[22px] h-[22px] text-[#03FC8F]" strokeWidth={2.5} /></button>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-app-gray mb-2">Destination network</label>
              <button className="h-11 bg-app-input rounded-xl flex items-center px-3.5 gap-2.5 cursor-pointer border border-app-border">
                <img src="/bnb-logo.png" alt="BNB" className="w-7 h-7 flex-shrink-0 object-contain" />
                <span className="text-[15px] font-semibold text-app-gray">BNB Smart Chain</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-1 flex-shrink-0"><path d="M0 0L5 6L10 0H0Z" fill="#8E8E93"/></svg>
              </button>
            </div>

            <div className="mb-32">
              <label className="block text-sm font-medium text-app-gray mb-2">Amount</label>
              <div onClick={() => setActiveField('amount')} className={`h-14 rounded-xl flex items-center px-4 transition-all duration-150 cursor-pointer ${activeField === 'amount' ? 'bg-transparent border-2 border-[#03FC8F]' : 'bg-transparent border border-app-border'}`}>
                <input type="text" inputMode="decimal" placeholder={currency === 'BNB' ? 'BNB Amount' : 'USD Amount'} value={amount} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d*\.?\d*$/.test(val)) setAmount(val) }} onFocus={() => setActiveField('amount')} className="flex-1 bg-transparent text-base text-white placeholder:text-app-gray outline-none" />
                <span onClick={(e) => { e.stopPropagation(); setCurrency(prev => prev === 'BNB' ? 'USD' : 'BNB') }} className="text-sm font-medium text-app-gray flex-shrink-0 cursor-pointer">{currency}</span>
                <button onClick={(e) => { e.stopPropagation(); setAmount('1000') }} className="text-sm font-semibold text-[#03FC8F] ml-3 flex-shrink-0">Max</button>
              </div>
              <p className="text-sm text-app-gray mt-2">{conversionText()}</p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4">
            <button disabled={!isAmountValid} onClick={handleNext} className={`w-full h-[52px] rounded-[26px] text-[16px] font-semibold transition-all ${isAmountValid ? 'bg-[#03FC8F] text-[#1C1C1E] cursor-pointer' : 'bg-[#03FC8F]/30 text-[#1C1C1E]/40 cursor-not-allowed'}`}>
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
    }
