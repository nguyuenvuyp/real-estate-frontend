export type Property = {
  id: number;
  title: string;
  description?: string;
  property_type: "apartment" | "house" | "villa" | "office" | "land";
  status: "available" | "sold" | "rented" | "pending";
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  address: string;
  city: string;
  district: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  year_built?: number;
  features?: Record<string, unknown> | null;
  images?: string[] | null;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  created_at?: string;
  updated_at?: string;
};

export type PropertyImage = {
  id: number;
  property_id: number;
  image_path: string | null;
  image_name: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Pagination<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
