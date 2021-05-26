/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import SupportInfo from 'calypso/components/support-info';
import getJetpackModules from 'calypso/state/selectors/get-jetpack-modules';
import { hasFeature } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isFreeAtomicSite } from 'calypso/lib/site/utils';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';

const SeoSettingsHelpCard = ( {
	disabled,
	hasAdvancedSEOFeature,
	siteId,
	siteIsJetpack,
	siteIsFreeAtomic,
	translate,
} ) => {
	const seoHelpLink =
		siteIsJetpack && ! siteIsFreeAtomic
			? 'https://jetpack.com/support/seo-tools/'
			: 'https://wpbizseo.wordpress.com/';

	return (
		<div id="seo">
			<SettingsSectionHeader title={ translate( 'Search engine optimization' ) } />
			{ hasAdvancedSEOFeature && ! siteIsFreeAtomic && (
				<Card className="seo-settings__help">
					<p>
						{ translate(
							'{{b}}WordPress.com has great SEO{{/b}} out of the box. All of our themes are optimized ' +
								"for search engines, so you don't have to do anything extra. However, you can tweak " +
								"these settings if you'd like more advanced control. Read more about what you can do " +
								"to {{a}}optimize your site's SEO{{/a}}.",
							{
								components: {
									a: <a href={ seoHelpLink } />,
									b: <strong />,
								},
							}
						) }
					</p>

					{ siteIsJetpack && ! siteIsFreeAtomic && (
						<SupportInfo
							text={ translate(
								'To help improve your search page ranking, you can customize how the content titles' +
									' appear for your site. You can reorder items such as ‘Site Name’ and ‘Tagline’,' +
									' and also add custom separators between the items.'
							) }
							link="https://jetpack.com/support/seo-tools/"
						/>
					) }
					{ siteIsJetpack && ! siteIsFreeAtomic && (
						<JetpackModuleToggle
							siteId={ siteId }
							moduleSlug="seo-tools"
							label={ translate( 'Enable SEO Tools to optimize your site for search engines' ) }
							disabled={ disabled }
						/>
					) }
				</Card>
			) }
		</div>
	);
};

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const siteIsAtomic = isAtomicSite( state, siteId );
	const siteIsFreeAtomic = isFreeAtomicSite( site, siteIsAtomic );
	const hasAdvancedSEOFeature =
		hasFeature( state, siteId, FEATURE_ADVANCED_SEO ) &&
		( ! siteIsJetpack || get( getJetpackModules( state, siteId ), 'seo-tools.available', false ) );

	return {
		siteId,
		siteIsJetpack,
		siteIsAtomic,
		siteIsFreeAtomic,
		hasAdvancedSEOFeature,
	};
} )( localize( SeoSettingsHelpCard ) );
