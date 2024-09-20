export interface EquationBoxProps {
    evaluate: () => void,
}

export interface result {
    dec: string,
    hex: string,
    bin: string
}

export enum error {
    UNDEFINED_VARIABLE,
    MALFORMED_PARENTHESES,
    MALFORMED_EXPRESSION,
    INCOMPLETE_EXPRESSION,
}