# ALICE TEST NETWORK ON AWS

## How to configure AWS

- Select an AWS region (currently Dublin and London are supported).
- Go to the EC2 dashboard
  - Make sure a security group is set up (or create a new one)
  - Check that there exists a key pair that you can use or create a new one
- Go to your IAM dasboard
  - Make sure you have an access key ID to authenticate on AWS or generate a new one for your user (and keep it in a secure location)

## How to deploy an alice test network on AWS

After generating the deployment configuration using `indigo-cli generate`, all the default settings should be set but you are free to edit them:

- the ansible inventory (network.ini) defines the variables that will be used for deployment.
- the ansible configuration (ansible.cfg) defines a few settings for ansible.
- the ansible playbook (main.yml) describes the actions to deploy the test network.

You can pass other configuration files to ansible using the `alice deploy` CLI options.

Example:

```
alice deploy --key path/to/aws_private_key.pem
```
