/**
 * External dependencies
 */
import { useQuery, UseQueryResult } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { getHomeLayoutFlags } from './home-layout-flags';

interface Options {
	fetchOnMount?: boolean;
}

const useHomeLayoutQuery = (
	siteId: number | null,
	{ fetchOnMount = false }: Options = {}
): UseQueryResult => {
	const { isDev, forcedView } = getHomeLayoutFlags();

	return useQuery(
		[ 'home-layout', siteId ],
		() =>
			wpcom.req.get(
				{
					path: `/sites/${ siteId }/home/layout`,
					apiNamespace: 'wpcom/v2',
				},
				{
					...( isDev && { dev: true } ),
					...( forcedView && { view: forcedView } ),
				}
			),
		{
			enabled: !! siteId,

			// The `/layout` endpoint can return a random view. Disable implicit refetches
			// so the view doesn't change without some user action.
			staleTime: Infinity,
			refetchOnMount: fetchOnMount && 'always',
		}
	);
};

export default useHomeLayoutQuery;
