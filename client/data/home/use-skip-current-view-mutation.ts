/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient, UseMutationResult } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import { getHomeLayoutFlags } from './home-layout-flags';

type ReminderDuration = '1d' | '1w' | null;

interface Variables {
	siteId: number;
	viewName: string;
	reminder: ReminderDuration;
}

interface Result extends UseMutationResult< void, unknown, Variables > {
	skipCurrentView: ( siteId: number, reminder: ReminderDuration ) => void;
}

function useSkipCurrentViewMutation(): Result {
	const queryClient = useQueryClient();
	const { isDev } = getHomeLayoutFlags();

	const mutation = useMutation< void, unknown, Variables >(
		( { siteId, viewName, reminder } ) =>
			wp.req.post(
				{
					path: `/sites/${ siteId }/home/layout/skip`,
					apiNamespace: 'wpcom/v2',
				},
				{ ...( isDev && { dev: true } ) },
				{
					view: viewName,
					...( reminder && { reminder } ),
				}
			),
		{
			onSuccess( data, { siteId } ) {
				queryClient.setQueryData( [ 'home-layout', siteId ], data );
			},
		}
	);

	const { mutate } = mutation;

	const skipCurrentView = useCallback(
		( siteId: number, reminder: ReminderDuration ) => {
			const data = queryClient.getQueryData( [ 'home-layout', siteId ] );
			const viewName = ( data as any )?.view_name;

			if ( siteId && viewName ) {
				mutate( { siteId, viewName, reminder } );
			}
		},
		[ mutate, queryClient ]
	);

	return { skipCurrentView, ...mutation };
}

export default useSkipCurrentViewMutation;
