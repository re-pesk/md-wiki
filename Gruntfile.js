var createIndex = function (grunt, mode) {
    'use strict';
    var conf = grunt.config('index')[mode],
        tmpl = grunt.file.read(conf.template),
        fileList = grunt.config('fileList')[mode];

    grunt.config.set('templatesString', '');

    // register the task name in global scope so we can access it in the .ejs file
    const data = {
        mode,
        destination: conf.dest,
        template: conf.template,
        cssFiles: fileList.cssFiles,
        jsFiles: fileList.jsFiles,
        jsMain: fileList.jsMain,
    };

    grunt.config.set('data', data);

    grunt.file.write(conf.dest, grunt.template.process(tmpl));
    // grunt.log.writeln('Generated \'' + conf.dest + '\' from \'' + conf.template + '\'');
};

/*global module:false*/
module.exports = function (grunt) {
    'use strict';
    // Project configuration.

    const packageJson = grunt.file.readJSON('package.json');

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // Metadata.
        pkg: {
            title: packageJson.title,
            name: packageJson.name,
            version: packageJson.version,
            author: packageJson.author,
            license: {
                name: packageJson.license,
                url: 'https://github.com/Dynalon/mdwiki/blob/master/LICENSE.txt',
            },
            repository: packageJson.repository,
        },

        fileList: {
            ownJsFiles: [
                'src/js/marked.js',
                'src/js/init.js',
                'src/_compiled/js/compiled_ts.js',
                'src/_compiled/js/compiled.templates.js',
                'src/js/main.js',
                'src/js/util.js',
                'src/js/basic_skeleton.js',
                'src/js/bootstrap.js',

                // gimmicks
                'src/js/gimmicks/templating.js',
                'src/js/gimmicks/prism.js',
                /*
                'src/js/gimmicks/googlemaps.js',
                'src/js/gimmicks/alerts.js',
                'src/js/gimmicks/colorbox.js',
                // 'src/js/gimmicks/carousel.js',
                'src/js/gimmicks/disqus.js',
                'src/js/gimmicks/editme.js',
                'src/js/gimmicks/facebooklike.js',
                'src/js/gimmicks/forkmeongithub.js',
                'src/js/gimmicks/gist.js',
                'src/js/gimmicks/iframe.js',
                'src/js/gimmicks/math.js',
                // 'src/js/gimmicks/leaflet.js',
                'src/js/gimmicks/twitter.js',
                'src/js/gimmicks/youtube_embed.js',
                'src/js/gimmicks/yuml.js',
                */
            ],

            prod: {
                // REMEMBER:
                // * ORDER OF FILES IS IMPORTANT
                // * ALWAYS ADD EACH FILE TO BOTH minified/unminified SECTIONS!
                cssFiles: [
                    'src/_compiled/css/main.min.css',
                ],

                jsFiles: [
                    'node_modules/jquery/dist/jquery.min.js',
                    'node_modules/handlebars/dist/handlebars.runtime.min.js',
                    'node_modules/jquery-colorbox/jquery.colorbox-min.js',
                    'node_modules/prismjs/prism.js',
                    'node_modules/bootstrap/js/affix.js',
                    'node_modules/bootstrap/js/dropdown.js',
                ],

                cssMain: 'src/_compiled/css/main.min.css',
                jsMain: 'src/_compiled/js/main.min.js',
            },

            dev: {
                // for debug builds use unminified versions:
                cssFiles: [
                    'src/_compiled/css/main.css',
                ],
                jsFiles: [
                    'node_modules/jquery/dist/jquery.js',
                    'node_modules/bootstrap/js/affix.js',
                    'node_modules/bootstrap/js/dropdown.js',
                    'node_modules/handlebars/dist/handlebars.runtime.js',
                    'node_modules/prismjs/prism.js',
                    'node_modules/jquery-colorbox/jquery.colorbox.js',
                ],

                cssMain: 'src/_compiled/css/main.css',
                jsMain: 'src/_compiled/js/main.js',
            },
        },

        less: {
            prod: {
                options: {
                    compress: true,
                },
                files: {
                    '<%= fileList.prod.cssMain %>': 'src/styles/main.less',
                },
            },
            dev: {
                options: {
                    compress: false,
                },
                files: {
                    '<%= fileList.dev.cssMain %>': 'src/styles/main.less',
                },
            },
        },

        concat: {
            options: {
                stripBanners: false,
            },
            dev: {
                src: '<%= fileList.ownJsFiles %>',
                dest: '<%= fileList.dev.jsMain %>'
            },
        },
        uglify: {
            options: {
                stripBanners: true,
            },
            dist: {
                src: '<%= concat.dev.dest %>',
                dest: '<%= fileList.prod.jsMain %>',
            },
        },
        index: {
            prod: {
                template: 'src/index.ejs',
                dest: 'dist/<%= pkg.name %>.html',
            },

            dev: {
                template: 'src/index.ejs',
                dest: 'dist/<%= pkg.name %>-debug.html',
            },
        },
        copy: {
            ts_map: {
                expand: true,
                flatten: true,
                src: 'src/_compiled/js/compiled_ts.js.map',
                dest: 'dist/'
            },
            assets: {
                expand: true,
                cwd: 'src/assets',
                src: '**',
                dest: 'dist/'
            },
            release_prod: {
                expand: true,
                flatten: true,
                src: ['dist/<%= pkg.name %>.html'],
                dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/',
            },
            release_dev: {
                expand: true,
                flatten: true,
                src: ['dist/<%= pkg.name %>-debug.html', 'dist/compiled_ts.js.map'],
                dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/',
            },
            release_assets: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/release_assets/*'],
                        dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/',
                    },
                    {
                        expand: true,
                        cwd: 'src/assets',
                        src: '**',
                        dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/',
                    }
                ],
            },
        },
        clean: {
            compiled: ['src/_compiled/'],
            dist: ['dist/'],
            release: ['release/'],
        },
        shell: {
            zip_release: {
                options: {
                    stdout: true,
                },
                command: 'cd release && zip -r <%= grunt.config("pkg").name %>-<%= grunt.config("pkg").version %>.zip <%= grunt.config("pkg").name %>-<%= grunt.config("pkg").version %>',
            },
            /* precompilation of our handlebars templates */
            compile_templates: {
                options: {
                    stdout: true,
                },
                // -n mdwiki = Namespace is mdwiki
                // -f outputfile
                // -r root for the templates (will mirror the FS structure to the template name)
                // -m = minify
                command: './node_modules/.bin/handlebars -f src/_compiled/js/compiled.templates.js -r src/templates -m src/templates/**/*.html',
            },
            ts: {
                options: {
                    stdout: true,
                },
                command: './node_modules/.bin/tsc && echo-cli "Typescript compilation is completed!"',
            },
        },
        watch: {
            dev: {
                options: {
                    livereload: true,
                },
                files: [
                    'Gruntfile.js',
                    'src/js/*.js',
                    'src/js/**/*.js',
                    'src/js/ts/**/*.ts',
                    'src/js/**/*.tsx',
                    'src/templates/**/*.html',
                    'src/index.ejs',
                ],
                tasks: ['build:dev'],
            },
            test: {
                options: {
                    livereload: true,
                },
                files: [
                    'Gruntfile.js',
                    'tests/spec/*.js',
                    'tests/**/*.html',
                ],
            },
        },
        connect: {
            dev: {
                options: {
                    port: 3000,
                    hostname: '*',
                    base: './dist',
                    open: 'http://localhost:3000/<%= pkg.name %>-debug.html',
                    debug: true,
                },
            },
            test: {
                options: {
                    port: 3000,
                    hostname: '*',
                    base: ['./node_modules', './src/_compiled/js', './tests'],
                    open: 'http://localhost:3000/SpecRunner.html',
                    debug: true,
                },
            },
        },
    });

    /*** CUSTOM CODED TASKS ***/
    grunt.registerTask(
        'index',
        function (mode) {
            const strChek = { dev: null, prod: '' }[mode];
            grunt.log.writeln(`Generate ${grunt.config('pkg').name}${strChek ?? '-debug'}.html, inline all scripts${strChek ?? ' unminified'}.`);
            createIndex(grunt, mode);
        }
    );

    /*** NAMED TASKS ***/
    grunt.registerTask('build:dev', ['shell:ts', 'less:dev', 'shell:compile_templates', 'concat:dev', 'copy:ts_map', 'index:dev', 'copy:assets']);
    grunt.registerTask('build:prod', ['shell:ts', 'less:prod', 'shell:compile_templates', 'concat:dev', 'uglify:dist', 'index:prod', 'copy:assets']);
    grunt.registerTask('build', ['build:dev', 'build:prod']);

    grunt.registerTask('serve', ['build:dev', 'connect:dev', 'watch']);
    grunt.registerTask('test', ['build:dev', 'connect:test', 'watch']);

    grunt.registerTask('clear', ['clean:compiled', 'clean:dist', 'clean:release']);
    grunt.registerTask('copy:release', ['copy:release_prod', 'copy:release_dev', 'copy:release_assets']);

    grunt.registerTask('release', [
        'clear', 'build',
        'copy:release',
        'shell:zip_release'
    ]);
    // Default task
    grunt.registerTask('default', ['clear', 'build']);
};
