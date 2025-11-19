import React, { useState, useEffect } from 'react';
import { Upload, Check, X, Search, Download, Eye, LogOut, Home, Users, Ticket, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';


const API_URL = 'http://13.61.180.156:5000/api';

export default function App() {
  const [view, setView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ nombre:'', dni:'', whatsapp:'', region:'', aceptaTerminos:false });
  const [comprobante, setComprobante] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [searchDNI, setSearchDNI] = useState('');
  const [loginData, setLoginData] = useState({ email:'', password:'' });
  const [showTicketModal, setShowTicketModal] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [userSearchDNI, setUserSearchDNI] = useState('');
  const [userTickets, setUserTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const regiones = ['Amazonas','Ancash','Apurimac','Arequipa','Ayacucho','Cajamarca','Callao','Cusco','Huancavelica','Huanuco','Ica','Junin','La Libertad','Lambayeque','Lima','Loreto','Madre de Dios','Moquegua','Pasco','Piura','Puno','San Martin','Tacna','Tumbes','Ucayali'];

  useEffect(()=> { if (isAdmin) loadTickets(); }, [isAdmin]);

  const loadTickets = async () => {
    try {
      const res = await axios.get(`${API_URL}/tickets`);
      setTickets(res.data);
    } catch(e){ console.error(e); }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return alert('Solo JPG/PNG/WEBP');
    if (file.size > 5*1024*1024) return alert('Max 5MB');
    setComprobante(file);
    const reader = new FileReader();
    reader.onloadend = ()=> setComprobantePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.dni || !formData.whatsapp || !formData.region || !comprobante || !formData.aceptaTerminos) return alert('Completa todos los campos');
    if (!/^[0-9]{8}$/.test(formData.dni)) return alert('DNI inválido');
    if (!/^[0-9]{9}$/.test(formData.whatsapp)) return alert('WhatsApp inválido');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nombre', formData.nombre);
      fd.append('dni', formData.dni);
      fd.append('whatsapp', formData.whatsapp);
      fd.append('region', formData.region);
      fd.append('comprobante', comprobante);
      const res = await axios.post(`${API_URL}/tickets`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowTicketModal(res.data);
      setFormData({ nombre:'', dni:'', whatsapp:'', region:'', aceptaTerminos:false });
      setComprobante(null); setComprobantePreview(null);
    } catch (err) {
      alert('Error al enviar: ' + (err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/admin/login`, loginData);
      if (res.data.success) { setIsAdmin(true); setView('dashboard'); localStorage.setItem('adminToken', res.data.token); }
    } catch(e){ alert('Credenciales incorrectas'); }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await axios.put(`${API_URL}/tickets/${ticketId}/status`, { estado: newStatus });
      await loadTickets();
      alert('Estado actualizado');
    } catch(e){ alert('Error al actualizar'); }
  };

  const searchUserTickets = async () => {
    if (!/^[0-9]{8}$/.test(userSearchDNI)) return alert('DNI inválido');
    try {
      const res = await axios.get(`${API_URL}/tickets/search/${userSearchDNI}`);
      setUserTickets(res.data);
    } catch(e){ setUserTickets([]); }
  };

  const exportCSV = () => {
    const headers = ['Ticket','Nombre','DNI','WhatsApp','Region','Monto','Estado','Fecha'];
    const rows = tickets.map(t => [t.ticket_id, t.nombre, t.dni, t.whatsapp, t.region, t.monto_detectado || 'N/A', t.estado, new Date(t.fecha_registro).toLocaleString('es-PE')]);
    const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `sorteo_${new Date().toISOString().split('T')[0]}.csv`; link.click();
  };

  const filteredTickets = searchDNI ? tickets.filter(t => t.dni.includes(searchDNI)) : tickets;
  const stats = { total: tickets.length, aprobados: tickets.filter(t=>t.estado==='aprobado').length, rechazados: tickets.filter(t=>t.estado==='rechazado').length, revision: tickets.filter(t=>t.estado==='revision').length };

  const getStatusColor=(e)=> e==='aprobado'?'from-green-500 to-green-600': e==='rechazado'?'from-red-500 to-red-600':'from-yellow-500 to-yellow-600';
  const getStatusIcon=(e)=> e==='aprobado'?<CheckCircle size={20}/> : e==='rechazado'? <X size={20}/> : <Clock size={20}/>;
  const getStatusText=(e)=> e==='aprobado'?'APROBADO': e==='rechazado'?'RECHAZADO':'EN REVISION';

  // The component UI (simplified for space): home, registration form, admin views, modals
  return (
    <div style={{fontFamily:'Inter,sans-serif',minHeight:'100vh',background:'linear-gradient(90deg,#0f1724,#1f2937)'}}>
      <header style={{padding:20,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img 
  src="/lenninsorteoslogo.jpg" 
  alt="Logo" 
  style={{width:50, height:50, borderRadius:12}} 
/>
          <div><h1 style={{color:'#fff'}}>LENNIN SORTEOS</h1><small style={{color:'#cbd5e1'}}>Sistema de Sorteos</small></div>
        </div>
        <div>
          <button onClick={()=>setView('login')} style={{padding:8,background:'rgba(255,255,255,0.08)',color:'#fff',borderRadius:8}}>Admin</button>
        </div>
      </header>

      <main style={{padding:24}}>
        {isAdmin ? (
          <section>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
  <h2 style={{color:'#fff'}}>Admin - {view}</h2>
  <div>
    <button onClick={() => setView('dashboard')} style={{marginRight:8}}>
      Dashboard
    </button>

    <button onClick={() => setView('participants')} style={{marginRight:8}}>
      Participantes
    </button>

    <button onClick={() => { setIsAdmin(false); setView('home'); localStorage.removeItem('adminToken'); }}>
      Salir
    </button>
  </div>
</div>
            {view==='dashboard' && (
              <div>
                <div style={{display:'flex',gap:12}}>
                  <div style={{background:'#111827',padding:16,borderRadius:12}}><h3>Total</h3><p>{stats.total}</p></div>
                  <div style={{background:'#0f1724',padding:16,borderRadius:12}}><h3>Aprobados</h3><p>{stats.aprobados}</p></div>
                  <div style={{background:'#0f1724',padding:16,borderRadius:12}}><h3>Rechazados</h3><p>{stats.rechazados}</p></div>
                  <div style={{background:'#0f1724',padding:16,borderRadius:12}}><h3>Revision</h3><p>{stats.revision}</p></div>
                </div>
                <button onClick={exportCSV} style={{marginTop:12}}>Descargar CSV</button>
              </div>
            )}
            {view==='participants' && (
              <div>
                <input placeholder="Buscar por DNI" value={searchDNI} onChange={e=>setSearchDNI(e.target.value)} />
                <table style={{width:'100%',marginTop:12}}>
                  <thead><tr><th>Ticket</th><th>Nombre</th><th>DNI</th><th>WhatsApp</th><th>Region</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {filteredTickets.map(t=>(
                      <tr key={t.ticket_id}>
                        <td>{t.ticket_id}</td><td>{t.nombre}</td><td>{t.dni}</td><td>{t.whatsapp}</td><td>{t.region}</td><td>{t.monto_detectado || 'N/A'}</td>
                        <td>{t.estado}</td>
                        <td>
                          <button onClick={()=>setSelectedTicket(t)}>Ver</button>
                          <button onClick={()=>updateTicketStatus(t.ticket_id,'aprobado')}>Aprobar</button>
                          <button onClick={()=>updateTicketStatus(t.ticket_id,'rechazado')}>Rechazar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          
          <section style={{maxWidth:1000,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'rgba(255,255,255,0.04)',padding:20,borderRadius:12}}>
              <h2 style={{color:'#fff'}}>Registra tu Ticket</h2>
              <input name="nombre" placeholder="Nombre completo" value={formData.nombre} onChange={handleInputChange} style={{width:'100%',padding:8,marginTop:8}} />
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <input name="dni" placeholder="DNI" maxLength={8} value={formData.dni} onChange={handleInputChange} />
                <input name="whatsapp" placeholder="WhatsApp" maxLength={9} value={formData.whatsapp} onChange={handleInputChange} />
              </div>
              <select name="region" value={formData.region} onChange={handleInputChange} style={{width:'100%',padding:8,marginTop:8}}>
                <option value="">Selecciona region</option>
                {regiones.map(r=> <option key={r} value={r}>{r}</option>)}
              </select>
              <div style={{border:'2px dashed rgba(255,255,255,0.1)',padding:12,marginTop:8,textAlign:'center'}}>
                <input id="file" type="file" accept="image/*" style={{display:'none'}} onChange={handleFileChange} />
                <label htmlFor="file" style={{cursor:'pointer'}}>Subir comprobante</label>
                {comprobantePreview && <img src={comprobantePreview} alt="preview" style={{maxWidth:'100%',marginTop:8}} />}
              </div>
              <div style={{marginTop:8}}>
                <label><input type="checkbox" name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleInputChange} /> Acepto términos</label>
              </div>
              <button onClick={handleSubmit} disabled={loading} style={{marginTop:12}}>{loading ? 'Enviando...' : 'Enviar Registro'}</button>
            </div>

            <div style={{background:'rgba(255,255,255,0.04)',padding:20,borderRadius:12}}>
              <h2 style={{color:'#fff'}}>Buscar Mis Tickets</h2>
              <div style={{display:'flex',gap:8}}>
                <input value={userSearchDNI} onChange={e=>setUserSearchDNI(e.target.value)} placeholder="DNI" maxLength={8} />
                <button onClick={searchUserTickets}>Buscar</button>
              </div>
              <div style={{marginTop:12}}>
                {userTickets.length===0 ? <p style={{color:'#cbd5e1'}}>Ingresa tu DNI para buscar</p> : userTickets.map(t=>(
                  <div key={t.ticket_id} style={{background:'rgba(0,0,0,0.4)',padding:8,borderRadius:8,marginBottom:8}}>
                    <strong>{t.ticket_id}</strong> - {t.nombre} - {t.estado}
                    <div><button onClick={()=>setSelectedTicket(t)}>Ver comprobante</button></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {showTicketModal && (
          <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.6)'}} onClick={()=>setShowTicketModal(null)}>
            <div style={{background:'#111827',padding:20,borderRadius:12}} onClick={e=>e.stopPropagation()}>
              <h3>Registro Exitoso</h3>
              <p>Ticket: {showTicketModal.ticket_id}</p>
              <p>Estado: {showTicketModal.estado}</p>
              <button onClick={()=>setShowTicketModal(null)}>Cerrar</button>
            </div>
          </div>
        )}

        {selectedTicket && (
          <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.8)'}} onClick={()=>setSelectedTicket(null)}>
            <div style={{background:'#0b1220',padding:20,borderRadius:12}} onClick={e=>e.stopPropagation()}>
              <h3>{selectedTicket.nombre}</h3>
              <img src={`http://localhost:3001${selectedTicket.comprobante_url}`} 
              alt="comprobante" 
          style={{maxWidth:600}} />
              <p>Estado: {selectedTicket.estado}</p>
              <button onClick={()=>setSelectedTicket(null)}>Cerrar</button>
            </div>
          </div>
        )}
{view === 'login' && !isAdmin && (
  <div style={{maxWidth: 400, margin: "0 auto", background: "#111827", padding: 20, borderRadius: 12}}>
    <h2 style={{color:"#fff", marginBottom:10}}>Iniciar Sesión (Admin)</h2>

    <input
      placeholder="Correo"
      value={loginData.email}
      onChange={e => setLoginData({...loginData, email: e.target.value})}
      style={{width:"100%", padding:8, marginBottom:10}}
    />

    <input
      placeholder="Contraseña"
      type="password"
      value={loginData.password}
      onChange={e => setLoginData({...loginData, password: e.target.value})}
      style={{width:"100%", padding:8, marginBottom:10}}
    />

    <button onClick={handleLogin} style={{padding:10, width:"100%"}}>
      Ingresar
    </button>

    <button onClick={()=>setView('home')} style={{padding:10, width:"100%", marginTop:10}}>
      Cancelar
    </button>
  </div>
)}
      </main>
    </div>
  );
}
