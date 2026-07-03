import constructorReducer, {
  addIngredient,
  clearConstructor,
  moveIngredient,
  removeIngredient
} from '../constructorSlice';
import { TConstructorIngredient, TIngredient } from '../../../utils/types';

const bun: TIngredient = {
  _id: 'bun-1',
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
};

const main: TIngredient = {
  _id: 'main-1',
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
};

const sauce: TIngredient = {
  _id: 'sauce-1',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'sauce.png',
  image_large: 'sauce-large.png',
  image_mobile: 'sauce-mobile.png'
};

const constructorMain: TConstructorIngredient = { ...main, id: 'main-uuid' };
const constructorSauce: TConstructorIngredient = { ...sauce, id: 'sauce-uuid' };

describe('constructorSlice reducer', () => {
  test('возвращает initialState при unknown action и undefined state', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual({
      bun: null,
      ingredients: []
    });
  });

  test('добавляет булку в bun', () => {
    const state = constructorReducer(undefined, addIngredient(bun));

    expect(state.bun).toMatchObject(bun);
    expect(state.ingredients).toEqual([]);
  });

  test('заменяет булку при повторном добавлении bun', () => {
    const anotherBun = { ...bun, _id: 'bun-2', name: 'Флюоресцентная булка R2-D3' };
    const firstState = constructorReducer(undefined, addIngredient(bun));
    const secondState = constructorReducer(firstState, addIngredient(anotherBun));

    expect(secondState.bun).toMatchObject(anotherBun);
    expect(secondState.ingredients).toEqual([]);
  });

  test('добавляет начинку в ingredients', () => {
    const state = constructorReducer(undefined, addIngredient(main));

    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]).toMatchObject(main);
    expect(state.ingredients[0].id).toBeDefined();
  });

  test('удаляет ингредиент по id', () => {
    const state = {
      bun: null,
      ingredients: [constructorMain, constructorSauce]
    };

    expect(constructorReducer(state, removeIngredient('main-uuid'))).toEqual({
      bun: null,
      ingredients: [constructorSauce]
    });
  });

  test('перемещает ингредиент вверх', () => {
    const state = {
      bun: null,
      ingredients: [constructorMain, constructorSauce]
    };

    expect(constructorReducer(state, moveIngredient({ index: 1, direction: 'up' }))).toEqual({
      bun: null,
      ingredients: [constructorSauce, constructorMain]
    });
  });

  test('перемещает ингредиент вниз', () => {
    const state = {
      bun: null,
      ingredients: [constructorMain, constructorSauce]
    };

    expect(constructorReducer(state, moveIngredient({ index: 0, direction: 'down' }))).toEqual({
      bun: null,
      ingredients: [constructorSauce, constructorMain]
    });
  });

  test('очищает конструктор', () => {
    const state = {
      bun: { ...bun, id: 'bun-uuid' },
      ingredients: [constructorMain, constructorSauce]
    };

    expect(constructorReducer(state, clearConstructor())).toEqual({
      bun: null,
      ingredients: []
    });
  });
});
