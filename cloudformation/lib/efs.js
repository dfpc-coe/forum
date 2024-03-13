import cf from '@openaddresses/cloudfriend';

export default {
    Resources: {
        EFSFileSystem: {
            Type: 'AWS::EFS::FileSystem',
            Properties: {
                Encrypted: true,
                KmsKeyId: cf.ref('KMS'),
                FileSystemTags: [{
                    Key: 'Name',
                    Value: cf.stackName
                }],
                PerformanceMode: 'generalPurpose'
            }
        },
        EFSMountTargetSubnetA: {
            Type: 'AWS::EFS::MountTarget',
            Properties: {
                FileSystemId: cf.ref('EFSFileSystem'),
                SubnetId: cf.importValue(cf.join(['coe-vpc-', cf.ref('Environment'), '-subnet-public-a'])),
                SecurityGroups: [ cf.ref('EFSSecurityGroup') ]
            }
        },
        EFSMountTargetSubnetB: {
            Type: 'AWS::EFS::MountTarget',
            Properties: {
                FileSystemId: cf.ref('EFSFileSystem'),
                SubnetId: cf.importValue(cf.join(['coe-vpc-', cf.ref('Environment'), '-subnet-public-b'])),
                SecurityGroups: [ cf.ref('EFSSecurityGroup') ]
            }
        },
        EFSSecurityGroup: {
            Type: 'AWS::EC2::SecurityGroup',
            Properties: {
                Tags: [{
                    Key: 'Name',
                    Value: cf.join('-', [cf.stackName, 'vpc'])
                }],
                VpcId: cf.importValue(cf.join(['coe-vpc-', cf.ref('Environment'), '-vpc'])),
                GroupDescription: 'Allow EFS Access in Forum Task',
                SecurityGroupIngress: [{
                    IpProtocol: 'tcp',
                    FromPort: 2049,
                    ToPort: 2049,
                    SourceSecurityGroupId: cf.ref('ServiceSecurityGroup')
                }]
            }
        }
    }
};
