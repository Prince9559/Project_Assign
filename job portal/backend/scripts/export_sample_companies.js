#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { QueryTypes } = require('sequelize');

// Load models & sequelize from project
const models = require('../models');
const sequelize = models.sequelize;

// Simple CLI parsing: --industries=1,2,3 --limit=10 --output=path
const argv = process.argv.slice(2);
const argMap = {};
for (const a of argv) {
  const m = a.match(/^--([a-zA-Z0-9_\-]+)=(.*)$/);
  if (m) argMap[m[1]] = m[2];
}

const industriesArg = argMap.industries || '';
const industries = industriesArg
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((n) => Number(n))
  .filter((n) => !Number.isNaN(n));

const limit = Number(argMap.limit || 10);
const outPath = argMap.output || path.join(__dirname, '..', 'debug_samples', 'sample_companies.json');

async function main() {
  if (!industries.length) {
    console.error('Usage: node export_sample_companies.js --industries=1,2 --limit=10 [--output=path]');
    process.exit(2);
  }

  try {
    await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
    const rows = await sequelize.query(
      `SELECT id, company_name, user_id, industry_id, status, is_verified
       FROM company_recruiter_profiles
       WHERE industry_id IN (:inds)
       LIMIT :lim`,
      { replacements: { inds: industries, lim: limit }, type: QueryTypes.SELECT }
    );

    await fs.promises.writeFile(outPath, JSON.stringify(rows, null, 2), 'utf8');
    console.log('Wrote', rows.length, 'rows to', outPath);
  } catch (err) {
    console.error('Failed to export sample companies:', err.message || err);
    process.exit(1);
  } finally {
    // Close DB connection
    try { await sequelize.close(); } catch (e) {}
  }
}

main();
