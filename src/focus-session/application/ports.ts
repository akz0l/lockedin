export interface SessionNotifier {
  scheduleSessionEnd(endsAt: number): Promise<void>;
  cancelSessionEnd(): Promise<void>;
}

export type Clock = () => number;
