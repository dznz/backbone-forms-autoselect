fs = require 'fs'

option '-o', '--output [DIR]', 'output dir'
DEFAULT_OUTPUT_DIR = 'lib'

{print} = require 'sys'
{spawn} = require 'child_process'

task 'build', 'Build dist/ from src/', (options) ->
  coffee = spawn 'coffee', ['--compile', '--bare', '--output', options.output? or DEFAULT_OUTPUT_DIR, 'src']
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    print data.toString()

task 'watch', 'Watch src/ for changes', (options) ->
  coffee = spawn 'coffee', ['--watch', '--compile', '--bare', '--output', options.output? or DEFAULT_OUTPUT_DIR, 'src']
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    print data.toString()
