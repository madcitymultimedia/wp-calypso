/**
 * External dependencies
 */
import config from '@automattic/calypso-config';

interface HomeLayoutFlags {
	forcedView: string | null;
	isDev: boolean;
}

export function getHomeLayoutFlags(): HomeLayoutFlags {
	const pageParams = new URLSearchParams( document.location.search.substring( 1 ) );
	const forcedView = pageParams.get( 'view' );
	const isDev = config.isEnabled( 'home/layout-dev' ) || pageParams.get( 'dev' ) === 'true';

	return { forcedView, isDev };
}
