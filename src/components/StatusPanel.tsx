
// src/components/StatusPanel.tsx
import { ZetaStatus } from '@/lib/types';

export function StatusPanel({ status }: { status: ZetaStatus }) {
    return (
        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">System Status</h2>
                <div className={`px-3 py-1 rounded ${
                    status.status.indicator === 'none' ? 'bg-green-500' :
                        status.status.indicator === 'minor' ? 'bg-yellow-500' :
                            status.status.indicator === 'major' ? 'bg-orange-500' :
                                'bg-red-500'
                }`}>
                    {status.status.description}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {status.components.map(component => (
                    <div key={component.name} className="bg-gray-800/80 p-4 rounded">
                        <h3>{component.name}</h3>
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                            component.status === 'operational' ? 'bg-green-500' :
                                component.status === 'degraded_performance' ? 'bg-yellow-500' :
                                    component.status === 'partial_outage' ? 'bg-orange-500' :
                                        'bg-red-500'
                        }`}>
              {component.status.replace('_', ' ')}
            </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
