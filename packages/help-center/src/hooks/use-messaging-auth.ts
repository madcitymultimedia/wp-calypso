import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { MessagingAuth } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

function requestMessagingAuth() {
	const currentEnvironment = config( 'env_id' );
	const params = { type: 'zendesk', test_mode: String( currentEnvironment === 'development' ) };
	const wpcomParams = new URLSearchParams( params );
	return canAccessWpcomApis()
		? wpcomRequest< MessagingAuth >( {
				path: '/help/authenticate/chat',
				query: wpcomParams.toString(),
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
				method: 'POST',
		  } )
		: apiFetch< MessagingAuth >( {
				path: addQueryArgs( '/help-center/authenticate/chat', params ),
				method: 'POST',
				global: true,
		  } as APIFetchOptions );
}

export default function useMessagingAuth( enabled: boolean ) {
	return useQuery< MessagingAuth >( [ 'getMessagingAuth' ], requestMessagingAuth, {
		staleTime: 10 * 60 * 1000, // 10 minutes
		meta: {
			persist: false,
		},
		enabled,
	} );
}