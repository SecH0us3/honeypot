import { BaseTemplateGenerator, RandomDataContext } from './types';
import { RANDOM_DATA, getRandomItem, getCompanyName } from './randomData';

export class WordPressLoginGenerator extends BaseTemplateGenerator {
  protected initializeVariables(): void {
    this.variables = {
      siteName: getCompanyName(this.context.companyName),
      siteUrl: `https://${getRandomItem(RANDOM_DATA.domains)}`,
      wpVersion: getRandomItem(['6.4.2', '6.3.1', '6.2.3', '6.1.4', '6.0.5', '5.9.8']),
      theme: getRandomItem(['twentytwentythree', 'twentytwentytwo', 'twentytwentyone', 'astra', 'oceanwp', 'generatepress']),
      language: getRandomItem(['en_US', 'ru_RU', 'de_DE', 'fr_FR', 'es_ES']),
      nonce: this.generateRandomKey(10),
      redirect: getRandomItem(['/wp-admin/', '/wp-admin/index.php', '/dashboard/', '/admin/']),
      loginMessage: getRandomItem([
        'Please log in to access the admin area.',
        'Enter your credentials to continue.',
        'Administrator login required.',
        'Secure login portal.',
        ''
      ]),
      poweredBy: getRandomItem(['WordPress', 'WordPress CMS', 'WP Engine', 'WordPress.org']),
      customLogo: Math.random() > 0.7,
      rememberMe: Math.random() > 0.3,
      lostPassword: Math.random() > 0.2,
      registration: Math.random() > 0.8,
      multisite: Math.random() > 0.9,
      pluginCount: Math.floor(Math.random() * 50) + 5,
      themeCount: Math.floor(Math.random() * 20) + 3,
    };
  }

  generate(): string {
    const templates = [
      // Standard WordPress login
      `<!DOCTYPE html>
<html lang="{{language}}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Log In &lsaquo; {{siteName}} &mdash; WordPress</title>
    <link rel='dns-prefetch' href='//fonts.googleapis.com' />
    <link rel='dns-prefetch' href='//s.w.org' />
    <meta name='robots' content='max-image-preview:large' />
    <link rel="stylesheet" id="dashicons-css" href="{{siteUrl}}/wp-includes/css/dashicons.min.css" type="text/css" media="all" />
    <link rel="stylesheet" id="buttons-css" href="{{siteUrl}}/wp-includes/css/buttons.min.css" type="text/css" media="all" />
    <link rel="stylesheet" id="forms-css" href="{{siteUrl}}/wp-admin/css/forms.min.css" type="text/css" media="all" />
    <link rel="stylesheet" id="l10n-css" href="{{siteUrl}}/wp-admin/css/l10n.min.css" type="text/css" media="all" />
    <link rel="stylesheet" id="login-css" href="{{siteUrl}}/wp-admin/css/login.min.css" type="text/css" media="all" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta name="viewport" content="width=device-width" />
    <style type="text/css">
        body.login { background: #f1f1f1; }
        body.login div#login { padding: 20px 20px 0; }
        body.login div#login h1 a {
            background-image: url({{siteUrl}}/wp-admin/images/wordpress-logo.svg);
            background-size: 84px;
            background-position: center top;
            background-repeat: no-repeat;
            color: #3c434a;
            height: 84px;
            font-size: 20px;
            font-weight: 400;
            line-height: 1.3;
            margin: 0 auto 25px;
            padding: 0;
            text-decoration: none;
            width: 84px;
            text-indent: -9999px;
            outline: 0;
            overflow: hidden;
            display: block;
        }
        .login form {
            margin-top: 20px;
            margin-left: 0;
            padding: 26px 24px 46px;
            font-weight: 400;
            overflow: hidden;
            background: #fff;
            border: 1px solid #c3c4c7;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .login form .input {
            font-size: 24px;
            width: 100%;
            padding: 3px;
            margin: 2px 6px 16px 0;
            min-height: 60px;
            max-height: none;
            border: 1px solid #8c8f94;
            background: #fbfbfc;
            box-shadow: inset 0 1px 0 rgba(0,0,0,0.07);
            border-radius: 0;
            font-family: Consolas, Monaco, monospace;
        }
        .login form .input:focus {
            border-color: #2271b1;
            box-shadow: 0 0 0 1px #2271b1;
            outline: 2px solid transparent;
        }
        .login form .wp-pwd { position: relative; }
        .login form .wp-pwd input { padding-right: 40px; }
        .login form .wp-pwd button.wp-hide-pw {
            position: absolute;
            right: 6px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #3c434a;
        }
        .login form .submit {
            padding: 0;
            margin: 24px 0 0;
        }
        .login form .submit input {
            float: right;
            font-size: 14px;
            height: 40px;
            line-height: 40px;
            padding: 0 12px;
            margin: 0;
            border: 1px solid #2271b1;
            background: #2271b1;
            color: #fff;
            border-radius: 3px;
            cursor: pointer;
        }
        .login form .submit input:hover,
        .login form .submit input:focus {
            background: #135e96;
            border-color: #135e96;
        }
        .login form .forgetmenot {
            float: left;
            margin-top: 10px;
        }
        .login form .forgetmenot input {
            margin-right: 8px;
        }
        .login #nav {
            margin: 24px 0 0;
            color: #50575e;
            text-align: center;
        }
        .login #nav a {
            color: #50575e;
            text-decoration: none;
        }
        .login #nav a:hover {
            color: #135e96;
        }
        .login #backtoblog {
            margin: 16px 0 0;
            color: #50575e;
            text-align: center;
        }
        .login #backtoblog a {
            color: #50575e;
            text-decoration: none;
        }
        .login #backtoblog a:hover {
            color: #135e96;
        }
        .login .message {
            margin: 12px 0 20px;
            padding: 8px 12px;
            background: #fff;
            border: 1px solid #c3c4c7;
            border-left: 4px solid #72aee6;
        }
    </style>
</head>
<body class="login no-js login-action-login wp-core-ui locale-{{language}}">
    <script type="text/javascript">
        document.body.className = document.body.className.replace('no-js','js');
    </script>
    <div id="login">
        <h1><a href="{{siteUrl}}/" title="Powered by WordPress" tabindex="-1">{{siteName}}</a></h1>
        {{#if loginMessage}}
        <div class="message">{{loginMessage}}</div>
        {{/if}}
        <form name="loginform" id="loginform" action="{{siteUrl}}/wp-login.php" method="post">
            <p>
                <label for="user_login">Username or Email Address</label>
                <input type="text" name="log" id="user_login" class="input" value="" size="20" autocapitalize="off" autocomplete="username" />
            </p>
            <div class="wp-pwd">
                <label for="user_pass">Password</label>
                <input type="password" name="pwd" id="user_pass" class="input password-input" value="" size="20" autocomplete="current-password" />
                <button type="button" class="wp-hide-pw hide-if-no-js" data-toggle="0" aria-label="Show password">
                    <span class="dashicons dashicons-visibility" aria-hidden="true"></span>
                </button>
            </div>
            {{#if rememberMe}}
            <p class="forgetmenot">
                <input name="rememberme" type="checkbox" id="rememberme" value="forever" />
                <label for="rememberme">Remember Me</label>
            </p>
            {{/if}}
            <p class="submit">
                <input type="submit" name="wp-submit" id="wp-submit" class="button button-primary button-large" value="Log In" />
                <input type="hidden" name="redirect_to" value="{{redirect}}" />
                <input type="hidden" name="testcookie" value="1" />
            </p>
        </form>
        {{#if lostPassword}}
        <p id="nav">
            <a href="{{siteUrl}}/wp-login.php?action=lostpassword">Lost your password?</a>
        </p>
        {{/if}}
        {{#if registration}}
        <p id="nav">
            <a href="{{siteUrl}}/wp-login.php?action=register">Register</a>
        </p>
        {{/if}}
        <p id="backtoblog">
            <a href="{{siteUrl}}/">&larr; Go to {{siteName}}</a>
        </p>
    </div>
    <div class="clear"></div>
    <script type="text/javascript">
        function wp_attempt_focus() {
            setTimeout(function() {
                try {
                    d = document.getElementById('user_login');
                    d.focus();
                    d.select();
                } catch(e) {}
            }, 200);
        }
        wp_attempt_focus();
        if(typeof wpOnload=='function')wpOnload();
    </script>
</body>
</html>`,

      // Custom branded WordPress login
      `<!DOCTYPE html>
<html lang="{{language}}">
<head>
    <meta charset="UTF-8">
    <title>{{siteName}} - Admin Login</title>
    <link rel="stylesheet" href="{{siteUrl}}/wp-admin/css/login.min.css" type="text/css" />
    <style>
        body.login { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .login h1 a {
            background: url('{{siteUrl}}/wp-content/uploads/logo.png') no-repeat center;
            background-size: contain;
            width: 250px;
            height: 80px;
            text-indent: -9999px;
        }
        .login form {
            background: rgba(255,255,255,0.95);
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .login form .input {
            border-radius: 5px;
            font-size: 18px;
            padding: 12px;
        }
        .login form .submit .button {
            background: #667eea;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 600;
            padding: 12px 24px;
        }
        .login form .submit .button:hover {
            background: #5a6fd8;
        }
        .login #nav a, .login #backtoblog a {
            color: #fff;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .login #nav a:hover, .login #backtoblog a:hover {
            color: #f0f0f0;
        }
        .custom-footer {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255,255,255,0.8);
            font-size: 12px;
            text-align: center;
        }
    </style>
</head>
<body class="login">
    <div id="login">
        <h1><a href="{{siteUrl}}">{{siteName}}</a></h1>
        <form method="post" action="{{siteUrl}}/wp-login.php">
            <p>
                <label for="user_login">Username or Email</label>
                <input type="text" name="log" id="user_login" class="input" required />
            </p>
            <p>
                <label for="user_pass">Password</label>
                <input type="password" name="pwd" id="user_pass" class="input" required />
            </p>
            <p class="forgetmenot">
                <input name="rememberme" type="checkbox" id="rememberme" value="forever" />
                <label for="rememberme">Remember Me</label>
            </p>
            <p class="submit">
                <input type="submit" name="wp-submit" class="button button-primary" value="Log In" />
                <input type="hidden" name="redirect_to" value="{{redirect}}" />
                <input type="hidden" name="testcookie" value="1" />
            </p>
        </form>
        <p id="nav">
            <a href="{{siteUrl}}/wp-login.php?action=lostpassword">Lost Password?</a>
        </p>
        <p id="backtoblog">
            <a href="{{siteUrl}}">← Back to {{siteName}}</a>
        </p>
    </div>
    <div class="custom-footer">
        Powered by {{poweredBy}} {{wpVersion}} | Theme: {{theme}}<br>
        {{pluginCount}} plugins active | {{themeCount}} themes installed
    </div>
</body>
</html>`,

      // Minimalist WordPress login
      `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login - {{siteName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9f9f9; }
        .container { max-width: 320px; margin: 100px auto; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #23282d; font-size: 24px; font-weight: 600; }
        .form-box { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 6px; color: #32373c; font-weight: 500; }
        .form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        .form-group input:focus { border-color: #0073aa; outline: none; box-shadow: 0 0 0 2px rgba(0,115,170,0.2); }
        .submit-btn { width: 100%; padding: 12px; background: #0073aa; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
        .submit-btn:hover { background: #005a87; }
        .checkbox-group { display: flex; align-items: center; margin: 15px 0; }
        .checkbox-group input { width: auto; margin-right: 8px; }
        .links { text-align: center; margin-top: 20px; }
        .links a { color: #0073aa; text-decoration: none; font-size: 14px; }
        .links a:hover { text-decoration: underline; }
        .footer { text-align: center; margin-top: 30px; color: #646970; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>{{siteName}}</h1>
        </div>
        <div class="form-box">
            <form method="post" action="/wp-login.php">
                <div class="form-group">
                    <label>Username or Email Address</label>
                    <input type="text" name="log" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="pwd" required>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" name="rememberme" id="remember" value="forever">
                    <label for="remember">Remember Me</label>
                </div>
                <button type="submit" class="submit-btn">Log In</button>
                <input type="hidden" name="redirect_to" value="{{redirect}}">
                <input type="hidden" name="testcookie" value="1">
            </form>
            <div class="links">
                <a href="/wp-login.php?action=lostpassword">Lost your password?</a>
            </div>
        </div>
        <div class="footer">
            WordPress {{wpVersion}} | {{siteName}}<br>
            Nonce: {{nonce}}
        </div>
    </div>
</body>
</html>`,

      // Multisite WordPress login
      `<!DOCTYPE html>
<html lang="{{language}}">
<head>
    <meta charset="UTF-8">
    <title>{{siteName}} Network - Login</title>
    <link rel="stylesheet" href="{{siteUrl}}/wp-admin/css/login.min.css">
    <style>
        body.login { background: #f1f1f1; }
        .login h1 a { color: #444; }
        .multisite-info {
            background: #fff;
            border: 1px solid #c3c4c7;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            font-size: 13px;
            color: #646970;
        }
        .multisite-info h3 {
            margin: 0 0 10px 0;
            color: #23282d;
            font-size: 14px;
        }
        .network-stats {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
        }
        .network-stats span {
            font-weight: 600;
            color: #0073aa;
        }
    </style>
</head>
<body class="login">
    <div id="login">
        <h1><a href="{{siteUrl}}">{{siteName}} Network</a></h1>

        {{#if multisite}}
        <div class="multisite-info">
            <h3>WordPress Multisite Network</h3>
            <p>This is a WordPress multisite network. Please enter your network credentials.</p>
            <div class="network-stats">
                <div>Sites: <span>{{themeCount}}</span></div>
                <div>Users: <span>{{pluginCount}}</span></div>
                <div>Themes: <span>{{themeCount}}</span></div>
            </div>
        </div>
        {{/if}}

        <form method="post" action="{{siteUrl}}/wp-login.php">
            <p>
                <label for="user_login">Username or Email Address</label>
                <input type="text" name="log" id="user_login" class="input" size="20" autocapitalize="off" />
            </p>
            <p>
                <label for="user_pass">Password</label>
                <input type="password" name="pwd" id="user_pass" class="input" size="20" />
            </p>
            <p class="forgetmenot">
                <input name="rememberme" type="checkbox" id="rememberme" value="forever" />
                <label for="rememberme">Remember Me</label>
            </p>
            <p class="submit">
                <input type="submit" name="wp-submit" class="button button-primary button-large" value="Log In" />
                <input type="hidden" name="redirect_to" value="{{redirect}}" />
                <input type="hidden" name="testcookie" value="1" />
            </p>
        </form>

        <p id="nav">
            <a href="{{siteUrl}}/wp-login.php?action=lostpassword">Lost your password?</a>
        </p>
        <p id="backtoblog">
            <a href="{{siteUrl}}">← Go to {{siteName}}</a>
        </p>
    </div>
    <script>
        document.getElementById('user_login').focus();
    </script>
</body>
</html>`
    ];

    const selectedTemplate = getRandomItem(templates);
    // Simple template replacement since we can't use Handlebars
    let result = this.replaceVariables(selectedTemplate);

    // Handle conditional blocks manually
    if (this.variables.loginMessage) {
      result = result.replace(/\{\{#if loginMessage\}\}/g, '');
      result = result.replace(/\{\{\/if\}\}/g, '');
    } else {
      result = result.replace(/\{\{#if loginMessage\}\}.*?\{\{\/if\}\}/gs, '');
    }

    if (this.variables.rememberMe) {
      result = result.replace(/\{\{#if rememberMe\}\}/g, '');
      result = result.replace(/\{\{\/if\}\}/g, '');
    } else {
      result = result.replace(/\{\{#if rememberMe\}\}.*?\{\{\/if\}\}/gs, '');
    }

    if (this.variables.lostPassword) {
      result = result.replace(/\{\{#if lostPassword\}\}/g, '');
      result = result.replace(/\{\{\/if\}\}/g, '');
    } else {
      result = result.replace(/\{\{#if lostPassword\}\}.*?\{\{\/if\}\}/gs, '');
    }

    if (this.variables.registration) {
      result = result.replace(/\{\{#if registration\}\}/g, '');
      result = result.replace(/\{\{\/if\}\}/g, '');
    } else {
      result = result.replace(/\{\{#if registration\}\}.*?\{\{\/if\}\}/gs, '');
    }

    if (this.variables.multisite) {
      result = result.replace(/\{\{#if multisite\}\}/g, '');
      result = result.replace(/\{\{\/if\}\}/g, '');
    } else {
      result = result.replace(/\{\{#if multisite\}\}.*?\{\{\/if\}\}/gs, '');
    }

    return result;
  }

  getContentType(): string {
    return 'text/html; charset=UTF-8';
  }

  getDescription(): string {
    return 'WordPress login page';
  }
}
