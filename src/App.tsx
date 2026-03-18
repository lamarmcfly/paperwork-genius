import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PermitMap } from '@/components/map/PermitMap'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthProvider } from '@/hooks/useAuth'
import { FiltersProvider } from '@/hooks/useFilters'
import { OnboardingProvider } from '@/hooks/useOnboarding'
import { ToastProvider } from '@/components/ui/toast'
import { WelcomeModal, TourStep, HelpButton } from '@/components/onboarding'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <OnboardingProvider>
                  <FiltersProvider>
                    <Layout>
                      <PermitMap />
                    </Layout>
                    <WelcomeModal />
                    <TourStep />
                    <HelpButton />
                  </FiltersProvider>
                </OnboardingProvider>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
