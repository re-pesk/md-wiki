var createIndex = function (grunt, mode, indexData) {
    'use strict';
    const tmpl = grunt.file.read(indexData.template),
        data = {
            mode,
            pkg : grunt.config('pkg'),
            isDebug: (mode === 'debug'),
            isFat: (mode === 'fat'),
            fileRead: grunt.file.read,
            ...indexData,
        };

    grunt.log.writeln(`Building single index.html in ${mode} mode`);
    grunt.file.write(data.dest, grunt.template.process(tmpl, { data }));
    grunt.log.writeln(`Generated '${data.dest}' from '${data.template}'`);
};

/*global module:false*/
module.exports = function (grunt) {
    'use strict';
    // Project configuration.

    require('load-grunt-tasks')(grunt);

    const makeFileId = true;

    grunt.initConfig({
        // Metadata.
        pkg: require('./.metadata'),

        ownJsFiles: [
            'src/js/init.js',
            'src/js/logging.js',
            'src/js/stage.js',
            'src/js/main.js',
            'src/js/utils.js',
            'src/js/modules.js',
            'src/js/basic_skeleton.js',
            'src/js/bootstrap.js',
            'src/js/gimmicker.js',

            // gimmicks
            'src/js/gimmicks/alerts.js',
            'src/js/gimmicks/colorbox.js',
            'src/js/gimmicks/carousel.js',
            'src/js/gimmicks/disqus.js',
            'src/js/gimmicks/facebooklike.js',
            'src/js/gimmicks/forkmeongithub.js',
            //'src/js/gimmicks/github_gist.js',
            'src/js/gimmicks/gist.js',
            'src/js/gimmicks/googlemaps.js',
            'src/js/gimmicks/iframe.js',
            'src/js/gimmicks/math.js',
            'src/js/gimmicks/prism.js',
            // 'src/js/gimmicks/leaflet.js',
            'src/js/gimmicks/themechooser.js',
            'src/js/gimmicks/twitter.js',
            'src/js/gimmicks/youtube_embed.js',
            'src/js/gimmicks/chart.js',
            'src/js/gimmicks/yuml.js'
        ],

        concat: {
            options: {
                stripBanners: false
            },
            dev: {
                src: '<%= ownJsFiles %>',
                dest: 'src/_compiled/js/<%= pkg.name %>.js'
            },
            prismjs: {
                files: {
                    'src/_compiled/js/prism-ext.js': [
                        'node_modules/prismjs/components/prism-bash.js',
                        'node_modules/prismjs/components/prism-c.js',
                        'node_modules/prismjs/components/prism-clike.js',
                        'node_modules/prismjs/components/prism-coffeescript.js',
                        'node_modules/prismjs/components/prism-cpp.js',
                        'node_modules/prismjs/components/prism-csharp.js',
                        'node_modules/prismjs/components/prism-css.js',
                        'node_modules/prismjs/components/prism-css-extras.js',
                        'node_modules/prismjs/components/prism-go.js',
                        'node_modules/prismjs/components/prism-javascript.js',
                        'node_modules/prismjs/components/prism-markdown.js',
                        'node_modules/prismjs/components/prism-markup.js',
                        'node_modules/prismjs/components/prism-python.js',
                        'node_modules/prismjs/components/prism-ruby.js',
                        'node_modules/prismjs/components/prism-sass.js',
                        'node_modules/prismjs/components/prism-sql.js',
                        'node_modules/prismjs/components/prism-uri.js',
                        'node_modules/prismjs/plugins/autoloader/prism-autoloader.js',
                        'node_modules/prismjs/plugins/keep-markup/prism-keep-markup.js',
                        'node_modules/prismjs/plugins/previewers/prism-previewers.js',
                    ],
                },
            }
        },
        uglify: {
            options: {
                stripBanners: true
            },
            dist: {
                src: '<%= concat.dev.dest %>',
                dest: 'src/_compiled/js/<%= pkg.name %>.min.js'
            },
            prismjs: {
                files: {
                    'src/_compiled/js/prism.min.js': 'node_modules/prismjs/prism.js',
                    'src/_compiled/js/prism-ext.min.js': 'src/_compiled/js/prism-ext.js',
                }
            }
        },
        index: {
            debug: {
                description: 'Generate <%= pkg.name %>-debug.html, inline all scripts unminified',
                template: 'src/index.ejs',
                dest: 'dist/<%= pkg.name %>-debug.html',

                cssFiles: [
                    { name: 'node_modules/bootstrap/dist/css/bootstrap.css' },
                    { name: 'node_modules/prismjs/themes/prism.css' },
                    { name: 'node_modules/prismjs/plugins/previewers/prism-previewers.css' },
                    { name: 'src/lib/jquery-colorbox/css/colorbox.css' },
                    { name: 'src/css/<%= pkg.name %>.css' },
                ],

                jsFiles: [
                    { name: 'node_modules/jquery/dist/jquery.js' },
                    { name: 'node_modules/bootstrap/dist/js/bootstrap.js' },
                    { name: 'node_modules/prismjs/prism.js' },
                    { name: 'src/_compiled/js/prism-ext.js' },
                    { name: 'node_modules/jquery-colorbox/jquery.colorbox.js' },
                    { name: 'node_modules/marked/lib/marked.js' },
                    { name: '<%= concat.dev.dest %>' },
                ],
            },
            fat: {
                description: 'Generate <%= pkg.name %>.html, inline all scripts',
                template: 'src/index.ejs',
                dest: 'dist/<%= pkg.name %>.html',

                cssFiles: [
                    { name: 'node_modules/bootstrap/dist/css/bootstrap.min.css', inline: true },
                    { name: 'node_modules/prismjs/themes/prism.min.css', inline: true },
                    { name: 'node_modules/prismjs/plugins/previewers/prism-previewers.min.css', inline: true },
                    { name: 'src/lib/jquery-colorbox/css/colorbox.css', inline: true },
                    { name: 'src/css/<%= pkg.name %>.css', inline: true },
                ],

                jsFiles: [
                    { name: 'node_modules/jquery/dist/jquery.min.js', inline: true },
                    { name: 'node_modules/bootstrap/dist/js/bootstrap.min.js', inline: true },
                    { name: 'node_modules/prismjs/prism.js', inline: true },
                    { name: 'src/_compiled/js/prism-ext.min.js', inline: true },
                    { name: 'node_modules/jquery-colorbox/jquery.colorbox-min.js', inline: true },
                    { name: 'node_modules/marked/marked.min.js', inline: true },
                    { name: '<%= uglify.dist.dest %>', inline: true },
                ],

                makeFileId,
            },
            slim: {
                description: 'Generate <%= pkg.name %>-slim.html, most scripts on CDN',
                template: 'src/index.ejs',
                dest: 'dist/<%= pkg.name %>-slim.html',

                cssFiles: [
                    { name: '//cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css' },
                    { name: '//cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css' },
                    { name: '//cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/previewers/prism-previewers.min.css' },
                    { name: 'src/lib/jquery-colorbox/css/colorbox.css', inline: true },
                    { name: 'src/css/<%= pkg.name %>.css', inline: true },
                ],

                jsFiles: [
                    { name: '//cdn.jsdelivr.net/npm/jquery@3.6.3/dist/jquery.min.js' },
                    { name: '//cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/js/bootstrap.min.js' },
                    { name: '//cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js' },
                    { name: '//cdn.jsdelivr.net/combine/npm/prismjs@1.29.0/components/prism-bash.min.js,npm/prismjs@1.29.0/components/prism-c.min.js,npm/prismjs@1.29.0/components/prism-clike.min.js,npm/prismjs@1.29.0/components/prism-coffeescript.min.js,npm/prismjs@1.29.0/components/prism-cpp.min.js,npm/prismjs@1.29.0/components/prism-csharp.min.js,npm/prismjs@1.29.0/components/prism-css.min.js,npm/prismjs@1.29.0/components/prism-css-extras.min.js,npm/prismjs@1.29.0/components/prism-go.min.js,npm/prismjs@1.29.0/components/prism-javascript.min.js,npm/prismjs@1.29.0/components/prism-markdown.min.js,npm/prismjs@1.29.0/components/prism-markup.min.js,npm/prismjs@1.29.0/components/prism-python.min.js,npm/prismjs@1.29.0/components/prism-ruby.min.js,npm/prismjs@1.29.0/components/prism-sass.min.js,npm/prismjs@1.29.0/components/prism-sql.min.js,npm/prismjs@1.29.0/components/prism-uri.min.js,npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js,npm/prismjs@1.29.0/plugins/keep-markup/prism-keep-markup.min.js,npm/prismjs@1.29.0/plugins/previewers/prism-previewers.min.js' },
                    { name: '//cdn.jsdelivr.net/npm/jquery-colorbox@1.6.4/jquery.colorbox-min.min.js' },
                    { name: '//cdn.jsdelivr.net/npm/marked@0.3.19/marked.min.js' },
                    { name: '<%= uglify.dist.dest %>', inline: true },
                ],

                makeFileId,
            },
        },
        /* make it use .jshintrc */
        jshint: {
            options: require('./.jshint'),
            js: {
                src: ['src/js/*[!_].js', 'src/js/**/*[!_].js']
            }
        },
        lib_test: {
            src: ['lib/**/*.js', 'test/**/*.js']
        },
        copy: {
            assets: {
                expand: true,
                cwd: 'src/assets',
                src: '**',
                dest: 'dist/'
            },
            release_fat: {
                expand: false,
                flatten: true,
                src: ['dist/<%= pkg.name %>.html'],
                dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/<%= pkg.name %>.html'
            },
            release_slim: {
                expand: false,
                flatten: true,
                src: ['dist/<%= pkg.name %>-slim.html'],
                dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/<%= pkg.name %>-slim.html'
            },
            release_debug: {
                expand: false,
                flatten: true,
                src: ['dist/<%= pkg.name %>-debug.html'],
                dest: 'release/<%= pkg.name %>-<%= grunt.config("pkg").version %>/<%= pkg.name %>-debug.html'
            },
            release_assets: {
                files: [{
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
                }],
            },
            dist: {
                expand: true,
                cwd: 'dist',
                src: '**/*[!_].html',
                dest: 'docs/'
            },
        },
        clean: {
            dist: ['dist/'],
            release: ['release/'],
        },
        shell: {
            zip_release: {
                options: {
                    stdout: true
                },
                command: [
                  'cd release',
                  'zip -r <%= grunt.config("pkg").name %>-<%= grunt.config("pkg").version %>.zip <%= grunt.config("pkg").name %>-<%= grunt.config("pkg").version %>'
                ].join(' && '),
            }
        },
        watch: {
            options: {
                livereload: 35729,
            },
            dev: {
                files: [
                    'Gruntfile.js',
                    'src/js/*.js',
                    'src/js/**/*.js',
                    'src/index.ejs'
                ],
                tasks: ['build:debug']
            },
            dist: {
                files: [
                    'dist/**/*[!_].html'
                ],
                tasks: ['copy:dist']
            },
            docs: {
                files: [
                    'docs/**/*'
                ],
            },
        },
        connect: {
            dist: {
                options: {
                    livereload: true,
                    port: 3000,
                    hostname: 'localhost',
                    base: ['./dist', './'],
                    open: 'http://localhost:3000/<%= pkg.name %>-debug.html',
                    debug: true,
                },
            },
            docs: {
                options: {
                    livereload: true,
                    port: 3000,
                    hostname: 'localhost',
                    base: ['./docs', './'],
                    open: 'http://localhost:3000/<%= pkg.name %>-debug.html',
                    debug: true,
                },
            },
        },
    });

    grunt.registerMultiTask('index', 'Generate .html files', function () {
        grunt.log.writeln(this.data.description)
        createIndex(grunt, this.target, this.data);
    });

    grunt.registerTask('build:slim', ['jshint', 'concat', 'uglify', 'index:slim', 'copy:assets']);
    grunt.registerTask('build:fat', ['jshint', 'concat', 'uglify', 'index:fat', 'copy:assets']);

    /* Debug is basically the fat version but without any minifing */
    grunt.registerTask('build:debug', ['jshint', 'concat', 'index:debug', 'copy:assets']);
    grunt.registerTask('build', ['build:slim', 'build:fat', 'build:debug']);
    grunt.registerTask('dev', ['build:debug']);

    grunt.registerTask('serve', ['connect:dist', 'watch:dev']);
    grunt.registerTask('docs', ['copy:dist', 'connect:docs', 'watch']);

    grunt.registerTask('copy:release', 'Make MDwiki release', (subtask) => grunt.task.run(`copy:release_${subtask}`));

    grunt.registerTask('release', [
        'clean',
        'build',
        'copy:release:slim', 'copy:release:fat', 'copy:release:debug', 'copy:release:assets',
        'shell:zip_release'
    ]);

    // Default task.
    grunt.registerTask('default',
        ['clean', 'build']
    );

};
