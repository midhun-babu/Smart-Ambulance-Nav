import React from 'react';
import { Clock, MapPin, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmergenciesList({ requests }) {
    if (!requests || requests.length === 0) {
        return (
            <div className="p-4 text-center text-slate-400 text-xs italic bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                No emergency records yet.
            </div>
        );
    }

    // Sort by timestamp desc
    const sortedRequests = [...requests].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[350px] stylish-scrollbar pr-1">
            {sortedRequests.map((req) => (
                <div
                    key={req.id}
                    className={`p-3 rounded-lg border transition-all ${req.status === 'ASSIGNED' ? 'bg-blue-900/10 border-blue-500/30' :
                            req.status === 'COMPLETED' ? 'bg-emerald-900/10 border-emerald-500/20 opacity-70' :
                                'bg-slate-800/40 border-slate-700'
                        }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${req.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-400' :
                                req.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                                    'bg-slate-700 text-slate-400'
                            }`}>
                            {req.status}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock size={10} /> {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                        <AlertCircle size={12} className="text-red-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-200 capitalize">{req.case_type}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate">Lat: {req.start_lat.toFixed(4)}, Lon: {req.start_lon.toFixed(4)}</span>
                    </div>

                    {req.assigned_ambulance_id && (
                        <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-2 text-[10px] text-blue-400/80">
                            <Activity size={10} />
                            <span>Assigned: AMB-{req.assigned_ambulance_id.toString().padStart(3, '0')}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
