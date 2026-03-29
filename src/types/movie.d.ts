// Types cho API response từ ophim1.com

export interface MovieItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  alternative_names?: string[];
  type: 'series' | 'single' | 'hoathinh';
  thumb_url: string;
  poster_url: string;
  year: number;
  category: Category[];
  country: Country[];
  modified?: {
    time: string;
  };
  sub_docquyen?: boolean;
  time?: string;
  episode_current?: string;
  quality?: string;
  lang?: string;
  tmdb?: {
    type: string;
    id: string;
    season: number | null;
    vote_average: number;
    vote_count: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
}

export interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
}

export interface HomeApiResponse {
  status: string;
  message: string;
  data: {
    seoOnPage: {
      titleHead: string;
      descriptionHead: string;
    };
    items: MovieItem[];
    params: {
      pagination: Pagination;
    };
    APP_DOMAIN_CDN_IMAGE: string;
    APP_DOMAIN_FRONTEND: string;
  };
}
