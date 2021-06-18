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
	// Parametrized test.
	[
		[ 'Simple', 'defaultUser' ],
		[ 'Atomic', 'wooCommerceUser' ],
	].forEach( function ( [ siteType, user ] ) {
		describe( `Upload media files (${ siteType })`, function () {
			let mediaPage;
			let testFiles;
			const basename = MediaHelper.getDateString();

			before( 'Create test files', async function () {
				// In the future, this can be expanded to also test document files, video, etc.
				testFiles = {
					image: MediaHelper.getTestImage( basename + '.jpg' ),
					audio: MediaHelper.getTestAudio( basename + '.mp3' ),
				};
			} );

			it( 'Log In', async function () {
				const loginFlow = new LoginFlow( this.page, user );
				await loginFlow.logIn();
			} );

			it( 'Navigate to Media', async function () {
				const sidebarComponent = await SidebarComponent.Expect( this.page );
				await sidebarComponent.gotoMenu( { item: 'Media' } );
			} );

			it( 'See media gallery', async function () {
				mediaPage = await MediaPage.Expect( this.page );
			} );

			it( 'Upload image then confirm', async function () {
				await mediaPage.upload( testFiles.image );
				await mediaPage.confirmUploadSuccessful( testFiles.image );
			} );

			it( 'Upload audio then confirm', async function () {
				await mediaPage.upload( testFiles.audio );
				await mediaPage.confirmUploadSuccessful( testFiles.audio );
			} );

			after( 'Clean up disk', async function () {
				for ( const [ , filepath ] of Object.entries( testFiles ) ) {
					MediaHelper.deleteFile( filepath );
				}
			} );
		} );
	} );

	describe( 'Upload unsupported file', function () {
		let mediaPage;
		let testFile;
		const basename = MediaHelper.getDateString();

		before( 'Create test files', async function () {
			// No extension given, which would make this invalid file from
			// WPCOM's perspective.
			testFile = MediaHelper.getTestImage( basename + '' );
		} );

		it( 'Log In', async function () {
			const loginFlow = new LoginFlow( this.page );
			await loginFlow.logIn();
		} );

		it( 'Navigate to Media', async function () {
			const sidebarComponent = await SidebarComponent.Expect( this.page );
			await sidebarComponent.gotoMenu( { item: 'Media' } );
		} );

		it( 'See media gallery', async function () {
			mediaPage = await MediaPage.Expect( this.page );
		} );

		it( 'Upload image then confirm', async function () {
			await mediaPage.upload( testFile );
		} );

		it( 'Upload rejected for unsupported file', async function () {
			await mediaPage.confirmUploadRejected( testFile );
		} );
	} );
} );
