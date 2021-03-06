var childProcess = require('child_process'),
    fs = require('fs');

module.exports = function(grunt) {
  grunt.registerTask('test:bin', function() {
    var done = this.async();

    childProcess.exec('node ./bin/handlebars -a spec/artifacts/empty.handlebars', { env: { NODE_ENV: 'test' } }, function(err, stdout) {
      if (err) {
        throw err;
      }

      var expected = fs.readFileSync('./spec/expected/empty.amd.js').toString().replace(/\r\n/g, '\n');

      if (stdout.toString() !== expected) {
        throw new Error('Expected binary output differed:\n\n"' + stdout + '"\n\n"' + expected + '"');
      }

      done();
    });
  });
  grunt.registerTask('test:mocha', function() {
    var done = this.async();

    var runner = childProcess.fork('./spec/env/runner', [], { stdio: 'inherit', env: { NODE_ENV: 'test' } });
    runner.on('close', function(code) {
      if (code != 0) {
        grunt.fatal(code + ' tests failed');
      }
      done();
    });
  });
  grunt.registerTask('test:cov', function() {
    var done = this.async();

    var runner = childProcess.fork('node_modules/.bin/istanbul', ['cover', '--source-map', '--', './spec/env/runner.js'], { stdio: 'inherit', env: { NODE_ENV: 'test' } });
    runner.on('close', function(code) {
      if (code != 0) {
        grunt.fatal(code + ' tests failed');
      }
      done();
    });
  });
  grunt.registerTask('test:min', function() {
    var done = this.async();

    var runner = childProcess.fork('./spec/env/runner', ['--min'], { stdio: 'inherit', env: { NODE_ENV: 'test' } });
    runner.on('close', function(code) {
      if (code != 0) {
        grunt.fatal(code + ' tests failed');
      }
      done();
    });
  });

  grunt.registerTask('test:check-cov', function() {
    var done = this.async();

    var runner = childProcess.fork('node_modules/.bin/istanbul', ['check-coverage', '--statements', '100', '--functions', '100', '--branches', '100', '--lines 100'], { stdio: 'inherit', env: { NODE_ENV: 'test' } });
    runner.on('close', function(code) {
      if (code != 0) {
        grunt.fatal('Coverage check failed: ' + code);
      }
      done();
    });
  });
  grunt.registerTask('test', ['test:bin', 'test:cov', 'test:check-cov']);
};
