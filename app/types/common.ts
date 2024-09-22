export interface EquationBoxProps {
    evaluate: () => void,
    setactive: (index: string) => void,
    processinput: (e: React.KeyboardEvent, id: string) => void,
    id: string,
    activeid: string
}

export interface result {
    dec: string,
    hex: string,
    bin: string
}

export interface evaluation {
    status: boolean;
    data: result | error;
}

export enum error {
    UNDEFINED_VARIABLE,
    MALFORMED_PARENTHESES,
    MALFORMED_EXPRESSION,
    INCOMPLETE_EXPRESSION,
    INVALID_CHARACTER,
}