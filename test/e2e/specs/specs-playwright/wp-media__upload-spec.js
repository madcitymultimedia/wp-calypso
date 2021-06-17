/**
 * External dependencies
 */
import {
	DataHelper,
	LoginFlow,
	MediaPage,
	SidebarComponent,
	MediaHelper,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Media: Upload' ), function () {
	describe( 'Upload Image (Simple)', function () {
		let mediaPage;
		let testImage;
		const filename = MediaHelper.getDateString();

		before( 'Generate image file', async function () {
			testImage = MediaHelper.getTestImage( filename );
		} );

		it( 'Log In', async function () {
			const loginFlow = new LoginFlow( this.page );
			await loginFlow.login();
		} );

		it( 'Navigate to Media', async function () {
			const sidebarComponent = await SidebarComponent.Expect( this.page );
			await sidebarComponent.gotoMenu( { item: 'Media' } );
		} );

		it( 'See media gallery', async function () {
			mediaPage = await MediaPage.Expect( this.page );
		} );

		it( 'Upload image', async function () {
			await mediaPage.upload( testImage.fullpath );
		} );

		it( 'Confirm image is uploaded', async function () {
			await mediaPage.confirmFileUploaded( testImage.filename );
		} );

		after( 'Clean up disk', async function () {
			MediaHelper.deleteFile( testImage.fullpath );
		} );
	} );
} );
