#!/bin/bash

CONDA_ENV=movie

source ~/miniconda3/bin/activate $CONDA_ENV

python ./export_data.py
python ./train.py