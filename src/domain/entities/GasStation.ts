interface OperatingHours {
    [key: string]: {
        open: string;
        close: string;
    };
}

interface Coordinates {
    lat?: number;
    lng?: number;
}

interface GasStationProps {
    id?: string;
    userId: string;
    name: string;
    cnpj?: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    capacityLiters?: number;
    storageType?: string;
    licenseNumber?: string;
    licenseExpiry?: string;
    operatingHours?: OperatingHours;
    services?: string[];
    paymentMethods?: string[];
    coordinates?: Coordinates;
    isActive?: boolean;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface GasStationJson {
    id?: string;
    user_id: string;
    name: string;
    cnpj?: string;
    address: string;
    city: string;
    state: string;
    zip_code?: string;
    phone?: string;
    email?: string;
    contact_person?: string;
    capacity_liters?: number;
    storage_type?: string;
    license_number?: string;
    license_expiry?: string;
    operating_hours?: OperatingHours;
    services?: string[];
    payment_methods?: string[];
    coordinates?: Coordinates;
    is_active?: boolean;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export class GasStation {
    id?: string;
    userId: string;
    name: string;
    cnpj?: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    capacityLiters?: number;
    storageType?: string;
    licenseNumber?: string;
    licenseExpiry?: string;
    operatingHours: OperatingHours;
    services: string[];
    paymentMethods: string[];
    coordinates: Coordinates;
    isActive: boolean;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor({
        id,
        userId,
        name,
        cnpj,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        contactPerson,
        capacityLiters,
        storageType,
        licenseNumber,
        licenseExpiry,
        operatingHours,
        services,
        paymentMethods,
        coordinates,
        isActive = true,
        notes,
        createdAt,
        updatedAt
    }: GasStationProps) {
        this.id = id || '';
        this.userId = userId;
        this.name = name;
        this.cnpj = cnpj;
        this.address = address;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.phone = phone;
        this.email = email;
        this.contactPerson = contactPerson;
        this.capacityLiters = capacityLiters;
        this.storageType = storageType; // underground, above_ground, mobile
        this.licenseNumber = licenseNumber;
        this.licenseExpiry = licenseExpiry;
        this.operatingHours = operatingHours || {};
        this.services = services || [];
        this.paymentMethods = paymentMethods || [];
        this.coordinates = coordinates || {};
        this.isActive = isActive;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    get fullAddress(): string {
        return `${this.address}, ${this.city} - ${this.state}, ${this.zipCode}`;
    }

    get isLicenseExpired(): boolean {
        if (!this.licenseExpiry) return false;
        return new Date() > new Date(this.licenseExpiry);
    }

    get isLicenseExpiringSoon(): boolean {
        if (!this.licenseExpiry) return false;
        const expiryDate = new Date(this.licenseExpiry);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }

    get hasCoordinates(): boolean {
        return !!(this.coordinates && this.coordinates.lat && this.coordinates.lng);
    }

    get operatingHoursFormatted(): string {
        if (!this.operatingHours || Object.keys(this.operatingHours).length === 0) {
            return 'Não informado';
        }

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames: Record<string, string> = {
            monday: 'Segunda',
            tuesday: 'Terça',
            wednesday: 'Quarta',
            thursday: 'Quinta',
            friday: 'Sexta',
            saturday: 'Sábado',
            sunday: 'Domingo'
        };

        return days
            .filter(day => this.operatingHours[day])
            .map(day => {
                const hours = this.operatingHours[day];
                return `${dayNames[day]}: ${hours.open} - ${hours.close}`;
            })
            .join(', ');
    }

    get servicesFormatted(): string {
        if (!this.services || this.services.length === 0) return 'Nenhum serviço informado';

        const serviceNames: Record<string, string> = {
            delivery: 'Entrega',
            pickup: 'Retirada',
            emergency: 'Emergência',
            bulk: 'Atacado'
        };

        return this.services.map(service => serviceNames[service] || service).join(', ');
    }

    get paymentMethodsFormatted(): string {
        if (!this.paymentMethods || this.paymentMethods.length === 0) return 'Nenhum método informado';

        const methodNames: Record<string, string> = {
            cash: 'Dinheiro',
            credit: 'Cartão de Crédito',
            debit: 'Cartão de Débito',
            pix: 'PIX',
            transfer: 'Transferência'
        };

        return this.paymentMethods.map(method => methodNames[method] || method).join(', ');
    }

    static fromJson(json: GasStationJson): GasStation {
        return new GasStation({
            id: json.id,
            userId: json.user_id,
            name: json.name,
            cnpj: json.cnpj,
            address: json.address,
            city: json.city,
            state: json.state,
            zipCode: json.zip_code,
            phone: json.phone,
            email: json.email,
            contactPerson: json.contact_person,
            capacityLiters: json.capacity_liters,
            storageType: json.storage_type,
            licenseNumber: json.license_number,
            licenseExpiry: json.license_expiry,
            operatingHours: json.operating_hours,
            services: json.services,
            paymentMethods: json.payment_methods,
            coordinates: json.coordinates,
            isActive: json.is_active,
            notes: json.notes,
            createdAt: json.created_at,
            updatedAt: json.updated_at
        });
    }

    toJson(): GasStationJson {
        return {
            id: this.id,
            user_id: this.userId,
            name: this.name,
            cnpj: this.cnpj,
            address: this.address,
            city: this.city,
            state: this.state,
            zip_code: this.zipCode,
            phone: this.phone,
            email: this.email,
            contact_person: this.contactPerson,
            capacity_liters: this.capacityLiters,
            storage_type: this.storageType,
            license_number: this.licenseNumber,
            license_expiry: this.licenseExpiry,
            operating_hours: this.operatingHours,
            services: this.services,
            payment_methods: this.paymentMethods,
            coordinates: this.coordinates,
            is_active: this.isActive,
            notes: this.notes,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }
}
