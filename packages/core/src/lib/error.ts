export abstract class ChatKittyError {
  protected constructor(public error: string, public message: string) {}
}
