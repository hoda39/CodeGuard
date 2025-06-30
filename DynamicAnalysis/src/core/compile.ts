import { exec } from 'child_process';
import * as path from 'path';

export async function compileSourceFile(
  sourceFilePath: string, 
  outputPath: string,
  sanitizerOptions: {
    asan?: boolean;
    ubsan?: boolean;
    msan?: boolean;
  } = { asan: true }  // Default to ASAN
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ext = path.extname(sourceFilePath);
    const compiler = ext === '.c' ? 'clang' : 'clang++';
    
    // Build sanitizer flags
    const sanitizerFlags = [];
    if (sanitizerOptions.asan) sanitizerFlags.push('-fsanitize=address', '-fsanitize-recover=address');
    if (sanitizerOptions.ubsan) {sanitizerFlags.push('-fsanitize=undefined,bounds -O2');}
    if (sanitizerOptions.msan) sanitizerFlags.push('-fsanitize=memory', '-fsanitize-recover=memory');
    
    const command = `${compiler} ${sanitizerFlags.join(' ')} -fno-omit-frame-pointer -g "${sourceFilePath}" -o "${outputPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Compilation failed: ${error.message}`);
        return;
      }
      
      if (stderr) {
        console.warn(`Compiler warnings: ${stderr}`);
      }
      
      resolve();
    });
  });
}