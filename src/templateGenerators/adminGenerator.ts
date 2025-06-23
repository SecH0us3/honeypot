import { BaseTemplateGenerator, RandomDataContext } from './types';
import { RANDOM_DATA, getRandomItem, getCompanyName } from './randomData';

export class AdminPanelGenerator extends BaseTemplateGenerator {
  protected initializeVariables(): void {
    this.variables = {
      companyName: getCompanyName(this.context.companyName),
      appName: getRandomItem(RANDOM_DATA.apps),
      version: this.generateRandomVersion(),
      buildDate: this.generateRandomDate(),
      serverTime: new Date().toISOString(),
      loginTitle: getRandomItem(['Admin Login', 'Administrator Access', 'Control Panel', 'Management Console', 'System Dashboard']),
      copyright: `© ${new Date().getFullYear()} ${getCompanyName(this.context.companyName)}`,
      poweredBy: getRandomItem(RANDOM_DATA.poweredBy),
      theme: getRandomItem(['default', 'dark', 'light', 'blue', 'green']),
      language: getRandomItem(['en', 'en-US', 'ru', 'de', 'fr', 'es']),
      csrfToken: this.generateRandomKey(32),
      sessionId: this.generateRandomKey(24),
      buildNumber: Math.floor(Math.random() * 9999) + 1000,
      supportEmail: getRandomItem(RANDOM_DATA.emails),
    };
  }

  generate(): string {
    const templates = [
      // Modern Bootstrap-style admin panel
      `<!DOCTYPE html>
<html lang="{{language}}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{loginTitle}} - {{companyName}}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .login-container { min-height: 100vh; display: flex; align-items: center; }
        .login-card { background: rgba(255,255,255,0.9); border-radius: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
        .login-header { background: #4e73df; color: white; border-radius: 15px 15px 0 0; }
        .btn-login { background: #4e73df; border: none; }
        .btn-login:hover { background: #2e59d9; }
    </style>
</head>
<body>
    <div class="container login-container">
        <div class="row justify-content-center w-100">
            <div class="col-md-6 col-lg-4">
                <div class="login-card">
                    <div class="login-header text-center py-4">
                        <i class="fas fa-shield-alt fa-2x mb-2"></i>
                        <h4>{{loginTitle}}</h4>
                        <small>{{companyName}}</small>
                    </div>
                    <div class="card-body p-4">
                        <form method="post" action="/admin/login">
                            <input type="hidden" name="_token" value="{{csrfToken}}">
                            <div class="mb-3">
                                <label class="form-label">Username</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                                    <input type="text" class="form-control" name="username" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                    <input type="password" class="form-control" name="password" required>
                                </div>
                            </div>
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="remember">
                                <label class="form-check-label" for="remember">Remember me</label>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-login btn-primary">
                                    <i class="fas fa-sign-in-alt me-2"></i>Sign In
                                </button>
                            </div>
                        </form>
                        <div class="text-center mt-3">
                            <a href="/admin/forgot-password" class="text-muted small">Forgot Password?</a>
                        </div>
                    </div>
                    <div class="card-footer text-center text-muted small">
                        {{copyright}} | Version {{version}} | Build {{buildNumber}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,

      // Classic corporate admin panel
      `<!DOCTYPE html>
<html>
<head>
    <title>{{loginTitle}} - {{appName}}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        .header { background: #2c3e50; color: white; padding: 15px 0; text-align: center; }
        .container { max-width: 400px; margin: 50px auto; }
        .login-box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h2 { color: #2c3e50; margin-bottom: 5px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; color: #555; font-weight: 500; }
        .form-group input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 14px; }
        .form-group input:focus { border-color: #3498db; outline: none; }
        .btn { width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
        .btn:hover { background: #2980b9; }
        .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px; }
        .security-notice { background: #ecf0f1; padding: 10px; border-left: 4px solid #e74c3c; margin-top: 20px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{companyName}} Management System</h1>
    </div>
    <div class="container">
        <div class="login-box">
            <div class="logo">
                <h2>{{loginTitle}}</h2>
                <p>{{appName}} v{{version}}</p>
            </div>
            <form method="POST" action="/admin/authenticate">
                <input type="hidden" name="session_id" value="{{sessionId}}">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required autocomplete="off">
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn">Login</button>
                </div>
            </form>
            <div class="security-notice">
                <strong>Security Notice:</strong> This is a restricted area. All access attempts are logged and monitored.
            </div>
        </div>
        <div class="footer">
            {{copyright}} | Powered by {{poweredBy}}<br>
            Build {{buildNumber}} ({{buildDate}}) | Support: {{supportEmail}}
        </div>
    </div>
</body>
</html>`,

      // Minimal dark theme admin
      `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Administrator Login</title>
    <style>
        body { margin: 0; padding: 0; background: #1a1a1a; color: #e0e0e0; font-family: 'Courier New', monospace; }
        .container { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .login-form { background: #2d2d2d; padding: 30px; border: 1px solid #444; width: 350px; }
        .title { text-align: center; margin-bottom: 20px; color: #00ff00; font-size: 18px; }
        .field { margin-bottom: 15px; }
        .field label { display: block; margin-bottom: 5px; color: #ccc; }
        .field input { width: 100%; padding: 8px; background: #1a1a1a; border: 1px solid #555; color: #e0e0e0; }
        .field input:focus { border-color: #00ff00; outline: none; }
        .submit { width: 100%; padding: 10px; background: #333; border: 1px solid #555; color: #e0e0e0; cursor: pointer; }
        .submit:hover { background: #444; }
        .info { margin-top: 20px; font-size: 11px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="login-form">
            <div class="title">SYSTEM ACCESS</div>
            <form method="post">
                <div class="field">
                    <label>USER:</label>
                    <input type="text" name="user" required>
                </div>
                <div class="field">
                    <label>PASS:</label>
                    <input type="password" name="pass" required>
                </div>
                <div class="field">
                    <input type="submit" value="ACCESS" class="submit">
                </div>
            </form>
            <div class="info">
                {{companyName}} v{{version}}<br>
                Session: {{sessionId}}<br>
                {{buildDate}}
            </div>
        </div>
    </div>
</body>
</html>`,

      // Enterprise-style login with additional features
      `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{companyName}} - Enterprise Login</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: #f8f9fa; }
        .login-wrapper { min-height: 100vh; display: flex; }
        .login-left { flex: 1; background: linear-gradient(45deg, #007bff, #0056b3); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; }
        .login-right { flex: 1; display: flex; justify-content: center; align-items: center; padding: 40px; }
        .login-form { width: 100%; max-width: 400px; }
        .company-logo { font-size: 48px; margin-bottom: 20px; }
        .company-info h1 { font-size: 32px; margin-bottom: 10px; }
        .company-info p { font-size: 18px; opacity: 0.9; }
        .form-card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .form-title { font-size: 28px; margin-bottom: 30px; color: #333; text-align: center; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; }
        .form-input { width: 100%; padding: 14px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; }
        .form-input:focus { border-color: #007bff; outline: none; box-shadow: 0 0 0 3px rgba(0,123,255,0.1); }
        .form-button { width: 100%; padding: 14px; background: #007bff; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
        .form-button:hover { background: #0056b3; }
        .form-footer { text-align: center; margin-top: 30px; color: #6c757d; }
        .form-links { margin-top: 20px; text-align: center; }
        .form-links a { color: #007bff; text-decoration: none; margin: 0 10px; }
        .security-badge { display: inline-flex; align-items: center; margin-top: 15px; padding: 8px 12px; background: #e8f5e8; color: #2d5a2d; border-radius: 20px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="login-wrapper">
        <div class="login-left">
            <div class="company-info">
                <div class="company-logo">🏢</div>
                <h1>{{companyName}}</h1>
                <p>Enterprise Management Portal</p>
                <div class="security-badge">
                    🔒 SSL Secured Connection
                </div>
            </div>
        </div>
        <div class="login-right">
            <div class="login-form">
                <div class="form-card">
                    <h2 class="form-title">Welcome Back</h2>
                    <form method="POST" action="/admin/login">
                        <input type="hidden" name="_token" value="{{csrfToken}}">
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input type="email" class="form-input" name="email" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-input" name="password" placeholder="Enter your password" required>
                        </div>
                        <div class="form-group">
                            <label style="display: flex; align-items: center;">
                                <input type="checkbox" name="remember" style="margin-right: 8px;">
                                Keep me signed in
                            </label>
                        </div>
                        <button type="submit" class="form-button">Sign In</button>
                    </form>
                    <div class="form-links">
                        <a href="/forgot-password">Forgot Password?</a>
                        <a href="/support">Need Help?</a>
                    </div>
                </div>
                <div class="form-footer">
                    {{copyright}}<br>
                    Version {{version}} • Build {{buildNumber}}<br>
                    Last updated: {{buildDate}}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
    ];

    const selectedTemplate = getRandomItem(templates);
    return this.replaceVariables(selectedTemplate);
  }

  getContentType(): string {
    return 'text/html; charset=utf-8';
  }

  getDescription(): string {
    return 'Admin panel login page';
  }
}

export class PhpMyAdminGenerator extends BaseTemplateGenerator {
  protected initializeVariables(): void {
    this.variables = {
      version: getRandomItem(['5.2.1', '5.1.3', '4.9.7', '5.0.4', '4.8.5']),
      serverVersion: getRandomItem(['8.0.28', '5.7.39', '10.6.12', '8.0.32']),
      phpVersion: getRandomItem(RANDOM_DATA.poweredBy.filter(p => p.startsWith('PHP'))),
      serverName: 'localhost',
      charset: 'utf8mb4_unicode_ci',
      user: 'root',
      theme: getRandomItem(['pmahomme', 'original', 'metro']),
      language: 'en',
      token: this.generateRandomKey(32),
    };
  }

  generate(): string {
    const template = `<!DOCTYPE HTML>
<html lang="{{language}}" dir="ltr">
<head>
    <meta charset="utf-8">
    <title>phpMyAdmin {{version}}</title>
    <meta name="robots" content="noindex,nofollow">
    <style>
        body { font-family: sans-serif; background: #f5f5f5; margin: 0; }
        .header { background: #2980b9; color: white; padding: 10px 20px; }
        .container { max-width: 400px; margin: 50px auto; background: white; padding: 30px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 20px; }
        .logo img { max-width: 200px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px; }
        .btn { background: #2980b9; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; }
        .btn:hover { background: #3498db; }
        .info { background: #ecf0f1; padding: 15px; margin-top: 20px; border-radius: 3px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>phpMyAdmin {{version}}</h1>
    </div>
    <div class="container">
        <div class="logo">
            <h2>Welcome to phpMyAdmin</h2>
        </div>
        <form method="post" action="index.php">
            <input type="hidden" name="token" value="{{token}}">
            <div class="form-group">
                <label for="input_username">Username:</label>
                <input type="text" name="pma_username" id="input_username" value="{{user}}" required>
            </div>
            <div class="form-group">
                <label for="input_password">Password:</label>
                <input type="password" name="pma_password" id="input_password" required>
            </div>
            <div class="form-group">
                <label for="select_server">Server Choice:</label>
                <select name="server" id="select_server">
                    <option value="1">{{serverName}}</option>
                </select>
            </div>
            <div class="form-group">
                <button type="submit" class="btn">Go</button>
            </div>
        </form>
        <div class="info">
            <strong>Server:</strong> {{serverName}}<br>
            <strong>Server type:</strong> MySQL<br>
            <strong>Server version:</strong> {{serverVersion}}<br>
            <strong>Protocol version:</strong> 10<br>
            <strong>User:</strong> {{user}}@localhost<br>
            <strong>Server charset:</strong> {{charset}}<br>
            <strong>PHP extension:</strong> mysqli curl mbstring<br>
            <strong>PHP version:</strong> {{phpVersion}}
        </div>
    </div>
</body>
</html>`;

    return this.replaceVariables(template);
  }

  getContentType(): string {
    return 'text/html; charset=utf-8';
  }

  getDescription(): string {
    return 'phpMyAdmin login page';
  }
}
