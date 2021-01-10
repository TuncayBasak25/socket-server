const open = (socket, data) => {
  console.log('New connection established');
  const { connections } = socket;
  
  connections[data.id] = socket;
}

module.exports = open;
