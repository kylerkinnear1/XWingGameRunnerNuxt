import type { CardsDto } from './cards';

export function parseCards(jsonText: string): CardsDto {
  return JSON.parse(jsonText) as CardsDto;
}