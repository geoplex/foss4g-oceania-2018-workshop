# 0 to 100 on AWS – Building a full stack web mapping application with PostGIS, GeoServer, OpenLayers and ReactJS

#### FOSS4G SotM Oceania - Afternoon Workshop #1 - 20th November 2018

### Section 7 Stage 4 - Build and upload to S3

We can now package our application for deployment, and use S3 to serve it as a
static website.

From the top-level directory of your `foss4g-client` app, run the following command.

```
npm run build
```

This will compile and minify our application down to a handful of HTML, JS and
CSS files.  Once the build process completes, look in the `build` directory to
see what was produced.  You should see the following directory structure:

```
|-- build
|   |-- static
|   |   |-- css
|   |   |-- js
```

Now, we can set up an S3 bucket to serve the website:

1. Log in to the AWS console
2. Go to the S3 service
3. Select ***Create bucket***
4. Enter a name for the bucket and select ***Next***.  An S3 bucket name must
   be a valid DNS segment and must be globally unique.
5. Add tags to the bucket if you wish, and select ***Next***.
6. Under ***Manage public permissions***, select "Grant public read access to this bucket" from the drop list and then ***Next***.
7. Select ***Create bucket***.
8. Select your new bucket from the list.
9. Choose the ***Properties*** tab.
10. Click on ***Static website hosting***.
11. Select "Use this bucket to host a website".
12. Under ***Index document***, enter `index.html` and ***Save***.

We now have a publically viewable S3 bucket which can serve a static website.
Next, we'll upload our build files to the bucket.  If you're comfortable using
the AWS CLI, you can use a `aws s3 sync` command to recursively upload the
contents of the build directory to the bucket.  To upload the files manually
via the web console, proceed as follows:

1. Return to the ***Overview*** tab of your S3 bucket.
2. Select ***Upload*** and drag and drop the contents of the build directory into the Upload dialog and then click ***Next***.
3. In the ***Set permissions*** dialog under ***Manage public permissions*** select "Grant public read access to this object(s).
4. Click ***Upload***

Our web application should now be ready to use.  Return to the bucket root
folder, select the ***Properties*** tab and click on ***Static website
hosting***.  Click on the endpoint link to visit your new website.

Congratulations, you've just gone from 0 to 100 on AWS and built a full-stack
web mapping application!

***

**Previous**: [7.3. Finish app](section-7-3-finish-app.md) | **Up**: [Index](README.md) | **Next**: [8. Cleanup](section-8-clean.md)
