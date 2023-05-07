# Crappy Tests Are Better Than No Tests

This project desparately needs better tests than it has if we want anyone to be
able to help just a little vs. figuring out how everything is put together.

Tests in this directory are an attempt to help with that, and might one day
graduate to the main `tests` dir, but for now they're here ... and they're
better than nothing, _if just barely._

These were added by [Jim Meyer](https://github.com/purp) to help safely upgrade
a node package dependency. Hopefully one day we'll have better tests. Until 
then, see title above.

## Current Crappy Testing Methodology

1. **Update your baseline.** 
  1. Switch to whatever branch/commit you want to compare to
  1. Run `node fetch-pages.js`
  1. Move the `*.html` files created to different names like `index.baseline.html` etc.
1. **Generate current pages.**
  1. Do the same as above in the branch/commit you want to test
1. **Diff the output.** If they look clean, congrats! You haven't broken anything (that we know of ...)