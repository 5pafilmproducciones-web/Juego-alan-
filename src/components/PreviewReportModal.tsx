import React, { useState } from 'react';
import { StudentProfile, LearningMission, AcademicRecord, Invoice } from '../types';
import {
  FileText,
  Printer,
  Download,
  X,
  Award,
  CheckCircle,
  Brain,
  Shield,
  Star,
  Sparkles,
} from 'lucide-react';

interface PreviewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  missions: LearningMission[];
  records: AcademicRecord[];
  invoice?: Invoice;
  onAddToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const PreviewReportModal: React.FC<PreviewReportModalProps> = ({
  isOpen,
  onClose,
  student,
  missions,
  records,
  invoice,
  onAddToast,
}) => {
  const [reportType, setReportType] = useState<'pedagogical' | 'invoice'>('pedagogical');

  if (!isOpen) return null;

  const completedMissions = missions.filter((m) => m.completed);
  const mathMissions = missions.filter((m) => m.subject === 'math');
  const readingMissions = missions.filter((m) => m.subject === 'reading');
  const tracingMissions = missions.filter((m) => m.subject === 'tracing');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const reportData = {
      titulo: 'Reporte Pedagógico Infantil - AventuraEduca',
      fechaGeneracion: new Date().toISOString(),
      alumno: student,
      misionesCompletadas: completedMissions.map((m) => ({
        titulo: m.title,
        materia: m.subject,
        gemas: m.gemReward,
      })),
      observacionesTutor:
        'El estudiante demuestra alta curiosidad y responde favorablemente al método socrático con preguntas de guía visual.',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_${student.name.replace(/\s+/g, '_')}_AventuraEduca.json`;
    a.click();
    URL.revokeObjectURL(url);

    onAddToast(
      'Reporte Descargado',
      'Se ha generado y descargado el archivo del reporte pedagógico',
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Vista Previa & Exportación de Reportes</h3>
              <p className="text-xs text-slate-400">
                Documento oficial pedagógico para padres, docentes y conciliación de tutorías
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher inside Modal */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-800/60 bg-slate-950/30">
          <button
            onClick={() => setReportType('pedagogical')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
              reportType === 'pedagogical'
                ? 'border-violet-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Reporte Pedagógico Semanal (Padres)
          </button>

          <button
            onClick={() => setReportType('invoice')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
              reportType === 'invoice'
                ? 'border-violet-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Factura de Tutoría Profesional (INV-2026-001)
          </button>
        </div>

        {/* Modal Body / Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin print:bg-white print:text-black">
          {reportType === 'pedagogical' ? (
            /* PEDAGOGICAL WEEKLY REPORT */
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-inner text-slate-200">
              {/* Document Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400">
                    AventuraEduca · Informe de Desarrollo Cognitivo
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Reporte Semanal de Aprendizaje Socrático
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generado para padres de: <strong className="text-white">{student.name}</strong> ({student.age} años)
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                  <span className="text-xs text-slate-400">Fecha de Corte:</span>
                  <div className="text-sm font-bold text-white">29 de Septiembre, 2026</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                    ✓ Verificado por Tutor Lumi (Gemini)
                  </div>
                </div>
              </div>

              {/* Cognitive Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Misiones</span>
                  <div className="text-lg font-black text-white mt-1">
                    {completedMissions.length} / {missions.length}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Tasa éxito 100%</span>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Gemas Ganadas</span>
                  <div className="text-lg font-black text-violet-400 mt-1">{student.gems} 💎</div>
                  <span className="text-[10px] text-slate-400">Por esfuerzo intelectual</span>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Racha Continua</span>
                  <div className="text-lg font-black text-amber-400 mt-1">{student.streakDays} días 🔥</div>
                  <span className="text-[10px] text-slate-400">Hábito consolidado</span>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pantalla Saludable</span>
                  <div className="text-lg font-black text-white mt-1">
                    {student.screenTimeUsedMinutes} min
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Bajo límite (20m)</span>
                </div>
              </div>

              {/* Pedagogical Observations */}
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/40 space-y-2">
                <h5 className="text-xs font-bold text-violet-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span>Observaciones del Tutor Socrático (Lumi)</span>
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "{student.name} ha demostrado una notable capacidad de deducción lógica. Cuando se enfrentó a
                  la suma de 3 + 2 manzanas, aprovechó la guía paso a paso sin frustrarse. En fonética,
                  reconoce con facilidad vocales abiertas (/A/). Se sugiere mantener la práctica de
                  tablas de multiplicar con soporte gráfico de flotas espaciales."
                </p>
              </div>

              {/* Explorer Certificate Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl">
                    🏆
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">
                      Diploma de Explorador Académico Nivel Bronce
                    </h5>
                    <p className="text-xs text-slate-300">
                      Otorgado a {student.name} por constancia y superación de retos de lectoescritura
                    </p>
                  </div>
                </div>
                <div className="text-2xl hidden sm:block">🌟 ⭐ 🌟</div>
              </div>
            </div>
          ) : (
            /* BILLING / INVOICE PREVIEW */
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-inner text-slate-200">
              <div className="flex justify-between items-start border-b border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400">
                    AventuraEduca Inc. · Factura de Servicios de Tutoría
                  </span>
                  <h4 className="text-2xl font-black text-white mt-1">INV-2026-001</h4>
                  <p className="text-xs text-slate-400">
                    Cliente: <strong>TechSoft Solutions</strong> (Carlos Gómez)
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    PAGADO
                  </span>
                  <p className="text-xs text-slate-400 mt-2">Fecha: 2026-08-01</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2">Descripción</th>
                      <th className="py-2 text-center">Cant.</th>
                      <th className="py-2 text-right">Precio Unit.</th>
                      <th className="py-2 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-3 font-medium text-white">
                        Integración API Stripe y Middleware de Pagos Escolares
                      </td>
                      <td className="py-3 text-center">4 hrs</td>
                      <td className="py-3 text-right">$80.00</td>
                      <td className="py-3 text-right font-bold text-white">$320.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="text-white">$320.00</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IVA (16%):</span>
                    <span className="text-white">$51.20</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-800">
                    <span>Total:</span>
                    <span className="text-emerald-400">$371.20 USD</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Reporte JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
