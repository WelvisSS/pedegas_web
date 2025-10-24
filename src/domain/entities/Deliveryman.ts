interface DeliverymanProps {
    id?: string;
    name: string;
    phone: string;
    email: string;
    cpf: string;
    active?: boolean;
    permissions?: string[];
    gasStationId?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface DeliverymanDbRow {
    id?: string;
    name: string;
    phone: string;
    email: string;
    cpf: string;
    active: boolean;
    permissions: string | string[];
    gas_station_id?: string;
    created_at?: string;
    updated_at?: string;
}

class Deliveryman {
    id?: string;
    name: string;
    phone: string;
    email: string;
    cpf: string;
    active: boolean;
    permissions: string[];
    gasStationId?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor({
        id,
        name,
        phone,
        email,
        cpf,
        active = true,
        permissions = [],
        gasStationId,
        createdAt,
        updatedAt
    }: DeliverymanProps) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.cpf = cpf;
        this.active = active;
        this.permissions = permissions; // Array of permissions like ['view_orders', 'update_deliveries', 'manage_invoices']
        this.gasStationId = gasStationId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static fromDatabase(row: DeliverymanDbRow | null): Deliveryman | null {
        if (!row) return null;

        return new Deliveryman({
            id: row.id,
            name: row.name,
            phone: row.phone,
            email: row.email,
            cpf: row.cpf,
            active: row.active,
            permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || []),
            gasStationId: row.gas_station_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    toDatabase(): DeliverymanDbRow {
        return {
            id: this.id,
            name: this.name,
            phone: this.phone,
            email: this.email,
            cpf: this.cpf,
            active: this.active,
            permissions: JSON.stringify(this.permissions),
            gas_station_id: this.gasStationId,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }

    validate(): string[] {
        const errors: string[] = [];

        if (!this.name || this.name.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }

        if (!this.phone || this.phone.length < 10) {
            errors.push('Telefone deve ter pelo menos 10 dígitos');
        }

        if (!this.email || !this.email.includes('@')) {
            errors.push('Email deve ser válido');
        }

        if (!this.cpf || this.cpf.length !== 11) {
            errors.push('CPF deve ter 11 dígitos');
        }

        if (!this.gasStationId) {
            errors.push('Posto de gasolina é obrigatório');
        }

        return errors;
    }

    hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

    addPermission(permission: string): void {
        if (!this.permissions.includes(permission)) {
            this.permissions.push(permission);
        }
    }

    removePermission(permission: string): void {
        this.permissions = this.permissions.filter(p => p !== permission);
    }

    isActive(): boolean {
        return this.active;
    }

    activate(): void {
        this.active = true;
        this.updatedAt = new Date().toISOString();
    }

    deactivate(): void {
        this.active = false;
        this.updatedAt = new Date().toISOString();
    }
}

export default Deliveryman;
