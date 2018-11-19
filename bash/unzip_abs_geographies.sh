#!/bin/bash

workdir="$(dirname $0)/../data/abs"
unzip -a "$workdir/vic_mb.zip"  -d "$workdir"
unzip -a "$workdir/aus_sa1.zip" -d "$workdir"
unzip -a "$workdir/aus_sa2.zip" -d "$workdir"
unzip -a "$workdir/aus_sa3.zip" -d "$workdir"
unzip -a "$workdir/aus_sa4.zip" -d "$workdir"
