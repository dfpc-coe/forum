import cf from '@openaddresses/cloudfriend';
import {
    RDS as RDSAlarms
} from '@openaddresses/batch-alarms';

import DB from './lib/db.js';
import KMS from './lib/kms.js';
import Alarms from './lib/alarms.js';

export default cf.merge(
    DB, KMS, Alarms,
    {
        Description: 'Template for @tak-ps/forum',
        Parameters: {
            GitSha: {
                Description: 'GitSha that is currently being deployed',
                Type: 'String'
            },
            Environment: {
                Description: 'VPC/ECS Stack to deploy into',
                Type: 'String',
                Default: 'prod'
            },
        }
    },
    /*
    ELBAlarms({
        prefix: 'BatchELB',
        topic: cf.ref('AlarmTopic'),
        apache: cf.stackName,
        cluster: cf.join(['coe-ecs-', cf.ref('Environment')]),
        service: cf.getAtt('Service', 'Name'),
        loadbalancer: cf.getAtt('ELB', 'LoadBalancerFullName'),
        targetgroup: cf.getAtt('TargetGroup', 'TargetGroupFullName')

    }),
    */
    RDSAlarms({
        prefix: 'Batch',
        topic: cf.ref('AlarmTopic'),
        instance: cf.ref('DBInstance')

    })
);
