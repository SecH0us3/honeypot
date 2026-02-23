import { BaseTemplateGenerator } from './types';

// Terraform Generator
export class TerraformGenerator extends BaseTemplateGenerator {
    protected initializeVariables(): void {
        this.variables = {
            awsRegion: this.getRandomItem(['us-east-1', 'us-west-2', 'eu-central-1', 'ap-northeast-1']),
            instanceType: this.getRandomItem(['t3.micro', 't3.small', 'm5.large', 'c5.xlarge']),
            bucketName: `terraform-state-${this.generateRandomKey(8)}`,
            environment: this.getRandomItem(['dev', 'staging', 'prod']),
        };
    }

    generate(): string {
        const templates = [
            `provider "aws" {
  region = "{{awsRegion}}"
}

terraform {
  backend "s3" {
    bucket = "{{bucketName}}"
    key    = "state/{{environment}}/terraform.tfstate"
    region = "{{awsRegion}}"
  }
}

resource "aws_instance" "web" {
  ami           = "ami-${this.generateRandomKey(17).toLowerCase()}"
  instance_type = "{{instanceType}}"

  tags = {
    Name = "WebServer-{{environment}}"
    Environment = "{{environment}}"
  }
}`,
            `variable "region" {
  default = "{{awsRegion}}"
}

variable "instance_type" {
  default = "{{instanceType}}"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "3.14.0"

  name = "vpc-{{environment}}"
  cidr = "10.0.0.0/16"

  azs             = ["{{awsRegion}}a", "{{awsRegion}}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}`,
        ];

        return this.replaceVariables(this.getRandomItem(templates));
    }

    getContentType(): string {
        return 'text/plain; charset=utf-8';
    }

    getDescription(): string {
        return 'Terraform configuration file';
    }
}

// CI/CD Generator (CircleCI, Travis, etc.)
export class CicdConfigGenerator extends BaseTemplateGenerator {
    protected initializeVariables(): void {
        this.variables = {
            nodeVersion: this.getRandomItem(['16.14.0', '18.12.0', '20.5.0']),
            branch: this.getRandomItem(['main', 'master', 'develop']),
            dockerImage: this.getRandomItem(['cimg/node:18.12.0', 'circleci/python:3.9', 'travisci/ubuntu-2004']),
        };
    }

    generate(): string {
        const templates = [
            // CircleCI
            `version: 2.1
jobs:
  build:
    docker:
      - image: {{dockerImage}}
    steps:
      - checkout
      - run: npm install
      - run: npm test
workflows:
  version: 2
  build_and_test:
    jobs:
      - build:
          filters:
            branches:
              only: {{branch}}`,
            // Travis CI
            `language: node_js
node_js:
  - "{{nodeVersion}}"
cache:
  directories:
    - node_modules
script:
  - npm test
branches:
  only:
    - {{branch}}`,
            // GitHub Actions (simple)
            `name: CI
on:
  push:
    branches: [ "{{branch}}" ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js {{nodeVersion}}
      uses: actions/setup-node@v3
      with:
        node-version: {{nodeVersion}}
    - run: npm ci
    - run: npm test`,
        ];

        return this.replaceVariables(this.getRandomItem(templates));
    }

    getContentType(): string {
        return 'text/yaml; charset=utf-8';
    }

    getDescription(): string {
        return 'CI/CD configuration file';
    }
}

// AI/ML Generator
export class AiMlGenerator extends BaseTemplateGenerator {
    protected initializeVariables(): void {
        this.variables = {
            pythonVersion: this.getRandomItem(['3.8.10', '3.9.13', '3.10.6']),
            framework: this.getRandomItem(['torch', 'tensorflow', 'keras']),
            modelName: this.getRandomItem(['resnet50', 'bert-base-uncased', 'yolov5']),
        };
    }

    generate(): string {
        // Simulating a Jupyter Notebook or a Python script
        const templates = [
            // Jupyter Notebook JSON structure
            `{
 "cells": [
  {
   "cell_type": "code",
   "execution_count": 1,
   "metadata": {},
   "outputs": [],
   "source": [
    "import {{framework}} as ml\\n",
    "import numpy as np\\n",
    "\\n",
    "model = ml.load_model('{{modelName}}')\\n",
    "print('Model loaded successfully')"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Model Training\\n",
    "Training the {{modelName}} model on the dataset."
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "{{pythonVersion}}"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 5
}`,
            // Python training script
            `import {{framework}}
import os

# Configuration
MODEL_NAME = "{{modelName}}"
BATCH_SIZE = 32
EPOCHS = 10

def train():
    print(f"Training {MODEL_NAME}...")
    # TODO: Implement training loop
    pass

if __name__ == "__main__":
    train()
`,
        ];

        const selected = this.getRandomItem(templates);
        // If it looks like JSON, return JSON content type
        if (selected.trim().startsWith('{')) {
            this.contentType = 'application/json';
        } else {
            this.contentType = 'text/x-python';
        }
        return this.replaceVariables(selected);
    }

    private contentType = 'text/plain';

    getContentType(): string {
        return this.contentType;
    }

    getDescription(): string {
        return 'AI/ML project file';
    }
}

// Remote Access Generator
export class RemoteAccessGenerator extends BaseTemplateGenerator {
    protected initializeVariables(): void {
        this.variables = {
            serverIp: this.getRandomItem(['10.0.1.5', '192.168.1.100', '172.16.0.50']),
            port: this.getRandomItem(['1194', '443', '3389']),
            proto: this.getRandomItem(['udp', 'tcp']),
        };
    }

    generate(): string {
        const templates = [
            // OpenVPN
            `client
dev tun
proto {{proto}}
remote {{serverIp}} {{port}}
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
cert client.crt
key client.key
remote-cert-tls server
cipher AES-256-CBC
verb 3`,
            // RDP (.rdp file format)
            `screen mode id:i:2
use multimon:i:0
desktopwidth:i:1920
desktopheight:i:1080
session bpp:i:32
winposstr:s:0,3,0,0,800,600
compression:i:1
keyboardhook:i:2
audiocapturemode:i:0
videoplaybackmode:i:1
connection type:i:7
networkautodetect:i:1
bandwidthautodetect:i:1
displayconnectionbar:i:1
enableworkspacereconnect:i:0
disable wallpaper:i:0
allow font smoothing:i:0
allow desktop composition:i:0
disable full window drag:i:1
disable menu anims:i:1
disable themes:i:0
disable cursor setting:i:0
bitmapcachepersistenable:i:1
full address:s:{{serverIp}}:{{port}}
audiomode:i:0
redirectprinters:i:1
redirectcomports:i:0
redirectsmartcards:i:1
redirectclipboard:i:1
redirectposdevices:i:0
drivestoredirect:s:
autoreconnection enabled:i:1
authentication level:i:2
prompt for credentials:i:1
negotiate security layer:i:1
remoteapplicationmode:i:0
alternate shell:s:
shell working directory:s:
gatewayhostname:s:
gatewayusagemethod:i:4
gatewaycredentialssource:i:4
gatewayprofileusagemethod:i:0
promptcredentialonce:i:0
gatewaybrokeringtype:i:0
use redirection server name:i:0
rdgiskdcproxy:i:0
kdcproxyname:s:
`,
        ];

        return this.replaceVariables(this.getRandomItem(templates));
    }

    getContentType(): string {
        return 'text/plain';
    }

    getDescription(): string {
        return 'Remote access configuration';
    }
}
