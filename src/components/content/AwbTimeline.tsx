// src/components/content/AwbTimeline.tsx
import React from "react";
import { AlertTriangle } from "lucide-react";

type Step = { key: string; label: string; sub?: string | null };

interface AwbTimelineProps {
  steps: Step[];
  proposedShippingDate?: string | null;
}

const AwbTimeline: React.FC<AwbTimelineProps> = ({ steps, proposedShippingDate }) => {
  return (
    <>
      <div className="flex items-center">
        {steps.map((s, idx) => {
          const active = Boolean(s.sub);
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ${active ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {idx + 1}
                </div>
                <div className="mt-1 text-[11px] font-medium text-center max-w-[110px] " title={s.label}>{s.label}</div>
                <div className="text-[10px] text-muted-foreground max-w-[100px] text-center truncate" title={s.sub || ''}>
                  {(() => {
                    const raw: any = s.sub;
                    if (!raw) return '—';
                    const str = String(raw).trim();
                    const pad = (n: number) => String(n).padStart(2, '0');
                    const parseParts = (v: string) => {
                      try {
                        // Pattern 1: DD.MM.YYYY[ HH:mm[:ss]]
                        const m1 = v.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:[ T](\d{2}):(\d{2})(?::\d{2})?)?$/);
                        if (m1) {
                          return { dd: m1[1], mm: m1[2], yyyy: m1[3], hh: m1[4] || undefined, min: m1[5] || undefined } as any;
                        }
                        // Pattern 2: YYYY-MM-DD[ T]HH:mm[:ss][timezone]
                        const m2 = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::\d{2})?(?:[Zz]|[+\-]\d{2}:?\d{2})?)?$/);
                        if (m2) {
                          return { dd: m2[3], mm: m2[2], yyyy: m2[1], hh: m2[4] || undefined, min: m2[5] || undefined } as any;
                        }
                        // Fallback: Date()
                        const d = new Date(v.replace(' ', 'T'));
                        if (!isNaN(d.getTime())) {
                          return { dd: pad(d.getDate()), mm: pad(d.getMonth() + 1), yyyy: String(d.getFullYear()), hh: pad(d.getHours()), min: pad(d.getMinutes()) } as any;
                        }
                      } catch {}
                      return null;
                    };
                    const p: any = parseParts(str);
                    if (!p) return str;
                    return (<><span className="font-semibold">{p.dd}.{p.mm}</span>.{p.yyyy}{p.hh ? `, ${p.hh}:${p.min}` : ''}</>);
                  })()}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${steps[idx + 1].sub ? 'bg-green-400' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Warning if pickup date is different from proposed shipping date */}
      {(() => {
        const proposed = proposedShippingDate;
        if (!proposed) return null;
        const pickupStep = steps.find(s => s.key === 'picked_up');
        const pickupDate = pickupStep?.sub;
        if (!pickupDate) return null;

        const parseDate = (dateStr: string) => {
          try {
            let date: Date;
            const m1 = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
            if (m1) {
              date = new Date(`${m1[3]}-${m1[2]}-${m1[1]}`);
            } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
              date = new Date(dateStr.substring(0, 10));
            } else {
              date = new Date(dateStr);
            }
            if (isNaN(date.getTime())) return null;
            return date.toISOString().split('T')[0];
          } catch {
            return null;
          }
        };

        const proposedDateStr = parseDate(proposed);
        const pickupDateStr = parseDate(String(pickupDate));
        if (!proposedDateStr || !pickupDateStr) return null;
        if (proposedDateStr !== pickupDateStr) {
          return (
            <div className="mt-3 p-2 border border-amber-500 bg-amber-50 rounded-md flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <strong>Atenție:</strong> Comanda a fost preluată de curier în data de <strong>{pickupDate}</strong>, diferit de data propusă clientului (<strong>{proposedShippingDate}</strong>).
              </div>
            </div>
          );
        }
        return null;
      })()}
    </>
  );
};

export default AwbTimeline;
