import axios from '@/lib/axios';
import { Article, Condition, Manufacturer } from '@/types';
import { useMutation } from '@tanstack/react-query';

export interface IArticleByBatch {
  name: string,
  articles: {
    id: number,
  article_type: string,
  status: string,
  serial: string,
  description: string,
  zone: string,
  brand: string,
  condition: string,
  manufacturer: string,
  weight: number,
  cost: number,
  batches_id: number,
  vendor_id: string,
  part_number: string,
  alternative_part_number: string[],
  certificates?: string[],
  unit_secondary: string,
  image: string,
  quantity: number,
  tool?: {
    id: number,
    serial: string,
    isSpecial: boolean,
    article_id: number,
  }
  component?: {
    serial: string,
    hard_time: {
      hour_date: string,
      cycle_date: string,
      calendary_date: string,
    },
    shell_time: {
      caducate_date: string,
      fabrication_date: string,
    }
  },
  consumable?: {
    article_id: number,
    is_managed: boolean,
    convertions: {
      id: number,
      secondary_unit: string,
      convertion_rate: number,
      quantity_unit: number,
      unit: {
        label: string,
        value: string,
      },
    }[],
    shell_time: {
      caducate_date: Date,
      fabrication_date: Date,
      consumable_id: string,
    }
  }
  }[]
}

const fetchArticlesByBatch = async (location_id: number, slug: string): Promise<IArticleByBatch> => {
  const {data} = await axios.post(`/hangar74/batches/${slug}`, {location_id});
  return data[0];
};

export const useGetArticlesByBatch = (location_id: number, slug: string) => {
  return useMutation<IArticleByBatch, Error, number>({
    mutationKey: ["articles"],
    mutationFn: () => fetchArticlesByBatch(location_id, slug),
  });
};
