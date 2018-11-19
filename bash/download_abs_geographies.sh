#!/bin/bash
#
# Download Australian Bureau of Statistics (ABS) Statistical Area (SA) data at
# levels 1 - 4.
#
# The data will be saved under data/abs/aus_sa<N>.zip, relative to the
# repository root.

workdir="$(dirname $0)/../data/abs"
url="http://www.abs.gov.au/AUSSTATS/subscriber.nsf/log"

mkdir -p "$workdir"
ret=$?
if [ $ret -ne 0 ]; then
    echo "Failed to create download directory $workdir, abort."
    exit $ret
fi

echo "Downloading ABS SA data to $workdir ..."

curl -Lo "$workdir/aus_sa1.zip" "$url?openagent&1270055001_sa1_2016_aust_shape.zip&1270.0.55.001&Data%20Cubes&6F308688D810CEF3CA257FED0013C62D&0&July%202016&12.07.2016&Latest"
curl -Lo "$workdir/aus_sa2.zip" "$url?openagent&1270055001_sa2_2016_aust_shape.zip&1270.0.55.001&Data%20Cubes&A09309ACB3FA50B8CA257FED0013D420&0&July%202016&12.07.2016&Latest"
curl -Lo "$workdir/aus_sa3.zip" "$url?openagent&1270055001_sa3_2016_aust_shape.zip&1270.0.55.001&Data%20Cubes&43942523105745CBCA257FED0013DB07&0&July%202016&12.07.2016&Latest"
curl -Lo "$workdir/aus_sa4.zip" "$url?openagent&1270055001_sa4_2016_aust_shape.zip&1270.0.55.001&Data%20Cubes&C65BC89E549D1CA3CA257FED0013E074&0&July%202016&12.07.2016&Latest"

echo "Done."
