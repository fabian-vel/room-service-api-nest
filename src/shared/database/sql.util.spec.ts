import { toPositional } from './sql.util.js';

describe('toPositional', () => {
  it('convierte parámetros nombrados y reutiliza el índice si se repiten', () => {
    expect(
      toPositional('WHERE a = :id AND b = :nombre OR c = :id', {
        id: 1,
        nombre: 'x',
      }),
    ).toEqual({
      text: 'WHERE a = $1 AND b = $2 OR c = $1',
      values: [1, 'x'],
    });
  });

  it('no toca los cast de postgres ni el texto sin parámetros', () => {
    expect(
      toPositional('SELECT x::date, ANY(:LLAVES)', { LLAVES: ['a'] }),
    ).toEqual({
      text: 'SELECT x::date, ANY($1)',
      values: [['a']],
    });
  });

  it('envía null cuando el valor es undefined', () => {
    expect(toPositional('VALUES (:a)', { a: undefined }).values).toEqual([
      null,
    ]);
  });

  it('falla si falta un parámetro', () => {
    expect(() => toPositional('WHERE a = :falta', {})).toThrow(
      'Parámetro SQL sin valor: falta',
    );
  });
});
