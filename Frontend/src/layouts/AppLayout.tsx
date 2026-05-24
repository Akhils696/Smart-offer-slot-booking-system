import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppShell } from '../components/layout/AppShell'

export function AppLayout() {
  return (
    <AppShell>
      <Outlet />
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </AppShell>
  )
}
