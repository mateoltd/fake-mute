var text = new TextDecoder("utf-8");

WebSocket.prototype.original = WebSocket.prototype.send;
WebSocket.prototype.send = function(data) {
    if (Object.prototype.toString.call(data) === "[object ArrayBuffer]") {
        if (text.decode(data).includes("self_deaf")) { // Si detecta el ensordecimiento y/o mute: 
            console.log("Se ha encontrado mute/ensordecimiento.");
            data = data.replace('"self_mute":false', 'NiceOneDiscord');
            console.log("Fakeado correctamente.");
        }
    }
    WebSocket.prototype.original.apply(this, [data]); // Aplica los cambios
}