import { BaseTemplateGenerator, RandomDataContext } from './types';
import { RANDOM_DATA, getRandomItem, getCompanyName } from './randomData';

export class GitConfigGenerator extends BaseTemplateGenerator {
  protected initializeVariables(): void {
    this.variables = {
      repositoryformatversion: Math.random() > 0.5 ? '0' : '1',
      filemode: Math.random() > 0.3 ? 'true' : 'false',
      bare: Math.random() > 0.9 ? 'true' : 'false',
      logallrefupdates: Math.random() > 0.2 ? 'true' : 'false',
      ignorecase: Math.random() > 0.5 ? 'true' : 'false',
      precomposeunicode: Math.random() > 0.7 ? 'true' : 'false',
      repositoryUrl: `https://github.com/${getCompanyName(this.context.companyName?.toLowerCase())}/${getRandomItem(RANDOM_DATA.projects)}.git`,
      repositoryUrlAlt: `git@github.com:${getCompanyName(this.context.companyName?.toLowerCase())}/${getRandomItem(RANDOM_DATA.projects)}.git`,
      mainBranch: getRandomItem(RANDOM_DATA.gitBranches),
      userName: getRandomItem(RANDOM_DATA.names),
      userEmail: getRandomItem(RANDOM_DATA.emails),
      remoteName: Math.random() > 0.8 ? 'upstream' : 'origin',
      additionalRemote: Math.random() > 0.7 ? 'fork' : 'backup',
      additionalUrl: `https://gitlab.com/${getCompanyName(this.context.companyName?.toLowerCase())}/${getRandomItem(RANDOM_DATA.projects)}.git`,
      pushDefault: getRandomItem(['nothing', 'current', 'upstream', 'simple', 'matching']),
      autocrlf: getRandomItem(['true', 'false', 'input']),
      safecrlf: Math.random() > 0.5 ? 'true' : 'false',
      editor: getRandomItem(['vim', 'nano', 'emacs', 'code', 'atom', 'sublime']),
      mergetool: getRandomItem(['vimdiff', 'meld', 'kdiff3', 'p4merge', 'tortoisemerge']),
      difftool: getRandomItem(['vimdiff', 'meld', 'kdiff3', 'p4merge']),
    };
  }

  generate(): string {
    const templates = [
      // Basic config
      `[core]
	repositoryformatversion = {{repositoryformatversion}}
	filemode = {{filemode}}
	bare = {{bare}}
	logallrefupdates = {{logallrefupdates}}
	ignorecase = {{ignorecase}}
[remote "{{remoteName}}"]
	url = {{repositoryUrl}}
	fetch = +refs/heads/*:refs/remotes/{{remoteName}}/*
[branch "{{mainBranch}}"]
	remote = {{remoteName}}
	merge = refs/heads/{{mainBranch}}
[user]
	name = {{userName}}
	email = {{userEmail}}`,

      // Extended config with multiple remotes
      `[core]
	repositoryformatversion = {{repositoryformatversion}}
	filemode = {{filemode}}
	bare = {{bare}}
	logallrefupdates = {{logallrefupdates}}
	ignorecase = {{ignorecase}}
	precomposeunicode = {{precomposeunicode}}
	autocrlf = {{autocrlf}}
	safecrlf = {{safecrlf}}
	editor = {{editor}}
[remote "{{remoteName}}"]
	url = {{repositoryUrl}}
	fetch = +refs/heads/*:refs/remotes/{{remoteName}}/*
	pushurl = {{repositoryUrlAlt}}
[remote "{{additionalRemote}}"]
	url = {{additionalUrl}}
	fetch = +refs/heads/*:refs/remotes/{{additionalRemote}}/*
[branch "{{mainBranch}}"]
	remote = {{remoteName}}
	merge = refs/heads/{{mainBranch}}
[branch "develop"]
	remote = {{remoteName}}
	merge = refs/heads/develop
[user]
	name = {{userName}}
	email = {{userEmail}}
[push]
	default = {{pushDefault}}
[merge]
	tool = {{mergetool}}
[diff]
	tool = {{difftool}}`,

      // Minimal config
      `[core]
	repositoryformatversion = {{repositoryformatversion}}
	filemode = {{filemode}}
	bare = {{bare}}
[remote "{{remoteName}}"]
	url = {{repositoryUrl}}
	fetch = +refs/heads/*:refs/remotes/{{remoteName}}/*
[user]
	name = {{userName}}
	email = {{userEmail}}`,

      // Corporate config with additional settings
      `[core]
	repositoryformatversion = {{repositoryformatversion}}
	filemode = {{filemode}}
	bare = {{bare}}
	logallrefupdates = {{logallrefupdates}}
	ignorecase = {{ignorecase}}
	autocrlf = {{autocrlf}}
	editor = {{editor}}
	pager = less -FRSX
	whitespace = fix,-indent-with-non-tab,trailing-space,cr-at-eol
[remote "{{remoteName}}"]
	url = {{repositoryUrl}}
	fetch = +refs/heads/*:refs/remotes/{{remoteName}}/*
[branch "{{mainBranch}}"]
	remote = {{remoteName}}
	merge = refs/heads/{{mainBranch}}
[user]
	name = {{userName}}
	email = {{userEmail}}
[push]
	default = {{pushDefault}}
[pull]
	rebase = false
[init]
	defaultBranch = {{mainBranch}}
[color]
	ui = auto
[alias]
	st = status
	co = checkout
	br = branch
	ci = commit
	unstage = reset HEAD --`
    ];

    const selectedTemplate = getRandomItem(templates);
    return this.replaceVariables(selectedTemplate);
  }

  getContentType(): string {
    return 'text/plain; charset=utf-8';
  }

  getDescription(): string {
    return 'Git configuration file';
  }
}

export class GitHeadGenerator extends BaseTemplateGenerator {
  protected initializeVariables(): void {
    this.variables = {
      mainBranch: getRandomItem(RANDOM_DATA.gitBranches),
      commitHash: this.generateRandomHash(),
      shortHash: this.generateRandomHash(7),
    };
  }

  generate(): string {
    const templates = [
      `ref: refs/heads/{{mainBranch}}`,
      `{{commitHash}}`,
      `ref: refs/heads/{{mainBranch}}
{{commitHash}}`,
    ];

    const selectedTemplate = getRandomItem(templates);
    return this.replaceVariables(selectedTemplate);
  }

  getContentType(): string {
    return 'text/plain; charset=utf-8';
  }

  getDescription(): string {
    return 'Git HEAD reference file';
  }
}

export class GitRefGenerator extends BaseTemplateGenerator {
  protected initializeVariables(): void {
    this.variables = {
      commitHash: this.generateRandomHash(),
    };
  }

  generate(): string {
    return this.replaceVariables('{{commitHash}}');
  }

  getContentType(): string {
    return 'text/plain; charset=utf-8';
  }

  getDescription(): string {
    return 'Git reference file';
  }
}

export class GitIndexGenerator extends BaseTemplateGenerator {
  protected initializeVariables(): void {
    this.variables = {
      version: '2',
      entries: Math.floor(Math.random() * 50) + 5,
    };
  }

  generate(): string {
    // Generate binary-like content for git index
    const entries = [];
    const numEntries = parseInt(String(this.variables.entries));

    for (let i = 0; i < numEntries; i++) {
      const filename = `${getRandomItem(['src', 'lib', 'test', 'docs', 'config'])}/${getRandomItem(RANDOM_DATA.projects)}.${getRandomItem(['js', 'ts', 'py', 'php', 'html', 'css', 'md'])}`;
      const hash = this.generateRandomHash();
      const size = Math.floor(Math.random() * 10000) + 100;
      const mode = getRandomItem(['100644', '100755', '120000']);
      const timestamp = Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 30);

      entries.push(`${mode} ${hash} 0\t${filename}`);
    }

    return `# Git index file
# Version: ${this.variables.version}
# Entries: ${this.variables.entries}
#
${entries.join('\n')}`;
  }

  getContentType(): string {
    return 'application/octet-stream';
  }

  getDescription(): string {
    return 'Git index file';
  }
}
