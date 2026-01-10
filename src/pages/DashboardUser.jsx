import { useAuth } from '../context/AuthContext'
import Calendar from '@/components/User/Calendar'

const DashboardUser = () => {
  const { user, logout } = useAuth()

  return (
    <>
      <Calendar />
    </>
  )
}

export default DashboardUser
