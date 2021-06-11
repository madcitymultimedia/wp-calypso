/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

function useDeleteMediaMutation() {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { siteId, mediaId } ) => wp.req.post( `/sites/${ siteId }/media/${ mediaId }/delete` ),
		{
			onSuccess( data, { siteId } ) {
				queryClient.invalidateQueries( [ 'media', siteId ] );
			},
		}
	);

	const { mutate } = mutation;

	const deleteMedia = useCallback(
		( siteId, mediaId ) => {
			mutate( { siteId, mediaId } );
		},
		[ mutate ]
	);

	return { deleteMedia, ...mutation };
}

export default useDeleteMediaMutation;
