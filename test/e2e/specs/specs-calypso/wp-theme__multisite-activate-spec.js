/**
 * External dependencies
 */
import assert from 'assert';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper';
import * as driverHelper from '../../lib/driver-helper';

import ThemesPage from '../../lib/pages/themes-page.js';
import SidebarComponent from '../../lib/components/sidebar-component';
import LoginFlow from '../../lib/flows/login-flow.js';

const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Themes: Activate a theme, all sites (${ screenSize }) @parallel`, function () {
	let driver;

	beforeAll( () => ( driver = global.__BROWSER__ ) );

	it( 'Login and select themes', async function () {
		this.themeSearchName = 'twenty';
		this.expectedTheme = 'Twenty F';

		this.loginFlow = new LoginFlow( driver, 'multiSiteUser' );
		await this.loginFlow.loginAndSelectMySite();

		this.sidebarComponent = await SidebarComponent.Expect( driver );
		await this.sidebarComponent.selectThemes();
	} );

	it( 'can search for free themes', async function () {
		this.themesPage = await ThemesPage.Expect( driver );
		await this.themesPage.waitUntilThemesLoaded();
		await this.themesPage.showOnlyFreeThemes();
		await this.themesPage.searchFor( this.themeSearchName );
		await this.themesPage.waitForThemeStartingWith( this.expectedTheme );

		this.currentThemeName = await this.themesPage.getFirstThemeName();
	} );

	it( 'click new theme more button', async function () {
		await this.themesPage.clickNewThemeMoreButton();
	} );

	it( 'should show a menu', async function () {
		const displayed = await this.themesPage.popOverMenuDisplayed();
		assert( displayed, 'Popover menu not displayed' );
	} );

	/*
	Commented out - using either `By` or `driverHelper` causes CI to not run e2e tests
	What is the correct way to verify that the thanks modal is shown?
	*/
	// eslint-disable-next-line jest/no-disabled-tests
	it.skip( 'can click activate', async function () {
		await this.themesPage.clickPopoverItem( 'Activate' );
		const thanksModalShown = await driverHelper.isElementEventuallyLocatedAndVisible(
			driver,
			By.css( '.themes__thanks-modal' )
		);
		return assert(
			thanksModalShown,
			"The 'Thanks for Choosing Twenty Sixteen' modal was not displayed after activating"
		);
	} );

	// Some tests about activating a theme in the context of "All Sites" were
	// removed - check git history. Visiting "/themes" while logged out should now
	// force you to select a site before proceeding. You'll be redirected to
	// "/themes/<site>" and be operating only in the context of one site.
} );
