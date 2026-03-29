import { useQuery } from '@tanstack/react-query';
import movieApi from '../../api/movieApi';

interface UseGetMovieListOptions {
  page?: number;
  limit?: number;
}

/**
 * Hook lấy danh sách phim theo bộ lọc
 * @param slug phim-moi, phim-bo, phim-le, tv-shows, hoat-hinh, v.v.
 * @param options page, limit
 */
export const useGetMovieList = (slug: string, options?: UseGetMovieListOptions) => {
  return useQuery({
    queryKey: ['movie-list', slug, options?.page, options?.limit],
    queryFn: () => movieApi.getMovieList(slug, options),
    enabled: !!slug, // Chỉ chạy khi có slug
    staleTime: 5 * 60 * 1000,
  });
};
