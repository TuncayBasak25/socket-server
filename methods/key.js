const key = (socket, { keycode }) => {
  const { connections } = socket;
  Object.entries(connections).map(([name, client]) => client.send({ keycode: keycode}));
}

module.exports = key;
