import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_USER = import.meta.env.VITE_ROLE_USER;
const ROLE_ADMIN = import.meta.env.VITE_ROLE_ADMIN;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, signin } = useAuth();

  const handleOnClick = async (e) => {
    e.preventDefault();
    setError('');

    const id = e.target.id;
    try {
      let res = null;
      if (id === 'accedi') res = await login(email, password);
      if (id === 'registrati') navigate('/register'); //res = await signin(email, password);

      if (!res || !res.user || !res.user.role) {
        setError(res?.message || 'Credenziali non valide');
        return;
      }

      if (res.user.role === ROLE_ADMIN) navigate('/admin');
      else if (res.user.role === ROLE_USER) navigate('/user');
      else navigate('/');

    } catch (err) {
      setError(err.message || 'Server offline');
    }
  };

  return (
    <div className="container">
      <form className="login-card">
        <h1><span className='color-bg'>BLUE</span>DREAM</h1>
        <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <section className='button-container'>
          <button type="button" id='accedi' onClick={handleOnClick}>Accedi</button>
          <button type="button" id='registrati' onClick={handleOnClick}>Registrati</button>
        </section>
      </form>
    </div>
  );
}
