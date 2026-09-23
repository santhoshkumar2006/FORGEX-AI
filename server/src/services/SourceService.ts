import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_FILES: Record<string, string> = {
  'CustomerDetailsService.ts': path.resolve(__dirname, 'CustomerDetailsService.ts'),
  'CheckoutService.ts': path.resolve(__dirname, 'CheckoutService.ts'),
  'Checkout.tsx': path.resolve(__dirname, '../../../demo-app/src/components/Checkout.tsx')
};

export class SourceService {
  public static getSourceFile(filename: string): { filename: string; content: string; lines: string[]; totalLines: number } {
    const cleanFilename = path.basename(filename);
    const filePath = ALLOWED_FILES[cleanFilename];

    if (!filePath) {
      throw new Error(`File '${cleanFilename}' is not in the source allowlist`);
    }

    if (!fs.existsSync(filePath)) {
      // Return synthetic fallback if file is still building
      return {
        filename: cleanFilename,
        content: `// Source file: ${cleanFilename}\n// Note: File not found on disk, displaying fallback context\n`,
        lines: [`// Source file: ${cleanFilename}`],
        totalLines: 1
      };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    return {
      filename: cleanFilename,
      content,
      lines,
      totalLines: lines.length
    };
  }

  public static isFileAllowed(filename: string): boolean {
    const cleanFilename = path.basename(filename);
    return cleanFilename in ALLOWED_FILES;
  }
}
