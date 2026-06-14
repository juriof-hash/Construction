import { GeometryObject, ValidationResult } from '../types/mission';
import { validateMission5 } from './mission5';

export const validateMission6 = (
  objects: GeometryObject[],
  refs: Readonly<Record<string, GeometryObject>>
): ValidationResult => {
  return validateMission5(objects, refs);
};
