import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdb_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';

let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;
let initPromise: Promise<duckdb.AsyncDuckDB> | null = null;

export async function initializeDuckDB() {
  if (initPromise) return initPromise;
  if (db) return db;

  initPromise = (async () => {
    try {
      const DUCKDB_CONFIG: duckdb.DuckDBBundles = {
        mvp: {
          mainModule: duckdb_wasm,
          mainWorker: duckdb_worker,
        },
      };

      // Create a new worker with the correct URL
      const workerUrl = new URL(DUCKDB_CONFIG.mvp.mainWorker, import.meta.url).href;
      const worker = new Worker(workerUrl, { type: 'module' });

      const logger = new duckdb.ConsoleLogger();
      const bundle = await duckdb.selectBundle(DUCKDB_CONFIG);

      db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.mainWorker);
      conn = await db.connect();

      return db;
    } catch (error) {
      console.error('Failed to initialize DuckDB:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

export async function executeQuery(query: string) {
  if (!conn) {
    await initializeDuckDB();
    if (!conn) throw new Error('Failed to initialize database connection');
  }
  
  try {
    const result = await conn.query(query);
    return result.toArray();
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

export async function registerParquetFile(file: File) {
  if (!db || !conn) {
    await initializeDuckDB();
    if (!db || !conn) throw new Error('Failed to initialize database');
  }

  const buffer = await file.arrayBuffer();
  const fileName = file.name.replace(/\.[^/.]+$/, '');
  
  await db.registerFileBuffer(file.name, new Uint8Array(buffer));
  await conn.query(`CREATE TABLE ${fileName} AS SELECT * FROM parquet_scan('${file.name}')`);
  
  return fileName;
}