// src/components/StatusPanel.tsx
import { ZetaSummary } from '@/lib/types';

interface StatusPanelProps {
    status: ZetaSummary;
}

interface NetworkStatus {
    name: string;
    status: string;
    indicator: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
}

export function StatusPanel({ status }: StatusPanelProps) {
    console.log('Received status:', status); // Debug log

    // Ensure components is an array
    const components = Array.isArray(status?.components) ? status.components : [];

    // Extract mainnet and testnet status
    const getNetworkStatus = (networkName: string): NetworkStatus | undefined => {
        const component = components.find((c: ZetaSummary['components'][0]) =>
            c?.name?.toLowerCase().includes(networkName.toLowerCase())
        );

        if (component) {
            return {
                name: component.name,
                status: component.status.replace('_', ' '),
                indicator: component.status
            };
        }
        return undefined;
    };

    const mainnet = getNetworkStatus('mainnet');
    const testnet = getNetworkStatus('testnet');

    const getStatusColor = (status: NetworkStatus['indicator']) => {
        switch (status) {
            case 'operational': return 'bg-green-500';
            case 'degraded_performance': return 'bg-yellow-500';
            case 'partial_outage': return 'bg-orange-500';
            case 'major_outage': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    // Add error boundary
    if (!status || !status.status) {
        return (
            <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 text-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Status Unavailable</h2>
                    <p className="text-gray-400">Unable to load status information</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 text-white">
            {/* Overall Status */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">ZetaChain Status</h2>
                <div className={`px-3 py-1 rounded ${
                    status.status.indicator === 'none' ? 'bg-green-500' :
                        status.status.indicator === 'minor' ? 'bg-yellow-500' :
                            status.status.indicator === 'major' ? 'bg-orange-500' :
                                'bg-red-500'
                }`}>
                    {status.status.description}
                </div>
            </div>

            {/* Network Status Cards */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                {mainnet && (
                    <div className="bg-gray-800/80 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">Mainnet</h3>
                            <span className={`px-3 py-1 rounded ${getStatusColor(mainnet.indicator)}`}>
                {mainnet.status}
              </span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Last updated: {new Date(status.page.updated_at).toLocaleString()}
                        </p>
                    </div>
                )}

                {testnet && (
                    <div className="bg-gray-800/80 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">Testnet</h3>
                            <span className={`px-3 py-1 rounded ${getStatusColor(testnet.indicator)}`}>
                {testnet.status}
              </span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Last updated: {new Date(status.page.updated_at).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            {/* Active Incidents */}
            {Array.isArray(status.incidents) && status.incidents.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Active Incidents</h3>
                    <div className="space-y-4">
                        {status.incidents.map((incident: ZetaSummary['incidents'][0]) => (
                            <div key={incident.id} className="bg-gray-800/80 p-4 rounded">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">{incident.name}</h4>
                                    <span className={`px-2 py-1 rounded text-sm ${
                                        incident.impact === 'none' ? 'bg-gray-500' :
                                            incident.impact === 'minor' ? 'bg-yellow-500' :
                                                incident.impact === 'major' ? 'bg-orange-500' :
                                                    'bg-red-500'
                                    }`}>
                    {incident.status}
                  </span>
                                </div>
                                <div className="text-gray-400 text-sm mt-2 flex justify-between">
                                    <span>Created: {new Date(incident.created_at).toLocaleString()}</span>
                                    <span>Updated: {new Date(incident.updated_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Other Components */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Other Components</h3>
                <div className="grid grid-cols-2 gap-4">
                    {components
                        .filter((component: ZetaSummary['components'][0]) =>
                            !component?.name?.toLowerCase().includes('mainnet') &&
                            !component?.name?.toLowerCase().includes('testnet')
                        )
                        .map((component: ZetaSummary['components'][0]) => (
                            <div key={component.id} className="bg-gray-800/80 p-4 rounded">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{component.name}</h4>
                                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(component.status)}`}>
                    {component.status.replace('_', ' ')}
                  </span>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}