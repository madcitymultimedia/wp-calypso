/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';
import { toTitleCase } from '../../data-helper';

/**
 * Type dependencies
 */
import { ElementHandle, Page } from 'playwright';

const selectors = {
	sidebar: '.sidebar',
	heading: '.sidebar > li',
	subheading: '.sidebar__menu-item--child',
	expandedMenu: '.sidebar__menu--selected',
};

/**
 * Component representing the sidebar on the dashboard of WPCOM.
 *
 * @augments {BaseContainer}
 */
export class SidebarComponent extends BaseContainer {
	sidebar!: ElementHandle;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		super( page, selectors.sidebar );
	}

	/**
	 * Post-initialization steps of this object.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		await this.page.waitForLoadState( 'domcontentloaded' );
		this.sidebar = await this.page.waitForSelector( selectors.sidebar );
	}

	/**
	 * Given heading and subheading, or any combination of the two, locate and click on the items on the sidebar.
	 *
	 * This method supports any of the following use cases:
	 *   - heading only
	 *   - subheading only
	 *   - heading and subheading
	 *
	 * Heading is defined as the top-level menu item that is permanently visible on the sidebar, unless outside
	 * of the viewport.
	 *
	 * Subheading is defined as the child-level menu item that is exposed only on hover or by toggling open the listing by clicking on the parent menu item.
	 *
	 * Note, in the current Nav Unification paradigm, clicking on certain combinations of sidebar menu items will trigger
	 * navigation away to an entirely new page (eg. wp-admin). Attempting to reuse the SidebarComponent object
	 * under this condition will throw an exception from the Playwright engine.
	 *
	 * @param {{[key: string]: string}} param0 Named object parameter.
	 * @param {string} param0.item Plaintext representation of the top level heading.
	 * @param {string} param0.subitem Plaintext representation of the child level heading.
	 * @throws {Error} If neither item or subitem were specified in the parameter.
	 * @returns {Promise<void>} No return value.
	 */
	async gotoMenu( { item, subitem }: { item?: string; subitem?: string } ): Promise< void > {
		let selector;

		if ( item ) {
			item = toTitleCase( item ).trim();
			// This will exclude entries where the `heading` term matches multiple times
			// eg. `Settings` but they are sub-headings in reality, such as Jetpack > Settings.
			// Since the sub-headings are always hidden unless heading is selected, this works to
			// our advantage.
			selector = `${ selectors.heading } span:has-text("${ item }"):visible`;
		}

		if ( subitem ) {
			subitem = toTitleCase( subitem ).trim();
			// If there is a subheading, by definition the expanded menu element will always be present.
			await this.sidebar.waitForSelector( selectors.expandedMenu );
			// Explicitly select only the child headings and combine with the text matching engine.
			// This works better than using CSS pseudo-classes like `:has-text` or `:text-matches` for text
			// matching.
			selector = `${ selectors.subheading } >> text="${ subitem }"`;
		}

		if ( ! selector ) {
			throw new Error(
				`Selector is undefined. Check if item or subitem has been specified as argument(s).`
			);
		}

		await this._click( selector );
	}

	/**
	 * Performs the underlying click action on a sidebar menu item.
	 *
	 * This method ensures the sidebar is in a stable, consistent state prior to executing its actions,
	 * scrolls the sidebar and main content to expose the target element in the viewport, then
	 * executes a click.
	 *
	 * @param {string} selector Any selector supported by Playwright.
	 * @returns {Promise<void>} No return value.
	 */
	async _click( selector: string ): Promise< void > {
		// Wait for these promises in no particular order. We simply want to ensure the sidebar
		// and the page is in a state to accept inputs.
		await Promise.all( [
			this.page.waitForLoadState( 'domcontentloaded' ),
			this.sidebar.waitForElementState( 'stable' ),
		] );

		const elementHandle = await this.page.waitForSelector( selector );

		await this.page.evaluate(
			( [ element ] ) => {
				const elementBottom = element.getBoundingClientRect().bottom;
				const isOutsideViewport = window.innerHeight < elementBottom;

				if ( isOutsideViewport ) {
					window.scrollTo( 0, elementBottom - window.innerHeight );
				}
			},
			[ elementHandle ]
		);

		await elementHandle.click();

		await this.page.waitForLoadState( 'domcontentloaded' );
	}
}
