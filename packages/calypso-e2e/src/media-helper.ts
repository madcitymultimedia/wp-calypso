/**
 * External dependencies
 */
import config from 'config';
import fs from 'fs-extra';
import path from 'path';
import sanitize from 'sanitize-filename';

/**
 * Internal dependencies
 */
import { getLocale, getViewportName } from './browser-helper';

const artifacts: { [ key: string ]: string } = config.get( 'artifacts' );

/**
 * Returns the base asset directory.
 *
 * If the environment variable TEMP_ASSET_PATH is set, this will return a path
 * to the directory. Otherwise, the parent directory of this current file.
 *
 * @returns {string} Absolute path to the directory.
 */
export function getAssetDir(): string {
	return path.resolve( process.env.TEMP_ASSET_PATH || path.join( __dirname, '..' ) );
}

/**
 * Returns the screenshot save directory.
 *
 * If the environment variable SCREENSHOTDIR is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {string} Absolute path to the directory.
 */
export function getScreenshotDir(): string {
	return path.resolve( getAssetDir(), process.env.SCREENSHOTDIR || artifacts.screenshot );
}

/**
 * Returns the video save directory.
 *
 * If the environment variable VIDEODIR is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {string} Absolute path to the directory.
 */
export function getVideoDir(): string {
	return path.resolve( getAssetDir(), process.env.VIDEODIR || artifacts.video );
}

/**
 * Returns a descriptive file name for the requested artifact type.
 *
 * @param {{[key: string]: string}} param0 Object assembled by the caller.
 * @param {string} param0.name Name of the test suite or step that failed.
 * @param {string} param0.type Target type of the file name.
 * @returns {string} A Path-like string.
 * @throws {Error} If target type is not one of supported types.
 */
export function getFileName( {
	name,
	type,
}: {
	name: string;
	type: 'video' | 'screenshot';
} ): string {
	const suiteName = name.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const viewportName = getViewportName().toUpperCase();
	const locale = getLocale().toUpperCase();
	const date = getDateString();
	const fileName = `FAILED-${ locale }-${ viewportName }-${ suiteName }-${ date }`;

	let dir;
	let extension;

	if ( type.toLowerCase() === 'screenshot' ) {
		dir = getScreenshotDir();
		extension = 'png';
	} else if ( type.toLowerCase() === 'video' ) {
		dir = getVideoDir();
		extension = 'webm';
	} else {
		throw new Error( `Unsupported type specified, received ${ type }` );
	}
	return `${ dir }/${ fileName }.${ extension }`;
}

/**
 * Returns the current date as a time stamp.
 *
 * @returns {string} Date represented as a timestamp.
 */
export function getDateString(): string {
	return new Date().getTime().toString();
}

/**
 * Given a full path to file on disk, remove the file.
 *
 * @param {string} filePath Full path on disk.
 * @returns {void} No return value.
 */
export function deleteFile( filePath: string ): void {
	fs.removeSync( filePath );
}

/**
 * Creates a temporary test file by cloning a source file under a new name.
 *
 * @param {{[key: string]: string}} param0 Parameter object.
 * @param {string} param0.testFileName Basename of the test file to be generated.
 * @param {string} param0.sourceFileName Basename of the source file to be cloned.
 * @returns {string} Full path to the generated test file.
 */
export function createTestFile( {
	testFileName,
	sourceFileName,
}: {
	testFileName: string;
	sourceFileName: string;
} ): string {
	testFileName = sanitize( testFileName );
	const sourceFileDir = path.join( __dirname, '../../../../test/e2e/image-uploads/' );
	const sourceFilePath = path.join( sourceFileDir, sourceFileName );

	// Generated test file will also go under the source directory.
	// Attempting to copy the file elsewhere will trigger the following error on TeamCity:
	// EPERM: operation not permitted
	const testFilePath = path.join( sourceFileDir, testFileName );
	// Copy the source file specified to testFilePath, creating a clone differing only by name.
	fs.copySync( sourceFilePath, testFilePath );

	return testFilePath;
}

/**
 * Returns the path to a generated temporary JPEG image file.
 *
 * @param {string} filename Basename used for the generated test file.
 * @returns {string} Full path on disk to the generated test file.
 */
export function getTestImage( filename: string ): string {
	return createTestFile( { testFileName: filename, sourceFileName: 'image0.jpg' } );
}

/**
 * Returns the path to a generated temporary MP3 audio file.
 *
 * @param {string} filename Basename used for the generated test file.
 * @returns {string} Full path on disk to the generated test file.
 */
export function getTestAudio( filename: string ): string {
	return createTestFile( { testFileName: filename, sourceFileName: 'bees.mp3' } );
}
