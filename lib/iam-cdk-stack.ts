import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export class IamCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new IAM user
    const user = new iam.User(this, "DemoUser", {
      userName: "gokul",
    });

    // Create a new IAM group
    const devGroup = new iam.Group(this, "DevelopersGroup", {
      groupName: "Developers",
    });

    // Add the user to the group
    devGroup.addUser(user);

    // Attach an AWS managed policy to the group
    devGroup.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );

    // Create a custom inline policy for limited S3 access
    const customPolicy = new iam.Policy(this, "CustomS3Policy", {
      statements: [
        new iam.PolicyStatement({
          actions: ["s3:ListBucket", "s3:GetObject"],
          resources: ["arn:aws:s3:::demo-purpose-cdk1/*"],
        }),
      ],
    });

    // Attach the custom inline policy to the user
    user.attachInlinePolicy(customPolicy);

    // Create an IAM role for Lambda execution
    const lambdaRole = new iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    // Attach the basic Lambda execution managed policy to the role
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );
  }
}
