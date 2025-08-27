import { promises as fs } from 'fs';
import path from 'path';

/**
 * Utility functions for Static Site Generation
 */

export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function writeHTMLFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDirectory(dir);
  await fs.writeFile(filePath, content, 'utf-8');
}

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatRoute(route: string): string {
  // Ensure route starts with /
  if (!route.startsWith('/')) {
    route = '/' + route;
  }
  
  // Remove trailing slash except for root
  if (route.length > 1 && route.endsWith('/')) {
    route = route.slice(0, -1);
  }
  
  return route;
}

export function getOutputPath(route: string, distPath: string): string {
  const formattedRoute = formatRoute(route);
  
  if (formattedRoute === '/') {
    return path.join(distPath, 'index.html');
  }
  
  // Create directory structure for clean URLs
  const routePath = formattedRoute.slice(1); // Remove leading slash
  return path.join(distPath, routePath, 'index.html');
}

export function logProgress(current: number, total: number, message: string): void {
  const percentage = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
  console.log(`[${bar}] ${percentage}% - ${message}`);
}

export function measureTime<T>(fn: () => T, label: string): T {
  const start = Date.now();
  const result = fn();
  const end = Date.now();
  console.log(`⏱️  ${label}: ${end - start}ms`);
  return result;
}

export async function measureTimeAsync<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const start = Date.now();
  const result = await fn();
  const end = Date.now();
  console.log(`⏱️  ${label}: ${end - start}ms`);
  return result;
}