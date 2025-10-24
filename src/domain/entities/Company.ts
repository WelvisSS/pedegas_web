interface CompanyProps {
    id?: string;
    name: string;
    cnpj: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface CompanyJson {
    id?: string;
    name: string;
    cnpj: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    created_at?: string;
    updated_at?: string;
}

export class Company {
    id?: string;
    name: string;
    cnpj: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor({
        id,
        name,
        cnpj,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        createdAt,
        updatedAt
    }: CompanyProps) {
        this.id = id;
        this.name = name;
        this.cnpj = cnpj;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    get formattedCnpj(): string {
        if (!this.cnpj) return '';
        return this.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    get isComplete(): boolean {
        return !!(this.name && this.email && this.cnpj);
    }

    static fromJson(json: CompanyJson): Company {
        return new Company({
            id: json.id,
            name: json.name,
            cnpj: json.cnpj,
            email: json.email,
            phone: json.phone,
            address: json.address,
            city: json.city,
            state: json.state,
            zipCode: json.zip_code,
            createdAt: json.created_at,
            updatedAt: json.updated_at
        });
    }

    toJson(): CompanyJson {
        return {
            id: this.id,
            name: this.name,
            cnpj: this.cnpj,
            email: this.email,
            phone: this.phone,
            address: this.address,
            city: this.city,
            state: this.state,
            zip_code: this.zipCode,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }
}
