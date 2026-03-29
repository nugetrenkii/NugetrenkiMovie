import { useQuery } from '@tanstack/react-query';
import movieApi from '../../api/movieApi';

interface UseGetMoviesByCategoryOptions {
  page?: number;
  limit?: number;
}

/**
 * Hook lấy danh sách phim theo thể loại
 * @param slug slug của thể loại
 * @param options page, limit
 */
export const useGetMoviesByCategory = (slug: string, options?: UseGetMoviesByCategoryOptions) => {
  return useQuery({
    queryKey: ['movies-by-category', slug, options?.page, options?.limit],
    queryFn: () => movieApi.getMoviesByCategory(slug, options),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};
