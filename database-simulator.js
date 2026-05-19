/**
 * database-simulator.js — Test State Machine для MariaDB/MySQL (Rayton).
 * * Оновлено: Лише Мережа 1 (ID 1), СЕС (ID 2), УЗЕ (ID 3), Завод (ID 4), Ген (ID 5).
 */

require('dotenv').config({ path: require('path').join(__dirname, 'backend', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mysql = require('mysql2/promise');
const e = process.env;

const host = e.DB_HOST || e.DATABASE_HOST || e.DATA_MARIADB_SERVER || '127.0.0.1';
const port = Number(e.DB_PORT || e.DATABASE_PORT || e.DATA_MARIADB_PORT || 3306);
const user = e.DB_USER || e.DATABASE_USER || e.DATA_MARIADB_USER || 'root';
const password = e.DB_PASSWORD || e.DATABASE_PASSWORD || e.DATA_MARIADB_PASSWORD || '';
const database = e.DB_NAME || e.DATABASE_NAME || e.DATA_MARIADB_DB || 'rayton_app';

console.log(`Спроба підключення до бази ${database} на ${host}...`);

const pool = mysql.createPool({
  host, port, user, password, database,
  waitForConnections: true, connectionLimit: 10, queueLimit: 0,
});

// ОНОВЛЕНО: Тільки Мережа 1. Видалено 7 та 8.
const DATA_IDS = [1, 2, 3, 4, 5, 10];
const DEVICE_ID = 1;
const INTERVAL_MS = 10_000;

const SEED_ALL_VIRTUAL_DEVICES = /^(1|true|yes|on)$/i.test(String(e.SEED_ALL_VIRTUAL_DEVICES || ''));

let currentScenarioIndex = 0;

const SCENARIOS = [
  { name: "1.1 З=М (Тільки Мережа -> Завод)",       pv: 0,   grid: 20, battery: 0, gen: 0, load: 20 },
  { name: "1.2 З=С (Тільки СЕС -> Завод)",          pv: 20,  grid: 0,  battery: 0, gen: 0, load: 20 },
  { name: "1.4 З=С-Експ (СЕС -> Завод + Експорт)",  pv: 30,  grid: -10, battery: 0, gen: 0, load: 20 },
  { name: "3.7 З=М, С=Зар (Мер->Зав, СЕС->Зар)",    pv: 15,  grid: 20, battery: -15, gen: 0, load: 20 },
  { name: "4.2 З=Г+С+У (Ген+СЕС+УЗЕ -> Завод)",     pv: 10,  grid: 0,  battery: 10, gen: 10, load: 30 },
];

const VIRTUAL_DEVICES = {
  GENERATOR: { device_id: 990007, text_l1: 'Generator' },
  ESS:       { device_id: 990005, text_l1: 'ESS' },
};

function parseTabConfig(tabConfigRaw) {
  if (!tabConfigRaw) return { hasEss: false, hasGen: false };
  try {
    const cfg = JSON.parse(String(tabConfigRaw));
    const isEnabled = (v) => v != null && String(v).toLowerCase() !== 'none';
    return { hasEss: isEnabled(cfg.ess), hasGen: isEnabled(cfg.gen) };
  } catch { return { hasEss: false, hasGen: false }; }
}

function generatePacket(plantId, name, hasEss, hasGen, now) {
  const scenario = SCENARIOS[currentScenarioIndex];

  const byId = {
    1: scenario.grid,    // Вся Мережа йде в ID 1
    2: scenario.pv,      // СЕС
    3: hasEss ? scenario.battery : 0,
    4: scenario.load,    // Завод
    5: hasGen ? scenario.gen : 0,
    10: hasEss ? 75 : 0, // SOC
  };

  const getDeviceId = (dataId) => {
    if (dataId === 5) return VIRTUAL_DEVICES.GENERATOR.device_id;
    if (dataId === 3 || dataId === 10) return VIRTUAL_DEVICES.ESS.device_id;
    return DEVICE_ID;
  };

  return {
    plantId, name, now,
    pv: scenario.pv, grid: scenario.grid, load: scenario.load,
    battery: byId[3], gen: byId[5],
    rows: DATA_IDS.map((dataId) => ({
      TIMESTAMP: now,
      PLANT_ID: plantId,
      DEVICE_ID: getDeviceId(dataId),
      DATA_ID: dataId,
      DATA: byId[dataId] ?? 0,
      UPDATED_AT: now,
    })),
  };
}

async function loadPlants() {
  const [rows] = await pool.query('SELECT PLANT_ID, TEXT_L1 AS name, tab_config FROM PLANT_LIST WHERE PLANT_ID IS NOT NULL');
  return rows.map((row) => {
    const { hasEss, hasGen } = parseTabConfig(row.tab_config);
    return { PLANT_ID: row.PLANT_ID, name: row.name, hasEss, hasGen };
  });
}

async function seedVirtualDevices(plants) {
  const seeds = [];
  for (const p of plants) {
    if (SEED_ALL_VIRTUAL_DEVICES || p.hasGen) {
      seeds.push([p.PLANT_ID, VIRTUAL_DEVICES.GENERATOR.device_id, 'Generator', 'Генератор']);
    }
    if (SEED_ALL_VIRTUAL_DEVICES || p.hasEss) {
      seeds.push([p.PLANT_ID, VIRTUAL_DEVICES.ESS.device_id, 'ESS', 'УЗЕ']);
    }
  }
  if (seeds.length === 0) return;
  const sql = `INSERT INTO PLANT_CONFIG (PLANT_ID, DEVICE_ID, CLASS_ID, PARENT_ID, TEXT_L1, TEXT_L2, created_at, updated_at)
               VALUES (?, ?, 0, 0, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE updated_at = NOW()`;
  for (const params of seeds) { await pool.execute(sql, params); }
}

function buildStatementsForPacket(pack) {
  const statements = [];
  for (const r of pack.rows) {
    statements.push([
      `INSERT INTO PLC_DATA_REALTIME (TIMESTAMP, PLANT_ID, DEVICE_ID, DATA_ID, DATA, UPDATED_AT)
       VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE DATA = VALUES(DATA), TIMESTAMP = VALUES(TIMESTAMP), UPDATED_AT = VALUES(UPDATED_AT)`,
      [r.TIMESTAMP, r.PLANT_ID, r.DEVICE_ID, r.DATA_ID, r.DATA, r.UPDATED_AT]
    ]);
    statements.push([
      `INSERT INTO PLC_DATA_HISTORICAL (TIMESTAMP, PLANT_ID, DEVICE_ID, DATA_ID, DATA) VALUES (?, ?, ?, ?, ?)`,
      [r.TIMESTAMP, r.PLANT_ID, r.DEVICE_ID, r.DATA_ID, r.DATA]
    ]);
  }
  return statements;
}

async function tick(plants) {
  const now = new Date();
  const currentScenario = SCENARIOS[currentScenarioIndex];
  console.log(`\n▶ [${currentScenario.name}]`);

  for (const p of plants) {
    const pack = generatePacket(p.PLANT_ID, p.name, p.hasEss, p.hasGen, now);
    const stmts = buildStatementsForPacket(pack);
    try {
      await Promise.all(stmts.map(([sql, params]) => pool.execute(sql, params)));
      console.log(`  -> ${pack.name} | PV: ${pack.pv}, Grid: ${pack.grid}, Bat: ${pack.battery}, Gen: ${pack.gen}`);
    } catch (err) { console.error(`Err ${pack.name}:`, err.message); }
  }
  currentScenarioIndex = (currentScenarioIndex + 1) % SCENARIOS.length;
}

async function main() {
  let plants = await loadPlants();
  if (plants.length > 0) {
    console.log(`Запуск для ${plants.length} станцій.`);
    await seedVirtualDevices(plants);
  }
  setInterval(async () => {
    try { await tick(plants); } catch (err) { console.error('Tick Error:', err); }
  }, INTERVAL_MS);
  if (plants.length) await tick(plants);
}

process.on('SIGINT', async () => { await pool.end(); process.exit(0); });
main().catch(err => { console.error(err); process.exit(1); });
