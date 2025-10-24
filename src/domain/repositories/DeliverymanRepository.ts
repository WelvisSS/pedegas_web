import Deliveryman from '../entities/Deliveryman';

/**
 * Deliveryman Repository Interface
 * Abstract class defining deliveryman data operations
 * Following Dependency Inversion Principle
 */
abstract class DeliverymanRepository {
    abstract findAll(): Promise<Deliveryman[]>;

    abstract findById(id: string): Promise<Deliveryman | null>;

    abstract findByGasStationId(gasStationId: string): Promise<Deliveryman[]>;

    abstract findByEmail(email: string): Promise<Deliveryman | null>;

    abstract findByCpf(cpf: string): Promise<Deliveryman | null>;

    abstract create(deliveryman: Deliveryman): Promise<Deliveryman>;

    abstract update(id: string, deliveryman: Partial<Deliveryman>): Promise<Deliveryman>;

    abstract delete(id: string): Promise<boolean>;

    abstract activate(id: string): Promise<Deliveryman>;

    abstract deactivate(id: string): Promise<Deliveryman>;

    abstract updatePermissions(id: string, permissions: string[]): Promise<Deliveryman>;
}

export default DeliverymanRepository;
