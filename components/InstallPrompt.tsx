'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // Already installed (display-mode standalone or iOS) → hide button.
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true
    if (standalone) {
      setInstalled(true)
      return
    }

    if (sessionStorage.getItem('installPromptDismissed') === '1') {
      setHidden(true)
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || hidden || !deferred) return null

  const handleInstall = async () => {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === 'dismissed') {
      sessionStorage.setItem('installPromptDismissed', '1')
      setHidden(true)
    }
    setDeferred(null)
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="w-full flex items-center gap-3 px-4 min-h-[56px] py-3 bg-[#E1F5EE] border border-[#1D9E75]/30 rounded-xl active:bg-[#cdebde] transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-[#1D9E75] flex items-center justify-center text-white shrink-0">
        <Download size={18} />
      </div>
      <div className="text-left min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#085041]">Installer Finperso</p>
        <p className="text-xs text-[#0F6E56] mt-0.5">Ajouter à l’écran d’accueil</p>
      </div>
    </button>
  )
}
