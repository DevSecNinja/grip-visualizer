#!/bin/bash
# Post-create script for the devcontainer.
# Called by devcontainer.json postCreateCommand after the container is built.

set -euo pipefail

########################################
# Node dependencies
########################################
npm install

########################################
# Mise — tool version manager (pins the CI linters in .mise.toml)
########################################
curl https://mise.run | sh
# shellcheck disable=SC2016 # Intentionally single-quoted to defer expansion to .bashrc
echo 'eval "$(~/.local/bin/mise activate bash)"' >>~/.bashrc
~/.local/bin/mise install

########################################
# Lefthook — git hooks
########################################
~/.local/bin/mise exec -- lefthook install
