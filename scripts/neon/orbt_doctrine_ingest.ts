#!/usr/bin/env tsx

import { Client } from 'pg';

console.log('🚀 Simple ORBT Doctrine Insert Starting...');

async function insertORBTDoctrine() {
  const connectionString = process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ NEON_DATABASE_URL not set');
    return;
  }

  console.log('🔧 Connecting to Neon...');
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon');

    // Import ORBT doctrine
    console.log('🔧 Importing ORBT doctrine...');
    const { ORBT_DOCTRINE } = await import('../orbt_doctrine');
    console.log('✅ ORBT doctrine imported');

    // Create a simple test entry
    const testEntry = {
      section_number: '1.2.1.30.001',
      section_title: 'ORBT Operating System - 30,000ft View',
      doctrine_text: ORBT_DOCTRINE.tiers[30000].description,
      doctrine_type: 'operating',
      enforcement_level: 'required',
      doctrine_category: 'ORBT',
      sub_hive: 'dpr'
    };

    console.log('🔧 Inserting test entry...');
    const query = `
      INSERT INTO dpr_doctrine (
        section_number, section_title, doctrine_text, 
        doctrine_type, enforcement_level, doctrine_category, sub_hive
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, section_number, section_title;
    `;

    const values = [
      testEntry.section_number,
      testEntry.section_title,
      testEntry.doctrine_text,
      testEntry.doctrine_type,
      testEntry.enforcement_level,
      testEntry.doctrine_category,
      testEntry.sub_hive
    ];

    const result = await client.query(query, values);
    console.log('✅ Test entry inserted:', result.rows[0]);

    // Insert all ORBT tiers
    console.log('🔧 Inserting ORBT tiers...');
    const tiers = [
      { altitude: 30000, title: 'ORBT Operating System - 30,000ft View', type: 'operating' },
      { altitude: 20000, title: 'ORBT Repair System - 20,000ft View', type: 'repair' },
      { altitude: 10000, title: 'ORBT Build System - 10,000ft View', type: 'build' },
      { altitude: 5000, title: 'ORBT Training System - 5,000ft View', type: 'training' }
    ];

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const sectionNumber = `1.2.1.${30 - i * 5}.${String(i + 1).padStart(3, '0')}`;
      
      const tierEntry = {
        section_number: sectionNumber,
        section_title: tier.title,
        doctrine_text: ORBT_DOCTRINE.tiers[tier.altitude].description,
        doctrine_type: tier.type,
        enforcement_level: 'required',
        doctrine_category: 'ORBT',
        sub_hive: 'dpr'
      };

      const tierValues = [
        tierEntry.section_number,
        tierEntry.section_title,
        tierEntry.doctrine_text,
        tierEntry.doctrine_type,
        tierEntry.enforcement_level,
        tierEntry.doctrine_category,
        tierEntry.sub_hive
      ];

      const tierResult = await client.query(query, tierValues);
      console.log(`✅ ${tier.title} inserted: ${tierResult.rows[0].section_number}`);
    }

    // Insert universal rules
    console.log('🔧 Inserting universal rules...');
    for (let i = 0; i < ORBT_DOCTRINE.universal_rules.length; i++) {
      const rule = ORBT_DOCTRINE.universal_rules[i];
      const sectionNumber = `1.2.1.32.${String(i + 1).padStart(3, '0')}`;
      
      const ruleValues = [
        sectionNumber,
        `Universal Rule ${i + 1}`,
        rule,
        'operating',
        'required',
        'ORBT',
        'dpr'
      ];

      const ruleResult = await client.query(query, ruleValues);
      console.log(`✅ Universal Rule ${i + 1} inserted: ${ruleResult.rows[0].section_number}`);
    }

    // Insert color coding system
    console.log('🔧 Inserting color coding system...');
    const colors = [
      { color: 'green', description: ORBT_DOCTRINE.color_model.green },
      { color: 'yellow', description: ORBT_DOCTRINE.color_model.yellow },
      { color: 'red', description: ORBT_DOCTRINE.color_model.red }
    ];

    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      const sectionNumber = `1.2.1.31.${String(i + 1).padStart(3, '0')}`;
      
      const colorValues = [
        sectionNumber,
        `ORBT Color System - ${color.color.charAt(0).toUpperCase() + color.color.slice(1)} Status`,
        color.description,
        'repair',
        'required',
        'ORBT',
        'dpr'
      ];

      const colorResult = await client.query(query, colorValues);
      console.log(`✅ ${color.color} color system inserted: ${colorResult.rows[0].section_number}`);
    }

    // Insert diagnostic mode
    console.log('🔧 Inserting diagnostic mode...');
    const diagnosticValues = [
      '1.2.1.33.001',
      'ORBT Diagnostic Mode',
      ORBT_DOCTRINE.diagnostic_mode,
      'build',
      'required',
      'ORBT',
      'dpr'
    ];

    const diagnosticResult = await client.query(query, diagnosticValues);
    console.log(`✅ Diagnostic mode inserted: ${diagnosticResult.rows[0].section_number}`);

    // Verify insertion
    console.log('🔧 Verifying insertion...');
    const verifyQuery = `
      SELECT COUNT(*) as count 
      FROM dpr_doctrine 
      WHERE doctrine_category = 'ORBT'
    `;
    const verifyResult = await client.query(verifyQuery);
    console.log(`✅ Total ORBT doctrine entries: ${verifyResult.rows[0].count}`);

    console.log('🎉 ORBT Doctrine insertion completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('🔧 Database connection closed');
  }
}

insertORBTDoctrine()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 