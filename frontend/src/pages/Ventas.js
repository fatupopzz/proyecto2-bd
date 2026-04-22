import { useEffect, useState } from 'react'
import { apiFetch } from '../api'

const inputStyle = {
  display:'block', width:'100%', padding:'10px 14px',
  border:'1px solid rgba(0,0,0,0.1)', borderRadius:10, fontSize:14,
  background:'rgba(255,255,255,0.7)', outline:'none', boxSizing:'border-box',
  fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const labelStyle = {
  display:'block', fontSize:11, fontWeight:600, color:'#64748b',
  letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:5,
}

export default function Ventas() {
  const [ventas,    setVentas]    = useState([])
  const [clientes,  setClientes]  = useState([])
  const [empleados, setEmpleados] = useState([])
  const [productos, setProductos] = useState([])
  const [detalle,   setDetalle]   = useState(null)
  const [ventaSel,  setVentaSel]  = useState(null)
  const [form,      setForm]      = useState({ id_cliente:'', id_empleado:'', items:[{ id_producto:'', cantidad:1 }] })
  const [error,     setError]     = useState('')
  const [exito,     setExito]     = useState('')
  const [loading,   setLoading]   = useState(true)

  const cargar = async () => {
    setLoading(true)
    try {
      const [v, c, e, p] = await Promise.all([
        apiFetch('/ventas'), apiFetch('/clientes'),
        apiFetch('/empleados'), apiFetch('/productos'),
      ])
      setVentas(v||[]); setClientes(c||[])
      setEmpleados(e||[]); setProductos(p||[])
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const verDetalle = async (id) => {
    setVentaSel(id)
    try { setDetalle(await apiFetch(`/ventas/${id}/detalle`)) }
    catch(e) { setError(e.message) }
  }

  const addItem    = () => setForm({...form, items:[...form.items, { id_producto:'', cantidad:1 }]})
  const removeItem = (i) => setForm({...form, items:form.items.filter((_,idx)=>idx!==i)})
  const updateItem = (i, key, val) => {
    const items = [...form.items]
    items[i] = {...items[i], [key]:val}
    setForm({...form, items})
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setExito('')
    try {
      const res = await apiFetch('/ventas', { method:'POST', body:JSON.stringify({
        id_cliente:  parseInt(form.id_cliente),
        id_empleado: parseInt(form.id_empleado),
        items: form.items.map(i => ({ id_producto:parseInt(i.id_producto), cantidad:parseInt(i.cantidad) }))
      })})
      setExito(`Venta #${res.id_venta} registrada por Q${parseFloat(res.total).toFixed(2)}`)
      setForm({ id_cliente:'', id_empleado:'', items:[{ id_producto:'', cantidad:1 }] })
      cargar()
    } catch(e) { setError(e.message) }
  }

  const estadoColor = (estado) => {
    if (estado === 'completada') return { bg:'rgba(16,185,129,0.1)', color:'#10b981' }
    if (estado === 'cancelada')  return { bg:'rgba(244,63,94,0.1)',  color:'#f43f5e' }
    return { bg:'rgba(245,158,11,0.1)', color:'#f59e0b' }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <p style={{ color:'#94a3b8' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <h2 style={{ fontSize:26, fontWeight:800, color:'#0f2027', letterSpacing:'-0.5px', marginBottom:6 }}>Ventas</h2>
      <p style={{ color:'#64748b', fontSize:14, marginBottom:28 }}>Registro y seguimiento de ventas</p>

      {/* Formulario nueva venta */}
      <div style={{
        background:'rgba(255,255,255,0.6)', backdropFilter:'blur(12px)',
        border:'1px solid rgba(255,255,255,0.8)', borderRadius:16,
        padding:28, marginBottom:28,
        boxShadow:'0 4px 24px rgba(100,180,255,0.1)',
      }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#0f2027', margin:'0 0 20px' }}>Nueva venta</h3>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
            borderRadius:10, padding:'10px 14px', color:'#dc2626', fontSize:13, marginBottom:16 }}>
            {error}
          </div>
        )}
        {exito && (
          <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)',
            borderRadius:10, padding:'10px 14px', color:'#10b981', fontSize:13, marginBottom:16 }}>
            {exito}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
            <div>
              <label style={labelStyle}>Cliente *</label>
              <select style={inputStyle} value={form.id_cliente} onChange={e=>setForm({...form,id_cliente:e.target.value})} required>
                <option value="">Seleccionar...</option>
                {clientes.map(c=><option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Empleado *</label>
              <select style={inputStyle} value={form.id_empleado} onChange={e=>setForm({...form,id_empleado:e.target.value})} required>
                <option value="">Seleccionar...</option>
                {empleados.map(e=><option key={e.id_empleado} value={e.id_empleado}>{e.nombre} {e.apellido}</option>)}
              </select>
            </div>
          </div>

          <h4 style={{ fontSize:12, fontWeight:600, color:'#64748b', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:12 }}>Productos</h4>
          {form.items.map((item, i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'center' }}>
              <select style={{...inputStyle, flex:2}} value={item.id_producto} onChange={e=>updateItem(i,'id_producto',e.target.value)} required>
                <option value="">Producto...</option>
                {productos.map(p=><option key={p.id_producto} value={p.id_producto}>{p.nombre} — stock: {p.stock}</option>)}
              </select>
              <input type="number" min="1" value={item.cantidad}
                onChange={e=>updateItem(i,'cantidad',e.target.value)}
                style={{...inputStyle, width:90, flex:'none'}} required />
              {form.items.length > 1 && (
                <button type="button" onClick={()=>removeItem(i)} style={{
                  background:'rgba(244,63,94,0.1)', color:'#f43f5e',
                  border:'none', borderRadius:8, padding:'8px 12px', cursor:'pointer', fontSize:13,
                }}>✕</button>
              )}
            </div>
          ))}

          <div style={{ display:'flex', gap:10, marginTop:16 }}>
            <button type="button" onClick={addItem} style={{
              background:'rgba(14,165,233,0.1)', color:'#0ea5e9',
              border:'none', borderRadius:10, padding:'9px 18px', cursor:'pointer', fontSize:13, fontWeight:600,
            }}>
              + Producto
            </button>
            <button type="submit" style={{
              background:'linear-gradient(135deg, #0f2027, #2c5364)',
              color:'#fff', border:'none', borderRadius:10,
              padding:'9px 24px', cursor:'pointer', fontSize:14, fontWeight:600,
            }}>
              Registrar venta
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de ventas */}
      <div style={{
        background:'rgba(255,255,255,0.6)', backdropFilter:'blur(12px)',
        border:'1px solid rgba(255,255,255,0.8)', borderRadius:16,
        boxShadow:'0 4px 24px rgba(100,180,255,0.1)', overflow:'hidden', marginBottom:20,
      }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ background:'linear-gradient(135deg, #0f2027, #2c5364)' }}>
              {['#','Fecha','Cliente','Empleado','Total','Estado',''].map(h=>(
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'rgba(255,255,255,0.85)', fontWeight:500, fontSize:12, letterSpacing:'0.3px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ventas.map((v,i)=>{
              const ec = estadoColor(v.estado)
              return (
                <tr key={v.id_venta} style={{ borderBottom:'1px solid rgba(0,0,0,0.04)', background:i%2===0?'transparent':'rgba(241,245,249,0.5)' }}>
                  <td style={{ padding:'12px 16px', color:'#94a3b8', fontSize:12 }}>{v.id_venta}</td>
                  <td style={{ padding:'12px 16px', color:'#475569' }}>{new Date(v.fecha).toLocaleDateString('es-GT')}</td>
                  <td style={{ padding:'12px 16px', fontWeight:500, color:'#0f2027' }}>{v.cliente}</td>
                  <td style={{ padding:'12px 16px', color:'#475569' }}>{v.empleado}</td>
                  <td style={{ padding:'12px 16px', color:'#0ea5e9', fontWeight:700 }}>Q{parseFloat(v.total).toFixed(2)}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ background:ec.bg, color:ec.color, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                      {v.estado}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <button onClick={()=>verDetalle(v.id_venta)} style={{
                      background:'rgba(99,102,241,0.1)', color:'#6366f1',
                      border:'none', borderRadius:8, padding:'5px 12px', cursor:'pointer', fontSize:12, fontWeight:600,
                    }}>Ver detalle</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detalle de venta */}
      {detalle && (
        <div style={{
          background:'rgba(255,255,255,0.6)', backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.8)', borderRadius:16,
          padding:24, boxShadow:'0 4px 24px rgba(100,180,255,0.1)',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'#0f2027', margin:0 }}>Detalle — Venta #{ventaSel}</h3>
            <button onClick={()=>setDetalle(null)} style={{
              background:'rgba(0,0,0,0.06)', color:'#475569',
              border:'none', borderRadius:8, padding:'5px 12px', cursor:'pointer', fontSize:13,
            }}>Cerrar</button>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
                {['Producto','Cantidad','Precio unitario','Subtotal'].map(h=>(
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'#94a3b8', fontWeight:500, fontSize:12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detalle.map((d,i)=>(
                <tr key={i} style={{ borderBottom:'1px solid rgba(0,0,0,0.04)' }}>
                  <td style={{ padding:'10px 12px', fontWeight:500, color:'#0f2027' }}>{d.producto}</td>
                  <td style={{ padding:'10px 12px', color:'#475569' }}>{d.cantidad}</td>
                  <td style={{ padding:'10px 12px', color:'#475569' }}>Q{parseFloat(d.precio_unitario).toFixed(2)}</td>
                  <td style={{ padding:'10px 12px', color:'#0ea5e9', fontWeight:700 }}>Q{parseFloat(d.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
