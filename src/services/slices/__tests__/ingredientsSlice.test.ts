import ingredientsReducer, { getIngredients } from '../ingredientsSlice';
import { TIngredient } from '../../../utils/types';

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'bun.png',
    image_large: 'bun-large.png',
    image_mobile: 'bun-mobile.png'
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'main.png',
    image_large: 'main-large.png',
    image_mobile: 'main-mobile.png'
  }
];

describe('ingredientsSlice reducer', () => {
  test('возвращает initialState при unknown action и undefined state', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual({
      ingredients: [],
      isLoading: false,
      error: null
    });
  });

  test('обрабатывает getIngredients.pending', () => {
    expect(ingredientsReducer(undefined, getIngredients.pending('requestId'))).toEqual({
      ingredients: [],
      isLoading: true,
      error: null
    });
  });

  test('обрабатывает getIngredients.fulfilled', () => {
    expect(
      ingredientsReducer(undefined, getIngredients.fulfilled(mockIngredients, 'requestId'))
    ).toEqual({
      ingredients: mockIngredients,
      isLoading: false,
      error: null
    });
  });

  test('обрабатывает getIngredients.rejected', () => {
    expect(
      ingredientsReducer(
        undefined,
        getIngredients.rejected(new Error('Network error'), 'requestId')
      )
    ).toEqual({
      ingredients: [],
      isLoading: false,
      error: 'Network error'
    });
  });
});
