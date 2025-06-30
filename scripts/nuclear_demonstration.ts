#!/usr/bin/env ts-node

/**
 * NUCLEAR BARTON DOCTRINE DEMONSTRATION
 * 
 * This script demonstrates the ULTIMATE level of Barton Doctrine enforcement
 * - ZERO TOLERANCE for violations
 * - AUTOMATIC SYSTEM SHUTDOWN on violations
 * - PERMANENT BLACKLISTING of violating tools
 * - NO RECOVERY without manual intervention
 */

import { NUCLEAR_DOCTRINE } from '../src/core/nuclear-barton-doctrine';
import { BartonDoctrineFormatter } from '../src/schemas/barton-doctrine-formatter';

console.log('☢️  NUCLEAR BARTON DOCTRINE DEMONSTRATION');
console.log('==========================================');

// STEP 1: Enable Nuclear Mode
console.log('\n🔧 STEP 1: Enabling Nuclear Mode...');
NUCLEAR_DOCTRINE.enable();

const status = NUCLEAR_DOCTRINE.status();
console.log('✅ Nuclear Mode Status:', {
  nuclearMode: status.nuclearMode,
  maxViolations: status.maxViolations,
  violationCount: status.violationCount,
  systemLocked: status.systemLocked
});

// STEP 2: Demonstrate Compliant Operation
console.log('\n🔧 STEP 2: Demonstrating Compliant Operation...');
try {
  const compliantPayload = BartonDoctrineFormatter.createBasePayload(
    'nuclear_demo',
    'nuclear_process',
    { demo: 'compliant_data' },
    { agent_id: 'nuclear_demo_agent', blueprint_id: 'nuclear_demo_blueprint', schema_version: '1.0.0' }
  );

  const validatedPayload = NUCLEAR_DOCTRINE.validate(compliantPayload, 'nuclear_demo_tool', 'demo_operation');
  console.log('✅ Compliant payload validated successfully');
  console.log('📋 Payload structure:', Object.keys(validatedPayload));

  // Demonstrate nuclear database operations
  const firebaseResult = NUCLEAR_DOCTRINE.database('firebase', validatedPayload, 'nuclear_demo_tool');
  console.log('✅ Nuclear Firebase operation successful (SPVPET format)');

  const neonResult = NUCLEAR_DOCTRINE.database('neon', validatedPayload, 'nuclear_demo_tool');
  console.log('✅ Nuclear Neon operation successful (STAMPED format)');

  const bigqueryResult = NUCLEAR_DOCTRINE.database('bigquery', validatedPayload, 'nuclear_demo_tool');
  console.log('✅ Nuclear BigQuery operation successful (STACKED format)');

} catch (error) {
  console.error('❌ Unexpected error in compliant operation:', error);
}

// STEP 3: Demonstrate Violation Detection
console.log('\n🔧 STEP 3: Demonstrating Violation Detection...');
try {
  const invalidPayload = {
    invalid_field: 'test',
    missing_required_fields: true,
    no_barton_doctrine_compliance: true
  };

  console.log('🚨 Attempting to validate invalid payload...');
  NUCLEAR_DOCTRINE.validate(invalidPayload, 'violating_tool', 'test_operation');
  
  console.log('❌ This should not be reached - violation should have triggered shutdown');
} catch (error) {
  console.log('✅ Nuclear violation correctly detected and blocked');
  console.log('🚨 Violation details:', error instanceof Error ? error.message : 'Unknown error');
  
  // Check status after violation
  const postViolationStatus = NUCLEAR_DOCTRINE.status();
  console.log('📊 Post-violation status:', {
    violationCount: postViolationStatus.violationCount,
    blacklistedTools: postViolationStatus.blacklistedTools,
    systemLocked: postViolationStatus.systemLocked
  });
}

// STEP 4: Demonstrate Manual Recovery
console.log('\n🔧 STEP 4: Demonstrating Manual Recovery...');
try {
  console.log('🔓 Attempting manual recovery...');
  NUCLEAR_DOCTRINE.recovery('BARTON_DOCTRINE_EMERGENCY_OVERRIDE_2025');
  
  const recoveryStatus = NUCLEAR_DOCTRINE.status();
  console.log('✅ Manual recovery successful');
  console.log('📊 Recovery status:', {
    nuclearMode: recoveryStatus.nuclearMode,
    violationCount: recoveryStatus.violationCount,
    systemLocked: recoveryStatus.systemLocked,
    blacklistedTools: recoveryStatus.blacklistedTools
  });
} catch (error) {
  console.error('❌ Recovery failed:', error instanceof Error ? error.message : 'Unknown error');
}

console.log('\n☢️  NUCLEAR DEMONSTRATION COMPLETE');
console.log('==================================');
console.log('Key Features Demonstrated:');
console.log('✅ Nuclear mode activation');
console.log('✅ Compliant payload validation');
console.log('✅ Nuclear database operations (SPVPET/STAMPED/STACKED)');
console.log('✅ Violation detection and blocking');
console.log('✅ Tool blacklisting');
console.log('✅ Manual recovery with authorization');
console.log('\n🔒 NUCLEAR ENFORCEMENT: ZERO TOLERANCE FOR VIOLATIONS'); 