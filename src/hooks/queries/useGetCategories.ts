import { useQuery } from '@tanstack/react-query';
import movieApi from '../../api/movieApi';

/**
 * Hook lấy danh sách tất cả thể loại
 */
export const useGetCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => movieApi.getCategories(),
    staleTime: 24 * 60 * 60 * 1000, // Thể loại ít thay đổi, cache 24h
  });
};
