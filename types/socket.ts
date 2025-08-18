export interface JoinRoomPayload {
    roomId: string;
    username: string;
  }
  
  export interface ProgressUpdatePayload {
    roomId: string;
    userId: string;
    progress: {
      wpm: number;
      accuracy: number;
    };
  }
  
  export interface TypingFinishedPayload {
    roomId: string;
    result: {
      username: string;
      wpm: number;
      accuracy: number;
    };
  }
  