import React, { useState } from 'react';
import {
  AcademicRecord,
  Client,
  Invoice,
  TimeEntry,
} from '../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderOpen,
  DollarSign,
  GraduationCap,
  Sparkles,
  X,
} from 'lucide-react';

interface RecordsViewProps {
  records: AcademicRecord[];
  onUpdateRecords: (records: AcademicRecord[]) => void;
  clients: Client[];
  invoices: Invoice[];
  onUpdateInvoices: (invoices: Invoice[]) => void;
  onAddToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  records,
  onUpdateRecords,
  clients,
  invoices,
  onUpdateInvoices,
  onAddToast,
}) => {
  // Mode toggle: 'academic' | 'billing'
  const [activeCatalog, setActiveCatalog] = useState<'academic' | 'billing'>('academic');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State for New / Edit Record
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(null);

  // Form Fields for Academic Record
  const [studentName, setStudentName] = useState('Mateo González');
  const [subject, setSubject] = useState('Matemáticas');
  const [activityName, setActivityName] = useState('');
  const [score, setScore] = useState(90);
  const [status, setStatus] = useState<'completado' | 'en_progreso' | 'pendiente_revision'>('completado');
  const [gemsEarned, setGemsEarned] = useState(20);
  const [tutorFeedback, setTutorFeedback] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [recordToDelete, setRecordToDelete] = useState<AcademicRecord | null>(null);

  // Filtered Academic Records
  const filteredAcademicRecords = records.filter((rec) => {
    const matchesSearch =
      rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingRecord(null);
    setStudentName('Mateo González');
    setSubject('Matemáticas');
    setActivityName('');
    setScore(95);
    setStatus('completado');
    setGemsEarned(20);
    setTutorFeedback('Excelente comprensión guiada por el tutor socrático.');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (rec: AcademicRecord) => {
    setEditingRecord(rec);
    setStudentName(rec.studentName);
    setSubject(rec.subject);
    setActivityName(rec.activityName);
    setScore(rec.score);
    setStatus(rec.status);
    setGemsEarned(rec.gemsEarned);
    setTutorFeedback(rec.tutorFeedback);
    setFormError('');
    setIsModalOpen(true);
  };

  // Save Record (Create or Edit)
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) {
      setFormError('Por favor ingresa el nombre de la actividad o reto');
      return;
    }

    if (editingRecord) {
      // Edit
      const updated = records.map((r) =>
        r.id === editingRecord.id
          ? {
              ...r,
              studentName,
              subject,
              activityName,
              score,
              status,
              gemsEarned,
              tutorFeedback,
            }
          : r
      );
      onUpdateRecords(updated);
      onAddToast('Registro Actualizado', `Se guardaron los cambios para "${activityName}"`, 'success');
    } else {
      // Create New
      const newRec: AcademicRecord = {
        id: `rec-${Date.now()}`,
        studentName,
        subject,
        activityName,
        score,
        status,
        gemsEarned,
        date: new Date().toISOString().split('T')[0],
        tutorFeedback: tutorFeedback || 'Buen desempeño pedagógico y avance continuo.',
      };
      onUpdateRecords([newRec, ...records]);
      onAddToast('Nuevo Registro Creado', `Se registró la sesión "${activityName}" exitosamente`, 'success');
    }

    setIsModalOpen(false);
  };

  // Quick Status Toggle for an Academic Record
  const handleToggleStatus = (recordId: string) => {
    const statusCycle: ('completado' | 'en_progreso' | 'pendiente_revision')[] = [
      'en_progreso',
      'completado',
      'pendiente_revision',
    ];

    const updated = records.map((r) => {
      if (r.id === recordId) {
        const nextIdx = (statusCycle.indexOf(r.status) + 1) % statusCycle.length;
        return { ...r, status: statusCycle[nextIdx] };
      }
      return r;
    });

    onUpdateRecords(updated);
    onAddToast('Estado Actualizado', 'Se modificó el estado de la sesión', 'info');
  };

  // Confirm Delete Record
  const handleConfirmDelete = () => {
    if (!recordToDelete) return;
    const updated = records.filter((r) => r.id !== recordToDelete.id);
    onUpdateRecords(updated);
    onAddToast('Registro Eliminado', `Se eliminó el registro de "${recordToDelete.activityName}"`, 'info');
    setRecordToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-violet-400" />
              <span>Directorio y Expedientes Académicos</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Historial de retos socráticos, avances infantiles y registros de facturación
            </p>
          </div>

          {/* Right Action: "+ Nuevo Registro" button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Registro</span>
            </button>
          </div>
        </div>

        {/* Catalog Selector & Search/Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          {/* Catalog Type Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => {
                setActiveCatalog('academic');
                setStatusFilter('all');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCatalog === 'academic'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Sesiones y Alumnos ({records.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveCatalog('billing');
                setStatusFilter('all');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCatalog === 'billing'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Facturas / Clientes ({invoices.length})</span>
            </button>
          </div>

          {/* Real-time Search Input & Filter */}
          <div className="flex items-center gap-2 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  activeCatalog === 'academic'
                    ? 'Buscar por alumno, materia o reto...'
                    : 'Buscar por cliente o factura...'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
            >
              <option value="all">Todos los Estados</option>
              {activeCatalog === 'academic' ? (
                <>
                  <option value="completado">Completado</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="pendiente_revision">Revisión</option>
                </>
              ) : (
                <>
                  <option value="paid">Pagado (Paid)</option>
                  <option value="sent">Enviado (Sent)</option>
                  <option value="draft">Borrador (Draft)</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {activeCatalog === 'academic' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Alumno y Materia</th>
                  <th className="px-6 py-4">Actividad / Reto</th>
                  <th className="px-6 py-4">Puntaje</th>
                  <th className="px-6 py-4">Gemas</th>
                  <th className="px-6 py-4">Estado (Click para cambiar)</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredAcademicRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No se encontraron registros que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredAcademicRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{rec.studentName}</div>
                        <div className="text-[11px] text-violet-400">{rec.subject}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-200">{rec.activityName}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 italic">
                          "{rec.tutorFeedback}"
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-black text-white">{rec.score}</span>
                        <span className="text-slate-500"> / 100</span>
                      </td>

                      <td className="px-6 py-4 font-bold text-violet-400">
                        +{rec.gemsEarned} 💎
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(rec.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                            rec.status === 'completado'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                              : rec.status === 'en_progreso'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                          title="Click para alternar estado"
                        >
                          {rec.status === 'completado' && <CheckCircle2 className="w-3 h-3" />}
                          {rec.status === 'en_progreso' && <Clock className="w-3 h-3" />}
                          {rec.status === 'pendiente_revision' && <AlertCircle className="w-3 h-3" />}
                          <span className="capitalize">{rec.status.replace('_', ' ')}</span>
                        </button>
                      </td>

                      <td className="px-6 py-4 text-slate-400">{rec.date}</td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(rec)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Editar registro"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(rec)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded-lg transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Billing & Invoices Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">No. Factura</th>
                  <th className="px-6 py-4">Cliente / Apoderado</th>
                  <th className="px-6 py-4">Monto Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Vencimiento</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-slate-200">{inv.clientName}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">${inv.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{inv.dueDate}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          const updated = invoices.map((i) =>
                            i.id === inv.id
                              ? { ...i, status: i.status === 'paid' ? ('sent' as const) : ('paid' as const) }
                              : i
                          );
                          onUpdateInvoices(updated);
                          onAddToast('Estado Factura', `Modificado a ${inv.status === 'paid' ? 'SENT' : 'PAID'}`, 'info');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                      >
                        Alternar Pago
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT RECORD MODAL WITH VALIDATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <span>{editingRecord ? 'Editar Registro Académico' : '+ Nuevo Registro de Sesión'}</span>
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre del Alumno / Explorador
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Materia</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Matemáticas">Matemáticas</option>
                    <option value="Lectura y Fonética">Lectura y Fonética</option>
                    <option value="Escritura y Trazos">Escritura y Trazos</option>
                    <option value="Ciencias Infantiles">Ciencias Infantiles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Puntaje (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre de la Actividad o Misión
                </label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Ej: Sumas con Objetos Espaciales"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Estado</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as 'completado' | 'en_progreso' | 'pendiente_revision')
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="completado">Completado</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="pendiente_revision">Pendiente Revisión</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Gemas Otorgadas
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={gemsEarned}
                    onChange={(e) => setGemsEarned(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Observaciones Pedagógicas del Tutor (Método Socrático)
                </label>
                <textarea
                  rows={3}
                  value={tutorFeedback}
                  onChange={(e) => setTutorFeedback(e.target.value)}
                  placeholder="Observaciones pedagógicas sobre el razonamiento del niño..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/30 transition-all"
                >
                  {editingRecord ? 'Guardar Cambios' : 'Registrar Sesión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white">¿Eliminar este registro?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Estás a punto de eliminar la actividad{' '}
              <strong className="text-white">"{recordToDelete.activityName}"</strong> de{' '}
              {recordToDelete.studentName}. Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
