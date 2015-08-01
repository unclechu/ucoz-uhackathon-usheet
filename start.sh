#!/bin/bash

supervisor -n -e node,js,json -w app.js,server.js,model,routes /home/dima/uh1
