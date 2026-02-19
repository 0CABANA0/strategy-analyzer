import { describe, it, expect } from 'vitest'
import { parseJsonResponse } from '../../services/aiService'

describe('parseJsonResponse', () => {
  it('순수 JSON 문자열을 정상 파싱한다', () => {
    const result = parseJsonResponse('{"key": "value"}')
    expect(result).toEqual({ key: 'value' })
  })

  it('```json 코드블록을 제거하고 파싱한다', () => {
    const input = '```json\n{"key":"value"}\n```'
    const result = parseJsonResponse(input)
    expect(result).toEqual({ key: 'value' })
  })

  it('<think> 태그를 제거하고 파싱한다 (DeepSeek R1 등)', () => {
    const input = '<think>reasoning about the answer</think>{"key":"value"}'
    const result = parseJsonResponse(input)
    expect(result).toEqual({ key: 'value' })
  })

  it('후행 콤마가 있는 불완전 JSON을 복구한다', () => {
    // 복구 로직 3차 시도: 후행 콤마(,] 또는 ,}) 를 제거하여 파싱 성공
    const input = '{"list":["a","b"],"count":3,}'
    const result = parseJsonResponse(input)
    expect(result).toEqual({ list: ['a', 'b'], count: 3 })
  })

  it('후행 텍스트가 잘린 JSON에서 첫 { ~ 마지막 } 사이를 추출한다', () => {
    const input = 'Some prefix text {"name":"테스트","list":["a"]} some suffix'
    const result = parseJsonResponse(input)
    expect(result).toEqual({ name: '테스트', list: ['a'] })
  })

  it('JSON이 아닌 일반 텍스트에서 오류를 던진다', () => {
    expect(() => parseJsonResponse('Hello world')).toThrow()
  })

  it('중첩된 JSON 객체를 정상 파싱한다', () => {
    const input = '{"outer": {"inner": "value"}, "list": [1, 2, 3]}'
    const result = parseJsonResponse(input)
    expect(result).toEqual({ outer: { inner: 'value' }, list: [1, 2, 3] })
  })

  it('앞뒤 공백이 있는 JSON을 파싱한다', () => {
    const input = '  \n  {"key": "value"}  \n  '
    const result = parseJsonResponse(input)
    expect(result).toEqual({ key: 'value' })
  })

  it('JSON 앞에 일반 텍스트가 있어도 첫 { 부터 추출한다', () => {
    const input = 'Here is the result: {"key": "value"}'
    const result = parseJsonResponse(input)
    expect(result).toEqual({ key: 'value' })
  })
})
