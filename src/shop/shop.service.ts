import { BadRequestException, Injectable } from '@nestjs/common';

export interface ShopItemDef {
  id: string;
  title: string;
  price: number;
}

const CATALOG: Record<string, ShopItemDef> = {
  hammer: { id: 'hammer', title: 'Молот (+10 урона)', price: 30 },
  boots: { id: 'boots', title: 'Сапоги Луны', price: 50 },
};

@Injectable()
export class ShopService {
  private readonly wallets = new Map<string, { coins: number; items: string[] }>();

  private getOrCreate(rawPlayer?: string) {
    const clean = (rawPlayer || 'Игрок').trim().slice(0, 24) || 'Игрок';
    let w = this.wallets.get(clean);
    if (!w) {
      w = { coins: 60, items: [] };
      this.wallets.set(clean, w);
    }
    return { player: clean, wallet: w };
  }

  getWallet(rawPlayer?: string) {
    const { player, wallet } = this.getOrCreate(rawPlayer);
    return { player, coins: wallet.coins, items: [...wallet.items], message: 'Готово' };
  }

  buyItem(rawPlayer?: string, rawItemId?: string) {
    const { player, wallet } = this.getOrCreate(rawPlayer);
    const item = CATALOG[String(rawItemId || '').trim()];
    if (!item) {
      throw new BadRequestException('Неизвестный товар в каталоге!');
    }
    if (wallet.coins < item.price) {
      throw new BadRequestException(`Недостаточно монет! Нужно ${item.price}, у вас ${wallet.coins}.`);
    }

    wallet.coins -= item.price;
    wallet.items.push(item.title);
    return {
      player,
      coins: wallet.coins,
      items: [...wallet.items],
      message: `Куплено: ${item.title} (-${item.price} мон.)`,
    };
  }
}
