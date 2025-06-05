import axios from '@/lib/axios';
import { ComponentArticle, ConsumableArticle } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface IGetArticle {
  isFather: boolean,
  article: {
      part_number: string,
      serial: string,
      status: string,
      description: string,
      image: string,
      condition: string,
      certificates: string[],
      zone: string,
      category_father: string,
      brand: string,
  }
  id: number,
  shell_time: {
    fabrication_date: string,
    caducate_date: string,
  },
  hard_time : {
    hour_date: number,
    cycle_date: number,
    calendary_date: string,
  }
  childrens:{
        child_component_id: string,
        child_serial: string,
        child_part_number: string,
        child_zone: string,
        child_image: string,
        category: string,
    }[]
}

const fetchArticle = async (location_id: string, slug: string, serial: string,): Promise<IGetArticle> => {
  const {data} = await axios.post(`/hangar74/articles/${slug}/${serial}`, {location_id});
  return data;
};

export const useGetArticle = (location_id: string, slug: string, serial: string) => {
  return useMutation<IGetArticle>({
    mutationKey: ["article"],
    mutationFn: () => fetchArticle(location_id, slug, serial),
  });
};
