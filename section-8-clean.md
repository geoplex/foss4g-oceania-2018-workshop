# 0 to 100 on AWS – Building a full stack web mapping application with PostGIS, GeoServer, OpenLayers and ReactJS

#### FOSS4G SotM Oceania - Afternoon Workshop #1 - 20th November 2018

## 8. (Optional) Remove AWS resources

If you wish to remove the resources created in this workshop, the fastest
method is to delete the CloudFormation stacks.

Please be aware that if you do not delete or stop these resources, you will
incur AWS charges over time.

To delete all resources created during this workshop, you can delete the
CloudFormation stacks in reverse order:

1. Log in to the AWS console
2. Go to the CloudFormation service
3. Select the *foss4g-oceania-workshop-admin* stack
4. Select ***Actions > Delete*** Stack
5. Wait for the Delete Stack operation to indicate success
6. Repeat steps 3 - 5 for each of the geoserver, db, security-groups, and finally vpc stacks.

Alternatively if you wish to access these resources after the workshop, but
don't want to pay for them to be running 24x7, you can stop the resources as
follows:

1. Log in to the AWS console
2. Go to the EC2 service
3. Select Instances
4. Choose the foss4g-oceania-workshop-geoserver instance and the foss4g-oceania-workshop-admin instance.
5. Select ***Actions > Instance State > Stop***
6. Confirm that you want to stop the instances
7. Go to the RDS service
8. Select Instances
9. Choose the foss4g-oceania-workshop instance
10. Select ***Instance actions > Stop***

Please note that if you choose to stop the RDS instance, AWS may automatically
restart the instance after 7 days.  If you wish to retain the data in the
database for later use, but avoid incurring RDS running costs, you can create a
database snapshot and then terminate the RDS instance.  You can then create a
new RDS instance from the snapshot at any time.

You may also wish to delete the static website S3 bucket, or disable public
read access to it.

***

**Previous**: [7.4. Publish app](section-7-4-publish-app.md) | **Up**: [Index](README.md)
