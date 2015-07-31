#!/bin/bash

supervisor -n -e node,js,json -w app.js,model,routes /home/dima/uh1
