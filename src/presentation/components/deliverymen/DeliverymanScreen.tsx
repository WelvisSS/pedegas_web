import { useEffect, useState, type ReactElement } from 'react';
import { GasStationService } from '../../../application/services/GasStationService';
import { GasStation } from '../../../domain/entities/GasStation';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useDeliverymen, type Deliveryman, type Permission } from '../../hooks';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Sidebar from '../ui/Sidebar';

interface DeliverymanScreenProps {
    onNavigate?: (screen: string) => void;
    activeScreen?: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
    email?: string;
    cpf?: string;
    gasStationId?: string;
}

interface FormData {
    name: string;
    phone: string;
    email: string;
    cpf: string;
    gasStationId: string;
}

const DeliverymanScreen = ({ onNavigate, activeScreen = 'deliverymen' }: DeliverymanScreenProps) => {
    const { user, signOut } = useAuth();
    const [selectedGasStationId, setSelectedGasStationId] = useState<string | null>(null);
    const [gasStationService] = useState(() => new GasStationService(supabase));
    const {
        deliverymen,
        loading,
        error,
        createDeliveryman,
        updateDeliveryman,
        activateDeliveryman,
        deactivateDeliveryman,
        updatePermissions,
        getAvailablePermissions
    } = useDeliverymen(selectedGasStationId);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedDeliveryman, setSelectedDeliveryman] = useState<Deliveryman | null>(null);
    const [gasStations, setGasStations] = useState<GasStation[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        cpf: '',
        gasStationId: ''
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading2, setLoading2] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => setIsMobile(window.innerWidth < 1024);
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleMenuToggle = () => isMobile ? setSidebarOpen(!sidebarOpen) : setSidebarCollapsed(!sidebarCollapsed);
    const handleSignOut = async () => {
        try {
            setLoading2(true);
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setLoading2(false);
        }
    };

    useEffect(() => {
        const loadGasStations = async () => {
            try {
                if (user?.id) {
                    const stations = await gasStationService.getGasStationsByUserId(user.id);
                    setGasStations(stations);
                    if (stations.length > 0) setSelectedGasStationId(stations[0].id ?? null);
                }
            } catch (error) {
                console.error('Error loading gas stations:', error);
            }
        };
        loadGasStations();
    }, [user, gasStationService]);

    const handleCreateDeliveryman = async () => {
        try {
            setFormErrors({});
            if (!formData.name.trim()) {
                setFormErrors((prev: FormErrors) => ({ ...prev, name: 'Nome é obrigatório' }));
                return;
            }
            if (!formData.phone.trim()) {
                setFormErrors((prev: FormErrors) => ({ ...prev, phone: 'Telefone é obrigatório' }));
                return;
            }
            if (!formData.email.trim()) {
                setFormErrors((prev: FormErrors) => ({ ...prev, email: 'Email é obrigatório' }));
                return;
            }
            if (!formData.cpf.trim()) {
                setFormErrors((prev: FormErrors) => ({ ...prev, cpf: 'CPF é obrigatório' }));
                return;
            }
            if (!formData.gasStationId) {
                setFormErrors((prev: FormErrors) => ({ ...prev, gasStationId: 'Posto é obrigatório' }));
                return;
            }
            await createDeliveryman({
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                cpf: formData.cpf.replace(/\D/g, ''),
                gasStationId: formData.gasStationId,
                permissions: []
            });
            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            console.error('Error creating deliveryman:', err);
        }
    };

    const handleEditDeliveryman = async () => {
        try {
            setFormErrors({});
            if (!formData.name.trim()) {
                setFormErrors((prev: FormErrors) => ({ ...prev, name: 'Nome é obrigatório' }));
                return;
            }
            if (!selectedDeliveryman || !selectedDeliveryman.id) return;
            await updateDeliveryman(selectedDeliveryman.id, {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                cpf: formData.cpf.replace(/\D/g, '')
            });
            setShowEditModal(false);
            setSelectedDeliveryman(null);
            resetForm();
        } catch (err) {
            console.error('Error updating deliveryman:', err);
        }
    };

    const handleToggleStatus = async (deliveryman: Deliveryman) => {
        try {
            if (!deliveryman.id) {
                console.error('Deliveryman ID is missing');
                return;
            }
            
            if (deliveryman.active) {
                await deactivateDeliveryman(deliveryman.id);
            } else {
                await activateDeliveryman(deliveryman.id);
            }
        } catch (err) {
            console.error('Error toggling deliveryman status:', err);
        }
    };

    const handleUpdatePermissions = async () => {
        try {
            if (!selectedDeliveryman || !selectedDeliveryman.id) return;
            await updatePermissions(selectedDeliveryman.id, selectedPermissions);
            setShowPermissionsModal(false);
            setSelectedDeliveryman(null);
            setSelectedPermissions([]);
        } catch (err) {
            console.error('Error updating permissions:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            cpf: '',
            gasStationId: selectedGasStationId || ''
        });
        setFormErrors({});
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const openEditModal = (deliveryman: Deliveryman) => {
        setSelectedDeliveryman(deliveryman);
        setFormData({
            name: deliveryman.name,
            phone: deliveryman.phone,
            email: deliveryman.email,
            cpf: deliveryman.cpf,
            gasStationId: deliveryman.gasStationId ?? ''
        });
        setShowEditModal(true);
    };

    const openPermissionsModal = (deliveryman: Deliveryman) => {
        setSelectedDeliveryman(deliveryman);
        setSelectedPermissions(deliveryman.permissions || []);
        setShowPermissionsModal(true);
    };

    const formatCpf = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    const formatPhone = (phone: string) => phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');

    const getPermissionIcon = (permissionKey: string) => {
        const icons: Record<string, ReactElement> = {
            'view_orders': <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
            'update_deliveries': <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            'manage_invoices': <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
            'view_customers': <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>,
            'access_reports': <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        };
        return icons[permissionKey] || <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
    };

    const getPermissionDescription = (permissionKey: string) => {
        const descriptions: Record<string, string> = {
            'view_orders': 'Permite visualizar todos os pedidos do posto',
            'update_deliveries': 'Permite atualizar status e informações de entregas',
            'manage_invoices': 'Permite criar, editar e gerenciar notas fiscais',
            'view_customers': 'Permite acessar informações dos clientes',
            'access_reports': 'Permite visualizar relatórios e estatísticas'
        };
        return descriptions[permissionKey] || 'Permissão personalizada';
    };

    return (
        <div className="min-h-screen bg-secondary-50">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userType={user?.userType || 'individual'}
                onNavigate={(screen) => {
                    if (onNavigate) onNavigate(screen);
                    if (isMobile) setSidebarOpen(false);
                }}
                activeScreen={activeScreen}
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
                <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-40">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <button onClick={handleMenuToggle} className="lg:hidden p-2 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 mr-2" title={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                </button>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-secondary-600">
                                    Olá, <span className="font-medium text-secondary-900">{user?.name || user?.email}</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleSignOut} loading={loading2}>Sair</Button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Entregadores</h1>
                                <p className="text-gray-600 mt-1">Gerencie os entregadores do seu posto</p>
                            </div>
                            <Button onClick={openCreateModal}>Adicionar Entregador</Button>
                        </div>

                        {gasStations.length > 1 && (
                            <Card className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <label className="font-medium text-gray-700 whitespace-nowrap">Filtrar por posto:</label>
                                    <div className="flex-1 min-w-0">
                                        <select value={selectedGasStationId || ''} onChange={(e) => setSelectedGasStationId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 shadow-sm">
                                            <option value="">Todos os postos</option>
                                            {gasStations.map((station) => (
                                                <option key={station.id} value={station.id}>{station.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {error && <Alert type="error" message={error} />}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, index) => (
                                    <Card key={index} className="p-6 animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                                        <div className="h-8 bg-gray-200 rounded"></div>
                                    </Card>
                                ))
                            ) : deliverymen.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500 text-lg">Nenhum entregador encontrado</p>
                                    <Button onClick={openCreateModal} className="mt-4">Adicionar Primeiro Entregador</Button>
                                </div>
                            ) : (
                                deliverymen.map((deliveryman: Deliveryman) => (
                                    <Card key={deliveryman.id} className="p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${deliveryman.active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-gray-900 text-lg">{deliveryman.name}</h3>
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${deliveryman.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        <div className={`w-2 h-2 rounded-full ${deliveryman.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                        {deliveryman.active ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        {formatPhone(deliveryman.phone)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                        {deliveryman.email}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                                        CPF: {formatCpf(deliveryman.cpf)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openEditModal(deliveryman)} className="flex-1">Editar</Button>
                                                <Button variant="outline" size="sm" onClick={() => openPermissionsModal(deliveryman)} className="flex-1">Permissões</Button>
                                            </div>
                                            <Button variant={deliveryman.active ? "outline" : "primary"} size="sm" onClick={() => handleToggleStatus(deliveryman)} className="w-full">
                                                {deliveryman.active ? 'Desativar' : 'Ativar'}
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>

                        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Adicionar Novo Entregador">
                            <div className="space-y-8 p-1">
                                <div className="text-center pb-6 border-b border-gray-100">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <p className="text-gray-600 text-sm">Preencha as informações do novo entregador</p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
                                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        Informações Pessoais
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Nome Completo" type="text" value={formData.name} onChange={(e) => setFormData((prev: FormData) => ({ ...prev, name: e.target.value }))} error={formErrors.name} placeholder="Digite o nome completo" required className="px-4 py-3 text-base" />
                                        <Input label="CPF" type="text" value={formData.cpf} onChange={(e) => setFormData((prev: FormData) => ({ ...prev, cpf: e.target.value }))} error={formErrors.cpf} placeholder="000.000.000-00" required className="px-4 py-3 text-base" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
                                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        Informações de Contato
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Telefone" type="tel" value={formData.phone} onChange={(e) => setFormData((prev: FormData) => ({ ...prev, phone: e.target.value }))} error={formErrors.phone} placeholder="(11) 99999-9999" required className="px-4 py-3 text-base" />
                                        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData((prev: FormData) => ({ ...prev, email: e.target.value }))} error={formErrors.email} placeholder="email@exemplo.com" required className="px-4 py-3 text-base" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
                                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        Posto de Trabalho
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Posto de Gasolina *</label>
                                        <select value={formData.gasStationId} onChange={(e) => setFormData((prev: FormData) => ({ ...prev, gasStationId: e.target.value }))} className={`w-full border rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${formErrors.gasStationId ? 'border-red-500 ring-red-200' : 'border-gray-300'}`}>
                                            <option value="">Selecione um posto</option>
                                            {gasStations.map((station) => (<option key={station.id} value={station.id}>{station.name}</option>))}
                                        </select>
                                        {formErrors.gasStationId && (<p className="text-red-500 text-sm mt-3 flex items-center"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{formErrors.gasStationId}</p>)}
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-8 border-t border-gray-100">
                                    <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 text-base">Cancelar</Button>
                                    <Button onClick={handleCreateDeliveryman} disabled={loading} className="flex-1 py-4 text-base bg-blue-600 hover:bg-blue-700">{loading ? <div className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Criando...</div> : 'Criar Entregador'}</Button>
                                </div>
                            </div>
                        </Modal>

                        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Entregador">
                            <div className="space-y-6 p-2">
                                <div className="text-center pb-6 border-b border-gray-100">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </div>
                                    <p className="text-gray-600 text-sm">Edite as informações do entregador</p>
                                </div>
                                <div className="space-y-8 px-1">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
                                            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Informações Pessoais
                                        </h3>
                                        <Input label="Nome Completo" type="text" value={formData.name} onChange={(e) => setFormData((prev: FormData) => ({ ...prev, name: e.target.value }))} error={formErrors.name} placeholder="Nome completo do entregador" className="px-4 py-3 text-base" />
                                        <div className="relative">
                                            <Input label="CPF" type="text" value={formData.cpf} onChange={(e) => setFormData((prev: FormData) => ({ ...prev, cpf: e.target.value }))} error={formErrors.cpf} placeholder="000.000.000-00" disabled className="px-4 py-3 text-base bg-gray-50" />
                                            <p className="text-xs text-gray-500 mt-2 flex items-center"><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>CPF não pode ser alterado após o cadastro</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
                                            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            Informações de Contato
                                        </h3>
                                        <Input label="Telefone" type="tel" value={formData.phone} onChange={(e) => setFormData((prev: FormData) => ({ ...prev, phone: e.target.value }))} error={formErrors.phone} placeholder="(11) 99999-9999" className="px-4 py-3 text-base" />
                                        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData((prev: FormData) => ({ ...prev, email: e.target.value }))} error={formErrors.email} placeholder="email@exemplo.com" className="px-4 py-3 text-base" />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-8 border-t border-gray-100 px-1">
                                    <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 py-3">Cancelar</Button>
                                    <Button onClick={handleEditDeliveryman} disabled={loading} className="flex-1 py-3 bg-orange-600 hover:bg-orange-700">{loading ? 'Salvando...' : 'Salvar Alterações'}</Button>
                                </div>
                            </div>
                        </Modal>

                        <Modal isOpen={showPermissionsModal} onClose={() => setShowPermissionsModal(false)} title="Gerenciar Permissões">
                            <div className="space-y-6 p-2">
                                <div className="text-center pb-6 border-b border-gray-100">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <p className="text-gray-600 text-sm">Defina as permissões para <strong>{selectedDeliveryman?.name}</strong></p>
                                </div>
                                <div className="space-y-5 px-1">
                                    {getAvailablePermissions().map((permission: Permission) => (
                                        <label key={permission.key} className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer group">
                                            <input type="checkbox" checked={selectedPermissions.includes(permission.key)} onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedPermissions((prev: string[]) => [...prev, permission.key]);
                                                } else {
                                                    setSelectedPermissions((prev: string[]) => prev.filter((p: string) => p !== permission.key));
                                                }
                                            }} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                                            <div className="flex items-center ml-4">
                                                <div className="flex-shrink-0 mr-3">{getPermissionIcon(permission.key)}</div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">{permission.label}</span>
                                                    <p className="text-xs text-gray-500 mt-1">{getPermissionDescription(permission.key)}</p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-4 pt-8 border-t border-gray-100 px-1">
                                    <Button variant="outline" onClick={() => setShowPermissionsModal(false)} className="flex-1 py-3">Cancelar</Button>
                                    <Button onClick={handleUpdatePermissions} disabled={loading} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700">{loading ? 'Salvando...' : 'Salvar Permissões'}</Button>
                                </div>
                            </div>
                        </Modal>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DeliverymanScreen;
