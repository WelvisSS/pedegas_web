/**
 * Sidebar Component
 * Reusable sidebar navigation component with toggle functionality
 * Following Single Responsibility Principle
 */
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  userType?: 'individual' | 'company';
  onNavigate?: (screen: string) => void;
  activeScreen?: string;
}

const Sidebar = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggle,
  userType = 'individual',
  onNavigate,
  activeScreen = 'dashboard',
}: SidebarProps) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`
                fixed top-0 left-0 h-screen bg-white shadow-lg transform transition-all duration-300 ease-in-out z-50 flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:shadow-lg
                ${isCollapsed ? 'w-16' : 'w-64'}
            `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-secondary-900">PedeGás</h2>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle button for desktop */}
            <button
              onClick={onToggle}
              className="hidden lg:block p-1 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100"
              title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
                />
              </svg>
            </button>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 flex flex-col">
          {/* Menu Items - Top */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {userType === 'individual' ? (
                /* Menu para Pessoa Física - Desempenho e Pedidos */
                <>
                  <button
                    onClick={() => onNavigate && onNavigate('dashboard')}
                    className={`
                                            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            ${
                                              activeScreen === 'dashboard'
                                                ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                                                : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100'
                                            }
                                        `}
                    title={isCollapsed ? 'Desempenho' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Desempenho</span>}
                  </button>

                  {/* Pedidos Menu Item - Apenas para Pessoa Física */}
                  <button
                    onClick={() => onNavigate && onNavigate('orders')}
                    className={`
                                            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            ${
                                              activeScreen === 'orders'
                                                ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                                                : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100'
                                            }
                                        `}
                    title={isCollapsed ? 'Pedidos' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Pedidos</span>}
                  </button>
                </>
              ) : (
                /* Menu para Pessoa Jurídica - Todas as opções */
                <>
                  {/* Desempenho Menu Item */}
                  <button
                    onClick={() => onNavigate && onNavigate('dashboard')}
                    className={`
                                            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            ${
                                              activeScreen === 'dashboard'
                                                ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                                                : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100'
                                            }
                                        `}
                    title={isCollapsed ? 'Desempenho' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Desempenho</span>}
                  </button>

                  {/* Pontos de Venda Menu Item */}
                  <button
                    onClick={() => onNavigate && onNavigate('gas-stations')}
                    className={`
                                            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            ${
                                              activeScreen === 'gas-stations'
                                                ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                                                : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100'
                                            }
                                        `}
                    title={isCollapsed ? 'Pontos de Venda' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Pontos de Venda</span>}
                  </button>

                  {/* Gerenciar Estoque Menu Item */}
                  <button
                    onClick={() => onNavigate && onNavigate('inventory')}
                    className={`
                                            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            ${
                                              activeScreen === 'inventory'
                                                ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                                                : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100'
                                            }
                                        `}
                    title={isCollapsed ? 'Gerenciar Estoque' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Gerenciar Estoque</span>}
                  </button>

                  {/* Entregas Menu Item */}
                  <button
                    onClick={() => onNavigate && onNavigate('deliveries')}
                    className={`
                                            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            ${
                                              activeScreen === 'deliveries'
                                                ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                                                : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100'
                                            }
                                        `}
                    title={isCollapsed ? 'Entregas' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Entregas</span>}
                  </button>

                  {/* Entregadores Menu Item */}
                  <button
                    onClick={() => onNavigate && onNavigate('deliverymen')}
                    className={`
                                            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            ${
                                              activeScreen === 'deliverymen'
                                                ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                                                : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100'
                                            }
                                        `}
                    title={isCollapsed ? 'Entregadores' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Entregadores</span>}
                  </button>

                  {/* Notificações Menu Item */}
                  <button
                    className={`
                                            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100
                                        `}
                    title={isCollapsed ? 'Notificações' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4 7h8l-2 2H6l-2-2z"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Notificações</span>}
                  </button>

                  {/* Assinatura Menu Item */}
                  <button
                    onClick={() => onNavigate && onNavigate('subscription')}
                    className={`
                                            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            ${
                                              activeScreen === 'subscription'
                                                ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                                                : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100'
                                            }
                                        `}
                    title={isCollapsed ? 'Assinatura' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Assinatura</span>}
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-secondary-200">
          {!isCollapsed && <div className="text-xs text-secondary-400 text-center">v1.0.0</div>}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
