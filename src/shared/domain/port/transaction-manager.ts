// puerto: los casos de uso piden "esto en una transacción" sin conocer la BD
// (la implementación con PostgreSQL la registra DatabaseModule)
export abstract class TransactionManager {
  abstract ejecutar<T>(fn: () => Promise<T>): Promise<T>;
}
