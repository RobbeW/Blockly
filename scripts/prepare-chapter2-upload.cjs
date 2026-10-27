/* Compatibility: the upload folder now contains the complete reviewed website. */
'use strict';
console.log('Preparing the complete public website, including Turtle A/B/C.');
require('./prepare-github-upload.cjs').prepare({checkOnly:process.argv.includes('--check')});
