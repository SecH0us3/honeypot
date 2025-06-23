// Base interface for all template generators

export interface TemplateGenerator {
	generate(): string;
	getContentType(): string;
	getDescription(): string;
}

export interface RandomDataContext {
	companyName?: string;
	companyDomain?: string;
	adminEmail?: string;
	userAgent?: string;
	clientIp?: string;
	timestamp?: Date;
	timezone?: string;
	locale?: string;
}

export interface TemplateVariables {
	[key: string]: string | number | boolean;
}

export abstract class BaseTemplateGenerator implements TemplateGenerator {
	protected context: RandomDataContext;
	protected variables: TemplateVariables = {};

	constructor(context: RandomDataContext = {}) {
		this.context = context;
		this.initializeVariables();
	}

	protected abstract initializeVariables(): void;

	abstract generate(): string;
	abstract getContentType(): string;
	abstract getDescription(): string;

	protected getRandomItem<T>(array: T[]): T {
		return array[Math.floor(Math.random() * array.length)];
	}

	protected generateRandomHash(length: number = 40): string {
		const chars = '0123456789abcdef';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars[Math.floor(Math.random() * chars.length)];
		}
		return result;
	}

	protected generateRandomDate(): string {
		const now = new Date();
		const pastDays = Math.floor(Math.random() * 365);
		const randomDate = new Date(now.getTime() - pastDays * 24 * 60 * 60 * 1000);
		return randomDate.toISOString().split('T')[0];
	}

	protected generateRandomVersion(): string {
		const major = Math.floor(Math.random() * 5) + 1;
		const minor = Math.floor(Math.random() * 10);
		const patch = Math.floor(Math.random() * 20);
		return `${major}.${minor}.${patch}`;
	}

	protected generateRandomSize(): string {
		return (Math.floor(Math.random() * 1000000) + 1000).toString();
	}

	protected generateRandomLines(): string {
		return (Math.floor(Math.random() * 1000) + 10).toString();
	}

	protected generateRandomKey(length: number = 32): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars[Math.floor(Math.random() * chars.length)];
		}
		return result;
	}

	protected replaceVariables(template: string): string {
		let content = template;

		for (const [key, value] of Object.entries(this.variables)) {
			const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
			content = content.replace(placeholder, String(value));
		}

		return content;
	}
}
