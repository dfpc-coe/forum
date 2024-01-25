while true
do
    ./nodebb start --config=${CONFIG_DIR}/config.json || true
    echo "Restart Script"
    ls
    ls ./install/
done
