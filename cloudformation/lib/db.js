import cf from '@openaddresses/cloudfriend';

export default {
    Parameters: {
        DatabaseType: {
            Type: 'String',
            Default: 'db.t3.micro',
            Description: 'Database size to create',
            AllowedValues: [
                'db.t3.micro'
            ]
        }
    },
    Resources: {
        DBMasterSecret: {
            Type: 'AWS::SecretsManager::Secret',
            Properties: {
                Description: cf.join([cf.stackName, ' RDS Master Password']),
                GenerateSecretString: {
                    SecretStringTemplate: '{"username": "tak"}',
                    GenerateStringKey: 'password',
                    ExcludePunctuation: true,
                    PasswordLength: 32
                },
                Name: cf.join([cf.stackName, '/rds/secret']),
                KmsKeyId: cf.ref('KMS')
            }
        },
        DBMasterSecretAttachment: {
            Type: 'AWS::SecretsManager::SecretTargetAttachment',
            Properties: {
                SecretId: cf.ref('DBMasterSecret'),
                TargetId: cf.ref('DBInstance'),
                TargetType: 'AWS::RDS::DBInstance'
            }
        },
        DBMonitoringRole: {
            Type: 'AWS::IAM::Role',
            Properties: {
                AssumeRolePolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                        Sid: '',
                        Effect: 'Allow',
                        Principal: {
                            Service: 'monitoring.rds.amazonaws.com'
                        },
                        Action: 'sts:AssumeRole'
                    }]
                },
                ManagedPolicyArns: [
                    cf.join(['arn:', cf.partition, ':iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole'])
                ],
                Path: '/'
            }
        },
        DBInstance: {
            Type: 'AWS::RDS::DBInstance',
            DependsOn: ['DBMasterSecret'],
            Properties: {
                Engine: 'postgres',
                AllowMajorVersionUpgrade: false,
                DBName: 'tak_ps_forum',
                CopyTagsToSnapshot: true,
                DBInstanceIdentifier: cf.stackName,
                MonitoringInterval: 60,
                MonitoringRoleArn: cf.getAtt('DBMonitoringRole', 'Arn'),
                KmsKeyId: cf.ref('KMS'),
                EngineVersion: '16.4',
                StorageEncrypted: true,
                MasterUsername: cf.sub('{{resolve:secretsmanager:${AWS::StackName}/rds/secret:SecretString:username:AWSCURRENT}}'),
                MasterUserPassword: cf.sub('{{resolve:secretsmanager:${AWS::StackName}/rds/secret:SecretString:password:AWSCURRENT}}'),
                EnablePerformanceInsights: true,
                PerformanceInsightsKMSKeyId: cf.ref('KMS'),
                PerformanceInsightsRetentionPeriod: 7,
                AllocatedStorage: 200,
                MaxAllocatedStorage: 200,
                BackupRetentionPeriod: 10,
                StorageType: 'gp2',
                DBInstanceClass: cf.ref('DatabaseType'),
                VPCSecurityGroups: [cf.ref('DBVPCSecurityGroup')],
                DBSubnetGroupName: cf.ref('DBSubnet'),
                PubliclyAccessible: true,
                DeletionProtection: true
            }
        },
        DBSubnet: {
            Type: 'AWS::RDS::DBSubnetGroup',
            Properties: {
                DBSubnetGroupDescription: cf.join('-', [cf.stackName, 'rds-subnets']),
                SubnetIds: [
                    cf.importValue(cf.join(['coe-vpc-', cf.ref('Environment'), '-subnet-private-a'])),
                    cf.importValue(cf.join(['coe-vpc-', cf.ref('Environment'), '-subnet-private-b']))
                ]
            }
        },
        DBVPCSecurityGroup: {
            Type: 'AWS::EC2::SecurityGroup',
            Properties: {
                GroupDescription: cf.join('-', [cf.stackName, 'rds-sg']),
                VpcId: cf.importValue(cf.join(['coe-vpc-', cf.ref('Environment'), '-vpc'])),
                SecurityGroupIngress: [{
                    IpProtocol: 'TCP',
                    FromPort: 5432,
                    ToPort: 5432,
                    SourceSecurityGroupId: cf.getAtt('ServiceSecurityGroup', 'GroupId')
                }]
            }
        }
    },
    Outputs: {
        DB: {
            Description: 'Postgres Connection String',
            Value: cf.join([
                'postgresql://',
                cf.sub('{{resolve:secretsmanager:${AWS::StackName}/rds/secret:SecretString:username:AWSCURRENT}}'),
                ':',
                cf.sub('{{resolve:secretsmanager:${AWS::StackName}/rds/secret:SecretString:password:AWSCURRENT}}'),
                '@',
                cf.getAtt('DBInstance', 'Endpoint.Address'),
                ':5432/tak_ps_forum'
            ])
        }
    }
};
