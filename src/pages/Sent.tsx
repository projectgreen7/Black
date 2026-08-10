import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Sent() {
  const location = useLocation()
  const navigate = useNavigate()
  const amount = location.state?.amount || '0'
  const time = location.state?.time || ''
  const n = parseFloat(amount) || 0
  const d = time ? new Date(time) : null

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ backgroundColor: '#1C1C1E', color: '#FFFFFF', fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}
    >
      <div style={{ width: '100%', maxWidth: '414px', padding: '0 16px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', position: 'relative' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: '17px', fontWeight: 600 }}>Sent</div>
          <button style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '28px', marginBottom: '36px' }}>
          <div style={{ fontSize: '34px', fontWeight: 700 }}>≈ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div style={{ fontSize: '15px', color: '#8E8E93', marginTop: '6px' }}>-{n.toLocaleString('en-US', { maximumFractionDigits: 6 })} USDT</div>
        </div>

        <div style={{ backgroundColor: '#2C2C2E', borderRadius: '12px', padding: '4px 16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #3A3A3C' }}>
            <span style={{ color: '#8E8E93', fontSize: '15px' }}>Date</span>
            <span style={{ fontSize: '15px' }}>{d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '--'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #3A3A3C' }}>
            <span style={{ color: '#8E8E93', fontSize: '15px' }}>Status</span>
            <span style={{ fontSize: '15px', color: '#EF4444', fontWeight: 600 }}>Completed</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
            <span style={{ color: '#8E8E93', fontSize: '15px' }}>Recipient</span>
            <span style={{ fontSize: '15px' }}>TR7NH...Lj6t</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#2C2C2E', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#8E8E93', fontSize: '15px' }}>Nonce</span>
          <span style={{ fontSize: '15px' }}>{d ? d.getSeconds() : '--'}</span>
        </div>

        <div style={{ marginTop: 'auto', padding: '32px 0 48px' }}>
          <a href="#" style={{ display: 'block', width: '100%', padding: '16px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#EF4444', fontSize: '16px', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
            View on block explorer
          </a>
        </div>
      </div>
    </motion.div>
  )
              }
