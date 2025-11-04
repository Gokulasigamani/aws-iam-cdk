import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";

export class Ec2CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ✅ Create VPC
    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: "PublicSubnet",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // ✅ Security Group
    const securityGroup = new ec2.SecurityGroup(this, "InstanceSG", {
      vpc,
      allowAllOutbound: true,
      description: "Allow SSH and HTTP",
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "SSH Access");
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "HTTP Access");

    // ✅ IAM Role for EC2 (S3 read access)
    const role = new iam.Role(this, "EC2S3ReadRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"),
      ],
    });

    // ✅ Correct AMI for eu-north-1
    const ami = ec2.MachineImage.latestAmazonLinux2023({
      cachedInContext: true,
    });

    // ✅ Use supported instance type (t3.micro works in eu-north-1)
    const instance = new ec2.Instance(this, "WebServerInstance", {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ami,
      securityGroup,
      role,
      keyName: "my-key", // your existing key
    });

    new cdk.CfnOutput(this, "InstancePublicIP", {
      value: instance.instancePublicIp,
    });

    new cdk.CfnOutput(this, "InstanceID", {
      value: instance.instanceId,
    });
  }
}
