/**
 * External dependencies
 */
import React from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import useDeleteMediaMutation from './use-delete-media-mutation';

const withDeleteMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { deleteMedia } = useDeleteMediaMutation();
		return <Wrapped { ...props } deleteMedia={ deleteMedia } />;
	},
	'WithDeleteMedia'
);

export default withDeleteMedia;
