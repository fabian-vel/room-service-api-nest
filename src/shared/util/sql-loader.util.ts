import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SqlLoadException } from '../domain/exception/sql-load.exception.js';

// Los .sql viven en resources/querys (como en el API Java); se resuelven desde la raíz del proyecto
const QUERYS_DIR = join(process.cwd(), 'resources');

export function loadSql(path: string): string {
  try {
    return readFileSync(join(QUERYS_DIR, path), 'utf8');
  } catch (error) {
    throw new SqlLoadException(path, error);
  }
}
