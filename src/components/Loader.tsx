import { motion, AnimatePresence } from 'framer-motion'

interface LoaderProps {
  isOpen: boolean
  title?: string
}

export default function Loader({ isOpen, title = 'Loading' }: LoaderProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#1a1a1a',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 20px',
            height: '56px'
          }}>
            <span style={{ color: '#e0e0e0', fontSize: '18px', fontWeight: 500 }}>{title}</span>
          </div>

          <div style={{
            width: '44px',
            height: '44px',
            background: 'rgba(255, 255, 255, 0.035)',
            borderRadius: '10px',
            transform: 'rotate(45deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              transform: 'rotate(-45deg)',
              display: 'flex',
              gap: '3px',
              alignItems: 'flex-end',
              height: '10px'
            }}>
              <div style={{ width: '3.5px', height: '3.5px', background: '#03FC8F', animation: 'hard-floor 1.1s ease-in-out infinite' }} />
              <div style={{ width: '3.5px', height: '3.5px', background: '#03FC8F', animation: 'hard-floor 1.1s ease-in-out infinite 0.14s' }} />
              <div style={{ width: '3.5px', height: '3.5px', background: '#03FC8F', animation: 'hard-floor 1.1s ease-in-out infinite 0.28s' }} />
              <div style={{ width: '3.5px', height: '3.5px', background: '#03FC8F', animation: 'hard-floor 1.1s ease-in-out infinite 0.42s' }} />
            </div>
          </div>

          <style>{`
            @keyframes hard-floor {
              0% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
              100% { transform: translateY(0); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
              }
          
