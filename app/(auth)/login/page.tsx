'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/firebase/auth'
import { Logo } from '@/components/ui/Logo'
import { LogIn, Eye, EyeOff } from 'lucide-react'

function mapAuthError(code: string): string {
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Email ou mot de passe incorrect.'
  }
  if (code === 'auth/invalid-email') return 'Email invalide.'
  if (code === 'auth/network-request-failed') {
    return 'Connexion impossible. Vérifiez votre réseau.'
  }
  if (code === 'auth/too-many-requests') {
    return 'Trop de tentatives. Réessayez dans quelques minutes.'
  }
  return 'Échec de connexion. Réessayez.'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      router.replace('/')
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''
      setError(mapAuthError(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-sm">
        <Logo subtitle="Connexion à votre compte" />
        <h1 className="sr-only">Finperso — Connexion</h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div
              role="alert"
              className="bg-[#FAECE7] text-[#993C1D] text-sm px-4 py-3 rounded-xl"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 pr-12 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-1 my-auto w-11 h-11 flex items-center justify-center text-gray-500 active:bg-gray-100 rounded-lg transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full h-12 bg-[#1D9E75] text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 active:bg-[#0F6E56] active:scale-[0.99] disabled:opacity-50 transition-all"
          >
            <LogIn size={18} />
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-[#1D9E75] font-medium">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
