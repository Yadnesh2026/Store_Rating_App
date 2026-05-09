import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LogOut, RefreshCcw, Search, Star } from 'lucide-react';
import { api } from './api/client.js';
import './styles.css';

const emptyAuth = { email: '', password: '' };
const minName = 'At least twenty chars';

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');

  function saveSession(payload) {
    localStorage.setItem('token', payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
    setUser(payload.user);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Store Rating Platform</p>
          <h1>{user ? `${user.role.toLowerCase()} dashboard` : 'Sign in to continue'}</h1>
        </div>
        {user && (
          <button className="icon-text" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        )}
      </header>

      {message && <div className="notice">{message}</div>}

      {!user && (
        <AuthPanel
          mode={mode}
          setMode={setMode}
          onLogin={saveSession}
          onMessage={setMessage}
        />
      )}
      {user?.role === 'ADMIN' && <AdminDashboard onMessage={setMessage} />}
      {user?.role === 'USER' && <UserDashboard onMessage={setMessage} />}
      {user?.role === 'OWNER' && <OwnerDashboard onMessage={setMessage} />}
    </div>
  );
}

function AuthPanel({ mode, setMode, onLogin, onMessage }) {
  const [login, setLogin] = useState(emptyAuth);
  const [signup, setSignup] = useState({ name: '', email: '', address: '', password: '' });

  async function submitLogin(event) {
    event.preventDefault();
    try {
      onLogin(await api('/auth/login', { method: 'POST', body: JSON.stringify(login) }));
    } catch (error) {
      onMessage(error.message);
    }
  }

  async function submitSignup(event) {
    event.preventDefault();
    try {
      await api('/auth/signup', { method: 'POST', body: JSON.stringify(signup) });
      onMessage('Signup successful. You can login now.');
      setMode('login');
    } catch (error) {
      onMessage(error.message);
    }
  }

  return (
    <section className="auth-layout">
      <div className="panel">
        <div className="tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Signup</button>
        </div>
        {mode === 'login' ? (
          <form onSubmit={submitLogin} className="form">
            <Input label="Email" value={login.email} onChange={(email) => setLogin({ ...login, email })} type="email" />
            <Input label="Password" value={login.password} onChange={(password) => setLogin({ ...login, password })} type="password" />
            <button>Login</button>
          </form>
        ) : (
          <form onSubmit={submitSignup} className="form">
            <Input label="Name" value={signup.name} onChange={(name) => setSignup({ ...signup, name })} minLength={20} maxLength={60} placeholder={minName} />
            <Input label="Email" value={signup.email} onChange={(email) => setSignup({ ...signup, email })} type="email" />
            <Input label="Address" value={signup.address} onChange={(address) => setSignup({ ...signup, address })} maxLength={400} />
            <Input label="Password" value={signup.password} onChange={(password) => setSignup({ ...signup, password })} type="password" minLength={8} maxLength={16} />
            <button>Create Account</button>
          </form>
        )}
      </div>
      <div className="seed-box">
        <h2>Seed Logins</h2>
        <p>Password for all: <strong>Password@123</strong></p>
        <p>admin@storerating.test</p>
        <p>user@storerating.test</p>
        <p>owner@storerating.test</p>
      </div>
    </section>
  );
}

function AdminDashboard({ onMessage }) {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [userSort, setUserSort] = useState({ sortBy: 'name', order: 'asc' });
  const [storeSort, setStoreSort] = useState({ sortBy: 'name', order: 'asc' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'USER' });
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });

  async function load() {
    const userQuery = new URLSearchParams({ ...clean(userFilters), ...userSort });
    const storeQuery = new URLSearchParams({ ...clean(storeFilters), ...storeSort });
    const [dash, userRows, storeRows] = await Promise.all([
      api('/admin/dashboard'),
      api(`/admin/users?${userQuery}`),
      api(`/admin/stores?${storeQuery}`)
    ]);
    setStats(dash);
    setUsers(userRows);
    setStores(storeRows);
  }

  useEffect(() => {
    load().catch((error) => onMessage(error.message));
  }, []);

  async function createUser(event) {
    event.preventDefault();
    try {
      await api('/admin/users', { method: 'POST', body: JSON.stringify(newUser) });
      setNewUser({ name: '', email: '', password: '', address: '', role: 'USER' });
      await load();
    } catch (error) {
      onMessage(error.message);
    }
  }

  async function createStore(event) {
    event.preventDefault();
    try {
      const payload = { ...newStore, ownerId: newStore.ownerId ? Number(newStore.ownerId) : null };
      await api('/admin/stores', { method: 'POST', body: JSON.stringify(payload) });
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      await load();
    } catch (error) {
      onMessage(error.message);
    }
  }

  return (
    <main className="grid">
      <Stat title="Users" value={stats.users} />
      <Stat title="Stores" value={stats.stores} />
      <Stat title="Ratings" value={stats.ratings} />

      <section className="panel wide">
        <h2>Add User</h2>
        <form className="form inline" onSubmit={createUser}>
          <Input label="Name" value={newUser.name} onChange={(name) => setNewUser({ ...newUser, name })} minLength={20} maxLength={60} />
          <Input label="Email" value={newUser.email} onChange={(email) => setNewUser({ ...newUser, email })} type="email" />
          <Input label="Password" value={newUser.password} onChange={(password) => setNewUser({ ...newUser, password })} type="password" />
          <Input label="Address" value={newUser.address} onChange={(address) => setNewUser({ ...newUser, address })} maxLength={400} />
          <label>Role<select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}><option>USER</option><option>ADMIN</option><option>OWNER</option></select></label>
          <button>Add User</button>
        </form>
      </section>

      <section className="panel wide">
        <h2>Add Store</h2>
        <form className="form inline" onSubmit={createStore}>
          <Input label="Name" value={newStore.name} onChange={(name) => setNewStore({ ...newStore, name })} minLength={20} maxLength={60} />
          <Input label="Email" value={newStore.email} onChange={(email) => setNewStore({ ...newStore, email })} type="email" />
          <Input label="Address" value={newStore.address} onChange={(address) => setNewStore({ ...newStore, address })} maxLength={400} />
          <Input label="Owner ID" value={newStore.ownerId} onChange={(ownerId) => setNewStore({ ...newStore, ownerId })} type="number" />
          <button>Add Store</button>
        </form>
      </section>

      <DataPanel title="Users" filters={userFilters} setFilters={setUserFilters} sort={userSort} setSort={setUserSort} onLoad={load}>
        <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Address</th><th>Role</th></tr></thead><tbody>{users.map((u) => <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.address}</td><td>{u.role}</td></tr>)}</tbody></table>
      </DataPanel>

      <DataPanel title="Stores" filters={storeFilters} setFilters={setStoreFilters} sort={storeSort} setSort={setStoreSort} onLoad={load}>
        <table><thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Rating</th></tr></thead><tbody>{stores.map((s) => <tr key={s.id}><td>{s.name}</td><td>{s.email}</td><td>{s.address}</td><td>{s.rating || 'No ratings'}</td></tr>)}</tbody></table>
      </DataPanel>
    </main>
  );
}

function UserDashboard({ onMessage }) {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });

  async function load() {
    const query = new URLSearchParams({ search, ...sort });
    setStores(await api(`/stores?${query}`));
  }

  useEffect(() => {
    load().catch((error) => onMessage(error.message));
  }, []);

  async function rate(storeId, rating) {
    try {
      await api(`/stores/${storeId}/rating`, { method: 'PUT', body: JSON.stringify({ rating }) });
      await load();
    } catch (error) {
      onMessage(error.message);
    }
  }

  return (
    <main className="panel">
      <div className="toolbar">
        <label className="search"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stores by name or address" /></label>
        <SortControl sort={sort} setSort={setSort} fields={['name', 'address', 'rating']} />
        <button className="icon-only" onClick={load} title="Refresh"><RefreshCcw size={18} /></button>
      </div>
      <div className="store-list">
        {stores.map((store) => (
          <article className="store-row" key={store.id}>
            <div>
              <h2>{store.name}</h2>
              <p>{store.address}</p>
              <p>Overall: <strong>{store.overallRating || 'No ratings'}</strong> | Your rating: <strong>{store.userRating || 'Not rated'}</strong></p>
            </div>
            <div className="stars">{[1, 2, 3, 4, 5].map((value) => <button key={value} onClick={() => rate(store.id, value)} className={Number(store.userRating) >= value ? 'selected' : ''} title={`Rate ${value}`}><Star size={20} /></button>)}</div>
          </article>
        ))}
      </div>
      <PasswordPanel onMessage={onMessage} />
    </main>
  );
}

function OwnerDashboard({ onMessage }) {
  const [data, setData] = useState({ store: null, ratings: [] });

  useEffect(() => {
    api('/owner/dashboard').then(setData).catch((error) => onMessage(error.message));
  }, []);

  return (
    <main className="grid">
      <section className="panel">
        <h2>{data.store?.name || 'No store assigned'}</h2>
        <p className="big-rating">{data.store?.averageRating || 'No ratings yet'}</p>
      </section>
      <PasswordPanel onMessage={onMessage} />
      <section className="panel wide">
        <h2>Users Who Submitted Ratings</h2>
        <table><thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Rating</th></tr></thead><tbody>{data.ratings.map((r) => <tr key={`${r.email}-${r.ratedAt}`}><td>{r.name}</td><td>{r.email}</td><td>{r.address}</td><td>{r.rating}</td></tr>)}</tbody></table>
      </section>
    </main>
  );
}

function PasswordPanel({ onMessage }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  async function submit(event) {
    event.preventDefault();
    try {
      await api('/auth/password', { method: 'PUT', body: JSON.stringify(form) });
      setForm({ currentPassword: '', newPassword: '' });
      onMessage('Password updated.');
    } catch (error) {
      onMessage(error.message);
    }
  }
  return <section className="panel"><h2>Update Password</h2><form onSubmit={submit} className="form"><Input label="Current Password" type="password" value={form.currentPassword} onChange={(currentPassword) => setForm({ ...form, currentPassword })} /><Input label="New Password" type="password" value={form.newPassword} onChange={(newPassword) => setForm({ ...form, newPassword })} /><button>Update</button></form></section>;
}

function DataPanel({ title, filters, setFilters, sort, setSort, onLoad, children }) {
  return (
    <section className="panel wide">
      <div className="table-head">
        <h2>{title}</h2>
        <SortControl sort={sort} setSort={setSort} fields={title === 'Users' ? ['name', 'email', 'address', 'role'] : ['name', 'email', 'address', 'rating']} />
      </div>
      <div className="filters">
        {Object.keys(filters).map((key) => <input key={key} placeholder={key} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} />)}
        <button onClick={onLoad}>Apply</button>
      </div>
      <div className="table-wrap">{children}</div>
    </section>
  );
}

function SortControl({ sort, setSort, fields }) {
  return <div className="sort"><select value={sort.sortBy} onChange={(e) => setSort({ ...sort, sortBy: e.target.value })}>{fields.map((field) => <option key={field}>{field}</option>)}</select><button type="button" onClick={() => setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' })}>{sort.order}</button></div>;
}

function Input({ label, value, onChange, ...props }) {
  return <label>{label}<input value={value} onChange={(e) => onChange(e.target.value)} required {...props} /></label>;
}

function Stat({ title, value }) {
  return <section className="stat"><span>{title}</span><strong>{value ?? 0}</strong></section>;
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value));
}

createRoot(document.getElementById('root')).render(<App />);
