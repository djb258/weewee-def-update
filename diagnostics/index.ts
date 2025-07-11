// diagnostics/index.ts

import doctrine from '../diagnostic_map.json';

export const systemKey = doctrine;
export const altitudeLevels = doctrine.altitude_levels;
export const colorCodes = doctrine.color_codes;
export const errorPromotionLogic = doctrine.error_promotion_logic;
export const udnsFormat = doctrine.udns_format;
export const exampleCodes = doctrine.example_codes;

// Export for direct import in apps
export default {
  systemKey,
  altitudeLevels,
  colorCodes,
  errorPromotionLogic,
  udnsFormat,
  exampleCodes
}; 