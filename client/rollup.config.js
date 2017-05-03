import hasha from 'hasha';
import hash from 'rollup-plugin-hash';
import svelte from 'rollup-plugin-svelte';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import buble from 'rollup-plugin-buble';
import CleanCSS from 'clean-css';
import * as fs from 'fs';

const dev = !!process.env.DEV;
const globalStyles = fs.readFileSync( 'server/templates/main.css', 'utf-8' );

export default {
	entry: 'client/src/main.js',
	dest: 'client/dist/bundle.js', // otherwise rollup-watch complains
	format: 'iife',
	plugins: [
		nodeResolve(),
		commonjs(),
		svelte({
			css: componentStyles => {
				let styles = globalStyles.replace( '__components__', componentStyles );

				try {
					fs.mkdirSync( 'client/dist' );
				} catch ( err ) {
					// noop
				}

				if ( dev ) {
					fs.writeFileSync( `client/dist/main.css`, styles );
				} else {
					styles = new CleanCSS().minify( styles ).styles;

					const hash = hasha( styles, { algorithm: 'md5' });
					fs.writeFileSync( `client/dist/main.${hash}.css`, styles );
					fs.writeFileSync( `server/manifests/css.json`, JSON.stringify({ 'main.css': `client/dist/main.${hash}.css` }) );
				}
			}
		}),
		buble(),
		!dev && hash({
			dest: 'client/dist/bundle.[hash].js',
			manifest: 'server/manifests/bundle.json',
			manifestKey: 'bundle.js'
		}),
		!dev && uglify()
	]
};