import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdb_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';

let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;

export async function initializeDuckDB() {
  if (db) return db;

  const DUCKDB_CONFIG: duckdb.DuckDBBundles = {
    mvp: {
      mainModule: duckdb_wasm,
      mainWorker: duckdb_worker,
    },
  };

  const worker = new Worker(DUCKDB_CONFIG.mvp.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  const bundle = await duckdb.selectBundle(DUCKDB_CONFIG);

  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule);
  conn = await db.connect();

  return db;
}

export async function executeQuery(query: string) {
  if (!conn) throw new Error('Database not initialized');
  
  try {
    const result = await conn.query(query);
    return result.toArray();
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

export async function registerParquetFile(file: File) {
  if (!db || !conn) throw new Error('Database not initialized');

  const buffer = await file.arrayBuffer();
  const fileName = file.name.replace(/\.[^/.]+$/, '');
  
  await db.registerFileBuffer(file.name, new Uint8Array(buffer));
  await conn.query(`CREATE TABLE ${fileName} AS SELECT * FROM parquet_scan('${file.name}')`);
  
  return fileName;
}