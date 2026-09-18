/**
 * Transpile src/*.js → lib/*.js using esbuild (ESM → CJS).
 * Preserves the source tree structure so each module stays a separate file.
 * Mirrors the original behavior of shipping source directly, but as CJS.
 */
import fs from 'node:fs';
import path from 'node:path';

async function main() {
    const fsp = await import('node:fs/promises');
    const { build } = await import('esbuild');

    const srcDir = path.resolve('src');
    const outDir = path.resolve('lib');

    await fsp.rm(outDir, { recursive: true, force: true });
    await fsp.mkdir(outDir, { recursive: true });

    function collectFiles(dir) {
        const results = [];
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                results.push(...collectFiles(fullPath));
            } else if (entry.name.endsWith('.js')) {
                results.push(fullPath);
            }
        }
        return results;
    }

    const files = collectFiles(srcDir);

    await build({
        entryPoints: files,
        outdir: outDir,
        outbase: srcDir,
        format: 'esm',
        target: 'node14',
        sourcemap: true,
        minify: false,
        keepNames: true,
        logLevel: 'info'
    });

    console.log(`Transpiled ${files.length} files to lib/`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
