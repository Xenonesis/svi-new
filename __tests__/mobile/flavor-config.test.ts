import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Mobile Flavor and Target Configuration', () => {
  const rootDir = path.resolve(__dirname, '../..');

  describe('capacitor.config.ts', () => {
    const originalEnv = process.env.CAP_APP_TARGET;

    beforeEach(() => {
      vi.resetModules();
    });

    afterEach(() => {
      process.env.CAP_APP_TARGET = originalEnv;
      vi.resetModules();
    });

    it('defaults to admin target with correct appId and appName', async () => {
      delete process.env.CAP_APP_TARGET;
      // Dynamic import required to evaluate capacitor.config with distinct process.env.CAP_APP_TARGET values
      const config = (await import('../../capacitor.config')).default;
      expect(config.appId).toBe('com.svi.infrasolutions');
      expect(config.appName).toBe('SVI Admin');
    });

    it('configures employee target with correct appId and appName when CAP_APP_TARGET=employee', async () => {
      process.env.CAP_APP_TARGET = 'employee';
      // Dynamic import required to evaluate capacitor.config with distinct process.env.CAP_APP_TARGET values
      const config = (await import('../../capacitor.config')).default;
      expect(config.appId).toBe('com.svi.infrasolutions.employee');
      expect(config.appName).toBe('SVI Workspace');
    });
  });

  describe('android/app/build.gradle', () => {
    it('declares flavorDimensions "default" and productFlavors for admin and employee', () => {
      const gradlePath = path.join(rootDir, 'android/app/build.gradle');
      const content = fs.readFileSync(gradlePath, 'utf-8');

      expect(content).toMatch(/flavorDimensions\s+["']default["']/);
      expect(content).toContain('productFlavors');

      // Admin flavor assertions
      expect(content).toMatch(/admin\s*\{[\s\S]*?applicationId\s+["']com\.svi\.infrasolutions["']/);
      expect(content).toMatch(
        /admin\s*\{[\s\S]*?resValue\s+["']string["'],\s*["']app_name["'],\s*["']SVI Admin["']/
      );

      // Employee flavor assertions
      expect(content).toMatch(
        /employee\s*\{[\s\S]*?applicationId\s+["']com\.svi\.infrasolutions\.employee["']/
      );
      expect(content).toMatch(
        /employee\s*\{[\s\S]*?resValue\s+["']string["'],\s*["']app_name["'],\s*["']SVI Workspace["']/
      );
    });
  });

  describe('package.json scripts', () => {
    it('contains sync and build scripts for both admin and employee targets', () => {
      const pkgPath = path.join(rootDir, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const scripts = pkg.scripts || {};

      expect(scripts['cap:admin:sync']).toBeDefined();
      expect(scripts['cap:admin:sync']).toContain('CAP_APP_TARGET=admin');

      expect(scripts['cap:employee:sync']).toBeDefined();
      expect(scripts['cap:employee:sync']).toContain('CAP_APP_TARGET=employee');

      expect(scripts['cap:admin:build']).toBeDefined();
      expect(scripts['cap:admin:build']).toContain('CAP_APP_TARGET=admin');
      expect(scripts['cap:admin:build']).toContain('assembleAdminRelease');

      expect(scripts['cap:employee:build']).toBeDefined();
      expect(scripts['cap:employee:build']).toContain('CAP_APP_TARGET=employee');
      expect(scripts['cap:employee:build']).toContain('assembleEmployeeRelease');
    });
  });
});
