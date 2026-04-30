'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/firebase/auth'
import { seedUserData } from '@/lib/services/seedService'
import { Logo } from '@/components/ui/Logo'
import { UserPlus, Eye, EyeOff } from 'lucide-react'

function mapAuthError(code: string): string {
  if (code === 'auth/email-already-in-use') {
    return 'Un compte existe déjà avec cet email.'
  }
  if (code === 'auth/invalid-email') return 'Email invalide.'
  if (code === 'auth/weak-password') {
    return 'Mot de passe trop faible. Choisissez-en un plus complexe.'
  }
  if (code === 'auth/network-request-failed') {
    return 'Connexion impossible. Vérifiez votre réseau.'
  }
  return 'Erreur lors de la création du compte. Réessayez.'
}

function passwordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (pw.length < 6) return { level: 0, label: 'Trop court' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { level: 1, label: 'Faible' }
  if (score === 2) return { level: 2, label: 'Moyen' }
  return { level: 3, label: 'Fort' }
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = passwordStrength(password)
  const strengthColors = ['#E5E7EB', '#D85A30', '#BA7517', '#1D9E75']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)
    try {
      const credential = await signUp(email, password)
      await seedUserData(credential.user.uid, name, email)
      router.replace('/')
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''
      setError(mapAuthError(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-gray-50">
      <div className="w-full max-w-sm">
        <Logo subtitle="Créez votre compte pour gérer vos finances" />
        <h1 className="sr-only">Finperso — Créer un compte</h1>

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
            <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom complet
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
              placeholder="Mamadou Diallo"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="reg-email"
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
              htmlFor="reg-password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                aria-describedby="pw-strength"
                className="w-full h-12 px-4 pr-12 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                placeholder="6 caractères minimum"
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
            {password.length > 0 && (
              <div id="pw-strength" className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors duration-200"
                      style={{
                        backgroundColor:
                          strength.level >= i ? strengthColors[strength.level] : '#E5E7EB',
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 tabular-nums shrink-0">
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full h-12 bg-[#1D9E75] text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 active:bg-[#0F6E56] active:scale-[0.99] disabled:opacity-50 transition-all"
          >
            <UserPlus size={18} />
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#1D9E75] font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
