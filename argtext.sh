#!/bin/sh

echo "number = $#" 1>&2

cat <<__EOT__
   $1
   $2
   $3
__EOT__

exit 0
