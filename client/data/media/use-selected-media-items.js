/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import getMediaLibrarySelectedItems from 'calypso/state/selectors/get-media-library-selected-items';
import useMediaQuery from './use-media-query';

const useSelectedMediaItems = ( siteId, query ) => {
	const selectedItemsIds = useSelector( ( state ) =>
		getMediaLibrarySelectedItems( state, siteId )
	);
	const mediaItems = useMediaQuery( site );
};

export default useSelectedMediaItems;
