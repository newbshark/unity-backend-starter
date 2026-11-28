import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class BeaconService {
  private totalPulses = 0;
  private lastSender = 'Никто';

  getStatus() {
    return {
      totalPulses: this.totalPulses,
      lastSender: this.lastSender,
      statusText: `Маяк активен! Последний сигнал от: ${this.lastSender}`,
    };
  }

  pulse(rawPlayer?: string) {
    const clean = (rawPlayer || '').trim();
    if (!clean) {
      throw new BadRequestException('Поле player не может быть пустым!');
    }
    this.totalPulses += 1;
    this.lastSender = clean.slice(0, 24);
    return this.getStatus();
  }

  reset() {
    this.totalPulses = 0;
    this.lastSender = 'Никто';
    return this.getStatus();
  }
}
