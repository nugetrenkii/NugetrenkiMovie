import { useQuery } from '@tanstack/react-query';
import movieApi from '../../api/movieApi';

interface UseSearchMoviesOptions {
  page?: number;
  limit?: number;
}

/**
 * Hook tìm kiếm phim
 * @param keyword từ khóa tìm kiếm
 * @param options page, limit
 */
export const useSearchMovies = (keyword: string, options?: UseSearchMoviesOptions) => {
  return useQuery({
    queryKey: ['search-movies', keyword, options?.page, options?.limit],
    queryFn: () => movieApi.searchMovies(keyword, options),
    enabled: !!keyword && keyword.trim().length > 0, // Chỉ tìm khi có keyword hợp lệ
    staleTime: 60 * 1000, // 1 phút
  });
};
