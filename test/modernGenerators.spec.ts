import { describe, it, expect } from 'vitest';
import {
    TerraformGenerator,
    CicdConfigGenerator,
    AiMlGenerator,
    RemoteAccessGenerator,
} from '../src/templateGenerators/modernGenerators';

describe('Modern Generators', () => {
    it('TerraformGenerator should generate valid content', () => {
        const generator = new TerraformGenerator();
        const content = generator.generate();
        expect(content).toContain('terraform {');
        expect(content).toContain('resource "aws_instance"');
        expect(generator.getContentType()).toBe('text/plain; charset=utf-8');
    });

    it('CicdConfigGenerator should generate valid content', () => {
        const generator = new CicdConfigGenerator();
        const content = generator.generate();
        // Should contain one of the keywords from the templates
        const keywords = ['version: 2.1', 'language: node_js', 'name: CI'];
        expect(keywords.some(k => content.includes(k))).toBe(true);
        expect(generator.getContentType()).toBe('text/yaml; charset=utf-8');
    });

    it('AiMlGenerator should generate valid content', () => {
        const generator = new AiMlGenerator();
        const content = generator.generate();
        // Should contain one of the keywords
        const keywords = ['"cells": [', 'import torch', 'import tensorflow', 'import keras'];
        expect(keywords.some(k => content.includes(k))).toBe(true);
        // Content type depends on content
        const contentType = generator.getContentType();
        expect(['application/json', 'text/x-python', 'text/plain']).toContain(contentType);
    });

    it('RemoteAccessGenerator should generate valid content', () => {
        const generator = new RemoteAccessGenerator();
        const content = generator.generate();
        const keywords = ['client', 'dev tun', 'screen mode id:i:2'];
        expect(keywords.some(k => content.includes(k))).toBe(true);
        expect(generator.getContentType()).toBe('text/plain');
    });
});
