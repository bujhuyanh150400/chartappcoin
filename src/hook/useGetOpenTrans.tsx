import {useQuery} from "@tanstack/react-query";
import twelveAPI from "../lib/api/twelveapi.ts";


type Params = {
    user_id?:string,
    secret?:string,
    symbol?:string
}
const useGetOpenTrans = (params: Params) => {

    return useQuery({
        queryKey: ['twelveAPI-getOpen', params],
        enabled: false,
        queryFn: async () => {
            return await twelveAPI.getOpen({
                symbol: params?.symbol || '',
                user_id: params?.user_id || '',
                secret: params?.secret || '',
            });
        },
        select: (res) => res.data ?? [],
    });
}
export default useGetOpenTrans;