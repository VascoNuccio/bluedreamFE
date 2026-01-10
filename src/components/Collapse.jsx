import React from 'react'
import styles from '@/assets/styles/collapse.module.scss'
import Up from "@/assets/icons/chevron-up-solid-full.svg";
import Down from "@/assets/icons/chevron-down-solid-full.svg";

const Collapse = ({title, children}) => {
    const [isOpen, setOpen] = React.useState(false);
  return (
    <div className={styles.container}>
        <div className={styles.title} onClick={() => setOpen(!isOpen)}>
            <h3>{title}</h3>
            {isOpen?<img src={Up} alt="Toggle" />:<img src={Down} alt="Toggle" />}
        </div>
        {isOpen && children}
    </div>
  )
}

export default Collapse