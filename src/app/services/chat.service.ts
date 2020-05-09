import { EventEmitter, Injectable } from '@angular/core';
declare var $: any;
import { Message } from '../models/message';

var contentid = '';
@Injectable()
export class ChatService {
  messageReceived = new EventEmitter<Message>();
  connectionEstablished = new EventEmitter<Boolean>();
  private connection: any;
  private proxy: any;
  private gName: any;

  private connectionIsEstablished = false;

  constructor() {
    // this.createConnection();
    // this.registerOnServerEvents();
    // this.startConnection();
    // this.initializeSignalRConnection();
    // this.registerOnServerEvents();
  }

  intialize() {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  private createConnection() {
    const signalRServerEndPoint = 'http://localhost:53999/signalr';
    this.connection = $.hubConnection(signalRServerEndPoint, {
      useDefaultPath: false
    });
    this.proxy = this.connection.createHubProxy('ChatHub');
    this.proxy.on('messageReceived', (serverMessage) => this.onMessageReceived(serverMessage));
  }
  private startConnection(): void {
    this.connection.start().done((data: any) => {
      this.connectionIsEstablished = true;
      contentid = data.id;
      debugger;
      this.proxy.invoke('AddToGroup', contentid)
        .catch((error: any) => {
          console.log('broadcastMessage error -> ' + error);
        });
      console.log('Connected to Notification Hub');

      this.connectionEstablished.emit(true);
    }).catch((error: any) => {
      console.log('Notification Hub error -> ' + error);
    });
  }
  sendMessage(message: Message) {
    this.proxy.invoke('NewMessage', message)
      .catch((error: any) => {
        console.log('broadcastMessage error -> ' + error);
      });
  }
  sendToGroup(message: Message, groupname) {
    this.proxy.invoke('SendMessageToRoom', groupname, message)
      .catch((error: any) => {
        console.log('broadcastMessage error -> ' + error);
      });
  }
  leaveRoom(roomName) {
    this.proxy.invoke('LeaveRoom', roomName)
      .catch((error: any) => {
        console.log('broadcastMessage error -> ' + error);
      });
  }

  private onMessageReceived(serverMessage): void {
    // this.messageReceived.emit(data);
    console.log('New message received from Server: ' + serverMessage);
    this.messageReceived.emit(serverMessage);
  }
  private registerOnServerEvents() {
    this.proxy.on('MessageReceived', (data: any) => {
      this.messageReceived.emit(data);
    });
    this.proxy.on('addChatMessage', (data) => {
      console.log('tetedd');
      if (data.groupName) {
        this.gName = data.groupName;
      }
      if (data.clientuniqueid) {
        this.messageReceived.emit(data);
      }
    });

  }
}


