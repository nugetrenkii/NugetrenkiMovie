import axiosClient from './axiosClient';
import { HomeApiResponse } from '../types/movie';

interface PaginationParams {
  page?: number;
  limit?: number;
}

const movieApi = {
  /**
   * 1. Trang chủ phim
   * GET /v1/api/home
   */
  getHome: (): Promise<HomeApiResponse> => {
    return axiosClient.get('/v1/api/home');
  },

  /**
   * 2. Danh sách phim theo bộ lọc
   * GET /v1/api/danh-sach/{slug}
   * Slugs: phim-moi, phim-bo, phim-le, tv-shows, hoat-hinh, phim-vietsub,
   *        phim-thuyet-minh, phim-long-tien, phim-bo-dang-chieu,
   *        phim-bo-hoan-thanh, phim-sap-chieu, subteam, phim-chieu-rap
   */
  getMovieList: (slug: string, params?: PaginationParams) => {
    return axiosClient.get(`/v1/api/danh-sach/${slug}`, { params });
  },

  /**
   * 3. Tìm kiếm phim
   * GET /v1/api/tim-kiem?keyword={keyword}
   */
  searchMovies: (keyword: string, params?: PaginationParams) => {
    return axiosClient.get('/v1/api/tim-kiem', {
      params: { keyword, ...params },
    });
  },

  /**
   * 4. Danh sách tất cả thể loại
   * GET /v1/api/the-loai
   */
  getCategories: () => {
    return axiosClient.get('/v1/api/the-loai');
  },

  /**
   * 5. Phim theo thể loại
   * GET /v1/api/the-loai/{slug}
   */
  getMoviesByCategory: (slug: string, params?: PaginationParams) => {
    return axiosClient.get(`/v1/api/the-loai/${slug}`, { params });
  },

  /**
   * 6. Danh sách tất cả quốc gia
   * GET /v1/api/quoc-gia
   */
  getCountries: () => {
    return axiosClient.get('/v1/api/quoc-gia');
  },

  /**
   * 7. Phim theo quốc gia
   * GET /v1/api/quoc-gia/{slug}
   */
  getMoviesByCountry: (slug: string, params?: PaginationParams) => {
    return axiosClient.get(`/v1/api/quoc-gia/${slug}`, { params });
  },

  /**
   * 8. Danh sách năm phát hành
   * GET /v1/api/nam-phat-hanh
   */
  getYears: () => {
    return axiosClient.get('/v1/api/nam-phat-hanh');
  },

  /**
   * 9. Phim theo năm phát hành
   * GET /v1/api/nam-phat-hanh/{year}
   */
  getMoviesByYear: (year: number | string, params?: PaginationParams) => {
    return axiosClient.get(`/v1/api/nam-phat-hanh/${year}`, { params });
  },

  /**
   * 10. Chi tiết phim (bao gồm episodes với link m3u8 & embed)
   * GET /v1/api/phim/{slug}
   */
  getMovieDetail: (slug: string) => {
    return axiosClient.get(`/v1/api/phim/${slug}`);
  },

  /**
   * 11. Hình ảnh phim từ TMDB
   * GET /v1/api/phim/{slug}/images
   */
  getMovieImages: (slug: string) => {
    return axiosClient.get(`/v1/api/phim/${slug}/images`);
  },

  /**
   * 12. Diễn viên, đạo diễn từ TMDB
   * GET /v1/api/phim/{slug}/peoples
   */
  getMoviePeoples: (slug: string) => {
    return axiosClient.get(`/v1/api/phim/${slug}/peoples`);
  },

  /**
   * 13. Từ khóa phim từ TMDB
   * GET /v1/api/phim/{slug}/keywords
   */
  getMovieKeywords: (slug: string) => {
    return axiosClient.get(`/v1/api/phim/${slug}/keywords`);
  },
};

export default movieApi;
