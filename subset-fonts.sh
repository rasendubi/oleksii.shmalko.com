#!/usr/bin/env sh
set -xe

COMMON_OPTIONS="--flavor=woff2 --layout-features+=liga,dlig,smcp,subs,sups --drop-tables+=FFTM --harfbuzz-repacker"

# latin
for f in Change-Regular Change-RegularItalic Change-SemiBold Change-SemiBoldItalic; do
    pyftsubset "$f.woff2" --unicodes-file="./unicode-range.txt" --output-file="$f-all.woff2" $COMMON_OPTIONS
done
