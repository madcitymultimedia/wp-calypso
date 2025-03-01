import { useQuery } from '@tanstack/react-query';
import { LICENSES_PER_PAGE } from 'calypso/a8c-for-agencies/sections/purchases/lib/constants';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import formatLicenses from './lib/format-licenses';

export default function useFetchLicenses(
	filter: LicenseFilter,
	search: string,
	sortField: LicenseSortField,
	sortDirection: LicenseSortDirection,
	page: number
) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: [ 'a4a-licenses', filter, search, sortField, sortDirection, page, agencyId ],
		queryFn: () =>
			wpcom.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: '/jetpack-licensing/licenses',
				},
				{
					...( agencyId && { agency_id: agencyId } ),
					...( search ? { search: search } : { filter: filter, page: page } ),
					sort_field: sortField,
					sort_direction: sortDirection,
					per_page: LICENSES_PER_PAGE,
				}
			),
		select: ( data ) => {
			return {
				items: formatLicenses( data.items ),
				total: data.total_items,
				perPage: data.items_per_page,
				totalPages: data.total_pages,
			};
		},
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
