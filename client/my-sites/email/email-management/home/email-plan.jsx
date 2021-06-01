/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { isEnabled } from '@automattic/calypso-config';
import { localize, useTranslate } from 'i18n-calypso';
import { handleRenewNowClick, isExpired } from 'calypso/lib/purchases';
import page from 'page';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import {
	emailManagement,
	emailManagementAddGSuiteUsers,
	emailManagementForwarding,
	emailManagementManageTitanAccount,
	emailManagementManageTitanMailboxes,
	emailManagementNewTitanAccount,
	emailManagementPurchaseNewEmailAccount,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import EmailPlanHeader from 'calypso/my-sites/email/email-management/home/email-plan-header';
import EmailPlanMailboxesList from 'calypso/my-sites/email/email-management/home/email-plan-mailboxes-list';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getEmailForwards } from 'calypso/state/selectors/get-email-forwards';
import {
	getEmailPurchaseByDomain,
	hasEmailSubscription,
} from 'calypso/my-sites/email/email-management/home/utils';
import {
	getGoogleAdminUrl,
	getGoogleMailServiceFamily,
	getGSuiteProductSlug,
	getProductType,
	hasGSuiteWithUs,
} from 'calypso/lib/gsuite';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { getTitanProductName, getTitanSubscriptionId, hasTitanMailWithUs } from 'calypso/lib/titan';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import {
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import HeaderCake from 'calypso/components/header-cake';
import isRequestingEmailForwards from 'calypso/state/selectors/is-requesting-email-forwards';
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL } from 'calypso/lib/titan/constants';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

const UpgradeNavItem = ( { currentRoute, domain, selectedSiteSlug } ) => {
	const translate = useTranslate();

	if ( ! hasEmailForwards( domain ) ) {
		return null;
	}

	return (
		<VerticalNavItem
			path={ emailManagementPurchaseNewEmailAccount( selectedSiteSlug, domain.name, currentRoute ) }
		>
			{ translate( 'Upgrade to unlock email features' ) }
		</VerticalNavItem>
	);
};

UpgradeNavItem.propTypes = {
	currentRoute: PropTypes.string,
	domain: PropTypes.object.isRequired,
	selectedSiteSlug: PropTypes.string.isRequired,
};

class EmailPlan extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,

		// Connected props
		currentRoute: PropTypes.string,
		emailForwards: PropTypes.array,
		hasSubscription: PropTypes.bool,
		isLoadingEmailForwards: PropTypes.bool,
		isLoadingPurchase: PropTypes.bool,
		purchase: PropTypes.object,
	};

	state = {
		isLoadingEmailAccounts: false,
		hasLoadedEmailAccounts: false,
		emailAccounts: [],
	};

	componentDidMount() {
		this.loadEmailAccounts();
	}

	componentDidUpdate() {
		this.loadEmailAccounts();
	}

	loadEmailAccounts() {
		const { domain, emailForwards, isLoadingEmailForwards, selectedSite } = this.props;

		if ( this.state.isLoadingEmailAccounts ) {
			return;
		}

		if ( this.state.hasLoadedEmailAccounts ) {
			if ( ! this.shouldCheckForEmailForwards( domain ) ) {
				return;
			}

			// Special handling for email forwards, as we want to trigger a re-fetch if the default email forward
			// Redux data has been updated due to adding or removing an email forward.
			if ( emailForwards === null || isLoadingEmailForwards ) {
				return;
			}

			// We've finished loading both sets of data. If the two data sources have the same
			// number of mailboxes, don't re-fetch the data below - this should help to
			// prevent fetch loops triggered via componentDidUpdate().
			if ( this.getMailboxes().length === emailForwards.length ) {
				return;
			}
		}

		this.setState( {
			isLoadingEmailAccounts: true,
		} );

		wp.undocumented()
			.getEmailAccountsForSiteAndDomain( selectedSite.ID, domain.name )
			.then(
				( data ) => {
					this.setState( {
						isLoadingEmailAccounts: false,
						hasLoadedEmailAccounts: true,
						emailAccounts: data?.accounts || [],
					} );
				},
				() => {
					this.setState( {
						isLoadingEmailAccounts: false,
						hasLoadedEmailAccounts: true,
						emailAccounts: [],
					} );
				}
			);
	}

	shouldCheckForEmailForwards = ( domain ) => {
		return ! hasGSuiteWithUs( domain ) && ! hasTitanMailWithUs( domain );
	};

	getAccount() {
		return this.state?.emailAccounts[ 0 ];
	}

	getMailboxes() {
		const account = this.getAccount();

		return account?.emails ?? [];
	}

	handleBack = () => {
		const { selectedSite } = this.props;

		page( emailManagement( selectedSite.slug ) );
	};

	handleRenew = ( event ) => {
		event.preventDefault();

		const { purchase, selectedSite } = this.props;

		handleRenewNowClick( purchase, selectedSite.slug, {
			tracksProps: { source: 'email-plan-view' },
		} );
	};

	getAddMailboxProps() {
		const { currentRoute, domain, selectedSite } = this.props;

		if ( hasGSuiteWithUs( domain ) ) {
			return {
				path: emailManagementAddGSuiteUsers(
					selectedSite.slug,
					domain.name,
					getProductType( getGSuiteProductSlug( domain ) ),
					currentRoute
				),
			};
		}

		if ( hasTitanMailWithUs( domain ) ) {
			if ( getTitanSubscriptionId( domain ) ) {
				return {
					path: emailManagementNewTitanAccount( selectedSite.slug, domain.name, currentRoute ),
				};
			}

			const showExternalControlPanelLink = ! isEnabled( 'titan/iframe-control-panel' );
			const controlPanelUrl = showExternalControlPanelLink
				? emailManagementTitanControlPanelRedirect( selectedSite.slug, domain.name, currentRoute, {
						context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
				  } )
				: emailManagementManageTitanAccount( selectedSite.slug, domain.name, currentRoute, {
						context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
				  } );

			return {
				external: showExternalControlPanelLink,
				path: controlPanelUrl,
			};
		}

		return {
			path: emailManagementForwarding( selectedSite.slug, domain.name, currentRoute ),
		};
	}

	getHeaderText() {
		const { domain, translate } = this.props;

		if ( hasGSuiteWithUs( domain ) ) {
			const googleMailService = getGoogleMailServiceFamily( getGSuiteProductSlug( domain ) );

			return translate( '%(googleMailService)s settings', {
				args: {
					googleMailService,
				},
				comment: '%(googleMailService)s can be either "GSuite" or "Google Workspace"',
			} );
		}

		if ( hasTitanMailWithUs( domain ) ) {
			return translate( '%(titanProductName)s settings', {
				args: {
					titanProductName: getTitanProductName(),
				},
				comment:
					'%(titanProductName) is the name of the product, which should be "Professional Email" translated',
			} );
		}

		return translate( 'Email forwarding settings' );
	}

	renderViewBillingAndPaymentSettingsNavItem() {
		const { hasSubscription, purchase, selectedSite, translate } = this.props;

		if ( ! hasSubscription ) {
			return null;
		}

		if ( ! purchase ) {
			return <VerticalNavItem isPlaceholder />;
		}

		const managePurchaseUrl = getManagePurchaseUrlFor( selectedSite.slug, purchase.id );

		return (
			<VerticalNavItem path={ managePurchaseUrl }>
				{ translate( 'View billing and payment settings' ) }
			</VerticalNavItem>
		);
	}

	getManageAllNavItemProps() {
		const { currentRoute, domain, selectedSite } = this.props;

		if ( hasGSuiteWithUs( domain ) ) {
			return {
				external: true,
				path: getGoogleAdminUrl( domain.name ),
			};
		}

		if ( hasTitanMailWithUs( domain ) ) {
			if ( isEnabled( 'titan/iframe-control-panel' ) ) {
				return {
					path: emailManagementManageTitanAccount( selectedSite.slug, domain.name, currentRoute ),
				};
			}

			return {
				path: emailManagementManageTitanMailboxes( selectedSite.slug, domain.name, currentRoute ),
			};
		}

		return {
			path: emailManagementForwarding( selectedSite.slug, domain.name, currentRoute ),
		};
	}

	renderManageAllMailboxesNavItem() {
		const { domain, translate } = this.props;

		if ( ! hasGSuiteWithUs( domain ) && ! hasTitanMailWithUs( domain ) ) {
			return null;
		}

		const manageAllNavItemProps = this.getManageAllNavItemProps();

		return (
			<VerticalNavItem { ...manageAllNavItemProps }>
				{ translate( 'Manage all mailboxes', {
					comment:
						'This is the text for a link to manage all email accounts/mailboxes for a subscription',
				} ) }
			</VerticalNavItem>
		);
	}

	renderAddNewMailboxesOrRenewNavItem() {
		const { domain, hasSubscription, purchase, translate } = this.props;

		if ( hasTitanMailWithUs( domain ) && ! hasSubscription ) {
			return (
				<VerticalNavItem { ...this.getAddMailboxProps() }>
					{ translate( 'Add new mailboxes' ) }
				</VerticalNavItem>
			);
		}

		if ( hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain ) ) {
			if ( ! purchase ) {
				return <VerticalNavItem isPlaceholder />;
			}

			if ( isExpired( purchase ) ) {
				return (
					<VerticalNavItem onClick={ this.handleRenew } path="#">
						{ translate( 'Renew to add new mailboxes' ) }
					</VerticalNavItem>
				);
			}

			return (
				<VerticalNavItem { ...this.getAddMailboxProps() }>
					{ translate( 'Add new mailboxes' ) }
				</VerticalNavItem>
			);
		}

		return (
			<VerticalNavItem { ...this.getAddMailboxProps() }>
				{ translate( 'Add new email forwards' ) }
			</VerticalNavItem>
		);
	}

	render() {
		const { currentRoute, domain, selectedSite, hasSubscription, purchase, isLoadingPurchase } = this.props;

		const { isLoadingEmailAccounts } = this.state;

		// Ensure we check for email forwarding additions and removals
		const queryForEmailForwards = this.shouldCheckForEmailForwards( domain );

		return (
			<>
				{ selectedSite && hasSubscription && <QuerySitePurchases siteId={ selectedSite.ID } /> }
				{ queryForEmailForwards && <QueryEmailForwards domainName={ domain.name } /> }

				<HeaderCake onClick={ this.handleBack }>{ this.getHeaderText() }</HeaderCake>

				<EmailPlanHeader
					domain={ domain }
					hasEmailSubscription={ hasSubscription }
					isLoadingEmails={ isLoadingEmailAccounts }
					isLoadingPurchase={ isLoadingPurchase }
					purchase={ purchase }
					selectedSite={ selectedSite }
					emailAccount={ this.state.emailAccounts?.[ 0 ] }
				/>

				<EmailPlanMailboxesList
					account={ this.getAccount() }
					domain={ domain }
					mailboxes={ this.getMailboxes() }
					isLoadingEmails={ isLoadingEmailAccounts }
				/>

				<div className="email-plan__actions">
					<VerticalNav>
						{ this.renderAddNewMailboxesOrRenewNavItem() }

						<UpgradeNavItem
							currentRoute={ currentRoute }
							domain={ domain }
							selectedSiteSlug={ selectedSite.slug }
						/>

						{ this.renderManageAllMailboxesNavItem() }

						{ this.renderViewBillingAndPaymentSettingsNavItem() }
					</VerticalNav>
				</div>
			</>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		emailForwards: getEmailForwards( state, ownProps.domain.name ),
		isLoadingEmailForwards: isRequestingEmailForwards( state, ownProps.domain.name ),
		isLoadingPurchase:
			isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
		purchase: getEmailPurchaseByDomain( state, ownProps.domain ),
		hasSubscription: hasEmailSubscription( ownProps.domain ),
	};
} )( localize( EmailPlan ) );
