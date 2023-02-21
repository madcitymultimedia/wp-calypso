import { createSelector } from '@automattic/state-utils';
import { isRequesting, isRequestingForAllSites } from './selectors';
import type {
	InstalledPlugins,
	InstalledPluginData,
	Plugin,
	PluginFilter,
	PluginSites,
} from './types';
import type { AppState } from 'calypso/types';

import 'calypso/state/plugins/init';

const getSiteIdsThatHavePlugins = createSelector(
	( state: AppState ) => {
		return Object.keys( state.plugins.installed.plugins ).map( ( siteId ) => Number( siteId ) );
	},
	( state: AppState ) => [ state.plugins.installed.plugins ]
);

const emptyObject = {};

/**
 * The server returns plugins store at state.plugins.installed.plugins are indexed by site, which means
 * that the information for a plugin may be spread across multiple site objects. This selector transforms
 * that structure into one indexed by the plugin slugs and memoizes that structure.
 */
export const getAllPluginsIndexedByPluginSlug = createSelector(
	( state: AppState ) => {
		if ( isRequestingForAllSites( state ) ) {
			return emptyObject;
		}

		return getSiteIdsThatHavePlugins( state ).reduce(
			( plugins: { [ key: string ]: Plugin }, siteId ) => {
				if ( isRequesting( state, siteId ) ) {
					return plugins;
				}

				const installedPlugins = state.plugins.installed.plugins as InstalledPlugins;

				const pluginsForSite = installedPlugins[ siteId ] || [];
				pluginsForSite.forEach( ( plugin: InstalledPluginData ) => {
					const { active, autoupdate, update, version, ...otherPluginInfo } = plugin;

					const sitePluginInfo: { [ key: string ]: any } = {};
					[ 'active', 'autoupdate', 'update', 'version' ].forEach( ( prop ) => {
						if ( undefined !== ( plugin as any )[ prop ] ) {
							sitePluginInfo[ prop ] = ( plugin as any )[ prop ];
						}
					} );

					plugins[ plugin.slug ] = {
						...plugins[ plugin.slug ],
						...otherPluginInfo,
						sites: {
							...plugins[ plugin.slug ]?.sites,
							[ siteId ]: sitePluginInfo,
						},
					};
				} );
				return plugins;
			},
			{}
		);
	},
	( state: AppState ) => [
		isRequestingForAllSites( state ),
		getSiteIdsThatHavePlugins( state ),
		...getSiteIdsThatHavePlugins( state ).map( ( siteId: number ) =>
			isRequesting( state, siteId )
		),
	]
) as { ( state: AppState ): { [ pluginSlug: string ]: Plugin } };

const _filters: { [ key in PluginFilter ]: ( plugin: Plugin ) => boolean } = {
	none: function () {
		return false;
	},
	all: function () {
		return true;
	},
	active: function ( plugin: Plugin ) {
		return (
			Object.values( plugin.sites ).some( ( site ) => site.active ) ||
			!! plugin.statusRecentlyChanged
		);
	},
	inactive: function ( plugin: Plugin ) {
		return (
			Object.values( plugin.sites ).some( ( site ) => ! site.active ) ||
			!! plugin.statusRecentlyChanged
		);
	},
	updates: function ( plugin: Plugin ) {
		return (
			Object.values( plugin.sites ).some(
				( site ) => !! site.update && ! site.update.recentlyUpdated
			) || !! plugin.statusRecentlyChanged
		);
	},
};

/**
 * The plugins here differ from the plugin objects found on state.plugins.installed.plugins in that each plugin
 * object has data from all the different sites on it, whereas on state.plugins.installed.plugins they only have
 * the state for the site which index they are under. The objects here are the same as those returned from
 * getAllPluginsIndexedByPluginSlug, except they are indexed by siteId.
 */
export const getAllPluginsIndexedBySiteId = createSelector(
	( state: AppState ) => {
		const allPluginsIndexedByPluginSlug = getAllPluginsIndexedByPluginSlug( state );

		return Object.values( allPluginsIndexedByPluginSlug ).reduce(
			(
				pluginsIndexedBySiteId: { [ siteId: number ]: { [ pluginSlug: string ]: Plugin } },
				plugin
			) => {
				Object.keys( plugin.sites ).forEach( ( siteIdString ) => {
					const siteId = Number( siteIdString );
					pluginsIndexedBySiteId[ siteId ] = {
						...pluginsIndexedBySiteId[ siteId ],
						[ plugin.slug ]: plugin,
					};
				} );

				return pluginsIndexedBySiteId;
			},
			{}
		);
	},
	( state: AppState ) => [
		getAllPluginsIndexedByPluginSlug( state ),
		getSiteIdsThatHavePlugins( state ),
	]
) as { ( state: AppState ): { [ siteId: number ]: { [ pluginSlug: string ]: Plugin } } };

export const getFilteredAndSortedPlugins = createSelector(
	( state: AppState, siteIds: number[], pluginFilter?: PluginFilter ) => {
		const allPluginsIndexedBySiteId = getAllPluginsIndexedBySiteId( state );

		// Properties on the objects in allPluginsIndexedBySiteId will be modified and the
		// selector memoization always returns the same object, so use `structuredClone` to avoid
		// altering it for everyone.
		const allPluginsForSites: { [ pluginSlug: string ]: Plugin } = structuredClone(
			siteIds
				.map( ( siteId: number ) => allPluginsIndexedBySiteId[ siteId ] )
				.filter( Boolean )
				.reduce( ( accumulator, current ) => ( { ...accumulator, ...current } ), {} )
		);

		// Filter the sites object on the plugins so that only data for the requested siteIds is present
		for ( const pluginSlug of Object.keys( allPluginsForSites ) ) {
			allPluginsForSites[ pluginSlug ].sites = Object.entries(
				allPluginsForSites[ pluginSlug ].sites
			)
				.filter( ( [ siteId ] ) => siteIds.includes( Number( siteId ) ) )
				.reduce( ( obj, [ siteId, site ] ) => {
					obj[ siteId ] = site;
					return obj;
				}, {} as PluginSites );
		}

		// Filter the plugins using the pluginFilter if it is set
		const pluginList =
			pluginFilter && _filters[ pluginFilter ]
				? Object.values( allPluginsForSites )
						.filter( ( plugin ) => _filters[ pluginFilter ]( plugin ) )
						.reduce( ( obj, plugin ) => {
							obj[ plugin.slug ] = plugin;
							return obj;
						}, {} as { [ pluginSlug: string ]: Plugin } )
				: allPluginsForSites;

		// Sort the plugins alphabetically by slug
		const sortedPluginListEntries = Object.values( pluginList ).sort( ( pluginA, pluginB ) => {
			const pluginSlugALower = pluginA.slug.toLowerCase();
			const pluginSlugBLower = pluginB.slug.toLowerCase();
			if ( pluginSlugALower < pluginSlugBLower ) {
				return -1;
			} else if ( pluginSlugALower > pluginSlugBLower ) {
				return 1;
			}
			return 0;
		} );

		return sortedPluginListEntries;
	},
	( state: AppState ) => [ getAllPluginsIndexedBySiteId( state ) ],
	( state: AppState, siteIds: number[], pluginFilter?: PluginFilter ) => {
		return [ siteIds, pluginFilter ].flat().join( '-' );
	}
);

export function getPluginsOnSites( state: AppState, plugins: Plugin[] ) {
	return plugins.reduce( ( acc: { [ pluginSlug: string ]: Plugin }, plugin: Plugin ) => {
		const siteIds = Object.keys( plugin.sites ).map( Number );
		const pluginOnSites = getPluginOnSites( state, siteIds, plugin.slug );
		if ( pluginOnSites ) {
			acc[ plugin.slug ] = pluginOnSites;
		}
		return acc;
	}, {} );
}

export function getPluginOnSites( state: AppState, siteIds: number[], pluginSlug: string ) {
	const plugin = getAllPluginsIndexedByPluginSlug( state )[ pluginSlug ];

	if ( ! plugin ) {
		return undefined;
	}

	if ( siteIds.some( ( siteId ) => !! plugin.sites[ siteId ] ) ) {
		return plugin;
	}

	return undefined;
}

export const getPluginOnSite = createSelector(
	( state: AppState, siteId: number, pluginSlug: string ) => {
		const plugin = getAllPluginsIndexedByPluginSlug( state )[ pluginSlug ];

		const { sites, ...pluginWithoutSites } = plugin;

		if ( ! plugin || ! plugin.sites[ siteId ] ) {
			return undefined;
		}

		// To keep compatibility with some behavior that existed before the refactor
		// in #73296 the returned object has the site specific data lifted onto it, and
		// the sites property has only the site data for the requested site.
		return {
			...pluginWithoutSites,
			...plugin.sites[ siteId ],
			...{ sites: { [ siteId ]: plugin.sites[ siteId ] } },
		};
	},
	( state: AppState ) => [ getAllPluginsIndexedByPluginSlug( state ) ]
);

export const getPluginsOnSite = createSelector(
	( state: AppState, siteId: number, pluginSlugs: string[] ) => {
		return pluginSlugs.map( ( pluginSlug ) => getPluginOnSite( state, siteId, pluginSlug ) );
	},
	( state: AppState, siteId: number, pluginSlugs: string[] ) => [
		...pluginSlugs.map( ( pluginSlug ) => getPluginOnSite( state, siteId, pluginSlug ) ),
	],
	( state: AppState, siteId: number, pluginSlugs: string[] ) => [ siteId, ...pluginSlugs ].join()
);
