/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Returns whether the user is currently editing a custom page template in the block editor.
 *
 * `wp-custom-template` is used as a prefix for custom page templates currently in Gutenberg.
 *
 * @returns {boolean} is editing a custom page template or not
 */
export const getIsEditingCustomPostTemplate = () =>
	select( 'core/edit-post' ).getEditedPostTemplate()?.slug.startsWith( 'wp-custom-template' );
