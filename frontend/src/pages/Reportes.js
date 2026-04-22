import { useEffect, useState } from 'react'
import { apiFetch, exportCSV } from '../api'

const tabStyle = (active) => ({
  padding: '10px 20px',
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: active ? 700 : 400,
  background: active ? 'linear-gradient(135deg, #0f2027, #2c5364)' : 'rgba(255,255,255,0.5)',
  color: active ? '#fff' : '#64748b',
  borderRadius: 10,
  transition: 'all 0.2s',
  backdropFilter: 'blur(8px)',
  border: active ? 'none' : '1px solid rgba(0,0,0,0.08)',
})

export default function Reportes() {
  const [tab,        setTab]       = useState('diarias')
  const [diarias,    setDiarias]   = useState([])
  const [categorias, setCategorias]= useState([])
  const [empleados,  setEmpleados] = useState([])
  const [clientes,   setClientes]  = useState([])
  const [loading,    setLoading]   = useState(true)
  const [error,      setError]     = useState('')

  useEffect(() => {
   const cargar = async () => {
  setLoading(true); setError('')
  try {
    const [d, c, e, cl] = await Promise.all([
      apiFetch('/reportes/ventas-diarias').catch(() => []),
      apiFetch('/reportes/inventario-categorias').catch(() => []),
      apiFetch('/reportes/ranking-empleados').catch(() => []),
      apiFetch('/reportes/clientes-activos').catch(() => []),
    ])
    setDiarias(d||[]); setCategorias(c||[])
    setEmpleados(e||[]); setClientes(cl||[])
  } catch (e) { setError(e.message) }
  setLoading(false)
}   
cargar()
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <p style={{ color:'#94a3b8' }}>Cargando reportes...</p>
    </div>
  )

  return (
    <div style={{ fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <h2 style={{ fontSize:26, fontWeight:800, color:'#0f2027', letterSpacing:'-0.5px', marginBottom:6 }}>Reportes</h2>
      <p style={{ color:'#64748b', fontSize:14, marginBottom:28 }}>Análisis y estadísticas de la tienda</p>

      {error && (
        <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
          borderRadius:10, padding:'10px 14px', color:'#dc2626', fontSize:13, marginBottom:16 }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {[
          { id:'diarias',    label:'Ventas diarias'        },
          { id:'categorias', label:'Inventario categorías' },
          { id:'empleados',  label:'Ranking empleados'     },
          { id:'clientes',   label:'Clientes activos'      },
        ].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={tabStyle(tab===t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{
        background:'rgba(255,255,255,0.6)', backdropFilter:'blur(12px)',
        border:'1px solid rgba(255,255,255,0.8)', borderRadius:16,
        padding:24, boxShadow:'0 4px 24px rgba(100,180,255,0.1)',
      }}>

        {tab === 'diarias' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#0f2027', margin:0 }}>Ventas diarias</h3>
                <p style={{ color:'#94a3b8', fontSize:12, margin:'4px 0 0' }}>Últimos 30 días — vista desde el VIEW de base de datos</p>
              </div>
              <button onClick={()=>exportCSV(diarias,'ventas_diarias.csv')} style={{
                background:'linear-gradient(135deg, #10b981, #059669)',
                color:'#fff', border:'none', borderRadius:10,
                padding:'8px 18px', cursor:'pointer', fontSize:13, fontWeight:600,
              }}>
                Exportar CSV
              </button>
            </div>
            <Tabla
              headers={['Día','Ventas','Ingresos totales','Ticket promedio','Clientes únicos']}
              rows={diarias.map(r=>[
                new Date(r.dia).toLocaleDateString('es-GT'),
                r.total_ventas,
                `Q${parseFloat(r.ingresos_totales).toFixed(2)}`,
                `Q${parseFloat(r.ticket_promedio).toFixed(2)}`,
                r.clientes_unicos,
              ])}
            />
          </>
        )}

        {tab === 'categorias' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#0f2027', margin:0 }}>Inventario por categoría</h3>
                <p style={{ color:'#94a3b8', fontSize:12, margin:'4px 0 0' }}>GROUP BY + HAVING + funciones de agregación</p>
              </div>
              <button onClick={()=>exportCSV(categorias,'inventario_categorias.csv')} style={{
                background:'linear-gradient(135deg, #10b981, #059669)',
                color:'#fff', border:'none', borderRadius:10,
                padding:'8px 18px', cursor:'pointer', fontSize:13, fontWeight:600,
              }}>
                Exportar CSV
              </button>
            </div>
            <Tabla
              headers={['Categoría','Productos','Stock total','Precio prom.','Precio max','Precio min']}
              rows={categorias.map(r=>[
                r.categoria,
                r.total_productos,
                r.stock_total,
                `Q${parseFloat(r.precio_promedio).toFixed(2)}`,
                `Q${parseFloat(r.precio_max).toFixed(2)}`,
                `Q${parseFloat(r.precio_min).toFixed(2)}`,
              ])}
            />
          </>
        )}

        {tab === 'empleados' && (
          <>
            <div style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'#0f2027', margin:0 }}>Ranking de empleados</h3>
              <p style={{ color:'#94a3b8', fontSize:12, margin:'4px 0 0' }}>CTE con RANK() — ordenado por monto total de ventas</p>
            </div>
            <Tabla
              headers={['Ranking','Empleado','Ventas completadas','Monto total']}
              rows={empleados.map(r=>[
                `#${r.ranking}`,
                r.empleado,
                r.total_ventas,
                `Q${parseFloat(r.monto_total).toFixed(2)}`,
              ])}
            />
          </>
        )}

        {tab === 'clientes' && (
          <>
            <div style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'#0f2027', margin:0 }}>Clientes activos</h3>
              <p style={{ color:'#94a3b8', fontSize:12, margin:'4px 0 0' }}>Subquery EXISTS — clientes con al menos una compra completada</p>
            </div>
            <Tabla
              headers={['ID','Nombre','Apellido','Email']}
              rows={clientes.map(r=>[r.id_cliente, r.nombre, r.apellido, r.email])}
            />
          </>
        )}
      </div>
    </div>
  )
}

function Tabla({ headers, rows }) {
  if (!rows.length) return (
    <p style={{ color:'#94a3b8', fontSize:13, textAlign:'center', padding:'24px 0' }}>
      Sin datos disponibles
    </p>
  )
  return (
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
      <thead>
        <tr style={{ borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
          {headers.map(h=>(
            <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'#94a3b8', fontWeight:600, fontSize:11, letterSpacing:'0.5px', textTransform:'uppercase' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row,i)=>(
          <tr key={i} style={{ borderBottom:'1px solid rgba(0,0,0,0.04)', background:i%2===0?'transparent':'rgba(241,245,249,0.4)' }}>
            {row.map((cell,j)=>(
              <td key={j} style={{ padding:'10px 12px', color: j===0?'#0f2027':'#475569', fontWeight: j===0?500:400 }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
