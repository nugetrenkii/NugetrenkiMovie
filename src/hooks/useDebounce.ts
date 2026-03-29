import { useState, useEffect } from 'react';

/**
 * Hook để delay việc update value (giúp hạn chế gọi API liên tục khi user gõ phím)
 * @param value Giá trị cần theo dõi
 * @param delay Thời gian chờ (milliseconds)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cài đặt hẹn giờ để update state sau khoảng delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Xóa hẹn giờ nếu value thay đổi trước khi delay chạy xong
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
