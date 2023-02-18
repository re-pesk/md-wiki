# MDwiki

100% static single file CMS/Wiki done purely with client-side Javascript and HTML5.

## See <http://www.mdwiki.info> for more info and documentation.

## !! This fork of original project is currently only for experiments and not for production use !!

## Download

See <https://github.com/Dynalon/mdwiki/releases> for original project and readily precompiled releases.

## How to build from source

(applies to this branch, others may differ)

1. Install node.js >= 16.0.0 and npm (if not included)
2. Clone the mdwiki repo
3. Install deps and build MDwiki:

    ```bash
    npm install
    npm update
    ./node_modules/.bin/grunt
    ```

    To get unminified source code compiled to `dist/mdwiki-debug.html`, as well as auto file watching and livereload support. Symlink the development mdwiki file into your webroot for testing.

4. Find the `mdwiki.html` in the `dist/` folder

5. Development server

    For loqading of development server, use

    ```bash
    ./node_modules/.bin/grunt serve
    ```

6. Release

    For creating release files, use

    ```bash
    ./node_modules/.bin/grunt release
    ```

    Files will be created in `release` folder
