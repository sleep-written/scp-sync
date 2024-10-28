import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import builtins from 'builtin-modules';
import json from '@rollup/plugin-json';

export default {
  input: 'dist/index.js',               // El archivo de entrada de tu proyecto
  output: {
    file: 'dist/bundle.cjs',            // El archivo de salida
    format: 'cjs',                      // Salida en formato CommonJS
  },
  external: builtins,
  plugins: [
    nodeResolve({                       // Resolución de dependencias de node_modules
      preferBuiltins: true,
      browser: false,
      mainFields: ['module', 'main'],   // Excluye el campo 'browser'
      exportConditions: ['node']        // Prioriza las condiciones de exportación para Node.js
    }),
    commonjs({                          // Activa la detección de dependencias circulares
      ignoreGlobal: false,
      requireReturnsDefault: 'auto',
      // esmExternals: true
    }),
    json()
  ],
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  }
};
