import { useQuery } from '@tanstack/react-query';
import movieApi from '../../api/movieApi';

/**
 * Hook lấy danh sách phim trang chủ
 * Sử dụng React Query để cache và quản lý state
 */
export const useGetHomeMovies = () => {
  return useQuery({
    queryKey: ['home-movies'],
    queryFn: () => movieApi.getHome(),
    staleTime: 5 * 60 * 1000, // Cache 5 phút trước khi refetch
  });
};
