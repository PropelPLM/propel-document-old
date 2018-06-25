#!/bin/bash
# move files from PLM repo to heroku repo. heroku repo should be passed as argument

if [ "$1" == "" ]; then
    echo "Destination folder must be passed as argument (e.g. ./copyFiles.sh ../../ryan-propeldocuments/)"
    exit
fi

rsync -av --exclude=".*" --exclude="node_modules/" ./* $1
