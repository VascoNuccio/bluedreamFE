import React from 'react'
import { useAuth } from '@/context/AuthContext'
import styles from '@/assets/styles/navbar.module.scss'

const Navbar = () => {
  const { user, handleLogout } = useAuth()
  const initials = user? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase(): 'NN';

  return (
    <nav className={styles.navbar}>
        <h2 className={styles.title}><span className={styles.color_bg}>BLUE</span>DREAM</h2>
        <div className={styles.user_icon}>
        <div className={styles.logoutWrapper}>
          <button className={styles.user_button} onClick={handleLogout}>
            {initials}
          </button>
          <span className={styles.logoutTooltip}>Log out</span>
        </div>
        </div>
    </nav>
  )
}

export default Navbar