import React from 'react';
import { useDebounce } from 'react-use';

export const useDebounced = <T extends unknown>(value: T, timeout: number) => {
  const [debounced, setDebounced] = React.useState(value);
  useDebounce(() => setDebounced(value), timeout, [value]);
  return debounced;
};
