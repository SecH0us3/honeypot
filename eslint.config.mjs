import security from 'eslint-plugin-security';
import tseslint from 'typescript-eslint';

// Security-focused static analysis (SAST) for the worker and its tests.
export default tseslint.config(
	{ ignores: ['node_modules/', '.wrangler/', 'worker-configuration.d.ts'] },
	{
		files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs'],
		languageOptions: { parser: tseslint.parser },
		linterOptions: { reportUnusedDisableDirectives: 'error' },
		...security.configs.recommended,
	},
	{
		// Flags every `obj[key]` access; here the keys are internal lookups, so it only produces noise.
		rules: { 'security/detect-object-injection': 'off' },
	},
);
