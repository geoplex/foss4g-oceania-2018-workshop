# 0 to 100 on AWS – Building a full stack web mapping application with PostGIS, GeoServer, OpenLayers and ReactJS

#### FOSS4G SotM Oceania - Afternoon Workshop #1 - 20th November 2018

## 1. Prerequistes and preliminary setup

### AWS account

To complete the workshop, you will need access to an Amazon Web Services
account.  Please verify that you are able to sign in to your account prior to
attending the workshop.

We recommend using your own account with root credentials.  If you wish to
access an account as an IAM user, please ensure that your user has broad
permissions within the account to deploy CloudFormation stacks, create
VPCs/subnets, launch EC2/RDS instances, et cetera.

### Required software

Software and libraries listed in the table below are required to complete the workshop.

| Software / Library | Version Required | Installation |
| --- | --- | --- |
| An Amazon Web Services account | | [Create an AWS account](https://portal.aws.amazon.com/billing/signup#/start) |
| QGIS | >= 2.12.0 | [Download and install](https://www.qgis.org/en/site/forusers/download.html)
| Node.js / NPM | Node >= 6 / NPM >= 5.2 | [Download and install](https://nodejs.org/) 
| SSH client | | Mac/Linux have this as standard, Windows users please [download and install the PuTTY MSI](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)
| Preferred Code Editor | | Throughout the workshop we'll be using [Visual Studio Code](https://code.visualstudio.com/)

### Workshop files

Please download and extract the following data to your local machine prior to attending the workshop:

[foss4g-oceania-workshop.zip](https://s3-ap-southeast-2.amazonaws.com/foss4g-oceania-2018-workshop-resources/foss4g-oceania-workshop.zip)

### Statistical data

Please download and extract the following data to your local machine prior to attending the workshop:

* [ABS Statistical Areas Level 4 Shapefile](http://www.abs.gov.au/AUSSTATS/subscriber.nsf/log?openagent&1270055001_sa4_2016_aust_shape.zip&1270.0.55.001&Data%20Cubes&C65BC89E549D1CA3CA257FED0013E074&0&July%202016&12.07.2016&Latest)

***

**Up**: [Index](README.md) | **Next**: [2. Deploy AWS resources](section-2-aws.md)
