# Auth Context - Clean Architecture

Esta implementação segue os princípios da **Clean Architecture** e **SOLID**, garantindo código testável, manutenível e escalável.

## Estrutura de Camadas

```
src/
├── domain/                    # Camada de Domínio (Regras de Negócio)
│   ├── entities/             # Entidades do domínio
│   │   └── AuthSession.ts
│   ├── repositories/         # Interfaces dos repositórios
│   │   ├── AuthRepository.ts
│   │   ├── UserRepository.ts
│   │   └── CompanyRepository.ts
│   └── usecases/            # Casos de uso (lógica de negócio)
│       ├── SignInUseCase.ts
│       ├── SignUpUseCase.ts
│       └── ResetPasswordUseCase.ts
│
├── application/              # Camada de Aplicação (Orquestração)
│   └── services/
│       └── AuthService.ts   # Orquestra os casos de uso
│
├── infrastructure/           # Camada de Infraestrutura (Implementações)
│   └── repositories/
│       ├── SupabaseAuthRepository.ts
│       ├── SupabaseUserRepository.ts
│       └── SupabaseCompanyRepository.ts
│
├── presentation/            # Camada de Apresentação (UI)
│   └── contexts/
│       └── AuthContext.tsx  # Context do React
│
└── lib/                     # Configurações externas
    └── supabaseClient.ts
```

## Princípios Aplicados

### 1. **Dependency Inversion Principle (DIP)**
- As camadas superiores não dependem das inferiores
- Repositórios são interfaces abstratas no domínio
- Implementações concretas (Supabase) na infraestrutura

### 2. **Single Responsibility Principle (SRP)**
- Cada Use Case tem uma única responsabilidade
- SignInUseCase: apenas login
- SignUpUseCase: apenas registro
- ResetPasswordUseCase: apenas reset de senha

### 3. **Dependency Injection**
- AuthService recebe repositórios via construtor
- Facilita testes e troca de implementações

## Como Usar

### 1. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Preencha com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Envolva sua aplicação com o AuthProvider

```tsx
import { AuthProvider } from './presentation/contexts';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

### 3. Use o hook useAuth em seus componentes

```tsx
import { useAuth } from './presentation/contexts';

function LoginPage() {
  const { signIn, loading, user } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // seu JSX
  );
}
```

## API do useAuth

```typescript
interface AuthContextType {
  user: any;                    // Usuário autenticado
  session: any;                 // Sessão atual
  loading: boolean;             // Estado de carregamento
  signIn: (email, password) => Promise<any>;
  signUp: (userData) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email) => Promise<any>;
  isAuthenticated: boolean;     // Se está autenticado
}
```

## Benefícios desta Arquitetura

1. **Testabilidade**: Fácil criar mocks dos repositórios
2. **Manutenibilidade**: Mudanças isoladas em cada camada
3. **Escalabilidade**: Adicionar novos casos de uso sem afetar existentes
4. **Flexibilidade**: Trocar Supabase por outro provider facilmente
5. **Separação de Responsabilidades**: Cada classe tem um propósito claro

## Exemplo de Teste

```typescript
// Exemplo de como testar SignInUseCase
const mockAuthRepository = {
  signIn: jest.fn(),
  // ... outros métodos
};

const signInUseCase = new SignInUseCase(mockAuthRepository);

test('should sign in successfully', async () => {
  mockAuthRepository.signIn.mockResolvedValue(mockSession);
  
  const result = await signInUseCase.execute('test@test.com', 'password');
  
  expect(result.success).toBe(true);
});
```
