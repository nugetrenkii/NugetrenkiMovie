import { useQuery } from '@tanstack/react-query';
import movieApi from '../../api/movieApi';

/**
 * Hook lấy chi tiết phim
 * @param slug slug của bộ phim
 */
export const useGetMovieDetail = (slug: string) => {
  return useQuery({
    queryKey: ['movie-detail', slug],
    queryFn: () => movieApi.getMovieDetail(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // Caching lâu hơn chút cho chi tiết phim
  });
};
