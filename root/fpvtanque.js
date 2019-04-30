var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8001});

console.log("Initializing...");

var mraa = require('mraa');

// Require the serialport node module
var serialport = require('serialport');
console.log("Initializing...");
var SerialPort = serialport.SerialPort;
// Open the port
var port = new SerialPort("/dev/ttyS0", {
    baudrate: 115200,
    parser: serialport.parsers.readline("\n")
});
var control_ws = null;

wss.on('error', function(err) {
  console.log("Error: %s", err);
});

wss.on('connection', function connection(ws) {

  if(control_ws) {
    // read only mode
    ws.on('close', function (code, message) {    
      console.log("Viewer is gone: %s, %s", code, message);
    });   
    ws.send('readonly mode');
    console.log("Viewer joined: %s", ws);
  }
  else {
    // Read the port data
    port.on("open", function () {
        console.log('open');
        port.on('data', function(data) {
            console.log(data);
        });
    });
    control_ws = ws;

    ws.on('close', function (code, message) {
      control_ws = null;
      console.log("Controller is gone: %s, %s", code, message);
    });

    ws.on('message', function incoming(message) {
      
      var d = message.split(",");
      var md = Number(d[0]); //motor direito
      var me = Number(d[1]); //motor esquerdo
      var f = Number(d[2]); //frente
      var te = Number(d[3]); //torre esquerda
      var td = Number(d[4]); //torre direita
      var s = Number(d[5]); //servo
      port.write('m'+md);
      port.write('n'+me);
      port.write('f'+f);
      port.write('t'+te);
      port.write('y'+td);
      port.write('s'+s);
      port.write('w'+0);
    });
    ws.send('control mode');
    console.log("Controller joined: %s", ws);  
  }
});

console.log("Service started...");

