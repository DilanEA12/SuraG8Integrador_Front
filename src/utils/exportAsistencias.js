// ====================================
// EXPORTAR ASISTENCIAS - ADAPTADO
// Campos reales del modelo: nombrePersona, fecha, horaEntrada, asistio
// ====================================

const escapeCsv = (value) => {
  if (value == null) return '';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

// ── Exportar a CSV ────────────────────────────
export const exportarAsistenciasCSV = (asistencias) => {
  // Soporta tanto el formato real del backend como el formato adaptado del componente
  const headers = ['ID', 'Nombre', 'Fecha', 'Hora Entrada', 'Estado'];

  const rows = asistencias.map((a) => [
    a.id              ?? '',
    // Soporta nombrePersona (backend real) y estudianteNombre (formato adaptado)
    a.nombrePersona   ?? a.estudianteNombre ?? '',
    a.fecha           ?? '',
    a.horaEntrada     ?? '',
    // Soporta asistio (Boolean del backend) y estado (String adaptado)
    a.estado          ?? (a.asistio ? 'Presente' : 'Ausente'),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', `asistencias_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ── Exportar a PDF (ventana de impresión) ─────
export const exportarAsistenciasPDF = (asistencias) => {
  const win = window.open('', '_blank');
  if (!win) return;

  const fechaActual = new Date().toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const rows = asistencias
    .map((a) => {
      const estado  = a.estado ?? (a.asistio ? 'Presente' : 'Ausente');
      const nombre  = a.nombrePersona ?? a.estudianteNombre ?? '—';
      const color   = estado === 'Presente' || a.asistio === true
        ? '#dcfce7'   // verde claro
        : '#fee2e2';  // rojo claro

      return `
        <tr style="background:${color}">
          <td>${a.id ?? '—'}</td>
          <td><strong>${nombre}</strong></td>
          <td>${a.fecha ?? '—'}</td>
          <td>${a.horaEntrada ?? '—'}</td>
          <td>${estado}</td>
        </tr>`;
    })
    .join('');

  const presentes = asistencias.filter(a => a.asistio === true || a.estado === 'Presente').length;
  const ausentes  = asistencias.length - presentes;
  const pct       = asistencias.length > 0
    ? ((presentes / asistencias.length) * 100).toFixed(1)
    : 0;

  win.document.write(`
    <html>
      <head>
        <title>Reporte de Asistencias - Sura G8</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #111; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .titulo { font-size: 22px; font-weight: 700; color: #001e60; }
          .subtitulo { font-size: 13px; color: #666; margin-top: 4px; }
          .kpis { display: flex; gap: 20px; margin-bottom: 20px; }
          .kpi { padding: 12px 20px; border-radius: 10px; text-align: center; min-width: 100px; }
          .kpi.verde  { background: #dcfce7; color: #166534; }
          .kpi.rojo   { background: #fee2e2; color: #991b1b; }
          .kpi.azul   { background: #dbeafe; color: #1e3a8a; }
          .kpi strong { display: block; font-size: 22px; }
          .kpi span   { font-size: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #001e60; color: white; padding: 10px 12px; text-align: left; }
          td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="titulo">📋 Reporte de Asistencias — Sura G8</div>
            <div class="subtitulo">Generado el ${fechaActual}</div>
          </div>
        </div>
        <div class="kpis">
          <div class="kpi verde"><strong>${presentes}</strong><span>Presentes</span></div>
          <div class="kpi rojo"><strong>${ausentes}</strong><span>Ausentes</span></div>
          <div class="kpi azul"><strong>${pct}%</strong><span>% Asistencia</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Fecha</th><th>Hora</th><th>Estado</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
};
