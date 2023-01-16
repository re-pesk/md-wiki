var createIndex = function (grunt, taskType) {
    'use strict';
    var conf = grunt.config('index')[taskType],
        tmpl = grunt.file.read(conf.template);

    grunt.config.set('templatesString', '');

    // register the task name in global scope so we can access it in the .tmpl file
    grunt.config.set('currentTask', { name: { prod: 'release', dev: 'debug' }[taskType] });
    grunt.config.set('cssFiles', grunt.config('fileList').prod.cssFiles);
    grunt.config.set('jsFiles', grunt.config('fileList').prod.jsFiles);
    grunt.config.set('unminifiedCssFiles', grunt.config('fileList').dev.cssFiles);
    grunt.config.set('unminifiedJsFiles', grunt.config('fileList').dev.jsFiles);

    grunt.file.write(conf.dest, grunt.template.process(tmpl));
    grunt.log.writeln('Generated \'' + conf.dest + '\' from \'' + conf.template + '\'');
};

/*global module:false*/
module.exports = function (grunt) {
    'use strict';
    // Project configuration.

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // Metadata.
        pkg: {
            title: 'MDwiki',
            name: 'mdwiki',
            version: '0.7.0'
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
                'src/js/gimmicks/yuml.js'
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
            },

            dev: {
                // for debug builds use unminified versions:
                cssFiles: [
                    'src/_compiled/css/main.css'
                ],

                jsFiles: [
                    'node_modules/jquery/dist/jquery.js',
                    'node_modules/bootstrap/js/affix.js',
                    'node_modules/bootstrap/js/dropdown.js',
                    'node_modules/handlebars/dist/handlebars.runtime.js',
                    'node_modules/prismjs/prism.js',
                    'node_modules/jquery-colorbox/jquery.colorbox.js',
                ],
            }
        },

        less: {
            prod: {
                options: {
                    compress: true,
                },
                files: {
                    'src/_compiled/css/main.min.css': 'src/styles/main.less',
                },
            },
            dev: {
                options: {
                    compress: false,
                },
                files: {
                    'src/_compiled/css/main.css': 'src/styles/main.less',
                },
            },
        },

        concat: {
            options: {
                stripBanners: false
            },
            dev: {
                src: '<%= fileList.ownJsFiles %>',
                dest: 'src/_compiled/js/main.js'
            }
        },
        uglify: {
            options: {
                stripBanners: true
            },
            dist: {
                src: '<%= concat.dev.dest %>',
                dest: 'src/_compiled/js/main.min.js'
            }
        },
        index: {
            prod: {
                template: 'src/index.ejs',
                dest: 'dist/<%= pkg.name %>.html'
            },

            dev: {
                template: 'src/index.ejs',
                dest: 'dist/<%= pkg.name %>-debug.html'
            }
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
                dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/'
            },
            release_dev: {
                expand: true,
                flatten: true,
                src: ['dist/<%= pkg.name %>-debug.html', 'dist/compiled_ts.js.map'],
                dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/'
            },
            release_assets: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/release_assets/*'],
                        dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/'
                    },
                    {
                        expand: true,
                        cwd: 'src/assets',
                        src: '**',
                        dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/'
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
                    stdout: true
                },
                command: 'cd release && zip -r <%= grunt.config("pkg").name %>-<%= grunt.config("pkg").version %>.zip mdwiki-<%= grunt.config("pkg").version %>'
            },
            /* precompilation of our handlebars templates */
            compile_templates: {
                options: {
                    stdout: true
                },
                // -n mdwiki = Namespace is mdwiki
                // -f outputfile
                // -r root for the templates (will mirror the FS structure to the template name)
                // -m = minify
                command: './node_modules/.bin/handlebars -f src/_compiled/js/compiled.templates.js -r src/templates -m src/templates/**/*.html'
            },
            ts: {
                options: {
                    stdout: true
                },
                command: './node_modules/.bin/tsc && echo-cli "Typescript compilation is completed!"'
            }
        },
        watch: {
            dev: {
                options: {
                    livereload: true,
                },
                files: [
                    'src/js/*.js',
                    'src/js/**/*.js',
                    'src/js/ts/**/*.ts',
                    'src/js/**/*.tsx',
                    'src/templates/**/*.html',
                    'src/index.ejs'
                ],
                tasks: ['build:dev'],
            },
            test: {
                options: {
                    livereload: true,
                },
                files: [
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
                }
            },
            test: {
                options: {
                    port: 3000,
                    hostname: '*',
                    base: ['./node_modules', './src/_compiled/js', './tests'],
                    open: 'http://localhost:3000/SpecRunner.html',
                    debug: true,
                }
            },
        },
    });

    /*** CUSTOM CODED TASKS ***/
    grunt.registerTask(
        'index',
        function (taskType) {
            grunt.log.writeln(`Generate ${grunt.config('pkg').name}${taskType === 'dev' ? '-debug' : ''}.html, inline all scripts`);
            createIndex(grunt, taskType);
        }
    );

    /*** NAMED TASKS ***/
    grunt.registerTask('build:dev', ['shell:ts', 'less:dev', 'shell:compile_templates', 'concat:dev', 'copy:ts_map', 'index:dev', 'copy:assets']);
    grunt.registerTask('build:prod', ['shell:ts', 'less:prod', 'shell:compile_templates', 'concat:dev', 'uglify:dist', 'index:prod', 'copy:assets']);
    grunt.registerTask('build', ['build:prod', 'build:dev']);

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
