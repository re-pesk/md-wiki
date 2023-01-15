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
                'js/marked.js',
                'js/init.js',
                'src_compiled/js/<%= pkg.name %>_ts.js',
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

            prod: {
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
            },

            dev: {
                // for debug builds use unminified versions:
                cssFiles: [
                    'tmp/main.css'
                ],

                jsFiles: [
                    'bower_components/jquery/jquery.js',
                    'bower_components/bootstrap/js/affix.js',
                    'bower_components/bootstrap/js/dropdown.js',
                    'node_modules/handlebars/dist/handlebars.runtime.js',
                    'extlib/js/prism.js',
                    'extlib/js/jquery.colorbox.js',
                ],
            }
        },

        ts: {
            // TODO: use tsconfig.json as soon as tsconfig.json supports globs/wildcards
            base: {
                tsconfig: "src/ts/tsconfig.json"
            }
        },

        less: {
            prod: {
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
                stripBanners: false
            },
            dev: {
                src: '<%= fileList.ownJsFiles %>',
                dest: 'tmp/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                stripBanners: true
            },
            dist: {
                src: '<%= concat.dev.dest %>',
                dest: 'tmp/<%= pkg.name %>.min.js'
            }
        },
        index: {
            prod: {
                template: 'index.tmpl',
                dest: 'dist/<%= pkg.name %>.html'
            },

            dev: {
                template: 'index.tmpl',
                dest: 'dist/<%= pkg.name %>-debug.html'
            }
        },
        copy: {
            ts_map: {
                expand: true,
                flatten: true,
                src: 'src_compiled/js/<%= pkg.name %>_ts.js.map',
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
                src: ['dist/<%= pkg.name %>-debug.html', 'dist/<%= pkg.name %>_ts.js.map'],
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
            test: {
                expand: true,
                flatten: true,
                src: [
                    'ts_compiled/<%= pkg.name %>_ts.js.map',
                    'tmp/<%= pkg.name %>.js',
                    'bower_components/jquery/jquery.min.js'
                ],
                dest: 'tests/js/'
            },
        },
        shell: {
            rm_compiled: {
                options: {
                    stdout: true
                },
                command: 'rm -frv tmp src_compiled'
            },
            rm_dist: {
                options: {
                    stdout: true
                },
                command: 'rm -frv dist'
            },
            rm_release: {
                options: {
                    stdout: true
                },
                command: 'rm -frv release'
            },
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
            dev: {
                files: [
                    'js/*.js',
                    'js/**/*.js',
                    'js/ts/**/*.ts',
                    'js/**/*.tsx',
                    'templates/**/*.html',
                    'index.tmpl'
                ],
                tasks: ['build:dev'],
            },
            test: {
                files: [
                    'tests/js/*.js',
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
                    base: ['./node_modules', './tmp', './tests'],
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
    grunt.registerTask('build:dev', ['ts', 'less:dev', 'shell:compile_templates', 'concat:dev', 'copy:ts_map', 'index:dev', 'copy:assets']);
    grunt.registerTask('build:prod', ['ts', 'less:prod', 'shell:compile_templates', 'concat:dev', 'uglify:dist', 'index:prod', 'copy:assets']);
    grunt.registerTask('build', ['build:prod', 'build:dev']);

    grunt.registerTask('serve', ['build:dev', 'connect:dev', 'watch']);
    grunt.registerTask('test', ['build:dev', 'copy:test', 'connect:test', 'watch']);

    grunt.registerTask('clear', ['shell:rm_compiled', 'shell:rm_dist', 'shell:rm_release'])
    grunt.registerTask('copy:release', ['copy:release_prod', 'copy:release_dev', 'copy:release_assets'])

    grunt.registerTask('release', [
        'clear', 'build',
        'copy:release',
        'shell:zip_release'
    ]);
    // Default task
    grunt.registerTask('default', ['clear', 'build', 'copy:test']);
};
