while true
do
    if test -f ${CONFIG_DIR}/config.json; then
        ./nodebb start --config=${CONFIG_DIR}/config.json || true
    else
        ./nodebb start || true
    fi

    echo "Restart Script"
    ls ${CONFIG_DIR}/
    cat ${CONFIG_DIR}/config.json
done
