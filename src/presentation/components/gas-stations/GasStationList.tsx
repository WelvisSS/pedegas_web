import { GasStation } from '../../../domain/entities/GasStation';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface GasStationListProps {
    gasStations: GasStation[];
    onEdit: (gasStation: GasStation) => void;
    onDelete: (gasStationId: string) => void;
    onToggleStatus: (gasStationId: string) => void;
    loading: boolean;
}

/**
 * Gas Station List Component
 * Component for displaying gas stations in a list
 * Following Single Responsibility Principle
 */
const GasStationList = ({ gasStations, onEdit, onDelete, onToggleStatus, loading }: GasStationListProps) => {
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getStatusColor = (isActive: boolean): string => {
        return isActive
            ? 'text-green-600 bg-green-100'
            : 'text-red-600 bg-red-100';
    };

    const getStatusText = (isActive: boolean): string => {
        return isActive ? 'Ativo' : 'Inativo';
    };

    const getStorageTypeText = (storageType: string): string => {
        const types: Record<string, string> = {
            'underground': 'Subterrâneo',
            'above_ground': 'Superfície',
            'mobile': 'Móvel'
        };
        return types[storageType] || storageType;
    };

    if (gasStations.length === 0) {
        return (
            <Card>
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">
                        Nenhum ponto de venda cadastrado
                    </h3>
                    <p className="text-secondary-600">
                        Comece criando seu primeiro ponto de venda para distribuição de gás.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gasStations.map((station) => (
                <Card key={station.id} className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                                    {station.name}
                                </h3>
                                <p className="text-sm text-secondary-600">
                                    {station.fullAddress}
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.isActive)}`}>
                                {getStatusText(station.isActive)}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                            {station.cnpj && (
                                <div className="flex items-center text-sm text-secondary-600">
                                    <svg className="w-4 h-4 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    CNPJ: {station.cnpj}
                                </div>
                            )}

                            {station.phone && (
                                <div className="flex items-center text-sm text-secondary-600">
                                    <svg className="w-4 h-4 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {station.phone}
                                </div>
                            )}

                            {station.capacityLiters && (
                                <div className="flex items-center text-sm text-secondary-600">
                                    <svg className="w-4 h-4 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Capacidade: {station.capacityLiters.toLocaleString()}L
                                </div>
                            )}

                            {station.storageType && (
                                <div className="flex items-center text-sm text-secondary-600">
                                    <svg className="w-4 h-4 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Armazenamento: {getStorageTypeText(station.storageType)}
                                </div>
                            )}

                            {station.licenseExpiry && (
                                <div className="flex items-center text-sm text-secondary-600">
                                    <svg className="w-4 h-4 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Licença vence: {formatDate(station.licenseExpiry)}
                                    {station.isLicenseExpired && (
                                        <span className="ml-2 text-red-600 font-medium">(Expirada)</span>
                                    )}
                                    {station.isLicenseExpiringSoon && !station.isLicenseExpired && (
                                        <span className="ml-2 text-yellow-600 font-medium">(Expira em breve)</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Services */}
                        {station.services && station.services.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs font-medium text-secondary-500 mb-1">Serviços:</p>
                                <p className="text-sm text-secondary-600">{station.servicesFormatted}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 border-t border-secondary-200">
                            <div className="flex flex-wrap gap-2 sm:justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(station)}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none min-w-0"
                                >
                                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span className="truncate">Editar</span>
                                </Button>

                                <Button
                                    variant={station.isActive ? "outline" : "primary"}
                                    size="sm"
                                    onClick={() => station.id && onToggleStatus(station.id)}
                                    disabled={loading || !station.id}
                                    className="flex-1 sm:flex-none min-w-0"
                                >
                                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {station.isActive ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        )}
                                    </svg>
                                    <span className="truncate">
                                        <span className="sm:hidden">{station.isActive ? 'Desat.' : 'Ativ.'}</span>
                                        <span className="hidden sm:inline">{station.isActive ? 'Desativar' : 'Ativar'}</span>
                                    </span>
                                </Button>

                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => station.id && onDelete(station.id)}
                                    disabled={loading || !station.id}
                                    className="flex-1 sm:flex-none min-w-0"
                                >
                                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="truncate">Excluir</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default GasStationList;
