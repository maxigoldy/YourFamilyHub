#!/bin/bash

TARGET_FILE="./node_modules/path-to-regexp/src/index.ts"

if [ -f "$TARGET_FILE" ]; then
    echo "##### Auto-Fixing Broken Node_Module for YourFamilyHub #####"
    echo "SUCCESS: Found broken file and started fixing: $TARGET_FILE"
    sed -i.bak '/DEBUG_URL/d' "$TARGET_FILE"
    echo "SUCCESS: All lines including 'DEBUG_URL' has been deleted."
    echo "##### Auto-Fix was successfully finished. #####"
else
    echo "##### Auto-Fix failed. #####"
    echo "ERROR: No Files found from Path-To-Regexp: $TARGET_FILE"
    echo "Follow this guide to fix: \nhttps://docs.yourfamilyhub.xyz/errors/server/path-to-regexp"
    echo "############################"
    exit 1
fi
