#! /bin/bash

mkdir -p "$HOME/config/"
mkdir -p "$HOME/config/public/"

#ln -s "${CONFIG_DIR}/public/" "./.docker/public/uploads"

while true
do
    if test -f "${CONFIG_DIR}/config.json"; then
        echo "Found Config File"

        echo "CONFIG_DIR Contents:"
        ls "${CONFIG_DIR}/"
        echo "CONFIG:"
        cat "${CONFIG_DIR}/config.json"

        if [[ -n "$CF_HOSTED_URL" ]]; then
            jq ".url=\"${CF_HOSTED_URL}\"" ./config.json | sponge ./config.json
        fi

        ./nodebb build --config="${CONFIG_DIR}/config.json" || true
        ./nodebb start --config="${CONFIG_DIR}/config.json" || true
    else
        echo "No Config File"
        ./nodebb start || true

        echo "copying config"
        mv "$HOME/NodeBB-${VERSION}/config.json" "${CONFIG_DIR}/config.json"
    fi

    echo "Restart Script"
done
