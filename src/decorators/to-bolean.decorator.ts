import { Transform } from 'class-transformer';

export function ToBoolean() {
  return Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string')
      return value === '1' || value.toLowerCase() === 'true';
    if (typeof value === 'number') return value === 1;
    return false;
  });
}
