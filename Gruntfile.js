var createIndex = function (grunt, taskname) {
    'use strict';
    var conf = grunt.config('index')[taskname],
        tmpl = grunt.file.read(conf.template);

    grunt.config.set('templatesString', '');

    // register the task name in global scope so we can access it in the .tmpl file
    grunt.config.set('currentTask', { name: taskname });

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

        ownJsFiles: [
            'js/marked.js',
            'js/init.js',
            'ts_compiled/<%= pkg.name %>_ts.js',
            'tmp/<%= pkg.name %>.templates.js',
            'js/main.js',
            'js/util.js',
            'js/basic_skeleton.js',
            'js/bootstrap.js',

            // gimmicks
            'js/gimmicks/templating.js',
            'js/gimmicks/prism.js',
            /*
             'js/gimmicks/googlemaps.js',
             'js/gimmicks/alerts.js',
            'js/gimmicks/colorbox.js',
            // 'js/gimmicks/carousel.js',
            'js/gimmicks/disqus.js',
            'js/gimmicks/editme.js',
            'js/gimmicks/facebooklike.js',
            'js/gimmicks/forkmeongithub.js',
            'js/gimmicks/gist.js',
            'js/gimmicks/iframe.js',
            'js/gimmicks/math.js',
            // // 'js/gimmicks/leaflet.js',
            'js/gimmicks/twitter.js',
            'js/gimmicks/youtube_embed.js',
            'js/gimmicks/yuml.js'
            */
        ],

        // REMEMBER:
        // * ORDER OF FILES IS IMPORTANT
        // * ALWAYS ADD EACH FILE TO BOTH minified/unminified SECTIONS!
        cssFiles: [
            'tmp/main.min.css',
        ],
        jsFiles: [
            'bower_components/jquery/jquery.min.js',
            'node_modules/handlebars/dist/handlebars.runtime.min.js',
            'extlib/js/jquery.colorbox.min.js',
            'extlib/js/prism.js',
            'bower_components/bootstrap/js/affix.js',
            'bower_components/bootstrap/js/dropdown.js',
        ],
        // for debug builds use unminified versions:
        unminifiedCssFiles: [
            'tmp/main.css'
        ],
        unminifiedJsFiles: [
            'bower_components/jquery/jquery.js',
            'bower_components/bootstrap/js/affix.js',
            'bower_components/bootstrap/js/dropdown.js',
            'node_modules/handlebars/dist/handlebars.runtime.js',
            'extlib/js/prism.js',
            'extlib/js/jquery.colorbox.js',
        ],

        ts: {
            // TOD: use tsconfig.json as soon as tsconfig.json supports globs/wildcards
            base: {
                tsconfig: "js/ts/tsconfig.json"
            }
        },

        less: {
            min: {
                options: {
                    compress: true,
                },
                files: {
                    'tmp/main.min.css': 'styles/main.less',
                },
            },
            dev: {
                options: {
                    compress: false,
                },
                files: {
                    'tmp/main.css': 'styles/main.less',
                },
            },
        },

        concat: {
            options: {
                //banner: '<%= banner %>',
                stripBanners: true
            },
            dev: {
                src: '<%= ownJsFiles %>',
                dest: 'tmp/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                // banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dev.dest %>',
                dest: 'tmp/<%= pkg.name %>.min.js'
            }
        },
        index: {
            release: {
                template: 'index.tmpl',
                dest: 'dist/<%= pkg.name %>.html'
            },
            debug: {
                template: 'index.tmpl',
                dest: 'dist/<%= pkg.name %>-debug.html'
            }
        },
        lib_test: {
            src: ['lib/**/*.js', 'test/**/*.js']
        },
        copy: {
            ts_map: {
                expand: true,
                flatten: true,
                src: 'ts_compiled/<%= pkg.name %>_ts.js.map',
                dest: 'dist/'
            },
            release: {
                expand: true,
                flatten: true,
                src: ['dist/<%= pkg.name %>.html'],
                dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/'
            },
            release_debug: {
                expand: true,
                flatten: true,
                src: ['dist/<%= pkg.name %>-debug.html', 'dist/<%= pkg.name %>_ts.js.map'],
                dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/'
            },
            release_templates: {
                expand: true,
                flatten: true,
                src: ['release_templates/*'],
                dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/'
            },
            unittests: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['tmp/<%= pkg.name %>.js', 'bower_components/jquery/jquery.min.js'],
                        dest: 'unittests/js/'
                    },
                ]
            }
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
                command: './node_modules/.bin/handlebars -f tmp/<%= pkg.name %>.templates.js -r templates -m templates/**/*.html'
            }
        },
        watch: {
            options: {
                livereload: true,
            },
            debug: {
                files: [
                    'js/*.js',
                    'js/**/*.js',
                    'js/ts/**/*.ts',
                    'js/**/*.tsx',
                    'templates/**/*.html',
                    'index.tmpl'
                ],
                tasks: ['debug'],
            },
            test: {
                files: [
                    'unittests/js/*.js',
                    'unittests/spec/*.js',
                    'unittests/**/*.html',
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
                    base: ['./node_modules', './tmp', './unittests'],
                    open: 'http://localhost:3000/SpecRunner.html',
                    debug: true,
                }
            },
        },
    });

    /*** CUSTOM CODED TASKS ***/
    grunt.registerTask('index_release', 'Generate <%= pkg.name %>.html, inline all scripts', function () {
        createIndex(grunt, 'release');
    });

    /* Debug is basically the releaes version but without any minifing */
    grunt.registerTask('index_debug', 'Generate <%= pkg.name %>-debug.html, inline all scripts unminified', function () {
        createIndex(grunt, 'debug');
    });

    /*** NAMED TASKS ***/
    grunt.registerTask('release', ['ts', 'less:min', 'shell:compile_templates', 'concat:dev', 'uglify:dist', 'index_release']);
    grunt.registerTask('debug', ['ts', 'less:dev', 'shell:compile_templates', 'concat:dev', 'copy:ts_map', 'index_debug']);
    grunt.registerTask('dev', ['debug', 'unittests', 'serve']);
    grunt.registerTask('unittests', ['copy:unittests']);

    grunt.registerTask('serve', ['connect:dev', 'watch']);
    grunt.registerTask('test', ['connect:test', 'watch']);

    grunt.registerTask('distrelease', [
        'release', 'debug',
        'copy:release', 'copy:release_debug', 'copy:release_templates',
        'shell:zip_release'
    ]);
    // Default task
    grunt.registerTask('default', ['release', 'debug', 'unittests']);
};
