import cf from '@openaddresses/cloudfriend';
import {
    ELB as ELBAlarms,
    RDS as RDSAlarms
} from '@openaddresses/batch-alarms';

import DB from './lib/db.js';
import KMS from './lib/kms.js';
import EFS from './lib/efs.js';
import API from './lib/api.js';
import Alarms from './lib/alarms.js';

export default cf.merge(
    DB, KMS, API, EFS, Alarms,
    {
        Description: 'Template for @tak-ps/forum',
        Parameters: {
            GitSha: {
                Description: 'GitSha that is currently being deployed',
                Type: 'String'
            },
            SubdomainPrefix: {
                Description: 'Subdomain prefix of the instance',
                Type: 'String',
                Default: 'forum'
            },
            Environment: {
                Description: 'VPC/ECS Stack to deploy into',
                Type: 'String',
                Default: 'prod'
            },
            EnableExecute: {
                Description: 'Allow SSH into docker container - should only be enabled for limited debugging',
                Type: 'String',
                AllowedValues: ['true', 'false'],
                Default: 'false'
            },
            SSLCertificateIdentifier: {
                Description: 'ACM SSL Certificate for HTTP Protocol',
                Type: 'String'
            }
        }
    },
    ELBAlarms({
        prefix: 'ELBAlarm',
        topic: cf.ref('AlarmTopic'),
        apache: cf.stackName,
        cluster: cf.join(['coe-ecs-', cf.ref('Environment')]),
        service: cf.getAtt('Service', 'Name'),
        loadbalancer: cf.getAtt('ELB', 'LoadBalancerFullName'),
        targetgroup: cf.getAtt('TargetGroup', 'TargetGroupFullName')

    }),
    RDSAlarms({
        prefix: 'RDSAlarm',
        topic: cf.ref('AlarmTopic'),
        instance: cf.ref('DBInstance')

    })
);
