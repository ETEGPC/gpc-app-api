interface IToken {
  id: string,
  email: string
};

interface IMessage {
  message: string,
  author: string,
  room: string
}

interface ISubscription {
  endpoint: string,
  keys: {
    p256dh: string,
    auth: string
  }
}

export { IToken, IMessage, ISubscription };