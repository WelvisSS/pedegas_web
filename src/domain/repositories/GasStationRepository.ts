import { GasStation } from '../entities/GasStation';

/**
 * Gas Station Repository Interface
 * Abstract class defining gas station data operations
 * Following Dependency Inversion Principle
 */
export abstract class GasStationRepository {
    abstract getByUserId(userId: string): Promise<GasStation[]>;

    abstract getById(id: string): Promise<GasStation | null>;

    abstract create(gasStation: GasStation): Promise<GasStation>;

    abstract update(id: string, updates: Partial<GasStation>): Promise<GasStation>;

    abstract delete(id: string): Promise<boolean>;

    abstract searchByLocation(city: string, state: string): Promise<GasStation[]>;

    abstract getActiveByUserId(userId: string): Promise<GasStation[]>;
}
