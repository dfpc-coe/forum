#! /bin/bash

set -eo pipefail

mkdir -p "${CONFIG_DIR}"
mkdir -p "${CONFIG_DIR}/uploads/"

echo "Symlinking $HOME/NodeBB-${VERSION}/public/uploads"
UPLOADS="$HOME/NodeBB-${VERSION}/public/uploads"

if [[ -L "$UPLOADS" && -d "$UPLOADS" ]]; then
    echo "Symlink already configured"
else
    cp -r "$HOME/NodeBB-${VERSION}/public/uploads" "${CONFIG_DIR}/uploads/"
    rm -rf "$HOME/NodeBB-${VERSION}/public/uploads"
    ln -s "${CONFIG_DIR}/uploads/" "$HOME/NodeBB-${VERSION}/public/uploads"
fi

while true
do
    if test -f "${CONFIG_DIR}/config.json"; then
        echo "Found Config File"

        echo "CONFIG_DIR Contents:"
        ls "${CONFIG_DIR}/"
        echo "CONFIG:"
        cat "${CONFIG_DIR}/config.json"

        if [[ -n "$CF_HOSTED_URL" ]]; then
            jq ".url=\"${CF_HOSTED_URL}\"" ${CONFIG_DIR}/config.json | sponge ${CONFIG_DIR}/config.json
        fi

        ./nodebb build --config="${CONFIG_DIR}/config.json" || true
        ./nodebb upgrade --config="${CONFIG_DIR}/config.json" || true
        ./nodebb stop --config="${CONFIG_DIR}/config.json"
        ./nodebb start --config="${CONFIG_DIR}/config.json" || true
    else
        echo "No Config File"
        ./nodebb start || true

        echo "copying config"
        mv "$HOME/NodeBB-${VERSION}/config.json" "${CONFIG_DIR}/config.json"
    fi

    echo "Restart Script"
done
