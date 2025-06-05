import axios from '@/lib/axios';
import { Quote } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface TrackingInfo {
  loc: string,
}

const fetchTracking = async (usa_tracking: string | null): Promise<TrackingInfo[]> => {
  const {data} = await axios.get(`https://api-test.dhl.com/track/shipments?trackingNumber=${usa_tracking}`, {
    headers: {
      'DHL-API-Key': `${process.env.DHL_API_KEY}`
    }
  });
  return data;
};

export const useGetTrackingInfo = (usa_tracking: string | null) => {
  return useQuery<TrackingInfo[]>({
    queryKey: ["tracking"],
    queryFn: () => fetchTracking(usa_tracking),
    enabled: !!usa_tracking
  });
};
