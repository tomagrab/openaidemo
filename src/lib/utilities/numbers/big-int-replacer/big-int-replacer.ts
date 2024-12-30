export const bigintReplacer = (
  key: string,
  value: string | number | boolean | null | bigint | object,
) => {
  return typeof value === 'bigint' ? Number(value) : value;
};
